import { createLanguageEngine } from './i18n';
import { loadLanguageResources } from './languageResources';
test('switches en/vn with English fallback and isolated server instances', async () => {
  const data = loadLanguageResources();
  const first = createLanguageEngine(data);
  const second = createLanguageEngine(data);
  await first.changeLanguage('vn');
  expect(first.t('auth.signIn')).toBe('Đăng nhập');
  expect(second.t('auth.signIn')).toBe('Sign in');
  first.addResource('en', 'common', 'fallbackOnly', 'English fallback');
  expect(first.t('fallbackOnly')).toBe('English fallback');
});
test('all namespaces have matching translation keys and placeholders', () => {
  const { resources } = loadLanguageResources();
  const flatten = (value: unknown, prefix = ''): Record<string, string> => {
    if (typeof value === 'string') return { [prefix]: value };
    if (!value || typeof value !== 'object')
      throw new Error('Translations must be strings or objects');
    return Object.assign(
      {},
      ...Object.entries(value).map(([key, item]) =>
        flatten(item, prefix ? prefix + '.' + key : key),
      ),
    );
  };
  const reference = flatten(resources.en);
  for (const [language, resource] of Object.entries(resources)) {
    const translated = flatten(resource);
    expect(Object.keys(translated).sort()).toEqual(
      Object.keys(reference).sort(),
    );
    for (const [key, value] of Object.entries(reference)) {
      expect((translated[key].match(/\{\{[^}]+\}\}/g) ?? []).sort()).toEqual(
        (value.match(/\{\{[^}]+\}\}/g) ?? []).sort(),
      );
      expect(translated[key].trim()).not.toBe('');
    }
    expect(language).toBeTruthy();
  }
});
