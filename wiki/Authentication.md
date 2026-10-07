# Local authentication and account management

## Workflow and UI

Root / shows LoginScreen when signed out and the protected simulator placeholder after login. /auth is shared login/registration; /auth/accounts composes AccountsScreen for administrators. Pages contain composition only. AppShell supplies navigation, footer/version, and language selector. Shared Input/Button/Modal provide labeled fields, focus, and native dialog containment/Escape/return focus. Languages are available before and after login.

AuthProvider holds transient account state; useAuth exposes shared operations. LoginScreen sends no direct HTTP: useAuth delegates to typed auth API functions. useAccounts owns paged loading, cancellation, errors, mutations, and conflict-triggered reload. AccountsScreen uses database-loaded roles and loaded rowVer for edit/reset/delete. apiClient alone builds configured URLs, attaches bearer headers, applies timeouts, and maps safe errors. HTTP 401 clears session/UI; no credentials/tokens are persisted. Screens preserve entered case and translation switching preserves input.

## Backend and SQL

AuthController translates HTTP/DTO contracts. AuthGuard resolves transient tokens; AdminGuard rejects non-admin roles; AuthRateGuard limits public credential attempts. AuthService owns registration, bcrypt, sessions, current identity, and administration rules. Passwords require eight Unicode characters, max 72 UTF-8 bytes, bcrypt cost 12. Public registration can never assign admin. SQL uniqueness is case-sensitive, including deleted usernames.

AuthRepository owns TypeORM/parameterized SQL and only returns approved contracts. AuthTransactionRunner defines opaque service-owned SERIALIZABLE boundaries. An application lock serializes admin/bootstrap mutations. The service rechecks the current actor under that lock, checks loaded rowVer, and refuses removal/demotion/disable of the final enabled undeleted administrator. All writes use adelaideTime.ts. Status/role/password changes and deletion rotate security stamps, revoking old tokens.

AuthSessions stores hashed random-token keys in backend memory with eight-hour expiry. Closing/reloading the frontend loses its token; backend restart loses all sessions. No preload/database access, persistent token cookie/localStorage, third-party identity provider, or default admin credential exists.

## Setup

Prepare the verified configured database using SQL-Table/0001_auth_create_accounts.sql OR schema_v1.sql, never both. Existing auth schema causes a clear failure. Neither startup nor TypeORM applies schema automatically. Target execution is pending approval. Set AUTH_BOOTSTRAP_USERNAME/AUTH_BOOTSTRAP_PASSWORD in ignored backend/.env.local and run pnpm --dir backend setup:admin. This refuses bootstrap when an active admin exists. Remove the local bootstrap credentials afterwards. No password belongs in this wiki or chat.

The owner expects 10,000 lifetime accounts. Five-digit USR IDs have 99,999 slots; roles use natural business keys. See docs/Database.md for constraints/snapshot and API-Docs.md for request contracts.

## Verification

Service/unit tests cover server-assigned user role, hash omission, password limits, timestamps, token revocation/expiry, and restart behavior. Isolated SQL/HTTP tests create a uniquely named disposable database, apply the snapshot, and verify registration/login, case/duplicates, role injection and denied access, paging, reset/disable/delete/revocation, rowVer conflicts, last-admin preservation, concurrent creates, and sequence limits. The database is removed afterwards. Frontend tests cover input, validation, loading, success, safe translated failures, and switching. Actual configured schema/admin setup remains pending until performed explicitly.

Verified counts: 11 frontend tests, 11 backend unit tests, 7 isolated SQL/HTTP tests, and 11 desktop unit tests. Development/production Electron smoke checks verify signed-out UI and language/lifecycle behavior; configured account setup remains pending. Existing runtime dependency audit findings are recorded in docs/Dependencies.md.
