# Internationalization

## Resources and adding languages

All authored UI text is in root language/en/common.json and language/vn/common.json. Stable app/auth/admin/errors/desktop namespaces hold messages, accessible labels, and interpolation templates. language/languages.json registers code/self-name/htmlTag; vn maps to vi, not a nonstandard HTML tag. Add a language folder with matching JSON keys/placeholders and a registry entry, then restart/rebuild. Feature namespace JSON files are discovered automatically. No component edits or online translation service is needed.

frontend/src/lib/languageResources.ts loads the local registry/folders on the server. Root layout serializes them into the client provider. lib/i18n.ts creates a separate engine per provider/request, avoiding SSR state leaks. LanguageProvider restores the preference after consistent initial English hydration, updates document lang/title/description, and notifies the narrow native bridge. LanguageSelector is a labeled native select; changing it preserves routes/component input. Only language preference persists.

Next keeps the frontend Turbopack boundary and includes root resources in server file tracing. A source-folder runtime requires language/ beside the apps. Font includes latin/vietnamese glyphs. en-AU/AUD formatting and Adelaide SQL timestamps are unaffected.

## Backend/native boundaries

API codes remain stable; screens map them to errors.* resources and never show raw exceptions. DB-driven role codes remain user/admin with translated labels. AppShell, forms, dialogs, status messages, metadata, and native labels use resources.

desktop/src/language.ts resolves native resources with English fallback. preload.ts exposes only desktopLanguage.setLanguage. main.ts validates registered codes, main-frame/sender identity, and local origin before updating title/menu. No native filesystem/process/database capability is exposed. Startup dialogs use safe translated configuration guidance. OS dialogs/text remain OS-controlled.

## Verification

Translation tests compare keys/placeholders and exercise English fallback and isolated instances. Form tests cover translated failures and language switching without losing input. Host tests reject unknown/path-like codes and foreign senders/origins. Real-renderer and layout verification is recorded with the completed checks; pending checks are not treated as passed.

Development and production Electron smoke checks passed for English-to-Vietnamese switching, native labels, retained username input, and 1200x800/800x600 layout widths. The screenshot is a local generated test artifact, not a committed translation source.
