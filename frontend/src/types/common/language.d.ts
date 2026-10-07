import type { Resource } from 'i18next';
export interface SupportedLanguage {
  code: string;
  label: string;
  htmlTag: string;
}
export interface LanguageResources {
  languages: SupportedLanguage[];
  resources: Resource;
}
declare global {
  interface Window {
    desktopLanguage?: { setLanguage(code: string): void };
  }
}
