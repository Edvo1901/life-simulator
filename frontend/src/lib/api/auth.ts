import { apiClient } from './client';
import type {
  Account,
  AccountPage,
  Credentials,
  AccountUpdate,
  AuthSession,
  RolePage,
} from '@/types/auth/account';
export const registerAccount = (body: Credentials) =>
  apiClient<Account>('POST', 'auth/accounts', body);
export const createSession = (body: Credentials) =>
  apiClient<AuthSession>('POST', 'auth/sessions', body);
export const endSession = () =>
  apiClient<void>('DELETE', 'auth/sessions/current');
export const currentAccount = () =>
  apiClient<Account>('GET', 'auth/accounts/current');
export const getRoles = async () =>
  (await apiClient<RolePage>('GET', 'auth/roles')).items;
export const getAccounts = (
  page: number,
  search: string,
  signal?: AbortSignal,
) =>
  apiClient<AccountPage>(
    'GET',
    'auth/accounts?' +
      new URLSearchParams({ page: String(page), pageSize: '20', search }),
    undefined,
    signal,
  );
export const updateAccount = (id: string, body: AccountUpdate) =>
  apiClient<Account>('PATCH', 'auth/accounts/' + encodeURIComponent(id), body);
export const deleteAccount = (id: string, rowVer: string) =>
  apiClient<void>('DELETE', 'auth/accounts/' + encodeURIComponent(id), {
    rowVer,
  });
