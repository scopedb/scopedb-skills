# Visualize ScopeDB results

Turn a verified ScopeDB result into an interactive chart that answers the user's visual question. Start with the raw result, verified field types, and requested comparison. Use a Markdown table when the user wants a record list or multi-field table. Load [query](../query/index.md) only if fresh data is needed.

Follow the steps below, skipping any step already satisfied by the inputs:

| Task                        | Reference                                | Outcome                                                                         |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| Convert the supplied result | [Preserve and map values](results.md)    | Ordered fields and cells with exact digits, NULLs, and timestamps               |
| Choose the chart            | [Chart forms and examples](charts.md)    | A ScopeView v1 document matching the question                                   |
| Validate and render         | [Public rendering tools](runtime.md)     | Offline HTML exported through an available renderer or `@scopedb/scopeview` CLI |
| Inspect and deliver         | [Delivery and verification](delivery.md) | Linked HTML artifact, source context, and observed checks                       |

ScopeDB-specific result conversion happens here; ScopeView provides document validation and rendering. Keep source identities, ordering, units, and reporting limits intact without silently aggregating, filling gaps, or truncating rows to fit a chart.

Load [host presentation](hosts.md) only when inline embedding is requested and supported by the current host. If a renderer cannot be executed in the current environment, deliver the prepared ScopeView document and source evidence and state that HTML export remains to be run.
