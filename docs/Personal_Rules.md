# Life Simulator — AI Coding Guide

> Rules version: 2.0 | Last reviewed: 2026-10-08 | Owner: Project owner
>
> Project adaptation of Personal Rules 1.1, originally based on Internal_Rules.md 1.4. Existing stack pins are retained; Electron is added for the owner-requested desktop host. Validation with two coding agents is pending before adopting this as a validated rule set.

This document is the project-specific technical standard for Life Simulator and the AI coding agents I use in Cursor, Codex, and Claude. I am its sole developer and owner. Changes to this project copy do not authorise changing another project or the reusable source guide.

In this guide, "project owner" means me, and "agent" means an AI coding agent working on my project. I specify the project's requirements and approve decisions where this guide requires approval.

If this guide conflicts with a scaffolding tool, a tutorial, or existing code, this guide wins. Record project requirements in `docs/ProjectInfo.md`. A departure from this guide needs my agreement and a recorded reason; an agent must not silently change the stack or architecture.

This is one guide for the owner and agents. There is no separate Internal/External Rules contract. Tool-specific instructions must stay aligned with this guide (section 20).

The canonical guide in this project is `docs/Personal_Rules.md`; shared Cursor summaries live in `.cursor/rules/`. AGENTS.md and all summaries must use this actual path. Maintain one canonical guide.

## Confirmed project scope

- A text-based and image-based life simulator for the owner's personal interest and learning, running locally on the current Windows desktop. No online publication or hosting is planned.
- One Next.js frontend, one NestJS backend, an Electron native host, TypeScript, TypeORM, and Microsoft SQL Server. Electron wraps the existing frontend and manages local processes; it does not add another UI application, API server, or persistence layer.
- The current implementation is a framework starter plus a working Electron learning demo. Gameplay and save/load persistence remain unspecified. Username/password authentication with user/admin roles and English/Vietnamese localization are confirmed requirements; their implementation status is recorded in ProjectInfo.md.
- Existing local Node.js and pnpm installations are used directly. Do not reintroduce `.tools`, a package-manager bootstrap folder, or a pnpm wrapper without an explicit need and owner agreement.
- Reuse these confirmed decisions. Confirm unresolved gameplay requirements before dependent work; do not reinterpret earlier suggestions as approved features.
- Real record/audit timestamps remain Adelaide time. Confirm game-time progression separately; do not assume that simulated time equals the computer clock.
- Electron demo development is authorised. A standalone installer, updater, code signing, cross-platform support, cloud storage, telemetry, and online deployment require a separate confirmed requirement.

## 1. How to use this guide

- Read the project's root `docs` folder before changing code. It explains the project's purpose and confirmed requirements.
- For a new project, confirm the purpose, users, workflows, supported devices, scope, success criteria, languages, integrations, and authentication requirements with me before implementing dependent features.
- Work within this project's repository. Reuse its shared components, API client, formatting helpers, and authentication implementation.
- Routine implementation choices within these rules may be made by the agent and recorded in `Assumptions.md`. Ask me when requirements are unclear, a choice changes confirmed scope, or a rule requires my approval.
- Update `wiki/` in the same piece of work as any change to a feature, an important file, an API, a table, the stack, or this guide. Read that feature's wiki page before the change. The rule is in section 17.
- When this guide changes, update the applicable agent instruction files in the same piece of work. The rule is in section 20.
- Increment the major rules version when an existing compliant project would require rework, and the minor number for additive or clarifying changes. Change the review date only after reviewing the complete guide.

The project must include these files in its root `docs` folder:

