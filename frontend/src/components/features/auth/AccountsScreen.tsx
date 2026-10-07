'use client';
/**
 * Administrator account search, role/status editing, resets, and soft-delete confirmation.
 * Uses typed feature hooks, SQL-driven roles, loaded row versions, and shared controls.
 * Wiki: wiki/Authentication.md.
 */
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/auth/useAuth';
import { useAccounts } from '@/hooks/auth/useAccounts';
import { LoginScreen } from './LoginScreen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Account } from '@/types/auth/account';
export function AccountsScreen() {
  const { t } = useTranslation(),
    auth = useAuth(),
    accounts = useAccounts(auth.account?.roleCode === 'admin');
  const [search, setSearch] = useState(''),
    [edit, setEdit] = useState<Account | null>(null),
    [remove, setRemove] = useState<Account | null>(null),
    [role, setRole] = useState(''),
    [enabled, setEnabled] = useState(true),
    [password, setPassword] = useState(''),
    [success, setSuccess] = useState(''),
    [formError, setFormError] = useState('');
  if (!auth.account) return <LoginScreen />;
  if (auth.account.roleCode !== 'admin')
    return <p role="alert">{t('auth.adminOnly')}</p>;
  const error =
    accounts.error &&
    t('errors.' + accounts.error, { defaultValue: t('errors.INTERNAL_ERROR') });
  async function save(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!edit) return;
    if (
      password &&
      (Array.from(password).length < 8 ||
        new TextEncoder().encode(password).length > 72)
    ) {
      setFormError(t('errors.INVALID_PASSWORD'));
      return;
    }
    const ok = await accounts.update(edit.id, {
      rowVer: edit.rowVer,
      roleCode: role,
      enabled,
      ...(password ? { password } : {}),
    });
    if (ok) {
      setSuccess('admin.saved');
      setEdit(null);
      setPassword('');
      if (edit.id === auth.account?.id) await auth.refresh();
    } else if (accounts.data) {
      setEdit(null);
      setPassword('');
    }
  }
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">{t('admin.title')}</h1>
        <p className="mt-3 text-inkSoft">{t('admin.subtitle')}</p>
      </header>
      <form
        className="mb-6 flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          accounts.setPage(1);
          accounts.setSearch(search);
          setSuccess('');
        }}
      >
        <div className="flex-1">
          <Input
            label={t('admin.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={50}
          />
        </div>
        <Button disabled={accounts.loading} type="submit">
          {t('admin.apply')}
        </Button>
      </form>
      {error && (
        <p role="alert" className="mb-4 text-danger">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mb-4">
          {t(success)}
        </p>
      )}
      {accounts.loading ? (
        <p role="status">{t('app.loading')}</p>
      ) : accounts.data?.items.length ? (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {['username', 'role', 'status', 'actions'].map((key) => (
                <th
                  key={key}
                  scope="col"
                  className="border-b border-ruleDark p-3"
                >
                  {t('admin.' + key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.data.items.map((account) => (
              <tr key={account.id}>
                <td className="break-all border-b border-rule p-3">
                  {account.username}
                </td>
                <td className="border-b border-rule p-3">
                  {t('admin.' + account.roleCode)}
                </td>
                <td className="border-b border-rule p-3">
                  {t(account.enabled ? 'admin.enabled' : 'admin.disabled')}
                </td>
                <td className="border-b border-rule p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={accounts.busy}
                      onClick={() => {
                        setEdit(account);
                        setRole(account.roleCode);
                        setEnabled(account.enabled);
                        setPassword('');
                        setFormError('');
                        setSuccess('');
                      }}
                    >
                      {t('admin.edit')}
                    </Button>
                    <Button
                      disabled={accounts.busy}
                      onClick={() => setRemove(account)}
                    >
                      {t('admin.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{t('admin.empty')}</p>
      )}
      {accounts.data && (
        <nav
          aria-label={t('admin.page', {
            page: accounts.page,
            pages: Math.max(
              1,
              Math.ceil(accounts.data.total / accounts.data.pageSize),
            ),
          })}
          className="mt-6 flex items-center justify-between gap-3"
        >
          <Button
            disabled={accounts.page <= 1 || accounts.loading}
            onClick={() => accounts.setPage((x) => x - 1)}
          >
            {t('admin.previous')}
          </Button>
          <p>
            {t('admin.page', {
              page: accounts.page,
              pages: Math.max(
                1,
                Math.ceil(accounts.data.total / accounts.data.pageSize),
              ),
            })}
          </p>
          <Button
            disabled={
              accounts.page * accounts.data.pageSize >= accounts.data.total ||
              accounts.loading
            }
            onClick={() => accounts.setPage((x) => x + 1)}
          >
            {t('admin.next')}
          </Button>
        </nav>
      )}
      {edit && (
        <Modal
          title={t('admin.editTitle', { username: edit.username })}
          onClose={() => {
            if (!accounts.busy) {
              setEdit(null);
              setPassword('');
            }
          }}
        >
          <form className="grid gap-5" onSubmit={save}>
            <label className="grid gap-2">
              {t('admin.role')}
              <select
                className="rounded border border-ruleDark bg-card p-2"
                value={role}
                disabled={accounts.busy}
                onChange={(e) => setRole(e.target.value)}
              >
                {accounts.roles.map((x) => (
                  <option key={x.roleCode} value={x.roleCode}>
                    {t('admin.' + x.roleCode)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enabled}
                disabled={accounts.busy}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              {t('admin.enabled')}
            </label>
            <Input
              label={t('admin.newPassword')}
              help={t('auth.passwordHelp')}
              error={formError || undefined}
              type="password"
              value={password}
              disabled={accounts.busy}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p role="alert" className="text-danger">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={accounts.busy}>
                {t(accounts.busy ? 'app.loading' : 'admin.save')}
              </Button>
              <Button
                type="button"
                disabled={accounts.busy}
                onClick={() => {
                  setEdit(null);
                  setPassword('');
                }}
              >
                {t('admin.cancel')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal
          title={t('admin.deleteTitle')}
          onClose={() => {
            if (!accounts.busy) setRemove(null);
          }}
        >
          <p>{t('admin.deletePrompt', { username: remove.username })}</p>
          {error && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <Button
              disabled={accounts.busy}
              onClick={() => {
                void accounts
                  .remove(remove.id, remove.rowVer)
                  .then(async (ok) => {
                    if (ok) {
                      setSuccess('admin.deleted');
                      setRemove(null);
                      if (remove.id === auth.account?.id) await auth.refresh();
                    } else setRemove(null);
                  });
              }}
            >
              {t(accounts.busy ? 'app.loading' : 'admin.confirmDelete')}
            </Button>
            <Button disabled={accounts.busy} onClick={() => setRemove(null)}>
              {t('admin.cancel')}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
