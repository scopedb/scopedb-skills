# Use the ScopeDB CLI

Use the official `scope` CLI from `PATH` or a user-supplied executable path. These instructions support stable `0.2.x` releases. Check `scope version`, `scope --help`, and the relevant subcommand help before using version-dependent flags. Retain the executable path and exact version with the task's execution evidence. Use the [CLI installation guide](https://www.scopedb.io/docs/developer/scopedb-cli), the [CLI connection guide](https://www.scopedb.io/docs/developer/scopedb-cli/connect), and the [CLI query guide](https://www.scopedb.io/docs/developer/scopedb-cli/query) as the authoritative references, checking that they apply to the installed release.

Keep an existing CLI outside `0.2.x` in place rather than automatically replacing or downgrading it. Before using it, verify the required command flags, authentication and workspace behavior, JSON structure, numeric representation, and success/error semantics against documentation or release notes for that version. Help output establishes available commands, not these behavioral contracts. Use authorized read-only checks to confirm observable behavior; do not initiate login or change workspace as a compatibility probe. If a required contract remains unverified, stop the affected workflow, preserve any prepared query or document, and explain which CLI/skill update or compatibility evidence is needed.

## Install or locate the CLI

If `scope` is missing and the user wants to set up or connect in this environment, select the highest stable `v0.2.x` tag from the [official releases](https://github.com/scopedb/scopedb-cli/releases), excluding drafts and prereleases. Download that tag's archive (`scope_<version>_<os>_<arch>.tar.gz` on `darwin`/`linux` for `arm64`/`amd64`, or `.zip` on `windows`) and its `checksums.txt`, and verify the SHA-256 checksum before extracting. For a source build, use `go install github.com/scopedb/scopedb-cli/cmd/scope@<selected-tag>` with that exact tag and its documented Go toolchain requirement. Do not use `releases/latest` or `@latest` to select a version outside the supported line. If no compatible release can be obtained, report the blocker rather than silently switching release lines.

Install the binary into a user-writable directory such as `$HOME/.local/bin/scope` and verify that `scope version` reports the selected release before continuing. Do not modify shell profile files without asking, overwrite an existing installation silently, or install an unrelated package named `scope`.

## Resolve connection state

First check whether `SCOPEDB_ENDPOINT` and `SCOPEDB_API_KEY` are set in the environment, without printing or reading their values:

- **Both variables are set:** `scope` uses them for queries and takes precedence over any saved CLI login. Proceed directly to [verifying the connection](#verify-and-query).
- **Only one variable is set:** ask the user to complete the endpoint/key pair in their environment following the [application connection guide](https://www.scopedb.io/docs/guides/connect-to-scopedb) (or unset both to use a personal CLI login). Do not clear environment variables on their behalf.
- **Neither variable is set:** inspect the saved CLI login and selected workspace:

```sh
scope auth status --format json
scope workspace get --format json
```

`scope auth status --format json` reports `credential_source` (`keyring`, `plaintext`, or `environment`), account status, and session expiry. When logged in, `scope workspace get --format json` reports the selected workspace's `connection.endpoint` and `provisioning.status`.

| Observed state                                                                   | Next step                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No saved login and no environment credentials                                    | Guide the user through [signing in](#complete-an-authorized-login) in the environment where `scope` runs.                                                                                                                   |
| Login is expired, revoked, or rejected                                           | Stop dependent queries and have the user sign in again.                                                                                                                                                                     |
| Environment credentials are rejected                                             | Ask the user to verify that `SCOPEDB_ENDPOINT` and `SCOPEDB_API_KEY` belong to the same workspace and that the key is active. Browser login does not replace this override.                                                 |
| Logged in, but no workspace is selected                                          | Run `scope workspace list --format json` to inspect available workspaces. When the target is clear and authorized, select it with `scope workspace use '<id-or-name>'`.                                                     |
| Account is pending, no workspace exists, or `provisioning.status` is not `ready` | Preserve the login, report the state, and direct the user to [ScopeDB Console](https://console.scopedb.cloud/) (or `scope console`). Wait until `provisioning.status` is `ready`.                                           |
| Network or OS keyring restriction prevents execution                             | Report the actual restriction. For headless Linux without a D-Bus Secret Service keyring, see the [Linux credential storage guide](https://www.scopedb.io/docs/developer/scopedb-cli/connect#linux-servers-and-containers). |

## Complete an authorized login

Start login only when the user has requested connection setup or authorized signing in for the task. If the user does not have a ScopeDB Cloud account yet, ask them to [create an account](https://console.scopedb.cloud/?signup) first.

Choose the flow matching the execution environment:

- **Local computer with a browser:** run `scope auth login`. It opens the browser for approval in ScopeDB Console and waits for a localhost callback on the same device. If the browser does not open, give the user the printed URL to open on that computer.
- **SSH, container, or remote agent:** run `scope auth login --use-device-code --no-browser`. Show the user the printed verification URL as a clickable link and the displayed device code, and keep the command running while they approve it in their browser. (`--no-browser` alone only skips browser launch; `--use-device-code` is required for cross-device approval.)

The CLI prefers the OS keyring and falls back to an unencrypted `0600` file with a stderr warning when keyring storage fails (`--insecure-storage` explicitly selects plaintext for that login). Never ask the user to paste passwords, tokens, or credential files into chat.

When prompting the user to complete a login step, state which operation is waiting, give the single action needed in their language, and explain how you will resume. Once login completes, re-verify `scope auth status --format json` and `scope workspace get --format json` before continuing the task.

## Verify and query

Before reporting that a connection is ready, run a live readiness query:

```sh
scope query --format json 'SELECT 1 AS ready'
```

Require a successful exit status and one row with `ready` equal to `1`. When deeper connection diagnostics are needed, run `scope doctor --format json --timeout 15s` and inspect `checks` (a passing `data plane` check confirms query access; exit code `0` alone can still include warnings for incomplete account setup).

For read-only queries, pass a statement inline or from a file:

```sh
scope query --file query.scopeql --format json --timeout 1m > result.json
```

`--format json` emits a JSON array of row objects (`table`, `jsonl`, and `csv` are also supported). Write redirected output to a fresh path so shell redirection (`>`) cannot truncate an existing result file before execution. Retain the exact statement, exit status, diagnostics, and raw output. If a query times out or is interrupted, retain the reported statement ID before deciding whether to retry. Do not switch workspaces silently or fall back to ad-hoc HTTP requests when a CLI query fails.
