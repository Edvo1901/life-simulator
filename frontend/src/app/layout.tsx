/**
 * Shared document, Vietnamese-capable font, translations, transient auth, and app shell.
 * Used by every App Router route. Wiki: wiki/Internationalization.md and wiki/Authentication.md.
 */
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Sans } from 'next/font/google';
import { loadLanguageResources } from '@/lib/languageResources';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { AuthProvider } from '@/components/layout/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';
import { createInstance } from 'i18next';
import '@/styles/globals.css';
const font = IBM_Plex_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-sans',
});
export function generateMetadata(): Metadata {
  const data = loadLanguageResources();
  const engine = createInstance();
  void engine.init({
    resources: data.resources,
    lng: 'en',
    fallbackLng: 'en',
    initAsync: false,
  });
  return {
    title: engine.t('app.title'),
    description: engine.t('app.description'),
  };
}
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const data = loadLanguageResources();
  return (
    <html lang="en">
      <body
        className={font.variable + ' bg-paper font-sans text-ink antialiased'}
      >
        <LanguageProvider data={data}>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
