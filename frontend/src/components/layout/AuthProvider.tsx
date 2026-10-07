'use client';
/**
 * Shared transient authentication context; used by login and protected screens.
 * Credentials/tokens never persist; all HTTP flows through typed API modules.
 * Wiki: wiki/Authentication.md.
 */
import {
  createContext,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import {
  createSession,
  endSession,
  currentAccount,
  registerAccount,
} from '@/lib/api/auth';
import { setSessionToken } from '@/lib/api/client';
import type { Account, Credentials } from '@/types/auth/account';
export const AuthContext = createContext<{
  account: Account | null;
  login(body: Credentials): Promise<void>;
  register(body: Credentials): Promise<Account>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
} | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  useEffect(() => {
    const expired = () => setAccount(null);
    window.addEventListener('auth:expired', expired);
    return () => window.removeEventListener('auth:expired', expired);
  }, []);
  const login = useCallback(async (body: Credentials) => {
    const result = await createSession(body);
    setSessionToken(result.token);
    setAccount(result.account);
  }, []);
  const logout = useCallback(async () => {
    try {
      await endSession();
    } finally {
      setSessionToken(null);
      setAccount(null);
    }
  }, []);
  const refresh = useCallback(async () => {
    try {
      setAccount(await currentAccount());
    } catch {
      setSessionToken(null);
      setAccount(null);
    }
  }, []);
  return (
    <AuthContext.Provider
      value={{ account, login, logout, refresh, register: registerAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}
