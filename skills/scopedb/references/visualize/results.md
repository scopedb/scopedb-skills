# Result preservation and conversion

Convert a derived copy of the source result while keeping the original file or response untouched. Carry the query, field types, and reporting context into the ScopeView document.

## Choose the input contract

| Input                  | Conversion                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| CLI JSON array         | Obtain field types from verified schema, expressions, or explicit casts; map each row object in field order |
| Wire ResultSet         | Use ordered `metadata.fields` and matrix `rows`; verify `metadata.num_rows` and each row width              |
| Statement response     | Require a successful terminal status; retain the envelope and extract its `result_set`                      |
| Other supplied result  | Use its documented format and verified schema, preferring raw values over display-formatted strings         |

For CLI object arrays, ensure column names are unique and present in every row, and rely on verified schema metadata or explicit casts rather than inferring types from field names or sample values. An empty successful result retains its schema with zero rows.

## Map to public ScopeView data

Produce `data.fields` with `name` and `data_type`, and `data.rows` with ordered cell arrays. Map verified numeric ScopeDB types (`int`, `uint` / wire `u_int`, `float`) to `number`, strings and booleans to `string`, and timestamps to `timestamp`. Cells must be strings or `null` (encode booleans as `"true"` or `"false"`). Project nested `object` or `array` values to agreed scalar fields in the query or present them in a table.

Retain exact numeric lexemes before JavaScript floating-point parsing can round 64-bit integers. On Node.js 24+, decode JSON object arrays with `context.source`:

```js
const rows = JSON.parse(rawText.replace(/^\uFEFF/, ''), (_key, value, context) =>
  typeof value === 'number' ? context.source : value
);
```

Preserve timestamp strings—including timezone offsets and fractional seconds—verbatim without round-tripping through `Date`. Do not sort, limit, interpolate, or replace `null` values during conversion unless the user requested that transformation. Read [charts](charts.md) for complete ScopeView document examples.
