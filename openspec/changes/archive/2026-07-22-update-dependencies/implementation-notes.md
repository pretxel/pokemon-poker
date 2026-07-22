# Dependency Update Implementation Notes

## Baseline

- Runtime used for the update: Node.js 22.22.2 and npm 11.4.0.
- Root production build: passed with Next.js 16.2.1 and Prisma 6.19.2.
- Root test suite: failed before dependency changes because `socket.io` was imported by `__tests__/server.test.js` but was not declared or installed. The other suite passed with 14 tests.
- Standalone client production build: passed with Vite 5.4.21, with Vite's CJS Node API deprecation warning from the CommonJS-style configuration.

## Inventory Decisions

- Root packages with verified application/configuration usage are Next.js, React/React DOM, the Next third-party integration, Vercel Analytics, Prisma, Pusher/Pusher JS, TypeScript, Jest, ts-jest, and their matching type packages.
- `vercel` and `concurrently` have no source or script usage and will be removed. Vercel-hosted deployment does not require the CLI as a local runtime dependency.
- `tsx` will be retained and updated because Prisma 7's TypeScript configuration/tooling guidance includes it.
- The Socket.IO path remains supported for this change because it is described as active in `README.md`, exercised extensively by `__tests__/server.test.js`, and implemented by `server.js` plus `client/`. The root manifest is missing its direct `express`, `cors`, and `socket.io` runtime packages and the test-only `socket.io-client`; these will be declared.
- Every direct client package is used by its source or Vite configuration.

## Audit Baseline

- Root production audit: 43 findings (2 low, 9 moderate, 31 high, 1 critical). Direct affected packages were Next.js, Prisma, and the unused Vercel CLI; the CLI contributed most of the transitive surface.
- Root full audit: 46 findings (3 low, 9 moderate, 32 high, 2 critical).
- Client production audit: 2 findings (1 moderate, 1 high) through the Socket.IO/WebSocket dependency chain.
- Client full audit: 6 findings (1 low, 3 moderate, 2 high), including the old Vite line.

## Target Versions and Deferrals

- Root framework group: Next.js and `@next/third-parties` 16.2.11, React and React DOM 19.2.8, `@types/react` 19.2.17, and `@types/react-dom` 19.2.3. Next.js 16 supports React 19 and requires Node.js 20.9 or newer.
- Root data group: Prisma CLI, Prisma Client, and PostgreSQL adapter 7.9.0, plus current `pg` and its types. The migration uses the Prisma 7 ESM generator, explicit config/env loading, and a driver adapter.
- Root real-time/integration group: Pusher 5.3.4, Pusher JS 8.5.0, Vercel Analytics 2.0.1, Socket.IO/Socket.IO Client 4.8.3, Express 5.2.1, and CORS 2.8.6.
- Root tooling group: Jest 30.4.2, ts-jest 29.4.11, `@types/jest` 30.0.0, tsx 4.23.1, and `@types/node` 22.20.1.
- TypeScript is intentionally held at 5.9.3: TypeScript 7.0.2 is current in the registry, but ts-jest 29.4.11 declares TypeScript `<7`; 5.9.3 is therefore the newest compatible release.
- Client group: React and React DOM 19.2.8, Vite 8.1.5, `@vitejs/plugin-react` 6.0.3, and Socket.IO Client 4.8.3. Vite 8 and the plugin require Node.js 20.19 or 22.12 or newer.
- The supported project runtime baseline becomes Node.js 20.19 or newer, satisfying Next.js, Prisma 7, and Vite 8.

## Final Validation

- Root clean installation and dependency-tree validation pass. Prisma 7.9.0 client generation, all 31 Jest tests, and the Next.js 16.2.11 production build pass.
- Client clean installation and dependency-tree validation pass. The Vite 8.1.5 production build passes without the prior CJS configuration warning.
- The Socket.IO integration suite exercises connections, room creation/joining, voting, reveal, reset, save, and disconnect/admin-transfer behavior. This validates the real-time path without mutating the configured PostgreSQL database or external Pusher account.
- Client transitive `engine.io-client` and `ws` releases were advanced within Socket.IO's supported ranges; production and full client audits report zero findings.
- Available root transitive remediations were applied with `npm audit fix`, reducing the root audit from 43 production/46 full findings to 5 findings in both views, with no critical findings.

## Security Exceptions

### Next.js transitive Sharp advisory

- Finding: high-severity `sharp` advisory through Next.js 16.2.11 (`sharp` 0.34.5; patched at 0.35.0 or newer).
- Blocker: npm reports no fix because the latest stable Next.js release allows the 0.34 line and has not adopted the patched Sharp major. Forcing a transitive major override would move outside Next.js's tested dependency range.
- Exposure: the repository has no `next/image` usage or user-controlled image upload/processing path; the only generated image route renders repository-owned static content.
- Mitigation/follow-up: keep untrusted image processing disabled, monitor stable Next.js releases, and update as soon as Next.js adopts Sharp 0.35 or newer.

### Next.js transitive PostCSS advisory

- Finding: moderate-severity PostCSS stringification advisory through Next.js 16.2.11 (`postcss` 8.4.31; patched at 8.5.10 or newer). npm propagates this and the Sharp advisory as two high Next.js-related and three moderate dependent-package findings.
- Blocker: Next.js pins PostCSS 8.4.31 exactly and npm reports no supported fix on the latest stable Next.js release.
- Exposure: the application builds static repository-owned CSS and does not accept or stringify user-authored CSS.
- Mitigation/follow-up: do not introduce user-controlled CSS generation, monitor stable Next.js releases, and remove the exception when its pinned PostCSS is patched.

No other high- or critical-severity production finding remains. TypeScript 7 remains the only direct-version deferral, for the ts-jest `<7` peer constraint recorded above.
