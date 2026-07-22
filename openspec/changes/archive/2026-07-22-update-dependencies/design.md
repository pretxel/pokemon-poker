## Context

The repository contains two independently installed npm projects: the root Next.js application with Prisma, Pusher, Jest, and TypeScript tooling, and a legacy-style `client/` Vite application using React and Socket.IO. Each project owns a `package.json` and `package-lock.json`. Some packages must move as compatible sets (for example React with React DOM, Prisma CLI with Prisma Client, and Vite with its React plugin), and major upgrades can impose Node.js, configuration, generated-client, or source API migrations.

## Goals / Non-Goals

**Goals:**

- Establish a current, mutually compatible set of direct production and development dependencies for both npm projects.
- Ensure each manifest reflects packages actually required by its source and scripts, and remove dependencies that are demonstrably unused.
- Preserve reproducible clean installs with synchronized npm lockfiles.
- Complete required compatibility migrations and validate the existing application, tests, and builds.
- Leave no unresolved high- or critical-severity production vulnerability without an explicit rationale and follow-up.

**Non-Goals:**

- Adding product features or intentionally changing public application behavior.
- Replacing npm, merging the two projects, or restructuring the application architecture.
- Opportunistic refactors unrelated to an upgraded dependency.
- Updating transitive package versions by hand outside npm's lockfile resolution.

## Decisions

### Use an inventory-driven upgrade rather than a blind latest-version rewrite

Implementation will compare each manifest with source imports, scripts, the installed tree, outdated-package output, peer constraints, release notes, and the supported Node.js runtime. Direct dependencies will be upgraded to current stable releases when compatible; blocked upgrades will remain pinned to the newest safe compatible release with the reason recorded. This is preferred over blindly selecting every newest major because framework and tooling majors often require coordinated migrations.

### Upgrade compatibility groups together

React and React DOM (plus their type packages), Next.js and its companion package, Prisma CLI and Prisma Client, Jest and its TypeScript integration, and Vite and its React plugin will be evaluated and upgraded as groups. This keeps peer dependencies and generated/runtime code aligned. Updating packages one at a time was rejected because it can create misleading intermediate failures and invalid peer combinations.

### Keep the projects independently reproducible

The root and `client/` manifests and lockfiles will remain separate. Dependency changes will be installed from each project directory, and `npm ci` must succeed independently afterward. Converting to npm workspaces was rejected as an architectural change beyond dependency maintenance.

### Limit compatibility edits to upgrade fallout

Source, test, and configuration edits are allowed only when required by documented package API, module, runtime, or configuration changes. Prisma artifacts will be regenerated through project scripts rather than edited manually. Existing test and build behavior supplies the regression boundary.

### Use explicit validation gates

The root project must pass clean installation, its test suite, and its production build; the client must pass clean installation and its production build. Both dependency trees will be checked for invalid or missing direct packages and audited, with production high/critical findings fixed or explicitly documented before completion.

## Risks / Trade-offs

- [A major framework or React upgrade changes runtime behavior] → Review official migration guidance, upgrade the compatibility group together, and exercise tests plus production builds.
- [The supported Node.js version changes] → Determine package engine requirements before selecting versions and document any required runtime baseline change.
- [A package has no safe compatible release] → Use the newest safe compatible version and document the blocker instead of forcing an unstable migration.
- [Lockfile churn obscures meaningful changes] → Change direct requirements intentionally, regenerate with npm, and review manifest and dependency-tree diffs separately.
- [Existing coverage misses interactive regressions] → Perform a focused smoke check of room creation/joining, voting, reveal/reset, and both real-time implementations when their dependencies change.
- [An imported package is undeclared or a declared package is obsolete] → Reconcile manifests against source and scripts before final validation.

## Migration Plan

1. Record the current Node.js/npm versions, dependency trees, tests, builds, and audit results for both projects.
2. Reconcile manifest declarations with actual source and script usage.
3. Upgrade grouped dependencies in controlled batches, applying only required migrations and validating after each high-risk group.
4. Regenerate both lockfiles through npm and verify clean installations.
5. Run the complete validation gates and record any intentionally deferred version or vulnerability with rationale.
6. Deploy through the existing application workflow and smoke-test core planning-poker flows. Roll back by reverting the dependency, lockfile, and compatibility-migration commit set together.

## Open Questions

- The exact target versions and any new Node.js minimum will be determined from stable releases and peer/engine constraints at implementation time.
- Whether the standalone Socket.IO client/server path is still supported must be confirmed from repository usage; if obsolete, removal should be proposed separately rather than assumed during this change.
