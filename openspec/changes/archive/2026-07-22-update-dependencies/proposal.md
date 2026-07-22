## Why

The root application and standalone client depend on aging and potentially mismatched package versions, which increases security, compatibility, and maintenance risk. Refreshing both dependency sets together provides a tested baseline and keeps their lockfiles reproducible.

## What Changes

- Audit direct production and development dependencies in the root and `client/` npm projects.
- Upgrade dependencies to current stable versions, including compatible major releases where the required migration is practical.
- Update both npm lockfiles so clean installs resolve the reviewed versions deterministically.
- Adapt application code, configuration, and tests where dependency API or tooling changes require it.
- Validate installs, tests, and production builds for both projects, and review the resulting dependency trees for known vulnerabilities.

## Capabilities

### New Capabilities

- `dependency-maintenance`: Defines the requirements for coordinated, reproducible, and verified dependency updates across both npm projects.

### Modified Capabilities

None.

## Impact

- Affects `package.json`, `package-lock.json`, `client/package.json`, and `client/package-lock.json`.
- May affect source code, test configuration, build configuration, and Prisma-generated integration points when required by upgraded packages.
- Does not intentionally change product behavior or public application APIs; any unavoidable breaking migration must be identified and validated during implementation.