| File                | What to record and review                                                                                                                                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProjectInfo.md`    | Personal Rules version, project purpose, users and devices, current and desired workflows, confirmed scope, success criteria, limitations, unresolved requirements, integrations, supported languages, default language, authentication requirements, and requirement change history. This must match the code. |
| `ApiEndpoints.md`   | Every endpoint, already using the configurable API prefix.                                                                                                                                                                                                                                                      |
| `PagesAndRoutes.md` | Routes, feature screens, and the shared components they use. For multilingual projects, include language switching and any locale route design.                                                                                                                                                                 |
| `Database.md`       | Tables, ID prefixes, number of digits, expected record counts, example IDs, relationships, and schema snapshot version.                                                                                                                                                                                         |
| `Dependencies.md`   | Any library beyond the stack in this guide, its pinned version, and its reason. Do not introduce a second framework.                                                                                                                                                                                            |
| `Assumptions.md`    | Technical choices made where the guide or requirements do not fix an answer, their reasons, and any required owner approval. Review and accept, change, or reject each material assumption.                                                                                                                     |

`docs` is the project's requirements and review summary. The `wiki/` folder holds one technical page per big feature (section 17).

When reviewing `ProjectInfo.md`, verify:

- The project problem, desired outcome, users, roles, supported device types, and success criteria are understandable.
- The current process, desired workflow, rules, approvals, statuses, exceptions, reporting, and important data are described.
- Must-have scope, optional scope, future scope, and out-of-scope items are separate.
- Demo limitations, simulated features, requested integrations, unresolved questions, and requirement changes are visible.
- The language and login requirements are explicit. Do not assume every project needs multiple languages or authentication.
- The recorded Personal Rules version is known. If it is older than the current version, review the changes and record which additional requirements must be applied.

### Validating rule changes

- Before approving a major rule version or a substantial change to discovery, architecture, security, testing, or documentation, give the same fictional project request and the same rules to at least two supported coding agents.
- Use fresh project folders and do not provide hidden technical help to one agent that the other agent does not receive.
- Score whether each agent completed requirements discovery, followed the fixed stack and architecture, maintained the required documents, passed the quality checks, and avoided the critical forbidden actions.
- Correct ambiguous or conflicting rules when multiple agents fail for the same reason. Do not make the guide longer because of one isolated agent mistake.
- Record the validation date, agents used, rule version, repeated failures, and resulting decisions in the project's rule-review notes.

## 2. Project and module boundaries

- Each personal project is a separate product with its own repository. Within that repository, a feature module is part of the project.
- Keep one Next.js frontend and one NestJS backend. The approved Electron host lives in `desktop/` and reuses them; do not create another frontend/backend for a feature. Read section 22 for desktop boundaries.
- Reuse shared UI (`Button`, `Table`, `Input`, `Modal`, `Dropdown`, and the rest of `components/ui`). Keep business rules in `components/features/[module-name]`, not inside shared UI.
- Keep one module name across the feature folder, route, API path, and table prefix.
- Register the module in `frontend/src/config/modules.ts` with `name`, `label`, `path`, `description`, and `icon`. `description` is the launcher card text. `icon` is a key the launcher maps to an icon. A module with no icon uses the launcher default.
- Routes live at `frontend/src/app/(modules)/[module-name]/`.
- Components for that module live at `frontend/src/components/features/[module-name]/`.
- A shared feature folder may hold business rules used by more than one module and have no route and no `modules.ts` row. For example, `shared-catalog` may be such a folder; it is not a route module.
- Keep one shared app shell and navigation system within the project.

### Languages

- This application supports English (en) and Vietnamese (vn resource identifier); English is the initial default and missing-key fallback. The Vietnamese HTML/Intl language tag is vi / vi-VN; keep the owner-requested vn folder name.
- All application-authored user-facing text lives in the root language/ folder: language/en/common.json and language/vn/common.json, with feature namespaces added as needed. Use stable semantic keys; keep matching keys, interpolation placeholders, and plural forms across languages. UI components contain translation keys, not literal display text.
- language/languages.json registers the supported languages, their self-names, resource identifiers, and HTML tags. Adding a language means adding its folder/resources and one registry entry, without changing business components. This compile-time language registry is an explicit exception to section 11; business selection lists and roles still come from SQL Server.
- Use i18next 26.4.2 and react-i18next 17.0.16 in the Next.js frontend. Bundle local JSON resources for offline runtime; do not require a translation service or remote fetch. Shared setup lives in frontend/src/lib/i18n.ts and the provider in components/layout, preserving the established source structure.
- Provide an accessible language selector available before and after login. Persist only the language preference locally; never store auth credentials/tokens with it. Unsupported preferences fall back to English. Initialize SSR and the first client render consistently, then restore the preference; avoid hydration mismatches and shared mutable server language state.
- Keep the existing routes without locale URL prefixes. Switching language preserves the current route and form state. Update document lang, title/metadata, visible text, validation/errors, dialogs, tooltips, accessible labels, module descriptions, and application-authored Electron menu/dialog text. OS-supplied UI remains controlled by the OS.
- Backend errors retain stable codes and safe canonical messages; the frontend maps codes/field errors to local translation keys and never displays raw SQL/framework exception text. API identifiers, role codes, modules, and database names do not change with language.
- Text uses the selected language; en-AU display formats and AUD remain the existing default. Stored timestamps remain Adelaide DATETIMEOFFSET. Include IBM Plex Sans Vietnamese glyphs. Document and test switching, fallback, namespace/key parity, native text, and both languages at the confirmed desktop sizes.

## 3. Existing code and refactor cleanup

- Existing code may predate this guide. Review it against the target rules rather than assuming its structure is the standard.
- When a rule is missing, record the technical choice in `Assumptions.md`. Ask me if it changes the architecture or needs an exception, and update this guide when I approve a new general rule.

### Holds

A hold is a file or folder I have explicitly said to keep. Record project-specific holds and their reasons in `Assumptions.md`. Ask me before deleting one. Do not delete it as part of a refactor. New projects have no inherited company hold list.

### Leftovers after a move or refactor

A leftover is the old path of a file this change moved, or a file this change left with no caller. Delete leftovers in the same piece of work. Delete the file. Do not move it to a trash folder. Do not finish while the old path is still in the tree or while an import still points at it.

- Delete the old path, including a folder the move left empty.
- Update or remove imports that pointed at the old path.
- Delete a file whose last caller was removed in this change.
- Leave files that were already unused before this change. Do not scan the repository for every file nothing imports.
- A missing import is not proof a file is unused. Next.js pages, SQL scripts, wiki pages, tests, and config are live without a normal import from feature code.

The matching Cursor rule is `.cursor/rules/refactor-cleanup.mdc`. Codex and Claude instructions must preserve the same cleanup rule.

## 4. Stack

Use TypeScript for frontend, backend, and Electron host source. Node startup modules may use `.mts`; compiled desktop output is not edited by hand. Use these exact versions.

| Area                           | Technology                   | Version |
| ------------------------------ | ---------------------------- | ------- |
| Runtime                        | Node.js                      | 24.19.0 |
| Package manager                | pnpm                         | 12.6.0  |
| Desktop host                   | Electron                     | 44.6.0  |
| Frontend                       | Next.js                      | 16.1.1  |
| Frontend                       | React                        | 19.2.3  |
| Frontend                       | react-dom                    | 19.2.3  |
| Frontend                       | axios                        | 1.11.0  |
| Frontend styling               | Tailwind CSS                 | 4.1.18  |
| Frontend styling               | @tailwindcss/postcss         | 4.1.18  |
| Frontend, backend, and desktop | TypeScript                   | 5.9.3   |
| Frontend, backend, and desktop | @types/node                  | 25.0.3  |
| Frontend                       | @types/react                 | 19.2.7  |
| Frontend                       | @types/react-dom             | 19.2.3  |
| Backend                        | NestJS                       | 12.0.4  |
| Backend                        | @nestjs/typeorm              | 12.0.1  |
| Backend                        | typeorm                      | 1.1.1   |
| Backend                        | mssql                        | 12.7.2  |
| Backend validation             | class-validator              | 0.15.1  |
| Backend validation             | class-transformer            | 0.5.1   |
| Testing                        | jest                         | 30.5.2  |
| Testing                        | ts-jest                      | 29.4.13 |
| Testing                        | @types/jest                  | 30.0.0  |
| Linting                        | eslint                       | 9.39.5  |
| Linting                        | typescript-eslint            | 8.70.1  |
| Linting (frontend)             | eslint-config-next           | 16.1.1  |
| Formatting                     | prettier                     | 3.9.9   |
| Database                       | Microsoft SQL Server (T-SQL) | —       |

- `eslint` stays on the 9.x line. `eslint-config-next` 16.1.1 and its React plugins are not confirmed on ESLint 10. Move to ESLint 10 only after checking those plugins, and update this guide with my agreement.
- `.nvmrc` at the repository root holds `24.19.0`. `frontend/package.json`, `backend/package.json`, and `desktop/package.json` set `"engines": { "node": "24.19.0" }` and `"packageManager": "pnpm@12.6.0"`.
- pnpm only. Do not use npm, yarn, or bun. Maintain `pnpm-lock.yaml` for `frontend`, `backend`, and `desktop`; include those lockfiles when commits are authorised. Do not commit `package-lock.json`.
- `frontend/.npmrc`, `backend/.npmrc`, and `desktop/.npmrc` hold `save-exact=true` (pnpm reads these files).
- New projects and imported feature code must match this table. Convert any npm or yarn lock file to `pnpm-lock.yaml` and align mismatched versions before accepting the code.
- Do not replace Electron, Next.js, React, NestJS, axios, Tailwind, TypeORM, or Microsoft SQL Server without my agreement. An extra library must be pinned and listed in `Dependencies.md` with a reason. I approve or reject material additions.

## 5. Folder structure

Use these folder names exactly as they appear on disk:

| Folder      | Contains                                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `frontend`  | UI code only                                                                                                           |
| `backend`   | API code only. Do not put table scripts here.                                                                          |
| `desktop`   | Electron host, local process lifecycle, desktop configuration, and colocated tests; no duplicate frontend or game API. |
| `SQL-Table` | The only place for SQL scripts. Also holds the one project schema snapshot `schema_v*.sql` (section 13).               |
| language    | Shared English/Vietnamese resources and registry                                                                       |
| `docs`      | Project guides, requirements, API contracts, and review summaries                                                      |
| `wiki`      | Technical Markdown documentation in the main repository (section 17)                                                   |

- Keep these folders separate.
- `docs` sits at the project root. It is not `backend/Docs`.
- Do not create a competing schema file under `backend`. New schema scripts and the snapshot belong only in `SQL-Table`.

## 6. Module and ID rules

- One module name is used for the feature folder, backend file names, API route, and table prefix.
- Reuse existing project tables for shared data. Do not create a second copy of the same resource for another module.
- Each project maintains its own reserved ID prefixes in `docs/Database.md`. There are no inherited company prefixes.
- Existing IDs stay as they are unless I approve a migration. New IDs are numbered above the highest existing value when continuing an existing sequence.
- IDs are `NVARCHAR(20)` in the form prefix, hyphen, digits.
- Before accepting a new ID format, check `Database.md` for the expected lifetime record count, number of digits, prefix, separator, and an example. Four digits only allow `0001`–`9999`. Five digits allow up to `99,999`. Six digits allow up to `999,999`. Reject a 4-digit ID when the stated volume can pass `9,999`.
- Ask me for the expected capacity before selecting the digit count. Do not silently default to 4 digits.
- A new prefix must not clash with another prefix used in the project. Record the prefix and capacity in `Database.md` when the module is added.

## 7. Naming conventions

| Item                        | Style                               | Example                    |
| --------------------------- | ----------------------------------- | -------------------------- |
| Component files             | PascalCase                          | `TaskCard.tsx`             |
| Utility files               | camelCase                           | `formatDate.ts`            |
| Backend files               | Nest style, dot-separated           | `tasks.controller.ts`      |
| Type files                  | `[name].d.ts` in the `types` folder | `task.d.ts`                |
| Database tables and columns | snake_case                          | `task_items`, `created_at` |
| Environment variables       | UPPER_SNAKE_CASE                    | `DB_HOST`                  |

`frontend/src/types/`, `backend/src/types/`, and `desktop/src/types/` hold only shared or global types: a shape used by many components, or used in many places. A component's props, and any type used only once, stay in that file.

- Shared within one feature: `frontend/src/types/[module-name]/[name].d.ts` or `backend/src/types/[module-name]/[name].d.ts`.
- Global, or shared across features: `types/common/[name].d.ts` on that side. Import it. Do not declare the same type twice.
- Each file in `types/` exports its types, so it is a module and not a global script.
- Class files stay where they are: DTOs in `dtos`, TypeORM entities in `models`.

## 8. Code style

- ESLint and Prettier run on every file.
- `frontend` uses `eslint-config-next`. `backend` and `desktop` use `typescript-eslint`. Each has an `eslint.config.mjs`.
- One `.prettierrc` at the repository root serves all three packages. Imported feature code uses this configuration; remove a duplicate Prettier config and reformat that code with the project's one.
- `pnpm lint` and `pnpm format:check` pass in `frontend`, `backend`, and `desktop` before changes are merged.
- A disabled lint rule needs a reason in the code review. Do not accept a blanket `eslint-disable` at the top of a file.

## 9. Frontend rules

### Folder structure

Use the Next.js App Router. Organise `frontend/src` like this:

| Folder                                   | Contains                                                                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/src/app`                               | Routes only: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`                                                                                                |
| `/src/components/ui`                     | Shared building blocks owned by the project: Button, Input, Modal, Dropdown, Table                                                                               |
| `/src/components/layout`                 | App shell: header, sidebar, page header, app launcher                                                                                                            |
| `/src/components/features/[module-name]` | Components that belong to one module only. A shared folder such as `shared-catalog` may live here without a route when several modules share its business rules. |
| `/src/hooks/api`                         | Generic query and mutation hook primitives                                                                                                                       |
| `/src/hooks/[module-name]`               | Typed business-specific hooks                                                                                                                                    |
| `/src/lib`                               | Shared clients and setup                                                                                                                                         |
| `/src/lib/api/client.ts`                 | Shared project backend transport                                                                                                                                 |
| `/src/lib/api/[module-name].ts`          | Typed module API functions                                                                                                                                       |
| `/src/lib/integrations/[provider].ts`    | Third-party service clients                                                                                                                                      |
| `/src/utils`                             | Pure helper functions: dates, IDs, formatting. No React and no API calls.                                                                                        |
| `/src/types`                             | Shared and global types only, `[name].d.ts`, grouped by feature. A prop or a type used once stays in its file. See section 7.                                    |
| `/src/constants`                         | Fixed constants only. Not dropdown or selection values.                                                                                                          |
| `/src/styles`                            | Global CSS and the Tailwind theme colours                                                                                                                        |
| `/src/config`                            | `api.ts` holds `apiPrefix`. `modules.ts` holds the module registry (`name`, `label`, `path`, `description`, `icon`).                                             |

The frontend must also have these folders:

| Folder   | Contains                                                |
| -------- | ------------------------------------------------------- |
| `public` | Static files served as-is, such as the logo and favicon |

Test files sit in the same folder as the file they test. Do not add a `Tests` folder.

- Use the App Router. Do not add a `pages` folder.
- Reuse the project's `components/ui`. When importing feature code, replace duplicate UI with the project's shared components.
- Do not put a module's screens in `/src/components/ui`.
- Do not add `store`, `context`, `providers`, or `services` at the top of `src` unless this guide is updated first.
- Pages compose components. Keep tables, forms, and lists out of `page.tsx`.
- Colours are Tailwind theme tokens (`bg-pine`). Do not leave raw hex values in components.

### Project backend access

Project backend requests follow this flow:

`component → feature hook → typed API module → apiClient`

Pages and components do not call `fetch` or axios. Components, pages, and hooks do not construct URLs. Components do not provide arbitrary endpoint strings. The matching Cursor rule is `.cursor/rules/frontend-api-client.mdc`.

**Shared API client**

- The shared transport is `frontend/src/lib/api/client.ts`.
- `apiClient` owns the base URL, the configurable API prefix, headers, JSON serialisation, response parsing, timeouts, cancellation, `204 No Content`, and conversion of standard error responses into a typed `ApiError`.
- Never hard-code `/api/`.
- Do not create a second API client for an individual module.
- `apiClient` is the only place where authentication headers are attached.
- Authentication is shared within the project when required. Feature modules do not add a second login.

**Typed module API functions**

- Module API files are `frontend/src/lib/api/[module-name].ts`.
- These files own endpoint paths and use typed request and response contracts.
- A contract used only in one module API file may stay in that file. Module-shared contracts live under `frontend/src/types/[module-name]/`.
- Cross-module static API contracts live in `frontend/src/types/common/api.d.ts`, such as `PagedResponse<T>` and common API error payload shapes.
- Import shared contracts rather than copying them. Declaration files export types and contain no runtime implementation.
- Runtime `ApiError` lives in `frontend/src/lib/api/client.ts` or `frontend/src/lib/api/errors.ts`, never in a `.d.ts` file.
- They return typed data or throw the standard typed `ApiError`.
- They do not manage React state, display notifications, or render messages.

**React hooks**

- Generic internal primitives may live in `frontend/src/hooks/api/useApiQuery.ts` and `frontend/src/hooks/api/useApiMutation.ts`.
- Typed module hooks live in `frontend/src/hooks/[module-name]/`.
- Components use business-specific hooks such as `useTasks`, `useCreateTask`, `useUpdateTask`, and `useDeleteTask`.
- Do not expose an unrestricted `useApi("/arbitrary/path")` hook to components.
- Hooks manage loading, errors, stale-request cancellation, and refetching.
- When a request returns a 409 `rowVer` conflict, the feature hook reloads the current record and exposes a typed conflict state or message for the component to display.
- Hooks do not directly render notifications or UI.
- Server Components and non-React code use typed module API functions directly because React hooks cannot be used there.

**Retry safety**

- Do not automatically retry `POST`, `PUT`, `PATCH`, or `DELETE`.
- A write may only be retried when it is explicitly designed to be idempotent.
- Do not silently retry a failed mutation.

**External integrations**

The shared project `apiClient` is for the project's backend.

- Third-party services use dedicated clients under `frontend/src/lib/integrations/[provider].ts`.
- Pages and components must not call third-party APIs directly.
- Third-party clients own their provider URL, timeout, parsing, and error conversion.
- Do not send a third-party API request through the project backend client unless the backend intentionally proxies that service.

Paged results use `{ items, total, page, pageSize }`. Standard errors use `{ "error": { "code": "...", "message": "..." } }`. See section 10.

### Colours

Use only these colours.

**Buttons**

| Role                     | Colour        | Background | Text      | Border    |
| ------------------------ | ------------- | ---------- | --------- | --------- |
| Default / primary        | Purple (pine) | `#383568`  | `#F7F6FB` | —         |
| Secondary filled         | Purple (soil) | `#5B57A0`  | `#F7F6FB` | —         |
| Outline                  | Light         | `#F7F6FB`  | `#26244A` | `#C7C3E1` |
| Apply / Agree / Confirm  | Green         | `#2E7A4F`  | `#F7F6FB` | —         |
| Cancel / Reject          | Red           | `#B23B3B`  | `#F7F6FB` | —         |
| Destructive, light style | Light red     | `#FBEAEA`  | `#B23B3B` | `#B23B3B` |
| Icon button: edit        | —             | none       | `#201E3D` | —         |
| Icon button: delete      | —             | none       | `#B23B3B` | —         |

