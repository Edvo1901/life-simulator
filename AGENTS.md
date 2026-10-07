# Life Simulator - Codex project instructions

Personal Rules version: **2.0**.
Canonical technical standard: [docs/Personal_Rules.md](docs/Personal_Rules.md).
Shared development rules: [.cursor/rules/](.cursor/rules/).
Scope: this project and its subdirectories.

## Read before working

1. Follow the owner's current request and phase. Discussion, review, planning, or instruction setup does not authorise building the application.
2. Read the canonical guide before project work, in bounded sections if necessary. Truncated output is not a complete read. If missing, report it and request the guide instead of substituting another project's rules.
3. Read `.cursor/rules/project-core.mdc` and `.cursor/rules/project-workflow.mdc` for every project task.
4. Before changing code, read existing root project documents and relevant existing feature wiki pages. Report missing prerequisites and clarify missing requirements before dependent implementation; do not invent requirements or claim missing documents exist.
5. Read every applicable rule in the lookup below before changing its files or behaviour, including cross-cutting rules. Follow the substantive instructions in `.cursor/rules/*.mdc` when developing this project.

Codex does not automatically attach rules using Cursor frontmatter. Treat `description`, `globs`, and `alwaysApply` as selection metadata, and follow the Markdown instructions below the frontmatter when their scope applies. Select rules by both task and affected paths, including new files that do not exist yet. Resolve references to other `.mdc` filenames inside `.cursor/rules/`. Consult newly added applicable rules even if they are not yet listed below.

The owner's explicit request takes precedence over project documents. The canonical guide governs technical standards over rule summaries, scaffolds, tutorials, and existing code. Report summary/guide mismatches and follow the guide; obtain owner agreement before departing from its technical standards. These instructions supplement Codex's system instructions and do not override tool permissions.

## Current scope and project setup

The canonical guide is `docs/Personal_Rules.md`. All rules use this project path. Keep the guide, Cursor rules, and agent instructions synchronized rather than creating another guide copy.

The confirmed project is a personal Windows desktop life simulator using text and images. Electron hosts the single Next.js frontend and NestJS backend; TypeORM and Microsoft SQL Server are the persistence stack. No online publication is planned. The three application folders currently contain a framework starter and Electron learning demo; authentication/localization code is implemented; gameplay is not. Configured schema execution and owner-admin creation remain pending.

English/Vietnamese localization and username/password user/admin authentication are confirmed. SQL-auth settings exist in backend/.env.local; 10,000 lifetime accounts and schema_v1.sql are owner-confirmed. Gameplay and Git setup remain pending. wiki/ is an ordinary folder in the main repository. Recheck state before dependent work and reuse confirmed decisions. Use local Node.js and pnpm directly without recreating `.tools`, wrappers, or bootstrap script folders. Installer packaging, signing, updates, cross-platform support, and online services require separately confirmed scope.

## Rule lookup

Paths are relative to the project root. Read task rules even when no file matches a Cursor glob yet, such as during scaffolding.

| When working on                                                                                               | Read                                                                              |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Any project task                                                                                              | `.cursor/rules/project-core.mdc`, `.cursor/rules/project-workflow.mdc`            |
| Stack, scaffolding, dependencies, packages, lock files, lint, formatting, or compiler/test configuration      | `.cursor/rules/stack-and-tooling.mdc`                                             |
| Modules, routes, registry, table prefixes, IDs, or ID allocation                                              | `.cursor/rules/modules-and-ids.mdc`                                               |
| Source naming, shared types, component/controller headers, or comments                                        | `.cursor/rules/naming-and-code-style.mdc`                                         |
| Electron, native windows, desktop configuration, server lifecycle, renderer boundaries, or packaging          | `.cursor/rules/desktop-electron.mdc`                                              |
| Frontend UI, layouts, styling, assets, options, or Next.js configuration                                      | `.cursor/rules/frontend.mdc`, `.cursor/rules/accessibility.mdc`                   |
| Frontend data access, components using backend data, hooks, contracts, or integration clients                 | `.cursor/rules/frontend-api-client.mdc`                                           |
| Backend files, API design, DTOs, validation, errors, lists, updates, or deletes                               | `.cursor/rules/backend-api.mdc`                                                   |
| Backend TypeScript, layer boundaries, modules, injection, persistence contracts, transactions, or reliability | `.cursor/rules/backend-architecture.mdc`, `.cursor/rules/backend-reliability.mdc` |
| SQL, tables, entities, repositories, connection settings, timestamps, scripts, or schema snapshot             | `.cursor/rules/database-sql.mdc`                                                  |
| Settings, configuration, authentication, permissions, uploads, logs, security, or dependencies                | `.cursor/rules/config-security.mdc`                                               |
| Endpoints added/changed/removed, API contracts, or API catalogs                                               | `.cursor/rules/api-catalog.mdc`                                                   |
| Feature/source/schema/documentation changes or wiki work                                                      | `.cursor/rules/wiki.mdc`                                                          |
| Source behaviour, defects, tests, or verification                                                             | `.cursor/rules/testing.mdc`                                                       |
| Moving, renaming, replacing, consolidating, or deleting files, folders, functions, or imports                 | `.cursor/rules/refactor-cleanup.mdc`                                              |
| Language requirements, translations, locale routing, or language selection                                    | `.cursor/rules/internationalization.mdc`                                          |
| Versions, releases, deployment, workflows, hosting, or deployment settings                                    | `.cursor/rules/deployment.mdc`                                                    |
| Guide, Cursor rules, AGENTS.md, or other agent instructions                                                   | `.cursor/rules/personal-rules-sync.mdc`                                           |

