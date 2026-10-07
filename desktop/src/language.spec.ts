import { resolve } from 'node:path';
import { DesktopLanguage, acceptsLanguageSender } from './language';
test('native resources switch and reject unregistered/path payloads', () => {
  const language = new DesktopLanguage(resolve(__dirname, '../..'));
  expect(language.change('vn')).toBe(true);
  expect(language.text('desktop.quit')).toBe('Thoát');
  expect(language.change('../../private')).toBe(false);
  expect(language.change({ code: 'en' })).toBe(false);
});
test('native messages reject unrelated renderer and origin', () => {
  expect(
    acceptsLanguageSender(
      1,
      1,
      'http://127.0.0.1:3005/auth',
      'http://127.0.0.1:3005',
    ),
  ).toBe(true);
  expect(
    acceptsLanguageSender(
      2,
      1,
      'http://127.0.0.1:3005',
      'http://127.0.0.1:3005',
    ),
  ).toBe(false);
  expect(
    acceptsLanguageSender(1, 1, 'https://example.com', 'http://127.0.0.1:3005'),
  ).toBe(false);
});
