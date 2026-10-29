# Releasing ScopeDB Skills

ScopeDB Skills is distributed from GitHub. A formal release is the reviewed commit identified by a published `vX.Y.Z` tag. Repository visibility, a merge to `main`, or a version string in a manifest does not by itself constitute a release. The repository's npm package remains private and is not published to npm.

## Skill versions and release boundaries

Keep these three values identical:

- `package.json`: `version`
- `.claude-plugin/marketplace.json`: `metadata.version`
- `.claude-plugin/marketplace.json`: `plugins[0].version`

Before the first `v0.1.0` tag, `0.1.0` is the unreleased initial candidate. Fixes and documentation changes made while preparing it retain `0.1.0`. Do not increment the version for each pull request.

After a version has been released, select the next version when preparing the next release's skill changes and update the three fields together. Multiple pull requests can contribute to that unreleased candidate without further increments. Use patch releases for compatible instruction fixes, minor releases for new capabilities, and a new minor line for incompatible changes during `0.x`. From `1.0.0`, use major versions for incompatible changes. Never move a published release tag or reuse its version for different released content.

The skill version is independent of the `scope` CLI version, the ScopeView package version, and the ScopeView document format version. For example, skill `0.1.0` can use CLI `0.2.x` and ScopeView `0.1.1`; changing a supported dependency does not require matching its version number.

## Installations following main

The default installation commands follow `main`, so users can install unreleased candidate content before its tag exists. This is development distribution, not a formal release channel. Users who require a fixed release should install a published tag.

Claude Code caches plugins by their manifest version, independently of GitHub tags. Refreshing the marketplace does not replace cached plugin files when that version is unchanged. When testing multiple revisions of an unreleased candidate, refresh the marketplace and uninstall/reinstall the plugin in an isolated configuration to obtain a fresh copy. Do not increment the release candidate merely to refresh a development installation. For a new released version, refresh the marketplace, update the plugin, and restart the session when prompted.

Skills CLI installations following `main` can receive content updates through their installer without a manifest version change. A pinned installation stays on its selected ref until explicitly reinstalled from another ref.

## Runtime compatibility

The skill supports stable `scope` CLI `0.2.x` releases and ScopeView `>=0.1.1 <0.2.0`. These ranges express a ScopeDB compatibility policy, not a stability guarantee supplied by SemVer for `0.x` software. Compatible runtime patches normally need no skill change; changes to supported contracts or instructions do.

Before recommending a runtime patch, verify the skill's existing workflows against the candidate artifact: CLI flags, authentication/workspace behavior, JSON shape, exact numeric output, and success/error handling; ScopeView document validation, HTML export, exact readings, NULL/zero handling, and the documented Node.js requirement. Use synthetic inputs and an isolated test environment. An incompatible change requires a new compatibility line and coordinated skill guidance rather than relying on an agent to infer the new contract from help output.

When changing a supported line, document the replacement and migration steps and link the runtime project's published support policy, including the old line's support end date and which fixes will be backported. Do not promise indefinite support for an old runtime or assume its availability guarantees continued compatibility with the hosted service. Include updated dependency guidance in the skill's next release, retaining the candidate version if it has not yet been released.

## Release checklist

1. Review the candidate's changes, verify its version fields match, and confirm that its `vX.Y.Z` tag does not already exist.
2. Run `pnpm lint`, `pnpm check`, `pnpm test`, `git diff --check`, and `claude plugin validate .`. Verify changed workflows using synthetic inputs, including applicable runtime compatibility checks above.
3. Verify Skills CLI and Claude Code plugin installation from the candidate in isolated directories, including complete references and skill discovery. For releases after the first, also verify updating an installation of the previous release to the candidate.
4. Merge the reviewed candidate, then create and push `vX.Y.Z` at that exact commit when the release is authorized. Describe user-visible changes, supported runtime lines, and migration requirements in the release notes.
5. Verify installation from the published tag without GitHub credentials. Keep the tag immutable and prepare any subsequent fixes under the next release candidate.
