# Deliver a chart and its evidence

Export self-contained HTML with the renderer and data embedded using [public rendering](runtime.md). Write to a fresh task-owned output path while keeping source files unchanged. In your reply, link the exported `.html` file directly (using an absolute path for local file links) so the user can open it immediately.

When the user asks for a reproducible query-and-chart package, retain:

| Artifact                   | Purpose                                                                       |
| -------------------------- | ----------------------------------------------------------------------------- |
| Executed or supplied query | Exact ScopeQL statement, when available                                       |
| Original result            | Untouched query output (and response envelope or schema when supplied)        |
| ScopeView document         | Derived field mapping, chart specification, titles, and reporting context     |
| Complete HTML              | Self-contained interactive chart that opens offline without network requests  |
| Integrity manifest         | Optional SHA-256 checksums and file sizes when producing an archive bundle    |

For a standard chart request, deliver the HTML file and relevant query/result summary without extra archive packaging. If the input was a saved snapshot without its original query, note that provenance limit rather than inventing a query.

Validate the document with `scopeview validate`. When a browser tool is available, inspect the rendered HTML to confirm visual layout, exact readings, empty/`null`/zero handling, and offline loading. Report validation, HTML export, browser inspection, and inline host display according to what was actually performed. If a dataset exceeds chart size limits, explain the constraint and agree on an aggregation or filtered view rather than silently dropping rows or rounding values.
