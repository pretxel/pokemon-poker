## 1. Establish the Baseline

- [x] 1.1 Record the supported Node.js and npm versions and run the existing root tests/build plus the client build to capture pre-upgrade failures.
- [x] 1.2 Capture `npm ls --depth=0`, outdated-package, and production/full audit results for both npm projects.
- [x] 1.3 Reconcile each manifest with source imports, configuration, tests, and scripts; document the disposition of missing, unused, and intentionally retained packages.

## 2. Select Compatible Target Versions

- [x] 2.1 Review stable releases, engine constraints, peer dependencies, and migration guidance for every root direct dependency and record selected or deferred targets.
- [x] 2.2 Review stable releases, engine constraints, peer dependencies, and migration guidance for every `client/` direct dependency and record selected or deferred targets.
- [x] 2.3 Confirm whether the standalone Socket.IO client/server path remains supported, declaring required packages if it does and leaving architectural removal to a separate change if it does not.

## 3. Upgrade the Root Application

- [x] 3.1 Upgrade the Next.js, React, React DOM, Next companion, and matching React type dependency group and apply required framework compatibility changes.
- [x] 3.2 Upgrade the Prisma CLI and Prisma Client together, regenerate the client through project scripts, and apply required schema/configuration compatibility changes.
- [x] 3.3 Upgrade Pusher, Vercel, TypeScript, Jest, ts-jest, Node/Jest types, and remaining root dependencies in compatible groups, applying only required source or configuration migrations.
- [x] 3.4 Regenerate the root `package-lock.json` with npm and confirm the manifest contains all and only verified direct dependencies.

## 4. Upgrade the Standalone Client

- [x] 4.1 Upgrade the client React and React DOM pair and apply required source compatibility changes.
- [x] 4.2 Upgrade Vite with its React plugin and upgrade Socket.IO Client, applying required build or connection compatibility changes.
- [x] 4.3 Regenerate `client/package-lock.json` with npm and confirm the client manifest contains all and only verified direct dependencies.

## 5. Verify Reproducibility and Behavior

- [x] 5.1 From a clean dependency state, run `npm ci`, `npm ls --depth=0`, the root test suite, and the root production build successfully.
- [x] 5.2 From a clean dependency state, run `npm ci`, `npm ls --depth=0`, and the production build successfully in `client/`.
- [x] 5.3 When a real-time dependency changed, smoke-test room creation and joining, voting, reveal/reset behavior, and the applicable Pusher or Socket.IO connection path.

## 6. Close Security and Migration Findings

- [x] 6.1 Run production and full dependency audits in both projects, remediate available high/critical production findings, and regenerate affected lockfiles.
- [x] 6.2 Document any deferred package target or unresolved high/critical production finding with its blocker, exposure, mitigation, and follow-up action.
- [x] 6.3 Review the final manifest, lockfile, source, and configuration diff to confirm every non-lockfile change is attributable to dependency maintenance and all validation evidence is captured.