**Hover and disabled**

| State                         | Background | Text      | Border    |
| ----------------------------- | ---------- | --------- | --------- |
| Primary hover                 | `#26244A`  | `#F7F6FB` | —         |
| Secondary hover               | `#383568`  | `#F7F6FB` | —         |
| Outline hover                 | `#EFEDF7`  | `#26244A` | `#C7C3E1` |
| Apply / Agree / Confirm hover | `#256B44`  | `#F7F6FB` | —         |
| Cancel / Reject hover         | `#8E2F2F`  | `#F7F6FB` | —         |
| Destructive light hover       | `#FBEAEA`  | `#B23B3B` | `#8E2F2F` |
| Disabled                      | `#EFEDF7`  | `#6B6890` | `#E1DFF0` |

A disabled button does not change on hover.

**Theme tokens**

| Token     | Hex       | Use                                        |
| --------- | --------- | ------------------------------------------ |
| paper     | `#F7F6FB` | Page background, text on dark buttons      |
| paperDark | `#EFEDF7` | Header and panel background                |
| ink       | `#201E3D` | Main text                                  |
| inkSoft   | `#6B6890` | Secondary text                             |
| pine      | `#383568` | Primary buttons, status strip, active tabs |
| pineDark  | `#26244A` | Dark text on light surfaces, primary hover |
| soil      | `#5B57A0` | Secondary filled buttons                   |
| gold      | `#8B87C4` | Accents and highlights                     |
| rule      | `#E1DFF0` | Light borders                              |
| ruleDark  | `#C7C3E1` | Stronger borders                           |
| card      | `#FFFFFF` | Cards and list surfaces                    |
| danger    | `#B23B3B` | Errors, delete, cancel, reject             |

