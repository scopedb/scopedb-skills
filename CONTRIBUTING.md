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
- Keep the version in `package.json` and `.claude-plugin/marketplace.json` (`metadata.version` and `plugins[0].version`) synchronized. Follow [RELEASE.md](RELEASE.md) for release boundaries and version changes; unreleased fixes do not require a version increment per pull request.

## Tests and continuous integration

`scripts/check.mjs` and `tests/check.test.mjs` verify frontmatter rules, file restrictions, local Markdown link resolution, and optional `agents/openai.yaml` metadata offline without database credentials, ScopeView, or model calls. `.github/workflows/ci.yml` runs `pnpm lint`, `pnpm check`, and `pnpm test` on pull requests and `main` pushes.

See [RELEASE.md](RELEASE.md) for runtime compatibility acceptance and the release checklist.

Keep local scratch files and test artifacts in ignored `.local/` or `/tmp`, and never commit credentials, private endpoints, or customer query results.
