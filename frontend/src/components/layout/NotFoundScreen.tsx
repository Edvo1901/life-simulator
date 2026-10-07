'use client';
/** Localized missing-route screen. Wiki: wiki/Internationalization.md. */
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
export function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <section>
      <h1 className="text-3xl font-semibold">{t('app.notFound')}</h1>
      <p className="my-4">{t('app.notFoundDescription')}</p>
      <Link className="text-pine underline" href="/">
        {t('app.home')}
      </Link>
    </section>
  );
}