### Typography

- Font: `'IBM Plex Sans', sans-serif`. Keep this font as the default. If a confirmed language needs glyphs it does not cover, document and agree with me on a suitable fallback font.

### Display formats

UI formatting defaults to the `en-AU` locale through shared formatters in `/src/utils`. Do not format inline in a component. Multilingual text follows section 2; any project-specific display locale is recorded in `ProjectInfo.md`. Stored timestamps always remain Adelaide time.

| Value         | Format                                     | Example            |
| ------------- | ------------------------------------------ | ------------------ |
| Date          | `DD/MM/YYYY`                               | `25/09/2026`       |
| Date and time | `DD/MM/YYYY HH:mm`, 24-hour, Adelaide time | `25/09/2026 14:05` |
| Money         | AUD, two decimals, thousands separator     | `$1,234.56`        |
| Whole numbers | Thousands separator                        | `12,500`           |
| Weight        | Number followed by the unit                | `1,250 kg`         |

All features use the project's shared formatters. Replace duplicates when importing code.

### Screen behaviour

- Every page has a header with a title, a short subtitle, and its action buttons.
- Every list has a loading state, an empty state, and an error state.
- Every delete uses an in-app confirm dialog. Do not use `window.confirm` or `window.alert`.
- A tooltip explains what a module, feature, or button does. A new feature needs one. Do not add a tooltip for something obvious, such as Delete, Apply, Agree, or Cancel.
- A tooltip shows on keyboard focus as well as mouse hover.

### Accessibility and supported devices

- Use semantic HTML and native controls where possible. Actions use buttons and navigation uses links.
- Every input has a visible label. Instructions and validation errors are programmatically associated with the affected field.
- Every action, form, menu, dialog, and table control works with a keyboard. Focus is visible and follows a logical order.
- A modal moves focus inside when opened, traps focus while open, closes with Escape when safe, and returns focus to its trigger.
- Do not communicate status, error, warning, or required state by colour alone. Include text or an icon with an accessible name.
- Use approved palette combinations that meet WCAG 2.2 AA contrast. Do not introduce an unapproved colour to fix contrast.
- Informative images have useful alternative text. Decorative images have empty alternative text.
- Test the layout at every device type recorded in `ProjectInfo.md`. Do not accept clipped content or unnecessary horizontal scrolling at a confirmed size.
- Use the project's accessible shared components without losing the module's business behaviour. For multilingual projects, test translated text and relevant text direction at the confirmed device sizes.

## 10. API rules

### Route prefix

- The prefix comes from one value per side: `API_PREFIX` for NestJS and `NEXT_PUBLIC_API_PREFIX` for Next.js. Both start at `api` and must match.
- NestJS applies it with `app.setGlobalPrefix(process.env.API_PREFIX)`. `frontend/src/config/api.ts` reads it and exports `apiPrefix`.
- Moving to `apiv1` or `apiv2` is a change to those two environment values only. Reject a module that writes `/api/` into a route string.
- Routes are REST under `/[apiPrefix]/[module-name]/[resource]`, plural resource names. JSON field names are camelCase.

### Validation

- Every request body and query string has a DTO in `/src/dtos`, validated by the global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
- Request DTOs and response DTOs are separate contracts. Do not return a TypeORM entity directly from a controller. Map it to a response DTO so internal columns, relations, and sensitive fields cannot appear by accident.
- Make optional, nullable, and omitted fields explicit in the DTO. Do not pass a request DTO directly into a generic save operation or spread unapproved request fields into an entity.

### Errors

- Every error response is `{ "error": { "code": "...", "message": "..." } }`, produced by one global exception filter in `/src/filters`.
- Status codes: 200 read or update, 201 created, 204 deleted, 400 invalid input, 404 not found, 409 concurrency conflict or duplicate ID, 500 unexpected. A 500 never returns a stack trace or SQL text.
- Error `code` values are stable machine-readable identifiers. Services throw domain exceptions; the global filter maps them to the standard response and HTTP status.
- Log an error once at the application boundary with its request ID. Expected 4xx outcomes are not logged as unexpected server failures. Unexpected errors are logged with safe context and returned as the standard 500 response.
- Keep one global exception filter. Imported feature code uses the project's filter rather than adding a duplicate.

### Paging

- Every list endpoint takes `page` (from 1) and `pageSize` (default 50, maximum 200) and returns `{ items, total, page, pageSize }`.
- Reject an endpoint that returns a whole table.
- Allow only documented filter and sort fields. Use a deterministic order and add the record ID as a tie-breaker so records do not move unpredictably between pages.

### Concurrency

- Updates carry the `rowVer` loaded with the record. The repository updates with `WHERE row_ver = @rowVer`. Zero rows affected returns 409 and nothing is saved.
- On a 409 `rowVer` conflict, the feature hook reloads the current record and exposes a typed conflict state or message. The component displays that message. See section 9.

### Deleting records

- User deletes are soft deletes: set `deleted_at`. Lists and lookups filter out rows with `deleted_at` set.
- Child rows replaced while saving their parent may be removed permanently.
- Any other permanent delete needs a reason recorded in `Assumptions.md` and my approval before implementation.

### API catalog

When an endpoint is added, changed, or removed, update both of these in the same piece of work:

- `wiki/API-Docs.md` — how to call every API in the project. For each endpoint: what it does, method, path, query or body, status codes, and one sample JSON result. Example data only. No passwords, connection strings, or rows copied from a database.
- `docs/Project.postman_collection.json` — the same contract, so I can import it into Postman and send the request. The collection variable `baseUrl` is the host plus the API prefix (default `http://127.0.0.1:4000/api`). Do not put a secret in the collection.

`docs/ApiEndpoints.md` is the endpoint summary. Keep it consistent with the wiki API catalog and Postman collection. The wiki contains the detailed calling contract; feature pages describe implementation details. Do not create a competing catalog.

### Repeated commands and API changes

- A create, import, webhook, approval, or batch operation that can be submitted more than once must prevent duplicate effects. Use a business-key unique constraint as the final protection and, where replay is expected, a documented idempotency key.
- The same idempotency key and payload returns the original result. Reusing the key with a different payload returns 409. Store the key and business write in the same transaction.
- Prefer additive API changes. Removing or renaming a field, changing its meaning, or changing a route requires an agreed migration plan or a new API version. Update the API catalog and Postman collection with the compatibility decision.

## 11. Dynamic lists and options

Supported UI languages are the compile-time registry exception described in section 2. Business dropdowns, selection lists, radio options, filters, categories, statuses, types, and units are loaded from the database. They are not hard-coded in the app. Hard-coded values are allowed only in tests and sample data.

Choose one shared options table or one table per list and record the choice in `Assumptions.md`. I review material assumptions. Do not force every module into the same table shape when the columns differ. An admin page may add, edit, and remove these values, but build it only when it is in the confirmed project scope.

## 12. Backend rules

NestJS uses this layout under `backend/src`:

