import { lstat, readdir, readFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';

const ALLOWED_FRONTMATTER_KEYS = new Set([
  'name',
  'description',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools'
]);

const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isInsideDirectory(rootDir, targetPath) {
  const rel = relative(rootDir, targetPath);
  return !isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`);
}

function parseYamlMapping(source, label) {
  const doc = parseDocument(source, { uniqueKeys: true });
  const diagnostics = [...doc.errors, ...doc.warnings];
  if (diagnostics.length > 0) {
    throw new Error(`${label}: ${diagnostics.map((d) => d.message).join('; ')}`);
  }
  const value = doc.toJS();
  if (!isPlainObject(value)) {
    throw new Error(`${label} must be a YAML mapping.`);
  }
  return value;
}

export function parseSkill(text, directoryName) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(text);
  if (!match) {
    throw new Error('SKILL.md must begin with YAML frontmatter delimited by --- lines.');
  }

  const frontmatter = parseYamlMapping(match[1], 'SKILL.md frontmatter');
  const body = match[2];
  const errors = [];

  for (const key of Object.keys(frontmatter)) {
    if (!ALLOWED_FRONTMATTER_KEYS.has(key)) {
      errors.push(`Unknown frontmatter field "${key}".`);
    }
  }

  if (typeof frontmatter.name !== 'string' || !frontmatter.name.trim()) {
    errors.push('name must be a non-empty string.');
  } else {
    if (frontmatter.name.length > 64) {
      errors.push('name must not exceed 64 characters.');
    }
    if (!SKILL_NAME_PATTERN.test(frontmatter.name)) {
      errors.push('name must use lowercase ASCII letters, digits, and single hyphens.');
    }
    if (frontmatter.name !== directoryName) {
      errors.push(`name "${frontmatter.name}" must match directory "${directoryName}".`);
    }
  }

  if (typeof frontmatter.description !== 'string' || !frontmatter.description.trim()) {
    errors.push('description must be a non-empty string.');
  } else if (frontmatter.description.length > 1024) {
    errors.push('description must not exceed 1024 characters.');
  }

  for (const key of ['license', 'compatibility', 'allowed-tools']) {
    if (key in frontmatter && (typeof frontmatter[key] !== 'string' || !frontmatter[key].trim())) {
      errors.push(`${key} must be a non-empty string when present.`);
    }
  }

  if ('metadata' in frontmatter) {
    const meta = frontmatter.metadata;
    if (
      !isPlainObject(meta) ||
      Object.values(meta).some((value) => typeof value !== 'string' || !value.trim())
    ) {
      errors.push('metadata must map keys to non-empty string values.');
    }
  }

  if (!body.trim()) {
    errors.push('SKILL.md must contain instructions after its frontmatter.');
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return { ...frontmatter, body };
}

function extractLocalLinks(markdown) {
  let activeFence = null;
  const proseLines = [];

  for (const line of markdown.split(/\r?\n/)) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!activeFence) {
        activeFence = marker;
      } else if (marker[0] === activeFence[0] && marker.length >= activeFence.length) {
        activeFence = null;
      }
      continue;
    }
    if (!activeFence) {
      proseLines.push(line);
    }
  }

  const prose = proseLines.join('\n');
  const targets = [];
  for (const match of prose.matchAll(/!?\[[^\]\n]*\]\(([^\s)]+)\)/g)) {
    const rawTarget = match[1];
    if (!rawTarget.startsWith('#') && !/^(?!file:)[a-z][a-z0-9+.-]*:/i.test(rawTarget)) {
      targets.push(rawTarget);
    }
  }
  return targets;
}

function isAllowedSkillFile(relativePath) {
  if (relativePath === 'SKILL.md' || relativePath === join('agents', 'openai.yaml')) {
    return true;
  }
  return relativePath.startsWith(`references${sep}`) && relativePath.endsWith('.md');
}

async function validateOpenAiConfig(filePath) {
  let content;
  try {
    content = await readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }

  const data = parseYamlMapping(content, 'agents/openai.yaml');
  if ('interface' in data) {
    if (!isPlainObject(data.interface)) {
      throw new Error('agents/openai.yaml: interface must be a mapping.');
    }
    for (const key of ['display_name', 'short_description', 'default_prompt']) {
      if (
        key in data.interface &&
        (typeof data.interface[key] !== 'string' || !data.interface[key].trim())
      ) {
        throw new Error(`agents/openai.yaml: interface.${key} must be a non-empty string.`);
      }
    }
  }

  if ('policy' in data) {
    if (
      !isPlainObject(data.policy) ||
      ('allow_implicit_invocation' in data.policy &&
        typeof data.policy.allow_implicit_invocation !== 'boolean')
    ) {
      throw new Error('agents/openai.yaml: policy.allow_implicit_invocation must be a boolean.');
    }
  }
}

export async function inspectSkill(directory) {
  const root = resolve(directory);
  const metadata = parseSkill(await readFile(join(root, 'SKILL.md'), 'utf8'), basename(root));
  const markdownFiles = [];

  async function walk(currentDir) {
    for (const entry of await readdir(currentDir, { withFileTypes: true })) {
      const fullPath = join(currentDir, entry.name);
      const relPath = relative(root, fullPath);

      if (entry.isSymbolicLink()) {
        throw new Error(`${relPath}: symlinks are not allowed inside a skill.`);
      }
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      if (entry.name === 'SKILL.md' && relPath !== 'SKILL.md') {
        throw new Error(`${relPath}: nested SKILL.md discovery entries are not allowed.`);
      }
      if (!isAllowedSkillFile(relPath)) {
        throw new Error(
          `${relPath}: only SKILL.md, references/**/*.md, and optional agents/openai.yaml are allowed.`
        );
      }
      if (entry.name.endsWith('.md')) {
        markdownFiles.push(fullPath);
      }
    }
  }

  await walk(root);

  for (const file of markdownFiles) {
    const content = await readFile(file, 'utf8');
    for (const link of extractLocalLinks(content)) {
      if (/^file:/i.test(link)) {
        throw new Error(`${relative(root, file)}: file: URLs are not allowed (${link}).`);
      }
      const cleanLink = decodeURIComponent(link.split(/[?#]/)[0]);
      const target = resolve(dirname(file), cleanLink);
      if (!isInsideDirectory(root, target)) {
        throw new Error(`${relative(root, file)}: link ${link} leaves the skill directory.`);
      }
      try {
        await lstat(target);
      } catch {
        throw new Error(`${relative(root, file)}: broken local link ${link}.`);
      }
    }
  }

  await validateOpenAiConfig(join(root, 'agents', 'openai.yaml'));
  return metadata;
}

export function validateMarketplace(packageJsonText, marketplaceJsonText, skillName = 'scopedb') {
  const pkg = JSON.parse(packageJsonText);
  const marketplace = JSON.parse(marketplaceJsonText);

  if (typeof pkg.version !== 'string' || !SEMVER_PATTERN.test(pkg.version)) {
    throw new Error('package.json version must be a valid X.Y.Z semver string.');
  }
  if (!isPlainObject(marketplace) || marketplace.name !== 'scopedb-skills') {
    throw new Error('.claude-plugin/marketplace.json must declare name "scopedb-skills".');
  }
  if (!isPlainObject(marketplace.metadata) || marketplace.metadata.version !== pkg.version) {
    throw new Error(
      `.claude-plugin/marketplace.json metadata.version must match package.json version (${pkg.version}).`
    );
  }
  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length !== 1) {
    throw new Error('.claude-plugin/marketplace.json must declare exactly one plugin entry.');
  }

  const plugin = marketplace.plugins[0];
  if (!isPlainObject(plugin) || plugin.name !== skillName) {
    throw new Error(`.claude-plugin/marketplace.json plugin name must be "${skillName}".`);
  }
  if (plugin.version !== pkg.version) {
    throw new Error(
      `.claude-plugin/marketplace.json plugins[0].version must match package.json version (${pkg.version}).`
    );
  }
  if (
    !Array.isArray(plugin.skills) ||
    plugin.skills.length !== 1 ||
    plugin.skills[0] !== `./skills/${skillName}`
  ) {
    throw new Error(
      `.claude-plugin/marketplace.json plugins[0].skills must equal ["./skills/${skillName}"].`
    );
  }
}

async function main() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const skillsDir = join(root, 'skills');
  const entries = (await readdir(skillsDir)).filter((name) => !name.startsWith('.'));

  if (entries.length !== 1 || entries[0] !== 'scopedb') {
    throw new Error('Only skills/scopedb may be published under skills/.');
  }

  await inspectSkill(join(skillsDir, 'scopedb'));
  validateMarketplace(
    await readFile(join(root, 'package.json'), 'utf8'),
    await readFile(join(root, '.claude-plugin/marketplace.json'), 'utf8')
  );
  console.log('Validated scopedb skill metadata, links, files, and marketplace manifest.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
