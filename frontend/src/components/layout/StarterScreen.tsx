'use client';
/**
 * Protected starter home; game simulation is not implemented.
 * Uses shared session state and translated local text. Wiki: wiki/Authentication.md.
 */
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/auth/useAuth';
import { LoginScreen } from '@/components/features/auth/LoginScreen';
export function StarterScreen() {
  const { t } = useTranslation(),
    { account } = useAuth();
  if (!account) return <LoginScreen />;
  return (
    <section>
      <h1 className="text-4xl font-semibold">{t('app.title')}</h1>
      <p className="mt-4">{t('app.welcome', { username: account.username })}</p>
      <p className="mt-4 text-inkSoft">{t('app.ready')}</p>
    </section>
  );
}
