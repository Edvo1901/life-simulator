'use client';
/**
 * Shared local translation context and persisted language preference.
 * Wraps all pages, keeps SSR hydration stable, and updates document/native labels.
 * Wiki: wiki/Internationalization.md.
 */
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createLanguageEngine } from '@/lib/i18n';
import type {
  SupportedLanguage,
  LanguageResources,
} from '@/types/common/language';
export const SupportedLanguagesContext = createContext<SupportedLanguage[]>([]);
export function LanguageProvider({
  data,
  children,
}: {
  data: LanguageResources;
  children: ReactNode;
}) {
  const [engine] = useState(() => createLanguageEngine(data));
  useEffect(() => {
    const update = () => {
      const language =
        data.languages.find((x) => x.code === engine.language) ??
        data.languages[0];
      document.documentElement.lang = language.htmlTag;
      document.title = engine.t('app.title');
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', engine.t('app.description'));
      window.desktopLanguage?.setLanguage(language.code);
      try {
        localStorage.setItem('life-simulator.language', language.code);
      } catch {
        /* Preference storage can be unavailable. */
      }
    };
    engine.on('languageChanged', update);
    let preferred = 'en';
    try {
      preferred = localStorage.getItem('life-simulator.language') ?? 'en';
    } catch {
      /* Use default language. */
    }
    if (!data.languages.some((x) => x.code === preferred)) preferred = 'en';
    void engine.changeLanguage(preferred).then(update);
    return () => {
      engine.off('languageChanged', update);
    };
  }, [data, engine]);
  return (
    <SupportedLanguagesContext.Provider value={data.languages}>
      <I18nextProvider i18n={engine}>{children}</I18nextProvider>
    </SupportedLanguagesContext.Provider>
  );
}
