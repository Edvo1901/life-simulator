'use client';
/**
 * Login/self-registration form; uses shared auth/typed API hook flow.
 * Supports translated validation and keeps credentials only in component memory.
 * Wiki: wiki/Authentication.md.
 */
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/auth/useAuth';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
export function LoginScreen() {
  const { t } = useTranslation(),
    auth = useAuth(),
    router = useRouter();
  const [register, setRegister] = useState(false),
    [username, setUsername] = useState(''),
    [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess(false);
    if (register && password !== confirm) {
      setError('auth.passwordMismatch');
      return;
    }
    if (
      Array.from(password).length < 8 ||
      new TextEncoder().encode(password).length > 72
    ) {
      setError('errors.INVALID_PASSWORD');
      return;
    }
    setBusy(true);
    try {
      if (register) {
        await auth.register({ username, password });
        setRegister(false);
        setSuccess(true);
      } else {
        await auth.login({ username, password });
        router.push('/');
      }
      setPassword('');
      setConfirm('');
    } catch (e) {
      setError('errors.' + (e instanceof ApiError ? e.code : 'INTERNAL_ERROR'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mx-auto max-w-md">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">
          {t(register ? 'auth.registerTitle' : 'auth.title')}
        </h1>
        <p className="mt-3 text-inkSoft">
          {t(register ? 'auth.registerSubtitle' : 'auth.subtitle')}
        </p>
      </header>
      <form className="grid gap-5" onSubmit={submit}>
        <Input
          label={t('auth.username')}
          help={t('auth.usernameHelp')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          maxLength={50}
          required
          disabled={busy}
        />
        <Input
          label={t('auth.password')}
          help={t('auth.passwordHelp')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={register ? 'new-password' : 'current-password'}
          minLength={8}
          required
          disabled={busy}
        />
        {register && (
          <Input
            label={t('auth.confirmPassword')}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            disabled={busy}
          />
        )}
        {error && (
          <p role="alert" className="text-danger">
            {t(error)}
          </p>
        )}
        {success && <p role="status">{t('auth.registered')}</p>}
        <Button type="submit" disabled={busy}>
          {t(busy ? 'app.loading' : register ? 'auth.register' : 'auth.signIn')}
        </Button>
        <button
          type="button"
          className="text-pine underline focus-visible:outline-2 focus-visible:outline-pine"
          disabled={busy}
          onClick={() => {
            setRegister((x) => !x);
            setError('');
            setPassword('');
            setConfirm('');
          }}
        >
          {t(register ? 'auth.switchLogin' : 'auth.switchRegister')}
        </button>
      </form>
    </section>
  );
}
