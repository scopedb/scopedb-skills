# Render with public tools

Load this guide when exporting or validating a chart. The supported renderer is the public [`@scopedb/scopeview`](https://www.npmjs.com/package/@scopedb/scopeview) package on npm (stable `>=0.1.1 <0.2.0` releases, expressed as `~0.1.1`).

When an integrated ScopeView rendering tool is not already provided by the host, select a compatible version once per task in a shell with Node.js 24+ and npm:

```sh
scopeview_version="$(npm exec --yes --ignore-scripts --package='@scopedb/scopeview@~0.1.1' -- scopeview --version)"
```

Require a successful command and an exact stable version within the supported range before continuing. Keep that value across shell calls and use it for every schema, example, validation, and rendering command in the task:

```sh
npm exec --yes --ignore-scripts --package="@scopedb/scopeview@$scopeview_version" -- scopeview schema
npm exec --yes --ignore-scripts --package="@scopedb/scopeview@$scopeview_version" -- scopeview example top-list
npm exec --yes --ignore-scripts --package="@scopedb/scopeview@$scopeview_version" -- scopeview validate document.json --json
npm exec --yes --ignore-scripts --package="@scopedb/scopeview@$scopeview_version" -- scopeview render document.json --output chart.html --theme system --json
```

Record the exact renderer version with the validation and export results. For an integrated renderer, verify its version and document contract before relying on it; do not assume an unknown or out-of-range renderer is compatible.

Range selection and downloads depend on registry access and npm cache configuration; they do not guarantee the newest patch or offline execution. If selection fails offline, reuse a known, available exact version within the supported range only after verifying its version. Otherwise deliver the prepared document and explain that validation or rendering remains unperformed. Write generated files to a task output directory outside the installed skill and avoid modifying the user's project `package.json` just to render a chart.

`scopeview` consumes a ScopeView document prepared with [results](results.md) and [charts](charts.md) rather than a raw ScopeDB query response. For programmatic rendering or host embedding, `@scopedb/scopeview` and `@scopedb/scopeview/embed` are also exported by the same package. If package execution is unavailable in the environment, deliver the validated or prepared ScopeView JSON document and state that HTML rendering could not be run locally.