| Folder              | Contains                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/src/controllers`  | Controller files                                                                                                              |
| `/src/services`     | Service files                                                                                                                 |
| `/src/repositories` | Repository files. TypeORM access lives here.                                                                                  |
| `/src/models`       | Model and entity files                                                                                                        |
| `/src/types`        | Shared and global types only, `[name].d.ts`, grouped by feature. A prop or a type used once stays in its file. See section 7. |
| `/src/dtos`         | DTO files                                                                                                                     |
| `/src/exceptions`   | Exception files                                                                                                               |
| `/src/filters`      | Filter files, including the global exception filter                                                                           |
| `/src/interceptors` | Interceptor files                                                                                                             |
| `/src/pipes`        | Pipe files                                                                                                                    |
| `/src/guards`       | Guard files                                                                                                                   |
| `/src/auth`         | Auth files when the project requires login. All modules use the project's shared authentication implementation.               |
| `/src/utils`        | Utility functions and constants, including `adelaideTime.ts`                                                                  |
| `/src/config`       | Configuration files                                                                                                           |
| `/src/Middleware`   | Middleware files                                                                                                              |
| `/src/Validators`   | Custom validators that `class-validator` does not provide                                                                     |

These folders sit directly in `backend`, beside `src`, because they are not compiled:

| Folder   | Contains                                                    |
| -------- | ----------------------------------------------------------- |
| `Docs`   | Backend notes. Not a substitute for the root `docs` folder. |
| `Logs`   | Log files. Do not commit the contents.                      |
| `Temp`   | Temporary files. Do not commit the contents.                |
| `Assets` | Static asset files                                          |

### Layer responsibilities

- Controllers translate HTTP input and output only. They call a service and do not contain business decisions, TypeORM queries, or transaction logic.
- Services own business rules, authorization decisions that depend on business data, workflow orchestration, and transaction boundaries.
- Repositories own persistence. Controllers do not import TypeORM infrastructure. Services do not import a TypeORM `Repository` or query builder and do not execute queries; they use only the approved transaction runner when they must define a transaction boundary.
- Repository methods express an application purpose such as `findActiveTaskById`; do not expose unrestricted generic CRUD or query builders to controllers and services.
- TypeORM entities remain inside the persistence layer. Repositories return the data the service needs, and controllers return response DTOs rather than entities.

### Modules and dependencies

- Each business feature is registered through a NestJS module. Other features use its exported service or contract, not its repository or entity.
- Use constructor injection through Nest providers. Do not use mutable global state or manually construct services and repositories.
- Dependencies point from controllers to services to repositories. Do not create circular module dependencies or use `forwardRef()` as a routine solution; change the boundary or extract the genuinely shared responsibility.

Business logic stays in services, not controllers. If a file could sit in `Validators`, `dtos`, or `pipes`, pick one place according to its responsibility, record the convention in `Assumptions.md`, and use it consistently.

## 13. Database rules

### Tables

- Microsoft SQL Server and T-SQL only.
- Schema `dbo` for business tables. When login and authorization tables are required, they live in schema `auth` (for example, `auth.users`, `auth.roles`, `auth.permissions`, `auth.user_roles`, `auth.role_permissions`, and `auth.audit_events`). Create only the tables required by the confirmed authentication design. Table and column names are snake_case.
- Every table has `created_at` and `updated_at` (`DATETIMEOFFSET(0)`) and `row_ver ROWVERSION`.
- Tables whose records users delete also have `deleted_at DATETIMEOFFSET(0) NULL`.
- Parameterised queries only. Never build SQL by joining strings.
- A write that touches more than one table runs in a transaction.
- Define foreign keys for relationships and state the required delete behaviour. Do not rely on an accidental cascade.
- Enforce business keys with unique constraints and simple data invariants with check constraints where SQL Server can reliably protect them.
- Index foreign keys and columns used by important joins, filters, and ordering when the query pattern justifies it. Do not add duplicate or speculative indexes.
- `docs/Database.md` must describe the tables, relationships, ID capacity, and constraints in language I can review.

### Transactions

- The service owns the transaction boundary for one business operation through the approved transaction runner. Repositories participating in that operation receive and use the same transaction context; the service does not query through that context.
- Do not start independent nested transactions for parts of the same operation. If any required write fails, the whole operation rolls back.
- Do not catch an error inside a transaction and continue with partial data. Translate the error after rollback.
- Do not keep a database transaction open while calling an external API, waiting for user input, or performing long-running file processing.

### Query performance

- Select only the columns and relations required by the operation. Do not load one related row at a time in a loop; batch or join to prevent N+1 queries.
- List queries follow the deterministic paging rule in section 10. Filters, sorting, imports, exports, and batch writes have documented and validated limits.
- Investigate the query and indexes before adding a cache. A cache must have an owner, expiry, invalidation rule, and documented reason.

### Adelaide time

- Every stored timestamp is Adelaide time (`Australia/Adelaide`). Do not store UTC. Do not use `SYSUTCDATETIME()` or `GETUTCDATE()`.
- Timestamps are `DATETIMEOFFSET`, so the `+09:30` or `+10:30` offset is kept. `DATETIME2` cannot tell apart the two instances of the repeated hour when daylight saving ends.
- Every timestamp comes from `backend/src/utils/adelaideTime.ts`. It converts explicitly to `Australia/Adelaide`, so a server clock in another timezone does not change the stored value.
- The TypeORM `mssql` connection sets `options.useUTC: false`. The driver default of `true` rewrites times as UTC.
- Keep one project time helper. Imported feature code uses it instead of a duplicate.

### Schema scripts

- Every schema change is a new script in `SQL-Table` named `NNNN_[module-name]_[description].sql`. Scripts run in number order and create referenced tables first.
- A script that has run against any shared database is never edited. Changes are new scripts.
- Seed data is in separate `NNNN_[module-name]_seed_[description].sql` scripts and runs only in test and development databases.
- TypeORM runs with `synchronize: false` and `migrationsRun: false`. `SQL-Table` is the only source of the schema.
- New scripts follow the repository's highest number. When importing scripts that have never run against a shared database, assign numbers in that sequence while keeping their order. Do not renumber scripts already applied to a shared database. Record which databases each script has run against.
- Each script checks the state it expects and fails clearly when that state is wrong. Use a transaction when SQL Server supports the complete change safely.
- A destructive change, column rename, type narrowing, or new non-null requirement needs a reviewed data-preservation and recovery plan. When necessary, use separate add, backfill, application-switch, and remove scripts instead of one destructive step.
- `SQL-Table/schema_v*.sql` is the project's current-state schema snapshot for review and initial setup. I choose its initial versioned filename. A numbered script that changes tables, columns, keys, indexes, constraints, or views also updates the snapshot contents in the same piece of work, so running the snapshot on an empty database gives the same result as running every script in order.
- Edit the snapshot in place. It is the one exception to "a script that has run is never edited". Numbered scripts still make the change on shared databases.
- `SQL-Table` holds exactly one snapshot file. Agents never rename it or change its version; I do that manually. If there are two, stop and ask me.
- The snapshot includes reference rows the app needs to work, such as required options and, when applicable, auth roles and permissions. It does not include test or sample seed data.
- If existing tables predate the timestamp or soft-delete rules, change them only through a reviewed numbered script, never in the snapshot alone.
- New features use the project's existing schema where appropriate. Review `Database.md` against the numbered scripts and snapshot before accepting a schema change.

### Files and images

- Uploaded files and images are not stored in SQL as data URLs or large text. The table stores a reference to the file.
- Record file storage paths or providers, access rules, and cleanup behaviour in `Assumptions.md` and the relevant wiki page. All features use the project's agreed file storage.

## 14. Configuration and security

- Local settings live in ignored `.env`/`.env.local` files; commit `.env.example` with placeholders only. Frontend `PORT` is read from `frontend/.env.local` before Next.js selects its listening port. Backend loads `.env` followed by `.env.local`; shell values take precedence over both. Electron uses the same precedence.
- Honour the owner's configured ports (for example, frontend 3005 and backend 4005); 3000/4000 are fallbacks only when no setting exists. Do not hard-code configured ports, rewrite local env files, or kill another server to obtain a port. Restart processes after changes; validate port range, collisions, and availability.
- `frontend/src/config/startNext.mts` loads frontend settings programmatically. Do not pass Node env-file CLI flags into Next.js dev-worker `NODE_OPTIONS`, where those flags are unsupported.
- Bind desktop-owned frontend/backend services to loopback. Add the actual frontend origin to the child backend CORS allowlist while retaining existing allowed origins; do not weaken CORS to a wildcard. Keep the frontend backend URL/prefix aligned when enabling API integration.
- Standard variable names:

| Variable                   | Used for                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `DB_HOST`                  | SQL Server host                                                                     |
| `DB_PORT`                  | SQL Server port                                                                     |
| `DB_NAME`                  | Database name                                                                       |
| `DB_USER`                  | Database user                                                                       |
| `DB_PASSWORD`              | Database password                                                                   |
| `PORT`                     | Frontend listening port, loaded before Next.js startup                              |
| `API_PORT`                 | Port the backend listens on                                                         |
| `NEXT_DIST_DIR`            | Optional project-specific Next.js output directory; Electron dev uses .next-desktop |
| `API_PREFIX`               | Backend API prefix                                                                  |
| `NEXT_PUBLIC_API_PREFIX`   | Frontend API prefix                                                                 |
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL the frontend calls                                                      |
| `CORS_ORIGINS`             | Comma-separated frontend origins the backend accepts                                |
| `MAX_REQUEST_BODY_BYTES`   | Maximum non-file request body size                                                  |
| `MAX_UPLOAD_BYTES`         | Maximum uploaded file size when uploads are supported                               |
| `AUTH_LOCAL_TOKEN_SECRET`  | HMAC secret for short-lived local login tokens                                      |
| `AUTH_BOOTSTRAP_USERNAME`  | Optional one-time first local administrator username                                |
| `AUTH_BOOTSTRAP_PASSWORD`  | Optional one-time first local administrator password                                |

- Use these standard names. A new variable must be added to `.env.example` and documented in the relevant project guide and wiki page. Add it to this guide when it becomes a shared standard.
- Anything named `NEXT_PUBLIC_` is sent to the browser. Never put a secret in one.
- Never commit passwords, keys, or connection strings.
- Use structured backend logs. Every request has a request or correlation ID that appears in related error logs. Log safe operation names, status, duration, and error codes rather than complete payloads.
- Never log passwords, tokens, connection strings, personal information, confidential business data, complete request bodies, or uploaded file contents. Redact sensitive fields before logging.
- Configure CORS from an environment-specific allowlist. Do not combine credentialed requests with an unrestricted `*` origin.
- Apply framework-supported HTTP security headers and explicit request-body size limits. Any package added for this purpose must be pinned and documented.
- For file uploads, validate the allowed type, extension, and maximum size on the backend; generate stored filenames; prevent path traversal; and keep files outside the web root unless deliberate public access is required.
- Enforce authenticated identity and permissions on the backend. Frontend route visibility and disabled controls are usability features, not authorization.
- When `ProjectInfo.md` requires an approval trail or other audit history, record the actor, action, affected record, outcome, and Adelaide timestamp without storing secrets or unnecessary sensitive values.
- Apply rate limiting to authentication, publicly reachable, and high-risk endpoints according to risk. Do not use a single arbitrary limit that breaks normal batch or operational workflows.
- Audit production dependencies before merge. Resolve high and critical findings, or document the finding, mitigation, and my explicit acceptance.
- Every outbound HTTP call has an explicit timeout. Validate and normalise the response before business code uses it, and redact sensitive request and response data from logs.
- Retry only operations that are safe to repeat. Retries are bounded, use backoff with jitter, and do not run inside a database transaction. A non-idempotent external write is not retried automatically without an agreed duplicate-protection design.
- Production deployments expose a lightweight health check for the process and a readiness check for required dependencies. These checks return no secrets or detailed infrastructure information.
- Enable NestJS shutdown hooks. On shutdown, stop accepting new work and close database connections and background resources cleanly.

### Project-specific authentication

- I specify whether the project needs login, who can sign in, and any roles or permissions in `ProjectInfo.md`. Do not assume Microsoft Entra or another identity provider.
- If the project does not require login, add no authentication system.
- If login is required, confirm the authentication approach and implement it as part of the project. Do not defer it to a future integration step or treat a protected feature as complete while authentication is missing.
- Authentication belongs to the project as a whole. Feature modules use the shared implementation and do not add their own login or authentication library.
- Document any provider-specific environment variables in `.env.example` and the authentication wiki page. Pin and document any added authentication packages.
- The `AUTH_LOCAL_TOKEN_SECRET` and bootstrap variables apply only when the agreed local-login design uses them.
- Test identity, permissions, unauthenticated access, and denied operations. Never bypass backend authorization to make a demo work.

## 15. Testing

- Jest. `backend` and `desktop` use `ts-jest`; `frontend` uses `next/jest`. Desktop tests also follow section 22.
- Put each test in the same folder as the file it tests. Name it after that file (`tasks.service.spec.ts` beside `tasks.service.ts`, `TaskCard.test.tsx` beside `TaskCard.tsx`). Do not create a `Tests` folder and put every test there.
- Every service that writes data, allocates IDs, or creates Adelaide timestamps has tests. ID allocation tests include the highest number the digit count allows.
- Unit-test service business rules without requiring HTTP or a real database.
- Integration-test repositories, constraints, queries, and transactions against an isolated SQL Server database with the same relevant schema as production. Mocking a repository is not proof that its SQL works.
- HTTP-level tests cover controllers, DTO validation, pipes, guards, permissions, the global exception filter, and response status and shape.
- Test important business rules, calculations, validation failures, approvals, status transitions, permissions, and exceptions described in `ProjectInfo.md`.
- Test API invalid-input responses, standard errors, transaction rollback, duplicate prevention or idempotency where relevant, and `rowVer` conflicts. Test important frontend forms and data views in loading, empty, validation-error, request-error, and success states.
- Every defect fix includes a regression test that fails without the fix.
- Each module has at least one automated end-to-end test for its most important business workflow. Added testing libraries must be pinned and documented.
- Map critical tests to the success criteria in `ProjectInfo.md`. A passing implementation-detail test is not evidence that the business workflow works.
- `pnpm test` passes in `frontend` and `backend` before changes are merged.
- Tests use isolated test data and never run against a production database.

## 16. Code comments

Comment the code so I or an agent can make the next change without reverse engineering it. Comment important behaviour, not every line.

At the top of every component file and every controller file, write a block that says:

- What this file is for.
- What it is responsible for.
- How it is used.
- Which wiki page is associated with this file, for example `wiki/TaskBoard.md`.

Throughout the file, comment each important function and feature: what it does and how the component uses it. Do not comment a one-line formatter or an obvious assignment.

Check that new and imported component and controller files have this header. Add it if it is missing. Point the wiki reference at the page's location in the wiki folder.

## 17. Wiki

wiki/ is an ordinary project folder tracked in the same Git repository as application source. It requires no separate remote, embedded Git repository, .gitmodules entry, or submodule pointer. This owner-approved project standard replaces the earlier separate-wiki requirement.

- Read the existing feature page before changing its feature and update it in the same work as the source/schema/API change.
- One Markdown page describes one substantial feature, with subsections for important functions, responsibilities, paths, callers, data, contracts, permissions, tests, and limitations. Use real paths and distinguish planned behavior from implemented behavior. Do not include secrets or environment values.
- The owner has authorized this wiki folder and the documentation needed for the requested localization and authentication/account-management work, including README.md, Internationalization.md, Authentication.md, and API-Docs.md. Ask before unrelated new feature pages unless already authorized; do not ask again for these pages.
- Keep API-Docs.md, docs/ApiEndpoints.md, and docs/Project.postman_collection.json aligned when APIs change. Root docs remains the requirements/review summary.
- When commits or pushes are authorized, include wiki files with the matching application changes in the same main-repository commit/push. Do not perform separate wiki commits or pushes. Writing files or stating a future push does not authorize a commit, Git initialization, or publication now.

## 18. Work is done when

Apply this checklist to new modules and relevant changes within the standalone project.

- The code follows the stack, folders, colours, and API rules in this guide.
- Local tooling and Next.js/NestJS servers run on Node.js 24.19.0 with the exact versions in section 4 and maintained pnpm lockfiles. Electron supplies its own embedded runtime; do not attempt to replace it with the system Node binary.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass in `frontend`, `backend`, and `desktop`. Type checks/builds and a real Electron smoke check apply to desktop/runtime changes. Instruction-only edits need consistency and Markdown checks; do not claim application or multi-agent validation from those checks.
- `ProjectInfo.md` matches the code; records the Personal Rules version; separates must-have, optional, future, and out-of-scope work; identifies limitations and simulated features; and states users, supported devices, workflows, success criteria, integrations, languages, login requirements, open questions, and requirement changes.
- Material items in `Assumptions.md` have been accepted, changed, or rejected, and required owner approvals are recorded.
- Features reuse the project's shared components, formatters, time helper, API client, and exception filter.
- Each route module is registered in `frontend/src/config/modules.ts`.
- ID prefixes, digit counts, and expected capacities are recorded, large enough for the stated volume, and added to the project's reserved prefix list.
- The API prefix comes from `API_PREFIX` and `NEXT_PUBLIC_API_PREFIX`. List endpoints are paged, errors use the standard shape, and updates check `rowVer`.
- Controllers, services, repositories, request DTOs, response DTOs, and module dependencies follow the boundaries in sections 10 and 12. TypeORM entities are not returned by APIs.
- Schema changes are new numbered scripts in `SQL-Table`. TypeORM `synchronize` and `migrationsRun` are off.
- The result of numbered schema scripts is reflected in the single `schema_v*.sql` snapshot.
- Database constraints, indexes, transaction boundaries, duplicate protection, and destructive-change recovery plans have been reviewed where relevant.
- A file move deletes the old path and any file that move left with no caller. Project-specific holds in section 3 were not deleted without approval.
- Dropdown values come from the database.
- Timestamps come from `adelaideTime.ts` and are stored as `DATETIMEOFFSET` in Adelaide time.
- Environment variables use the standard names, and project-specific variables are documented.
- A short README explains how to run the project.
- New features that are not obvious have a tooltip. Delete, Apply, Agree, and Cancel do not.
- Confirmed device sizes have been tested. Forms, navigation, dialogs, validation, focus, contrast, and status messages meet the accessibility rules in section 9.
- Confirmed languages, language switching, fallback behaviour, and translated text have been tested when multilingual support is required.
- Authentication matches the confirmed project requirements. Protected operations have backend identity and permission checks.
- Critical rules, failures, conflicts, and fixed defects have automated tests, including at least one end-to-end workflow per module.
- Backend tests include the required service, repository integration, HTTP contract, transaction rollback, permission, and concurrency coverage.
- Logs and error responses contain no secrets or sensitive payloads. CORS, security headers, request limits, file uploads, server-side permissions, audit events, rate limits, and dependency findings have been reviewed where relevant.
- Outbound request timeouts and safe retry behaviour, and health/readiness checks where deployment is required, have been reviewed. Graceful shutdown is implemented.
- Every component file and every controller file starts with a comment saying what it is for, what it is responsible for, how it is used, and which wiki page it belongs to.
- The feature's wiki page was read before the change and updated after it.
- `wiki/API-Docs.md`, `docs/ApiEndpoints.md`, and `docs/Project.postman_collection.json` match every endpoint, including method, path, query or body, status codes, and a sample JSON result.
- Applicable Cursor, Codex, and Claude instructions agree with this guide.
- Any release or deployment follows section 21 and the project-specific plan agreed with me.

## 19. Critical forbidden actions

These are hard stops. The detailed rules in the earlier sections still apply.

- Do not treat obsolete code or another project's structure as the target architecture.
- Do not introduce a second frontend, backend, app shell, authentication system, API style, or database style within one project.
- Do not expose secrets or sensitive data in code, prompts, logs, documentation, examples, fixtures, client bundles, or error responses.
- Do not rely on frontend visibility or disabled controls as authorization, or merge a protected operation without a backend permission check.
- Do not call HTTP APIs directly from components, expose an arbitrary-path API hook, create a second project API client, or hard-code `/api/`.
- Do not build SQL by joining strings, enable TypeORM `synchronize` or `migrationsRun`, bypass numbered `SQL-Table` scripts, skip updating the schema snapshot, or rename it without my direction.
- Do not query through TypeORM from controllers or services, return entities directly from an API, bypass database constraints for application-enforced duplicates, or hold a transaction open during an external call. A service may use only the approved transaction runner to define a transaction boundary.
- Do not permanently delete user records unless the documented delete rule allows it and any required owner approval is recorded.
- Do not bypass DTO validation, paging, `rowVer` concurrency, accessibility requirements, security controls, or tests to make a change pass.
- Do not merge failing lint, formatting, tests, high or critical dependency findings without documented mitigation and my explicit acceptance, stale project documents, stale wiki pages, or agent instructions that disagree with this guide.
- Do not reuse, move, or delete a published release tag, commit production settings files, put secrets in `NEXT_PUBLIC_*`, stop unrelated processes, or change an agreed deployment process without my agreement.
- Do not assume login, languages, company infrastructure, or a deployment platform without confirmed project requirements.

## 20. Cursor, Codex, and Claude project instructions

This guide is the shared source of truth for all three tools. An agent that changes Personal Rules must update the applicable instruction files in the same piece of work. Do not leave tool-specific instructions behind the guide.

### Shared instructions

- Keep root `AGENTS.md` for Codex and root `CLAUDE.md` for Claude aligned with this guide. Each identifies the guide's actual repository path, its version, and the requirement to read the project documents and relevant wiki pages before changing code.
- Put concise shared workflow and critical safeguards in those files. Avoid independently maintained copies of the complete guide.
- Tool-specific instructions may explain how that tool applies the rules, but must not change the technical standard or approval requirements.
- When a rule is removed or changed, update every affected tool-specific instruction so an agent does not keep enforcing an old rule.
- When the rule-set version changes, update its reference in `AGENTS.md`, `CLAUDE.md`, and `.cursor/rules/project-core.mdc` in the same piece of work.
- Do not generate or change instruction files for another project merely because this reusable guide changes. Apply and synchronise the guide within each project deliberately.

### Cursor rules

`.cursor/rules/` is how Cursor applies this guide.

- Keep one concern per `.mdc` file. Use YAML frontmatter (`description`, `globs` or `alwaysApply`).
- If the change belongs to an existing concern (stack, frontend, API, wiki, and so on), update that `.mdc` file.
- If the change is a new concern, create a new `.mdc` file. Do not dump unrelated rules into `project-core.mdc`.
- If a rule is removed from this guide, remove or shrink the matching `.mdc` so Cursor does not keep enforcing it.
- Use `.cursor/rules/personal-rules-sync.mdc` for this synchronisation requirement.

## 21. Releases and deployment

Life Simulator is a personal local Windows desktop project; online publication is not planned. Git source control setup remains pending; wiki files are maintained locally in the main project folder without a separate remote. Local play and the Electron demo require no cloud host, published release, or deployment pipeline. The conditional release/deployment rules below apply only if separately requested. Running the local Next.js production build in Electron is not online deployment or installer packaging.

### Versions and releases

- The project has one version. `version` in `frontend/package.json`, `backend/package.json`, and `desktop/package.json` is always the same value.
- Use Semantic Versioning. Stay on `0.x.y` while the project is experimental or in beta. Mark published releases in that series as pre-releases. `1.0.0` is the first stable release.
- The Git tag is `vX.Y.Z`. `package.json` holds `X.Y.Z` without the `v`.
- When I request a release, create it in GitHub Releases from the project's agreed default branch. Record that branch in the project documentation; do not assume `master`.
- Merge or commit the version bump and every change for the release into that branch first.
- Never reuse, move, or delete a published tag. A wrong release is fixed by publishing the next version.
- Record the release procedure and release-note template in `wiki/Release-Process.md` when releases are introduced, following the wiki-page approval rule.
- Release notes never contain passwords, connection strings, private infrastructure details, or `.env` values.
- The home page footer reads the version from `frontend/package.json`. Do not hard-code the version anywhere else.

### Choosing deployment

- Do not provision infrastructure, add a deployment pipeline, or select a hosting platform without an agreed project requirement.
- Before introducing deployment, agree with me on the target, environments, process, required settings, database changes, backups, recovery, health checks, and any costs.
- Record the agreed procedure in `wiki/Deployment.md` and keep applicable agent instructions aligned with it.
- GitHub Actions may be used if agreed; its use is not mandatory for local practice projects.

### Requirements when deployment is introduced

- Build and verify from a clean checkout. The code must build from a fresh clone, so folder and import letter case must match what Git tracks.
- Run required lint, formatting, tests, settings checks, and builds before stopping or replacing any running application.
- Each workflow step must propagate command failures. Do not hide a failure behind a later successful command.
- Deployments run unattended and stop or replace only their own application resources. Never kill every `node.exe` or otherwise stop unrelated processes.
- Back up the running version before replacing it where the platform requires this. Verify the new version with a health check and restore the previous working version on failure. Document an equivalent rollback procedure for managed hosting.
- Production deployments expose lightweight process health and dependency readiness checks without secrets or detailed infrastructure information.

### Settings

- Production settings are stored in the agreed hosting environment or secret store, never committed. Deployment must preserve them.
- Never copy a developer `.env` or `.env.local` into production.
- Secrets go only in backend settings. `NEXT_PUBLIC_*` values are compiled into the browser bundle and must be public.
- Every required variable is an uncommented line in the matching `.env.example`, added in the same change as the code that reads it. An optional variable is a commented line.
- Before deployment, validate required variable names without printing their values. Missing settings stop deployment before the running version is changed.
- Document how frontend settings are applied at build time and how backend settings are applied when the process starts.

### Database changes

- Keep schema changes in numbered `SQL-Table` scripts.
- Do not silently run SQL during deployment. Agree on and document when required scripts run, which environment they target, and the preservation and recovery plan before deploying dependent code.
- Track which scripts have run against each database.

### Changing deployment

- A change to a workflow, deploy script, hosting target, or deployment procedure updates `wiki/Deployment.md` and the applicable agent instructions in the same piece of work.
- A change to an agreed deployment process needs my agreement before it is merged.

## 22. Electron desktop host

### Responsibilities and current workflow

- `desktop/src/main.ts` owns the Electron application/window/menu lifecycle. `config.ts` resolves local settings. `localServers.ts` starts and stops the existing Next.js/NestJS servers. Shared desktop declarations belong in `desktop/src/types/common/`; tests stay beside source. Desktop code is not a NestJS service/repository or an alternate React application.
- Render the existing Next.js application. Game calculations, rule enforcement, save/load operations, and SQL Server access belong in NestJS services/repositories through the established typed HTTP client flow. The preload/renderer must not receive database credentials. Main may pass backend-only settings to the backend child, but SQL access stays in NestJS.
- Use the installed Node.js 24.19.0 for the local servers and pnpm 12.6.0 for all packages. Electron 44.6.0 has its own embedded desktop runtime. Validate the actual executable/version; do not mistake an older PATH shim for the owner's only installation.
- `pnpm --dir desktop install --frozen-lockfile` installs host dependencies; `pnpm --dir desktop setup` downloads Electron's executable. Keep build-script approvals scoped to identified package versions.
- `pnpm --dir desktop dev` builds the backend/host and runs the existing frontend in dev mode. Frontend changes hot-reload; backend/desktop changes require restarting this demo. `start` builds the three packages and runs the local production frontend. These commands do not create an installer.
- Desktop dev uses `.next-desktop`, keeping normal web development's `.next` cache separate. Both directories are generated, ignored, and excluded from source lint/format scanning. Production mode uses `.next`. Preserve the existing frontend startup helper and local env files.

### Lifecycle and isolation

- Validate settings before opening the game window. Frontend/backend ports must be valid and distinct. Refuse occupied ports clearly; do not silently attach to unrelated existing servers or automatically change the requested port.
- Own only the child processes started by this host. Stop their process trees on window/app shutdown or startup failure, including Next.js workers. Never terminate by process name or affect another project's processes.
- Await server readiness with bounded timeouts. Handle child start/exit failures and show a safe actionable error; never expose secrets, env contents, SQL, or arbitrary raw exception details in dialogs.
- Keep `nodeIntegration: false`, `contextIsolation: true`, and `sandbox: true`. Restrict navigation to the intended local frontend origin, deny unsolicited new windows, and deny unused permissions. No insecure browser flags or disabled web security.
- The multilingual UI uses a narrow validated language-selection bridge. If another confirmed native feature needs one, expose narrowly scoped typed operations, validate payloads and the calling sender/origin, and keep process execution/filesystem primitives out of the renderer.

### Verification and future packaging

- Cover `.env.local` port loading, `.env` fallback, shell precedence, invalid/colliding/occupied ports, backend-setting separation, startup failures, and cleanup when relevant code changes.
- Run `pnpm --dir desktop test:smoke` for desktop/runtime changes. It must load the real frontend in Electron, verify renderer isolation, and verify that owned server ports are released. Use free isolated test ports and preserve owner env files/running servers. A screenshot or mocked BrowserWindow alone does not prove lifecycle correctness.
- Microsoft SQL Server remains required when persistence is implemented. Authentication uses the prepared auth schema and SQL-auth settings. Capacity/snapshot are confirmed; target execution/admin setup is pending. Game save/load remains to be confirmed; do not silently substitute SQLite, browser storage, or JSON files as the persistence backend.
- A self-contained installer/updater is future scope. Before packaging, agree on how Node-based servers, SQL Server availability, local secrets/settings, game data/assets, backups, and uninstall behaviour will be handled. Do not claim a source-folder demo works on a clean machine without its dependencies.
- Personal offline/local use is the goal. Avoid required online services, automatic publishing, cloud telemetry, or hosting. Record build-time network dependencies, including the current Electron/font downloads, rather than claiming a fresh build is already fully offline.

## Rule review record

- 08/10/2026, version 2.0: Owner approved root language/en and language/vn resources, multilingual support, and a regular wiki folder committed with the main repository. This major version replaces the former submodule contract and records the i18next design. Separate two-agent fictional-project validation remains pending; this update is not a claim that it ran.

- 07/10/2026, version 1.2: Adapt this project copy to the owner's confirmed local Windows life-simulator scope and approved Electron/Next.js/NestJS/SQL Server stack. Preserve existing framework pins and technical safeguards. Add desktop rules, actual guide-path references, and env/port precedence; synchronise Cursor/Codex and current version references.
- This is an additive project-specific clarification of decisions already authorised and implemented. Application runtime checks from earlier work are not validation of this revised rule set. The guide's separate two-agent fictional-project validation remains pending; do not describe version 1.2 as validated by that procedure.

## 23. Confirmed local authentication requirements

- Username/password login and public self-registration; new registrations always receive user, never admin. Usernames are case-sensitive and unique through a SQL Server constraint. Passwords have a minimum of 8 characters and use bcrypt 6.0.0; validate the 72-byte UTF-8 input boundary rather than silently truncating.
- Administrator management includes paged search, enable/disable, role changes, password resets, and soft deletion. Enforce admin permission in NestJS and protect the last enabled undeleted admin transactionally. No public admin registration.
- Create the first admin only through an explicit one-time local backend command using ignored local credentials. Never embed a default admin password or expose a bootstrap HTTP endpoint.
- Keep login credentials/tokens out of localStorage, persistent cookies, translation files, and renderer/native bridges. Closing the app requires a new login; store frontend session state in memory and enforce token expiry/revocation on the backend.
- Use backend/.env.local SQL Server SQL-auth settings without displaying or rewriting secrets. Confirmed lifetime account capacity is 10,000; reserve five-digit user IDs (USR-00001 through USR-99999), not four digits. The owner chose SQL-Table/schema_v1.sql. Prepare numbered scripts and the snapshot together; execution requires a verified explicitly authorized target.
