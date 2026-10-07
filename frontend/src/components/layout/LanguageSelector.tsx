'use client';
/**
 * Accessible language selection from the local supported-language registry.
 * Used before/after login; labels/resources are maintained in language/.
 * Wiki: wiki/Internationalization.md.
 */
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { SupportedLanguagesContext } from './LanguageProvider';
export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const languages = useContext(SupportedLanguagesContext);
  return (
    <label className="flex items-center gap-3 text-sm">
      {t('app.language')}
      <select
        className="rounded border border-ruleDark bg-card px-3 py-2 focus-visible:outline-2 focus-visible:outline-pine"
        value={i18n.language}
        onChange={(e) => {
          void i18n.changeLanguage(e.target.value);
        }}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
