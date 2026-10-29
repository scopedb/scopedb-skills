# ScopeDB Agent Skill

Connect to and query ScopeDB, write and repair ScopeQL, maintain reusable analysis context, and turn results into portable interactive charts. One [Agent Skill](https://agentskills.io/specification) loads the relevant guidance on demand.

## Install

Choose one installation method for each agent and scope to avoid duplicate copies.

### Skills CLI

With Node.js and npm available, run the [Skills CLI](https://github.com/vercel-labs/skills) from the project where you want to use the skill:

```sh
npx skills add scopedb/scopedb-skills --copy
```

Choose your agent in the installer, or pass `--agent codex`, `--agent claude-code`, or another supported agent. Installation is project-scoped by default. For user-wide Codex availability:

```sh
npx skills add scopedb/scopedb-skills --agent codex --global --copy
```

For Codex, the CLI installs into `.agents/skills/scopedb/` in the project, or `~/.agents/skills/scopedb/` with `--global`. `--copy` creates an independent installed copy. To install from the current checkout, use `npx skills add . --copy`.

### Claude Code plugin

In Claude Code, add this repository as a plugin marketplace and install the `scopedb` plugin:

```text
/plugin marketplace add scopedb/scopedb-skills
/plugin install scopedb@scopedb-skills
```

### Codex skill-installer

Ask Codex to use its built-in [skill-installer](https://learn.chatgpt.com/docs/build-skills#install-curated-skills-for-local-use):

```text
Use $skill-installer to install the ScopeDB skill from
https://github.com/scopedb/scopedb-skills/tree/main/skills/scopedb
```

This installer defaults to `$CODEX_HOME/skills/scopedb/`, usually `~/.codex/skills/scopedb/`, for user-wide availability.

For a manual installation, copy the entire `skills/scopedb/` directory into your agent's skill directory, preserving its relative paths. All methods install the references alongside `SKILL.md`; the agent reads them only when needed. The installed skill works independently of this checkout.

## Update

Use the same installer and scope as the original installation. Updates replace installed files, so preserve any local edits first.

### Skills CLI

Check for available updates:

```sh
npx skills check
```

Then use the command matching your installation scope. Run project updates from that project:

```sh
# Project installation
npx skills update scopedb --project

# User-wide installation
npx skills update scopedb --global
```

The CLI tracks the source and ref in its lock file. See the [command reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-update) for update options.

### Claude Code plugin

Refresh the marketplace catalog and update the installed plugin in Claude Code:

```text
/plugin marketplace update scopedb-skills
/plugin update scopedb@scopedb-skills
```

Restart your Claude Code session when prompted so the updated skill files take effect.

### Codex skill-installer

The installer stops when the destination already exists; it has no in-place update command. Ask Codex to preserve the existing copy and reinstall:

```text
Update scopedb with $skill-installer from
https://github.com/scopedb/scopedb-skills/tree/main/skills/scopedb
First move the existing installation to a backup outside all skill directories,
then reinstall into the same parent directory. Keep the backup and any local edits.
```

The examples above follow `main`. Stable versions will be managed through GitHub tags. Once a tag is published, use the GitHub skill URL with that tag in place of `main` with either installer. A pinned installation stays on that ref; to move to a newer tag, select the new tag explicitly when reinstalling.

## Capabilities

| Capability                                                    | What it does                                                                                              | Needed when executing                                                |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [ScopeQL](skills/scopedb/references/scopeql/index.md)         | Write, explain, translate, and repair queries using ScopeQL semantics and official documentation          | Relevant documentation; no database connection or runtime            |
| [Query](skills/scopedb/references/query/index.md)             | Connect the CLI, discover schemas, run read-only analysis, verify coverage, and maintain analysis context | The official `scope` CLI with an authorized connection for live work |
| [Visualization](skills/scopedb/references/visualize/index.md) | Preserve exact values and export a portable interactive chart from saved or live results                  | An available renderer or public ScopeView package                    |

## Try it

Ask naturally, or invoke `$scopedb` explicitly where your agent supports it:

- "Connect to my ScopeDB workspace, inspect the available tables, and suggest a first question to explore."
- "Explain why this ScopeQL loses the time column after SELECT, and fix it without connecting."
- "Translate this PostgreSQL latest-event-per-service query to ScopeQL, preserving ties and output columns."
- "Using my connected ScopeDB workspace, compare p95 request latency by service over the last 24 hours."
- "Turn this saved ScopeDB query result into a ranked bar chart that opens offline."
- "Query errors by service for the last complete UTC hour and save the result with an interactive chart."

Automatic invocation is enabled where supported. Replies and chart prose follow your requested language, otherwise the conversation language.

## How loading works

The [entry](skills/scopedb/SKILL.md) selects a capability; its guide links the documentation or CLI usage details needed for that task. Query, language, and visualization are internal modules of the same skill. The installed files are instructions, references, and optional host metadata. Loading them starts no connection and installs no software.

Queries prefer the official `scope` CLI (`0.2.x`) and reuse its current workspace and authentication. Installation and login follow the [official CLI guide](https://www.scopedb.io/docs/developer/scopedb-cli). Charts can use [`@scopedb/scopeview@0.1`](skills/scopedb/references/visualize/runtime.md) on demand; its CLI needs Node.js 24+ and npm. Saved results need no database connection. Complete HTML is the default delivery, with inline display only when the host explicitly supports it.

## License

Apache-2.0 — see [LICENSE](LICENSE).

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for authoring and validation commands. The repository keeps only a metadata/link checker and its tests outside the installed skill.
