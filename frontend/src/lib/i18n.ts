import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { LanguageResources } from '@/types/common/language';
/** A separate engine per provider/request prevents SSR language state leaks. */
export function createLanguageEngine(data: LanguageResources) {
  const engine = createInstance();
  void engine.use(initReactI18next).init({
    resources: data.resources,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: data.languages.map((x) => x.code),
    defaultNS: 'common',
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return engine;
}
