## ADDED Requirements

### Requirement: Dependency inventory is complete
The implementation SHALL inventory direct production and development dependencies in both the root and `client/` npm projects and SHALL reconcile manifest declarations with packages required by source code, configuration, tests, and scripts.

#### Scenario: Required package is missing from a manifest
- **WHEN** source code, configuration, a test, or a script directly requires a package that its project does not declare
- **THEN** the implementation adds the package to the appropriate manifest or documents and removes the obsolete usage

#### Scenario: Declared package is unused
- **WHEN** a direct dependency has no runtime, build, test, configuration, or script usage
- **THEN** the implementation removes it or records the verified reason it must remain

### Requirement: Direct dependencies use supported compatible releases
The implementation SHALL evaluate every direct dependency for a stable update and SHALL select versions that satisfy package peer dependencies, package engine constraints, and the repository's runtime requirements. Packages that operate as a compatibility group SHALL be updated together.

#### Scenario: Stable compatible update is available
- **WHEN** a newer stable release is compatible with the selected runtime and related packages
- **THEN** the manifest and lockfile resolve the dependency to that reviewed release range

#### Scenario: Latest stable release is blocked
- **WHEN** the latest stable release cannot be adopted without unsupported peers, an unavailable runtime, or product work outside this change
- **THEN** the implementation uses the newest safe compatible release and records the blocker and follow-up path

### Requirement: Installations are reproducible
The implementation SHALL keep `package-lock.json` synchronized with `package.json` in both npm projects and SHALL produce valid dependency trees from clean lockfile-based installations.

#### Scenario: Root project clean install
- **WHEN** `npm ci` is run from the repository root in the supported Node.js environment
- **THEN** installation completes without lockfile mismatch, missing dependency, or invalid peer-tree errors

#### Scenario: Client project clean install
- **WHEN** `npm ci` is run from the `client/` directory in the supported Node.js environment
- **THEN** installation completes without lockfile mismatch, missing dependency, or invalid peer-tree errors

### Requirement: Existing behavior remains validated
The implementation SHALL apply compatibility changes required by upgraded packages without intentionally altering product behavior and SHALL pass the available automated validation for each project.

#### Scenario: Root application validation
- **WHEN** the updated root project is validated
- **THEN** its test suite and production build complete successfully, including Prisma client generation performed by the build workflow

#### Scenario: Client application validation
- **WHEN** the updated standalone client is validated
- **THEN** its production build completes successfully

#### Scenario: Real-time dependency changes
- **WHEN** an upgraded dependency affects Pusher or Socket.IO behavior
- **THEN** the associated room, vote, reveal, reset, and connection flows are smoke-tested with no intentional behavior change

### Requirement: Production vulnerability risk is controlled
The implementation SHALL audit both resolved dependency trees and SHALL not complete with an unresolved high- or critical-severity production vulnerability unless the exception, exposure, mitigation, and follow-up are documented.

#### Scenario: Fix is available
- **WHEN** an audit reports a high- or critical-severity production vulnerability with a compatible remediation
- **THEN** the implementation applies the remediation and regenerates the affected lockfile

#### Scenario: Fix is not currently viable
- **WHEN** remediation requires an unsupported or out-of-scope migration
- **THEN** the implementation records the affected package, exposure, mitigation, blocking constraint, and follow-up action
