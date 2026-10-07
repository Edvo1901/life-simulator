# Life Simulator

Personal Rules version: **2.0**. Guide: [Personal_Rules.md](Personal_Rules.md).

## Confirmed scope

Personal local Windows text/image life simulator for the owner, using Electron, one Next.js frontend, one NestJS backend, TypeScript, TypeORM, and Microsoft SQL Server. No online publication or installer packaging is planned. Gameplay remains unspecified/unimplemented. Package versions remain 0.1.0.

## Authentication and account management

Implemented source: username/password login and self-registration; bcrypt 6.0.0 cost 12; case-sensitive unique usernames; passwords at least eight Unicode characters and at most 72 UTF-8 bytes. Usernames are 1–50 characters without edge whitespace/control characters. Public registration always creates user accounts. Roles are user/admin.

Administrators can search paged accounts, enable/disable, change roles, reset passwords, and soft-delete. Backend guards and transactional service checks enforce access. Updates require the loaded rowVer. A serialized transaction protects the last active administrator. Password/status/role changes and deletion invalidate prior sessions. Deleted usernames remain reserved to prevent account identity reuse.

The first admin is created using the explicit local setup:admin command and ignored AUTH_BOOTSTRAP_USERNAME/AUTH_BOOTSTRAP_PASSWORD settings. No default credential or public bootstrap endpoint exists. Tokens are opaque, transient, expire after eight hours, and are revocable. Closing/reloading the app requires login again; no credentials or tokens are persisted in the frontend. Backend restart also clears sessions. No email recovery, MFA, or third-party identity provider is included.

The configured SQL Server is reachable and was empty at review. SQL authentication uses backend/.env.local. Lifetime account capacity is 10,000; five-digit USR IDs allow 99,999 allocations. SQL-Table/0001_auth_create_accounts.sql and the owner-chosen schema_v1.sql are prepared and verified against an isolated database. Applying them to the configured database and creating the owner administrator are pending explicit execution approval/local bootstrap credentials.

## Languages and documentation

English and Vietnamese are confirmed: root language/en and language/vn, using i18next/react-i18next and an accessible selector before/after login. English is the initial default/fallback. Vietnamese resources use the requested vn name and the standard vi HTML tag. Language preference persists separately from login, and switching preserves routes/form input. Existing routes have no locale prefixes. en-AU/AUD display formatting and Adelaide storage remain unchanged. Default English and username validation details are recorded routine choices.

wiki/ is a regular folder in the main repository, maintained and committed/pushed with source when authorized. No separate wiki remote/submodule is required. Git initialization, commits, and pushes were not requested. Current target sizes are the Windows Electron window at 1200x800 and its minimum 800x600.

## Success criteria

Register/log in using either language; reject exact duplicate usernames even during concurrent requests while allowing case variants. Never accept public role injection. Users cannot call admin operations. Admins can manage accounts with conflict handling, safe resets, and soft deletion; the last active admin remains available. Logout/expiry/revocation/app close require new authentication. Backend errors and logs expose no credentials or SQL. Translation keys/placeholders match and missing entries fall back to English. Electron renders the same UI, isolates Node, and stops only its own servers.

## Remaining scope

Gameplay, character setup, save/load, game-time progression, integrations, and installer design remain open. The first owner admin and target database schema execution are pending; the feature must not be reported as operational there until those steps are performed.

## Requirement history

- 07/10/2026: Framework setup and Electron learning demo approved; frontend/backend ports configurable through local env files.
- 07/10/2026: Personal Rules 1.2 aligned the approved Electron/Next.js/NestJS/SQL Server stack.
- 07/10/2026: Username/password registration/login, bcrypt, user/admin roles, and admin management requested using idea-discovery.
- 08/10/2026: Owner confirmed all proposed admin actions/first-admin safeguards, case-sensitive usernames, eight-character minimum passwords, login after app close, English/Vietnamese resources, and regular main-repository wiki files. Confirmed 10,000 accounts, schema_v1, and SQL Server SQL authentication. Rules 2.0 replaces the former wiki-submodule contract.

## Verified implementation checks — 08/10/2026

- Frontend: lint, formatting, type checks, production build, and 11 translation/form/admin UI tests pass.
- Backend: lint, formatting, type checks, build, and 11 service/session/time/error unit tests pass. Normal tests skip the SQL suite without settings; the separate integration command passed all 7 SQL/HTTP tests against a disposable database, then removed it.
- Desktop: lint, formatting, type checks, build, and 11 host tests pass. Real Electron smoke checks passed in development and production: login renderer, Node isolation, English-to-Vietnamese/native switching, retained form input, 1200x800/800x600 widths, and owned server shutdown/port release.
- SQL/HTTP coverage follows the complete registration/login/administration API workflow. Component tests cover UI actions; the real Electron smoke does not create configured accounts or log in to the configured database. Target schema/admin setup remains pending.
- Security audit fails on existing pinned runtime dependencies; exact counts/advisories and proposed owner-approved updates are in Dependencies.md. Functional checks do not establish that those dependencies are secure.
- Rule path/version/metadata/coverage checks are performed separately. Cursor attachment behavior and the guide’s two-agent fictional-project validation have not been run.
