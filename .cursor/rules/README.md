# Life Simulator Cursor rules

Rules version: **2.0**. Canonical guide: [Personal_Rules.md](../../docs/Personal_Rules.md).

This folder contains 21 project rules for the personal Windows desktop life simulator. The approved stack is Electron, one Next.js frontend, one NestJS backend, TypeScript, TypeORM, and Microsoft SQL Server. Versions are pinned in guide section 4; desktop boundaries are in section 22. Authentication/localization and the backend SQL connection are implemented; configured schema execution/first-admin creation are pending. Gameplay remains unimplemented. No online publication is planned.

## Selection and maintenance

- `project-core.mdc` is the only rule with `alwaysApply: true`.
- Scoped rules use file globs or task descriptions. Select rules by both affected paths and behavior, including new files.
- Consult `project-workflow.mdc` for every task and `desktop-electron.mdc` for Electron, native lifecycle, local server configuration, renderer boundaries, or future packaging work.
- AGENTS.md directs Codex to follow the substantive Markdown instructions; Cursor frontmatter is selection metadata, not automatic Codex attachment.
- Reuse confirmed scope and stack decisions. Reuse confirmed languages, login, SQL-auth settings, account capacity, and snapshot name; clarify unresolved gameplay/installer scope.
- Authentication and English/Vietnamese localization are required; hosting remains future scope. Local builds and Electron startup do not authorize deployment or installer packaging.
- Keep this README, all summaries, the canonical guide, and AGENTS.md synchronized. Keep one guide at `docs/Personal_Rules.md`.

## Guide coverage

| Guide section                       | Rules                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------- |
| 1. Workflow and documentation       | project-core, project-workflow, personal-rules-sync                       |
| 2. Project boundaries and languages | project-core, modules-and-ids, internationalization, desktop-electron     |
| 3. Existing code and cleanup        | refactor-cleanup                                                          |
| 4. Stack                            | stack-and-tooling, desktop-electron                                       |
| 5. Folders                          | project-workflow, frontend, backend-api, database-sql, desktop-electron   |
| 6. Modules and IDs                  | modules-and-ids                                                           |
| 7. Naming and shared types          | naming-and-code-style, frontend-api-client                                |
| 8. Code style                       | stack-and-tooling, naming-and-code-style                                  |
| 9. Frontend                         | frontend, frontend-api-client, accessibility, internationalization        |
| 10. API                             | backend-api, frontend-api-client, api-catalog, backend-reliability        |
| 11. Dynamic options                 | frontend                                                                  |
| 12. Backend architecture            | backend-api, backend-architecture                                         |
| 13. Database                        | database-sql, backend-reliability                                         |
| 14. Configuration and security      | config-security, backend-reliability, desktop-electron                    |
| 15. Testing                         | testing, desktop-electron                                                 |
| 16. Comments                        | naming-and-code-style                                                     |
| 17. Wiki                            | wiki                                                                      |
| 18. Completion                      | project-workflow, testing                                                 |
| 19. Forbidden actions               | project-core and relevant scoped rules                                    |
| 20. Agent instructions              | personal-rules-sync                                                       |
| 21. Releases and deployment         | deployment, backend-reliability                                           |
| 22. Electron desktop                | desktop-electron, config-security, stack-and-tooling, testing             |
| 23. Local authentication            | config-security, database-sql, backend-api, internationalization, testing |

## Validation status

Document consistency, canonical paths, metadata, coverage, and package pins are checked for this update. Cursor attachment behavior has not been tested. The guide's two-agent rule-review procedure remains pending; static checks and earlier application tests do not replace that review.

Owner-approved design: shared root language/en and language/vn resources, i18next/react-i18next, and a regular wiki folder tracked with source. Rule updates authorize no Git initialization/publication.
