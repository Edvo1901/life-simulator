/** @jest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { TextEncoder } from 'node:util';
import { createLanguageEngine } from '@/lib/i18n';
import { AccountsScreen } from './AccountsScreen';
import type { Account } from '@/types/auth/account';
import english from '../../../../../language/en/common.json';
import vietnamese from '../../../../../language/vn/common.json';
const account: Account = {
  id: 'USR-00002',
  username: 'Player',
  roleCode: 'user',
  enabled: true,
  rowVer: '0000000000000001',
  createdAt: '2026-10-08T00:00:00Z',
};
const mockAuth = {
  account: { ...account, id: 'USR-00001', roleCode: 'admin' } as Account,
  refresh: jest.fn(),
};
const mockAccounts = {
  data: { items: [account], total: 1, page: 1, pageSize: 20 },
  page: 1,
  roles: [{ roleCode: 'user' }, { roleCode: 'admin' }],
  loading: false,
  busy: false,
  error: '',
  setPage: jest.fn(),
  setSearch: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};
jest.mock('@/hooks/auth/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('@/hooks/auth/useAccounts', () => ({
  useAccounts: () => mockAccounts,
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
let container: HTMLDivElement, root: Root;
beforeEach(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.TextEncoder = TextEncoder;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  jest.clearAllMocks();
  mockAuth.account = { ...account, id: 'USR-00001', roleCode: 'admin' };
  mockAccounts.data = { items: [account], total: 1, page: 1, pageSize: 20 };
  mockAccounts.loading = false;
  mockAccounts.busy = false;
  mockAccounts.error = '';
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});
async function render(language = 'en') {
  const engine = createLanguageEngine({
    languages: [
      { code: 'en', label: 'English', htmlTag: 'en' },
      { code: 'vn', label: 'Tiếng Việt', htmlTag: 'vi' },
    ],
    resources: { en: { common: english }, vn: { common: vietnamese } },
  });
  await engine.changeLanguage(language);
  await act(async () =>
    root.render(
      <I18nextProvider i18n={engine}>
        <AccountsScreen />
      </I18nextProvider>,
    ),
  );
}
async function click(text: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (x) => x.textContent === text,
  );
  if (!button) throw new Error('Missing test button ' + text);
  await act(async () => button.click());
}
test('non-admin cannot see account-management controls', async () => {
  mockAuth.account.roleCode = 'user';
  await render('vn');
  expect(container.querySelector('[role=alert]')?.textContent).toBe(
    vietnamese.auth.adminOnly,
  );
  expect(container.querySelector('table')).toBeNull();
});
test('loading, empty results, and conflict errors are translated', async () => {
  mockAccounts.loading = true;
  await render('vn');
  expect(container.querySelector('[role=status]')?.textContent).toBe(
    vietnamese.app.loading,
  );
  mockAccounts.loading = false;
  mockAccounts.data.items = [];
  mockAccounts.error = 'CONFLICT';
  await render('vn');
  expect(container.textContent).toContain(vietnamese.admin.empty);
  expect(container.querySelector('[role=alert]')?.textContent).toBe(
    vietnamese.errors.CONFLICT,
  );
});
test('edit sends loaded row version, database role selection, and optional reset', async () => {
  mockAccounts.update.mockResolvedValue(true);
  await render();
  await click(english.admin.edit);
  expect(container.querySelectorAll('dialog option')).toHaveLength(2);
  await act(async () => {
    const select = container.querySelector(
      'dialog select',
    ) as HTMLSelectElement;
    select.value = 'admin';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    const password = container.querySelector(
      'dialog input[type=password]',
    ) as HTMLInputElement;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(password, 'Reset-password');
    password.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () =>
    container
      .querySelector('dialog form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
  expect(mockAccounts.update).toHaveBeenCalledWith(account.id, {
    rowVer: account.rowVer,
    roleCode: 'admin',
    enabled: true,
    password: 'Reset-password',
  });
  expect(container.querySelector('dialog')).toBeNull();
  expect(container.querySelector('[role=status]')?.textContent).toBe(
    english.admin.saved,
  );
});
test('delete requires confirmation and cancellation makes no mutation', async () => {
  mockAccounts.remove.mockResolvedValue(true);
  await render('vn');
  await click(vietnamese.admin.delete);
  expect(mockAccounts.remove).not.toHaveBeenCalled();
  await click(vietnamese.admin.cancel);
  expect(mockAccounts.remove).not.toHaveBeenCalled();
  await click(vietnamese.admin.delete);
  await click(vietnamese.admin.confirmDelete);
  expect(mockAccounts.remove).toHaveBeenCalledWith(account.id, account.rowVer);
  expect(container.querySelector('[role=status]')?.textContent).toBe(
    vietnamese.admin.deleted,
  );
});
