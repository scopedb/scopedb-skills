# Render with public tools

Load this guide when exporting or validating a chart. The supported renderer is the public [`@scopedb/scopeview`](https://www.npmjs.com/package/@scopedb/scopeview) package on npm (stable `>=0.1.1 <0.2.0` releases, expressed as `~0.1.1`).

When an integrated ScopeView rendering tool is not already provided by the host, invoke the compatible `~0.1.1` release range on demand in a shell with Node.js 24+ and npm:

```sh
npm exec --yes --ignore-scripts --package='@scopedb/scopeview@~0.1.1' -- scopeview schema
npm exec --yes --ignore-scripts --package='@scopedb/scopeview@~0.1.1' -- scopeview example top-list
npm exec --yes --ignore-scripts --package='@scopedb/scopeview@~0.1.1' -- scopeview validate document.json --json
npm exec --yes --ignore-scripts --package='@scopedb/scopeview@~0.1.1' -- scopeview render document.json --output chart.html --theme system --json
```

Write generated files to a task output directory outside the installed skill and avoid modifying the user's project `package.json` just to render a chart.

`scopeview` consumes a ScopeView document prepared with [results](results.md) and [charts](charts.md) rather than a raw ScopeDB query response. For programmatic rendering or host embedding, `@scopedb/scopeview` and `@scopedb/scopeview/embed` are also exported by the same package. If package execution is unavailable in the environment, deliver the validated or prepared ScopeView JSON document and state that HTML rendering could not be run locally.
