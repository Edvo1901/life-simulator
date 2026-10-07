import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type {
  LanguageResources,
  SupportedLanguage,
} from '@/types/common/language';
import type { Resource } from 'i18next';
/** Server-only local resources: registering a folder adds a language without component edits. */
export function loadLanguageResources(): LanguageResources {
  const directory = resolve(process.cwd(), '../language');
  const languages: SupportedLanguage[] = JSON.parse(
    readFileSync(resolve(directory, 'languages.json'), 'utf8'),
  );
  const resources: Resource = {};
  for (const language of languages) {
    if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(language.code))
      throw new Error('Invalid language registry.');
    resources[language.code] = {};
    for (const file of readdirSync(resolve(directory, language.code)).filter(
      (x) => x.endsWith('.json'),
    )) {
      resources[language.code][file.slice(0, -5)] = JSON.parse(
        readFileSync(resolve(directory, language.code, file), 'utf8'),
      );
    }
  }
  return { languages, resources };
}
