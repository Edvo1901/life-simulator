/** @jest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { createLanguageEngine } from '@/lib/i18n';
import { LoginScreen } from './LoginScreen';
import { ApiError } from '@/lib/api/client';
import { TextEncoder } from 'node:util';
import english from '../../../../../language/en/common.json';
import vietnamese from '../../../../../language/vn/common.json';
const mockAuth = {
  account: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refresh: jest.fn(),
};
jest.mock('@/hooks/auth/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
let container: HTMLDivElement, root: Root;
beforeEach(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.TextEncoder = TextEncoder;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  jest.clearAllMocks();
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
        <LoginScreen />
      </I18nextProvider>,
    ),
  );
  return engine;
}
async function fill(index: number, value: string) {
  await act(async () => {
    const input = container.querySelectorAll('input')[index];
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function submit() {
  await act(async () => {
    container
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}
test('case-sensitive credentials are sent unchanged and login succeeds', async () => {
  mockAuth.login.mockResolvedValue(undefined);
  await render();
  await fill(0, 'Alice');
  await fill(1, 'Test-password');
  await submit();
  expect(mockAuth.login).toHaveBeenCalledWith({
    username: 'Alice',
    password: 'Test-password',
  });
  expect(
    container.querySelector<HTMLInputElement>('input[type=password]')!.value,
  ).toBe('');
});
test('registration requires matching passwords, then shows success', async () => {
  mockAuth.register.mockResolvedValue({ id: 'USR-00001' });
  await render();
  await act(async () => {
    container.querySelector<HTMLButtonElement>('button[type=button]')!.click();
  });
  await fill(0, 'alice');
  await fill(1, 'Test-password');
  await fill(2, 'Different-password');
  await submit();
  expect(container.querySelector('[role=alert]')?.textContent).toBe(
    english.auth.passwordMismatch,
  );
  expect(mockAuth.register).not.toHaveBeenCalled();
  await fill(2, 'Test-password');
  await submit();
  expect(mockAuth.register).toHaveBeenCalled();
  expect(container.querySelector('[role=status]')?.textContent).toBe(
    english.auth.registered,
  );
});
test('translated request errors and switching preserve entered values', async () => {
  mockAuth.login.mockRejectedValue(new ApiError('INVALID_CREDENTIALS', 401));
  const engine = await render();
  await fill(0, 'KeptName');
  await fill(1, 'Wrong-password');
  await submit();
  await act(async () => {
    await engine.changeLanguage('vn');
  });
  expect(container.querySelector('[role=alert]')?.textContent).toBe(
    vietnamese.errors.INVALID_CREDENTIALS,
  );
  expect(container.querySelector<HTMLInputElement>('input')!.value).toBe(
    'KeptName',
  );
  expect(container.querySelector('h1')?.textContent).toBe(
    vietnamese.auth.title,
  );
});
test('rejects bcrypt byte overflow before submitting', async () => {
  await render('vn');
  await fill(0, 'Valid');
  await fill(1, '🙂'.repeat(20));
  await submit();
  expect(mockAuth.login).not.toHaveBeenCalled();
  expect(container.querySelector('[role=alert]')?.textContent).toBe(
    vietnamese.errors.INVALID_PASSWORD,
  );
});
test('pending login disables submission until response resolves', async () => {
  let finish: () => void = () => {};
  mockAuth.login.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  await render();
  await fill(0, 'Valid');
  await fill(1, 'Test-password');
  await submit();
  expect(
    container.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled,
  ).toBe(true);
  await act(async () => finish());
  expect(
    container.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled,
  ).toBe(false);
});
