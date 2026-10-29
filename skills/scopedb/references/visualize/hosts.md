# Host presentation

Complete, self-contained HTML is the default delivery format. Link the exported `.html` file using the current host's file-linking or preview mechanism.

Use inline HTML fragment embedding only when the current host environment explicitly provides an executable HTML fragment or custom view capability. When supported, generate the fragment through `@scopedb/scopeview/embed` and follow the host's documented contract while still keeping the complete `.html` file linked as a portable fallback.

Distinguish between exporting an HTML file, inspecting it in a browser tool, and rendering it inline in the chat UI, and report only the presentation steps that succeeded. If inline output exceeds host size limits or fails to render, fall back to linking the complete HTML file without truncating the underlying data.
