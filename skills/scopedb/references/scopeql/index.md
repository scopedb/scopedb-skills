# ScopeQL

ScopeQL is ScopeDB's relational pipeline query language. A query is a sequence of clauses evaluated in written order without pipe characters (`|`) or SQL's fixed `SELECT ... FROM ...` ordering. Each clause consumes the relation produced by the preceding clause, and clauses such as `WHERE` and `SELECT` can repeat as the relation is refined:

```scopeql
FROM app_events
WHERE time >= '2026-10-01T00:00:00Z'::timestamp
  AND time < '2026-10-02T00:00:00Z'::timestamp
GROUP BY service
AGGREGATE count() AS events
WHERE events >= 10
ORDER BY events DESC
LIMIT 20
```

## Core semantics and dialect translation rules

Apply these rules when writing, reviewing, or translating SQL or Kusto into ScopeQL:

| Area                                  | ScopeQL rule                                                                                                                                       | SQL / Kusto habit to avoid                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Column scope and projection           | `SELECT` replaces the current relation's columns; use `SELECT *, expr AS alias` to append a computed column while retaining existing ones          | Projecting a subset in `SELECT` and referencing dropped columns in a later `WHERE`, `GROUP BY`, or `ORDER BY`  |
| Aggregation and group filtering       | Place aggregate expressions in `AGGREGATE` (with `GROUP BY` when grouping), and filter aggregate outputs with a subsequent `WHERE` clause          | Putting `count()` inside `SELECT`, writing `count(*)` instead of `count()`, or using `HAVING`                  |
| Windowing and deduplication           | Use `GROUP BY ... WITHIN GROUP ORDER BY ... WINDOW row_number() AS rn` (`row_number()` is zero-based) or `DISTINCT ON key BY sort_expr`            | Writing `OVER (PARTITION BY ...)` or filtering `row_number() = 1` for the first row without accounting for `0` |
| Casts and named arguments             | Cast explicitly with `expr::type` (`'2026-10-01T00:00:00Z'::timestamp`) and pass named arguments with `=>` (`floor(time, n => 1, unit => 'hour')`) | Relying on implicit string-to-timestamp coercion or positional time-bucket arguments                           |
| Semi-structured data (`any`/`object`) | Access nested paths with `payload['region']::string` and cast to a scalar type before comparing, grouping, or sorting                              | Using PostgreSQL `->>` operators or grouping directly on untyped nested values                                 |
| Joins and subqueries                  | Filter a right-hand table inside a parenthesized subquery (`LEFT JOIN (FROM s WHERE active = true) AS s ON ...`) to keep unmatched left rows       | Assuming `WITH` CTE syntax exists, or filtering right-table columns in an outer `WHERE` after a `LEFT JOIN`    |

Preserve the user's population, reporting window and timezone, row grain, NULL semantics, tie-breaking rules, and exact versus approximate calculations (`SAMPLE ... PERCENT` changes the population and is not an exact optimization). When a source SQL feature has no verified ScopeQL equivalent, identify the unresolved part rather than inventing syntax or functions.

## Official documentation

Consult the relevant reference page when verifying clauses, types, or function signatures:

| Topic                                             | Documentation                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| Find a specific topic                             | [Documentation index](https://www.scopedb.io/llms.txt)                       |
| Filtering, search, aggregation, and join patterns | [Query guide](https://www.scopedb.io/docs/guides/query-events)               |
| Query pipeline syntax and clauses                 | [Query reference](https://www.scopedb.io/docs/reference/commands/stmt-query) |
| Data types and type conversions                   | [Data types](https://www.scopedb.io/docs/reference/data-types)               |
| Built-in aggregate, scalar, and window functions  | [Function reference](https://www.scopedb.io/docs/reference/functions)        |
| DDL and DML statement syntax                      | [Commands reference](https://www.scopedb.io/docs/reference/commands)         |

Read only the pages needed for the current task. For live schema discovery, connection setup, or investigating observed errors and query performance, use the [query workflow](../query/index.md).
