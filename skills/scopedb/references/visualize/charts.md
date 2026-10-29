# Chart selection and public documents

Use ScopeView's version-1 document contract. The examples below are complete synthetic documents accepted by `@scopedb/scopeview@0.1`. See [results](results.md) for lossless result conversion and [rendering](runtime.md) for the public schema and CLI validator.

| Question                              | Chart             | Conditions                                                             |
| ------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| Change over time                      | `line` or `area`  | Preserve sample timestamps and gaps; stack only additive quantities    |
| Compare categories                    | `bar`             | Categorical or timestamp `x`; one or more numeric `y` fields           |
| Rank categories with exact readings   | `top-list`        | Preserve result ordering and distinct labels; state any `LIMIT`        |
| Compare two numeric fields            | `scatter`         | Numeric `x` and `y`; optional categorical `color`                      |
| Show parts of a whole                 | `pie` or `treemap`| Nonnegative parts that sum to a verified common total                  |
| Show summary scalar quantities        | `big-number`      | Single row containing the requested scalar metrics                     |
| Inspect records or many exact columns | Markdown table    | Keep original column names and values                                  |

## Ranked comparison

```json
{
  "version": 1,
  "title": "Requests by service",
  "description": "Synthetic returned rows; counts in requests",
  "data": {
    "fields": [
      { "name": "service", "data_type": "string" },
      { "name": "requests", "data_type": "number" }
    ],
    "rows": [["api", "12"], ["worker", "0"]]
  },
  "spec": {
    "visualization": "top-list",
    "encoding": { "category": "service", "value": "requests" }
  },
  "semantics": { "provenance": { "kind": "rows", "scope": "returned" } }
}
```

For `bar`, set `visualization` to `"bar"` and `encoding` to `{ "x": "service", "y": ["requests"] }`. Time-series charts use a `timestamp` `x` field with `line` or `area` and an optional categorical `series` field. Numeric `x` values require `scatter` with scalar `x` and `y` fields and optional `color`. Check the CLI's built-in `example` and `schema` commands for additional encodings.

## Exact scalar readings

```json
{
  "version": 1,
  "title": "Synthetic snapshot readings",
  "data": {
    "fields": [
      { "name": "exact_count", "data_type": "number" },
      { "name": "zero_count", "data_type": "number" },
      { "name": "missing_count", "data_type": "number" }
    ],
    "rows": [["18446744073709551615", "0", null]]
  },
  "spec": {
    "visualization": "big-number",
    "encoding": { "values": ["exact_count", "zero_count", "missing_count"] }
  }
}
```

Use `big-number` only when the data is already a single summary row, keeping `null` distinct from `"0"`. Include units, reporting timezone, and coverage or sampling bounds in the chart's `description`, and keep source category identifiers intact even when translating titles into the user's language.
