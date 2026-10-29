---
name: scopedb
description: Connect to and query ScopeDB, write or debug ScopeQL, maintain reusable analysis context, and visualize results as interactive charts. Use when getting started with ScopeDB, setting up the CLI, exploring schemas, answering data questions, translating SQL to ScopeQL, or charting saved or live results.
license: Apache-2.0
---

# ScopeDB

Load the guide for the requested outcome, then only the references that task needs.

| Requested work                                                       | Load                                                                                                | Completion evidence                                                                               |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Get started, install or sign in with the CLI, or verify a connection | [CLI](references/query/cli.md), then [Query](references/query/index.md) to explore tables as needed | CLI, workspace state, and `SELECT 1 AS ready` verified; next human step or initial schema summary |
| Write, explain, translate, or review ScopeQL                         | [ScopeQL](references/scopeql/index.md)                                                              | Query or explanation delivered with its documentation basis and any untested assumptions          |
| Discover schemas, answer a data question, or maintain context        | [Query](references/query/index.md)                                                                  | Verified output inspected; answer includes the executed query, definitions used, and limits       |
| Diagnose query errors, unexpected results, or slow execution         | [Query](references/query/index.md)                                                                  | Diagnosis tied to observed evidence; proposed fixes distinguished from verified fixes             |
| Chart a supplied result or export portable HTML                      | [Visualization](references/visualize/index.md)                                                      | Document validated and exported HTML linked, with preview status stated                           |
| Answer a live data question with a chart                             | [Query](references/query/index.md) first, then [Visualization](references/visualize/index.md)       | Query and chart criteria met from the same verified result without rerunning the query            |

When syntax, function signatures, CLI options, or version details need checking, follow the [official documentation workflow](references/documentation.md).

Reuse supplied schemas, saved results, user-maintained context documents, and verified connection state from the current session. Preserve the exact statement, untouched result values, verified field types, and reporting limits across guides. Report only the validation, execution, and display steps actually completed.

Language work needs no database connection or renderer; saved results need no fresh query; querying needs no renderer. Prefer the official `scope` CLI for live queries, reusing its established workspace and authentication. Use public ScopeView tools on demand for charts. If a required executor is unavailable, return the prepared query or document and state what remains unperformed.

Keep database access read-only by default: when the user requests getting started or connection setup and no valid session exists, guide or start the login flow, but do not overwrite an existing login, switch a selected workspace silently, edit saved context files, or create, modify, or delete database objects unless requested. For user-requested catalog changes, follow the [CLI catalog workflow](https://www.scopedb.io/docs/developer/scopedb-cli/catalog). Complete HTML is the chart default; inline display requires explicit host support. Use the requested output language, otherwise the conversation language, while preserving syntax, identifiers, and source data verbatim.
