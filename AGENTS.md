# ScopeDB skills contributor instructions

This repository publishes the official ScopeDB [Agent Skill](https://agentskills.io/specification) at `skills/scopedb/`.

## Architecture

- Publish only `skills/scopedb/SKILL.md` as the single discovery entry. Query, ScopeQL, and visualization live as internal modules under `skills/scopedb/references/`; never add nested or peer `SKILL.md` entries.
- Keep `skills/scopedb/SKILL.md` focused on task routing and shared guardrails, loading detailed references on demand.
- Keep the installed skill directory instruction-only: `SKILL.md`, Markdown references under `references/`, and optional host metadata at `agents/openai.yaml`. Do not add executable scripts, runtime lockfiles, build artifacts, or symlinks inside `skills/scopedb/`.
- Delegate live queries to the official `scope` CLI, language reference details to official ScopeDB documentation, and chart validation/rendering to public `@scopedb/scopeview` releases.
- Keep `package.json` and `.claude-plugin/marketplace.json` (`metadata.version` and `plugins[0].version`) at the same `X.Y.Z` version, and bump that version whenever changes under `skills/scopedb/` are shipped so Claude Code plugin caches receive the update.

## Markdown

- Keep each prose paragraph and each list item's prose on one source line in all Markdown files. Do not insert hard line breaks merely to satisfy a line-width limit.
- Format Markdown tables with aligned columns and consistent delimiter rows.
- Preserve meaningful paragraph boundaries, explicit line breaks, nested lists, code blocks, and other syntax that requires newlines. Keep links within `skills/scopedb/` relative and self-contained.

## Pull requests

Use `<type>[optional scope]: <description>` for every new or renamed PR title, for example `docs: clarify CLI installation` or `refactor(skills): tighten query workflow`. Allowed types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert`. Semantic PR checks the title only; valid commit messages do not compensate for an invalid PR title. Use the same convention for commit messages.

## Verification

Run `pnpm lint`, `pnpm check`, `pnpm test`, and `git diff --check` before handoff. Keep generated output, temporary scripts, credentials, and real query results out of repository commits.
