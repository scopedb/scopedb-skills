import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { inspectSkill, parseSkill, validateMarketplace } from '../scripts/check.mjs';

function makeSkillMarkdown(name, extraFrontmatter = '', body = 'Follow the workflow.') {
  return `---\nname: ${name}\ndescription: Connect to and query ScopeDB.\n${extraFrontmatter}---\n\n${body}\n`;
}

async function createTempSkill(t, name = 'scopedb', content = makeSkillMarkdown(name)) {
  const root = await mkdtemp(join(tmpdir(), 'scopedb-skills-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const skillDir = join(root, 'skills', name);
  await mkdir(skillDir, { recursive: true });
  await writeFile(join(skillDir, 'SKILL.md'), content);
  return { root, skillDir };
}

test('parseSkill accepts valid standard frontmatter and optional fields', () => {
  const parsed = parseSkill(
    makeSkillMarkdown(
      'scopedb',
      'license: Apache-2.0\ncompatibility: Node.js 24+\nmetadata:\n  version: "0.1.0"\n'
    ),
    'scopedb'
  );
  assert.equal(parsed.name, 'scopedb');
  assert.equal(parsed.license, 'Apache-2.0');
  assert.equal(parsed.metadata.version, '0.1.0');
});

test('parseSkill rejects malformed or mismatched frontmatter', () => {
  for (const [source, dirName, pattern] of [
    ['name: scopedb', 'scopedb', /frontmatter/],
    [makeSkillMarkdown('ScopeDB'), 'ScopeDB', /lowercase ASCII/],
    [makeSkillMarkdown('scope--db'), 'scope--db', /lowercase ASCII/],
    [makeSkillMarkdown('-scopedb'), '-scopedb', /lowercase ASCII/],
    [makeSkillMarkdown('other-name'), 'scopedb', /must match directory/],
    [makeSkillMarkdown('scopedb', 'unknown: true\n'), 'scopedb', /Unknown frontmatter field/],
    [makeSkillMarkdown('scopedb', 'metadata:\n  version: 1\n'), 'scopedb', /non-empty string/],
    [makeSkillMarkdown('scopedb', '', ''), 'scopedb', /must contain instructions/]
  ]) {
    assert.throws(() => parseSkill(source, dirName), pattern);
  }
});

test('inspectSkill checks local Markdown links and ignores fenced code examples', async (t) => {
  const { skillDir } = await createTempSkill(
    t,
    'scopedb',
    makeSkillMarkdown(
      'scopedb',
      '',
      '[Query](references/query/index.md)\n[Docs](https://www.scopedb.io/docs)\n```md\n[Example](missing.md)\n```\n'
    )
  );
  await mkdir(join(skillDir, 'references', 'query'), { recursive: true });
  await writeFile(
    join(skillDir, 'references', 'query', 'index.md'),
    '[Root](../../SKILL.md#top)\n'
  );
  assert.equal((await inspectSkill(skillDir)).name, 'scopedb');

  await writeFile(join(skillDir, 'references', 'query', 'index.md'), '[Missing](missing.md)\n');
  await assert.rejects(inspectSkill(skillDir), /broken local link missing\.md/);

  await writeFile(
    join(skillDir, 'references', 'query', 'index.md'),
    '[Outside](../../../README.md)\n'
  );
  await assert.rejects(inspectSkill(skillDir), /leaves the skill directory/);
});

test('inspectSkill validates optional agents/openai.yaml metadata', async (t) => {
  const { skillDir } = await createTempSkill(t);
  await mkdir(join(skillDir, 'agents'));
  const yamlPath = join(skillDir, 'agents', 'openai.yaml');

  await writeFile(
    yamlPath,
    'interface:\n  display_name: ScopeDB\npolicy:\n  allow_implicit_invocation: true\n'
  );
  await inspectSkill(skillDir);

  await writeFile(yamlPath, 'policy:\n  allow_implicit_invocation: "yes"\n');
  await assert.rejects(inspectSkill(skillDir), /allow_implicit_invocation must be a boolean/);
});

test('inspectSkill rejects nested SKILL.md files, unexpected files, and symlinks', async (t) => {
  const { root, skillDir } = await createTempSkill(t);

  const nestedDir = join(skillDir, 'references', 'nested');
  await mkdir(nestedDir, { recursive: true });
  await writeFile(join(nestedDir, 'SKILL.md'), makeSkillMarkdown('nested'));
  await assert.rejects(inspectSkill(skillDir), /nested SKILL\.md/);
  await rm(nestedDir, { recursive: true });

  await mkdir(join(skillDir, 'scripts'));
  await writeFile(join(skillDir, 'scripts', 'helper.mjs'), 'export default 1;\n');
  await assert.rejects(inspectSkill(skillDir), /only SKILL\.md/);
  await rm(join(skillDir, 'scripts'), { recursive: true });

  await writeFile(join(root, 'external.md'), 'outside');
  await mkdir(join(skillDir, 'references'), { recursive: true });
  await symlink(join(root, 'external.md'), join(skillDir, 'references', 'linked.md'));
  await assert.rejects(inspectSkill(skillDir), /symlinks are not allowed/);
});

test('validateMarketplace enforces version and skill path synchronization', async () => {
  const pkg = await readFile(new URL('../package.json', import.meta.url), 'utf8');
  const marketplace = await readFile(
    new URL('../.claude-plugin/marketplace.json', import.meta.url),
    'utf8'
  );
  validateMarketplace(pkg, marketplace);

  const mismatched = JSON.parse(marketplace);
  mismatched.plugins[0].version = '0.0.1';
  assert.throws(
    () => validateMarketplace(pkg, JSON.stringify(mismatched)),
    /plugins\[0\]\.version must match package\.json version/
  );
});
