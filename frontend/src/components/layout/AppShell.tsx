'use client';
/**
 * Shared navigation/language selection for every application screen.
 * Displays role-aware links; backend guards remain the authorization boundary.
 * Wiki: wiki/Authentication.md and wiki/Internationalization.md.
 */
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/auth/useAuth';
import { LanguageSelector } from './LanguageSelector';
import { version } from '../../../package.json';
import type { ReactNode } from 'react';
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation(),
    auth = useAuth();
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ruleDark py-5">
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/">{t('app.home')}</Link>
          {auth.account?.roleCode === 'admin' && (
            <Link href="/auth/accounts">{t('app.admin')}</Link>
          )}
          {auth.account ? (
            <button
              onClick={() => {
                void auth.logout().catch(() => {});
              }}
              className="text-pine underline"
            >
              {t('app.logout')}
            </button>
          ) : (
            <Link href="/auth">{t('app.login')}</Link>
          )}
        </nav>
        <LanguageSelector />
      </header>
      <main className="flex-1 py-10">{children}</main>
      <footer className="border-t border-rule py-5 text-sm">
        {t('app.version', { version })}
      </footer>
    </div>
  );
}
