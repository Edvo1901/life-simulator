import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export class DesktopLanguage {
  private code = 'en';
  private readonly languages: { code: string }[];
  constructor(private readonly root: string) {
    this.languages = JSON.parse(
      readFileSync(resolve(root, 'language/languages.json'), 'utf8'),
    );
  }
  change(code: unknown) {
    if (
      typeof code !== 'string' ||
      !this.languages.some((x) => x.code === code)
    )
      return false;
    this.code = code;
    return true;
  }
  text(key: string): string {
    const get = (code: string) => {
      let value: unknown = JSON.parse(
        readFileSync(
          resolve(this.root, 'language', code, 'common.json'),
          'utf8',
        ),
      );
      for (const part of key.split('.')) {
        if (!value || typeof value !== 'object') return undefined;
        value = (value as Record<string, unknown>)[part];
      }
      return typeof value === 'string' ? value : undefined;
    };
    return get(this.code) ?? get('en') ?? key;
  }
}
/** Only the main renderer at the configured local origin may request a language change. */
export function acceptsLanguageSender(
  actualId: number,
  expectedId: number,
  actualUrl: string,
  expectedOrigin: string,
) {
  try {
    return (
      actualId === expectedId && new URL(actualUrl).origin === expectedOrigin
    );
  } catch {
    return false;
  }
}
