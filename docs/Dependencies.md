# Dependencies

Guide-pinned direct dependencies are recorded exactly in `frontend/package.json`, `backend/package.json`, and `desktop/package.json`. Each application has its own `pnpm-lock.yaml`. Node.js is `24.19.0` and pnpm is `12.6.0`.

| Additional direct dependency | Version  | Reason                                                                 |
| ---------------------------- | -------- | ---------------------------------------------------------------------- |
| `reflect-metadata`           | `0.2.2`  | NestJS decorator metadata support                                      |
| `rxjs`                       | `7.8.2`  | NestJS runtime peer dependency                                         |
| `@nestjs/cli`                | `12.0.8` | NestJS build and development watcher                                   |
| `@nestjs/testing`            | `12.0.4` | Guide-required NestJS test tooling, aligned with the framework version |

These are framework support/tooling packages, not additional application frameworks or integrations. Transitive versions are resolved in the lockfiles. Translation and local-password dependencies are listed below; no third-party identity/online translation provider is selected.

## Desktop host

Electron `44.6.0` is pinned by Personal Rules 2.0 and is an owner-requested development dependency in `desktop/package.json`. It provides the native window and desktop lifecycle for the learning demo. `desktop/pnpm-lock.yaml` pins the host's resolved dependencies. Its TypeScript, ESLint, Prettier, Jest, and ts-jest versions match the guide.

Electron 44's npm package requires the explicit `pnpm --dir desktop setup` step to download its desktop executable. This is the Electron runtime, not another package-manager installation. Native watcher/resolver build scripts are allowed only for their identified versions. pnpm also recorded the explicit `electron@44.6.0` release-age exception for this pinned installation.

## Localization, credentials, and UI tests

| Package                | Exact version | Purpose                                                          |
| ---------------------- | ------------- | ---------------------------------------------------------------- |
| i18next                | 26.4.2        | Local JSON resources, interpolation, language selection/fallback |
| react-i18next          | 17.0.16       | Shared React translation context                                 |
| bcrypt                 | 6.0.0         | Backend password hashing, cost 12                                |
| @types/bcrypt          | 6.0.0         | Backend TypeScript declarations                                  |
| jest-environment-jsdom | 30.5.2        | Frontend form and DOM behavior tests                             |

The owner requested bcrypt and i18n. Native bcrypt builds are allowed only for bcrypt@6.0.0. Electron uses local JSON and a narrow language bridge without another translation package. Framework versions remain unchanged.

@jest/globals 30.5.2 is a direct backend development dependency for typed ESM Jest mocks, matching Jest.

## Security audit — 08/10/2026

The runtime audit currently reports frontend: 2 critical, 30 high, 36 moderate, 4 low advisories, affecting pinned Next.js/Axios and transitive sharp/PostCSS. Backend: one moderate sprintf-js advisory via the SQL Server driver, with no published patch. Functional tests do not resolve these findings.

Next.js 16.1.1 is affected by a critical Windows server vulnerability: [publisher advisory GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36). An owner-approved update to Next.js/eslint-config-next 16.4.0 and Axios 1.20.0 is proposed, pending agreement to change the guide pins. Keep the app bound to loopback; this limits network exposure but is not a patch. Remaining transitive findings must be re-audited after any approved update.
