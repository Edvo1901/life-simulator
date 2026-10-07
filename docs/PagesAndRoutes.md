# Pages and routes

| Route          | Purpose                                                            | Source                                                                                   |
| -------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| /              | Login when signed out; protected simulator placeholder after login | src/app/page.tsx and components/layout/StarterScreen.tsx                                 |
| /auth          | Shared login and self-registration                                 | src/app/(modules)/auth/page.tsx and components/features/auth/LoginScreen.tsx             |
| /auth/accounts | Administrator account search/edit/reset/soft-delete                | src/app/(modules)/auth/accounts/page.tsx and components/features/auth/AccountsScreen.tsx |

All source paths above are under frontend/. The auth module registry entry is in src/config/modules.ts. Pages compose screens; the shared AppShell handles navigation/footer/language selection. Button, Input, and native Modal/dialog provide shared controls. Backend authorization remains required regardless of route visibility.

Root layout loads local resources, includes IBM Plex Sans latin/vietnamese glyphs, and composes LanguageProvider and memory-only AuthProvider. LanguageSelector uses language/languages.json. English is default/fallback; Vietnamese uses vn resources and vi HTML. No locale prefixes; switching preserves route/input and updates document lang/title/description. Only language preference is persisted.

The Electron host loads these same routes, translates its menus/window labels, and exposes only a validated language-selection bridge. Its renderer has no Node/SQL access. See wiki/Internationalization.md and wiki/Authentication.md.
