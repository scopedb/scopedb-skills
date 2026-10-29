# Contributing to ScopeDB Skills

Use Node.js 24+ and the pnpm version in `package.json`. Install dependencies with `pnpm install --frozen-lockfile`.

## Everyday commands

Run all verification commands before submitting a pull request.

| Command            | Purpose                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `pnpm lint`        | Format and lint JavaScript and JSON files with Biome                                                        |
| `pnpm check`       | Validate `SKILL.md` frontmatter, single discovery entry, allowed files, relative links, and host metadata   |
| `pnpm test`        | Run unit tests for the repository skill checker (`tests/check.test.mjs`)                                    |
| `git diff --check` | Check for trailing whitespace and conflict markers                                                          |

## Authoring skills and references

- Write skill instructions, metadata, references, and tests in English. User-facing agent replies and chart titles follow the user's requested or conversation language while preserving identifiers, syntax, and data verbatim.
- Keep general ScopeDB syntax and product manuals in official documentation on `scopedb.io`, and keep skill references focused on task routing, core ScopeQL semantics and dialect pitfalls, `scope` CLI workflows, and ScopeView conversion/rendering contracts.
- Grow troubleshooting guidance from verified ScopeDB cases rather than speculative recipes: state the symptom, applicable versions, authoritative documentation link, minimal synthetic example, and verified resolution.
- Keep `skills/scopedb/` self-contained and portable across installers (`npx skills`, Claude Code plugins, and Codex `$skill-installer`). All local links inside `skills/scopedb/` must resolve within that directory without symlinks or references to repository-root files.
- Increment the semantic version in both `package.json` and `.claude-plugin/marketplace.json` (`metadata.version` and `plugins[0].version`) whenever shipping changes under `skills/scopedb/`. Claude Code caches installed plugins by version and will retain stale skill files unless the marketplace plugin version increases.

## Tests and continuous integration

### Runtime compatibility and releases

The skill supports stable `scope` CLI `0.2.x` releases and ScopeView `>=0.1.1 <0.2.0`. These ranges express a ScopeDB compatibility policy, not a stability guarantee supplied by SemVer for `0.x` software. Compatible runtime patches normally need no skill change; changes to supported contracts or instructions do.

Before recommending a runtime patch, verify the skill's existing workflows against the candidate artifact: CLI flags, authentication/workspace behavior, JSON shape, exact numeric output, and success/error handling; ScopeView document validation, HTML export, exact readings, NULL/zero handling, and the documented Node.js requirement. Use synthetic inputs and an isolated test environment. An incompatible change requires a new compatibility line and coordinated skill guidance rather than relying on an agent to infer the new contract from help output.

When changing a supported line, document the replacement and migration steps and link the runtime project's published support policy, including the old line's support end date and which fixes will be backported. Do not promise indefinite support for an old runtime or assume its availability guarantees continued compatibility with the hosted service. Keep the skill and marketplace version bump in the same release as the updated guidance.

### Repository checks

`scripts/check.mjs` and `tests/check.test.mjs` verify frontmatter rules, file restrictions, local Markdown link resolution, and optional `agents/openai.yaml` metadata offline without database credentials, ScopeView, or model calls. `.github/workflows/ci.yml` runs `pnpm lint`, `pnpm check`, and `pnpm test` on pull requests and `main` pushes.

Keep local scratch files and test artifacts in ignored `.local/` or `/tmp`, and never commit credentials, private endpoints, or customer query results.