## Essential safeguards

- Keep one Next.js frontend and one NestJS backend, with Electron as their approved desktop host, using TypeScript, TypeORM, Microsoft SQL Server, and the guide's exact stack versions. Use pnpm only. Do not silently substitute versions or frameworks. Pin and document added dependencies; obtain approval for material additions.
- Keep `frontend`, `backend`, `desktop`, `SQL-Table`, root `docs`, and `wiki` responsibilities separate. Reuse shared UI, app shell, formatting, time helper, API client, exception filter, and authentication when required.
- Frontend backend access follows `component -> feature hook -> typed API module -> apiClient`. Server Components and non-React code use typed module API functions directly. No direct component HTTP calls, arbitrary-path API hooks, duplicate clients, or hard-coded `/api/`.
- Backend dependencies run `controller -> service -> repository`. Controllers translate HTTP; services own business rules and transaction boundaries through the approved runner; repositories own TypeORM access. Do not expose entities through APIs.
- Keep game business rules and persistence in NestJS services/repositories. Electron owns windows and lifecycle, not a second API or direct SQL access. Preserve renderer isolation, sandboxing, disabled Node integration, and restricted navigation/permissions. Add narrowly validated IPC only for confirmed native features.
- Honour frontend `.env.local` `PORT` and backend `.env` then `.env.local` `API_PORT`, with shell values taking precedence. Preserve the frontend environment loader, desktop dev cache, loopback binding, and actual-origin CORS. Reject invalid, colliding, or occupied ports; stop only host-owned process trees.
- Validate requests, page lists, return standard errors, and check loaded `rowVer` on updates. User deletes are soft deletes; other permanent deletes follow the guide's exceptions and approvals.
- Use numbered `SQL-Table` scripts with TypeORM `synchronize` and `migrationsRun` disabled. Keep exactly one owner-named schema snapshot and update its contents with schema changes. Use parameterised SQL, constraints, and appropriate transactions.
- Store timestamps as Adelaide `DATETIMEOFFSET` through shared `adelaideTime.ts`; preserve the guide's connection setting. Store uploaded files separately and keep references in SQL.
- Use the guide's approved palette, IBM Plex Sans, shared display formatters, accessible controls, and database-driven options. Test confirmed device sizes and languages.
- Never expose secrets or sensitive data in source, prompts, logs, fixtures, docs, client bundles, or errors. Enforce confirmed identity and permissions on the backend.
- Keep user-facing text in root language/en and language/vn JSON resources with stable keys and shared i18next setup. Use en by default/fallback and vi as the Vietnamese HTML tag. Never persist login tokens with the language preference.
- Confirm genuinely unresolved scope, workflows, devices, integrations, and success criteria before dependent implementation; reuse the confirmed languages and login requirements. Ask for lifetime ID capacity before selecting digits. Do not assume a provider or hosting platform.
- Make routine choices within the guide and record assumptions. Reuse confirmed decisions; ask about unclear requirements, scope or architecture changes, and explicit approval requirements.
- Read existing feature wiki pages before changes and update them afterwards. Ask before new wiki pages unless already authorised. The wiki is an ordinary folder committed/pushed with the main repository; no separate remote or submodule is required. The requested localization/authentication pages are already authorized.
- Remove leftovers created by a move or refactor in the same work; preserve owner-designated holds and unrelated pre-existing unused files.
- Commit, push, publish, release, or deploy only when authorised. Local development does not imply hosting.

## Verification and maintenance

- Keep the six required root documents accurate: `docs/ProjectInfo.md`, `docs/ApiEndpoints.md`, `docs/PagesAndRoutes.md`, `docs/Database.md`, `docs/Dependencies.md`, and `docs/Assumptions.md`. Document confirmed requirements and actual behaviour; distinguish planned or simulated features.
- Follow guide section 18 for implementation and relevant changes. Run `pnpm lint`, `pnpm format:check`, and `pnpm test` in frontend, backend, and desktop when they exist. Relevant desktop behavior changes also require the real Electron smoke test and owned-server shutdown verification. Instruction-only updates require document/rule consistency checks, not application execution. Include applicable service, isolated SQL Server integration, HTTP, frontend, regression, and critical end-to-end coverage required by the guide.
- Update feature wiki pages and source headers with relevant changes. API changes update `wiki/API-Docs.md`, `docs/ApiEndpoints.md`, and `docs/Project.postman_collection.json` together, subject to existing new-page approval requirements.
- Report missing scripts, unavailable environments, failures, and unrun checks honestly. Do not claim application execution, Cursor rule activation, or two-agent rule validation was tested when it was not. Instruction-only setup does not establish application requirements or implement functionality.
- Maintain the guide and matching Cursor summaries together when standards change. Keep this file's version, guide path, rule lookup, and any existing CLAUDE.md consistent. Do not create another independently maintained copy of the complete rules.
- Apply future external guide updates deliberately within this project; the project copy is not a live link to another repository.
