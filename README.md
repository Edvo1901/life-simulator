# Life Simulator

Local desktop application following [Personal Rules 2.0](docs/Personal_Rules.md).

- Node.js: `24.19.0`
- pnpm: `12.6.0`
- Next.js: `16.1.1`; React: `19.2.3`
- NestJS: `12.0.4`
- Electron: `44.6.0`; Microsoft SQL Server via TypeORM

## Run locally

Run from the project root in PowerShell, using two terminals:

```powershell
pnpm --dir frontend dev
```

```powershell
pnpm --dir backend dev
```

The frontend defaults to `http://localhost:3000`. Set its port in `frontend/.env.local`, for example:

```dotenv
PORT=3005
```

Run `pnpm --dir frontend dev` and open `http://localhost:3005`. The same setting applies to `pnpm --dir frontend start` after building. Restart the server after changing the port. Shell `PORT` values take precedence over the env file; an explicit `--port` argument takes precedence over both. If calling the backend from a changed frontend origin, add that origin (for example `http://localhost:3005`) to the backend `CORS_ORIGINS` allowlist. The backend defaults to `http://127.0.0.1:4000`. Set `API_PORT=4005` in `backend/.env.local` to listen on `http://127.0.0.1:4005`; authentication endpoints are documented in wiki/API-Docs.md.

Use your locally installed Node.js `24.19.0` and pnpm `12.6.0`. On a fresh checkout, confirm the versions and install dependencies:

```powershell
node --version
pnpm --version
pnpm --dir frontend install --frozen-lockfile
pnpm --dir backend install --frozen-lockfile
```

Each app has an `.env.example`. Copy the frontend example to `.env.local`, and the backend example to `.env.local`, only if you need to change local defaults; never commit credentials. Frontend startup loads `.env.local` before Next.js selects its listening port. Next.js also loads its standard environment files; the backend uses Node's optional environment-file support.

## Verify

For each app, run the following with `frontend` or `backend` as the directory:

```powershell
pnpm --dir frontend lint
pnpm --dir frontend format:check
pnpm --dir frontend typecheck
pnpm --dir frontend test
pnpm --dir frontend build
```

Jest uses `next/jest` in the frontend and `ts-jest` in the backend. Frontend tests cover translations, login/registration forms, and admin management. Backend tests cover services, sessions, timestamps, and errors. SQL integration tests use isolated databases with local settings; gameplay is unimplemented.

Run the built apps with `start` instead of `dev` after building. The initial frontend build downloads IBM Plex Sans through `next/font/google`.

Gameplay remains pending. SQL settings exist locally; schema execution and first-admin creation remain pending. wiki/ is a regular main-repository folder. See `docs/ProjectInfo.md` and `docs/Assumptions.md`.

## Try the Electron desktop demo

The desktop host wraps the existing frontend and launches the local backend. It runs locally from this project, without publishing or creating an installer. SQL Server is the database choice and the backend now requires its local connection settings. Apply the reviewed auth schema before registering or signing in.

Initial setup:

```powershell
pnpm --dir desktop install --frozen-lockfile
pnpm --dir desktop setup
```

Launch a desktop window:

```powershell
pnpm --dir desktop dev
```

Close the window or choose **Demo → Quit** to stop the host and its servers. **Demo → Toggle Developer Tools** opens Chromium developer tools. Frontend changes hot-reload; restart after changing backend/desktop code.

The demo honours frontend `.env.local` `PORT` and backend `.env.local` `API_PORT` (with `.env` as a fallback). If the configured ports are already used by separate web-development terminals, stop those terminals or use temporary alternative ports:

```powershell
$env:PORT = '3105'
$env:API_PORT = '4100'
pnpm --dir desktop dev
```

These shell settings override the env files for this terminal. Remove them afterwards if you want the env-file values again:

```powershell
Remove-Item Env:PORT, Env:API_PORT -ErrorAction SilentlyContinue
```

To try the built frontend in Electron, use `pnpm --dir desktop start`; it first builds the frontend, backend, and host. This still requires the project files and installed Node.js; it is not a standalone executable or installer.

Desktop verification:

```powershell
pnpm --dir desktop lint
pnpm --dir desktop format:check
pnpm --dir desktop typecheck
pnpm --dir desktop test
pnpm --dir desktop test:smoke
```

The smoke test opens a hidden real Electron renderer, verifies login rendering, Vietnamese/native language switching, retained input, both supported widths, and Node isolation, captures `desktop/coverage/electron-smoke.png`, and stops its own servers. It needs free configured ports; the alternative shell-port commands above also apply to it.

## Authentication and languages

Root language/en and language/vn contain editable texts; language/languages.json registers languages. English is the default/fallback and the selector offers Vietnamese. See wiki/Internationalization.md for adding languages. Wiki files live with application source, without a separate remote.

Apply the reviewed SQL-Table/0001_auth_create_accounts.sql once to the verified configured database (or use schema_v1.sql for empty initial setup, never both). Startup never runs SQL automatically. Set local AUTH_BOOTSTRAP_USERNAME and AUTH_BOOTSTRAP_PASSWORD, then run:

```powershell
pnpm --dir backend setup:admin
```

Remove those local settings afterwards. Public registration creates user accounts only. /auth provides login/registration; /auth/accounts is admin management. Login again after app close/reload; only language preference persists. Configured database/schema/admin setup has not yet been performed by this work.

For separate browser development, match frontend NEXT_PUBLIC_API_BASE_URL to the configured backend port/prefix and keep frontend origins in backend CORS_ORIGINS. Electron injects actual local URL/origins. SQL tests create a randomly named disposable database and remove it, preserving configured accounts:

```powershell
pnpm --dir backend test:integration
```

The test login needs permission to create/drop an isolated test database. Never test against a production target. See wiki/Authentication.md for architecture/limitations.

The 08/10/2026 runtime dependency audit reports critical/high findings in existing frontend pins. See docs/Dependencies.md; proposed Next.js/Axios security updates await agreement to change the guide versions. Passing workflow checks does not resolve the audit.
