'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteAccount,
  getAccounts,
  getRoles,
  updateAccount,
} from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import type {
  AccountPage,
  AccountUpdate,
  RoleChoice,
} from '@/types/auth/account';
export function useAccounts(active: boolean) {
  const [data, setData] = useState<AccountPage | null>(null),
    [roles, setRoles] = useState<RoleChoice[]>([]),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(''),
    [settledKey, setSettledKey] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [mutationError, setMutationError] = useState<string | null>(null),
    [revision, setRevision] = useState(0);
  const requestKey = page + ':' + search + ':' + revision;
  const loading = active && settledKey !== requestKey;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const reload = useCallback(() => setRevision((x) => x + 1), []);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();

    void Promise.all([getAccounts(page, search, controller.signal), getRoles()])
      .then(([list, options]) => {
        if (!controller.signal.aborted) {
          setError(null);
          setData(list);
          setRoles(options);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof ApiError ? e.code : 'INTERNAL_ERROR');
      })
      .finally(() => {
        if (!controller.signal.aborted) setSettledKey(requestKey);
      });
    return () => controller.abort();
  }, [active, page, search, revision, requestKey]);
  async function mutate(operation: () => Promise<unknown>) {
    setBusy(true);
    setMutationError(null);
    try {
      await operation();
      reload();
      return true;
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'INTERNAL_ERROR';
      if (mounted.current) {
        setMutationError(code);
        if (e instanceof ApiError && e.status === 409) reload();
      }
      return false;
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  return {
    data,
    roles,
    page,
    setPage,
    search,
    setSearch,
    loading,
    busy,
    error: mutationError ?? error,
    reload,
    update: (id: string, body: AccountUpdate) =>
      mutate(() => updateAccount(id, body)),
    remove: (id: string, rowVer: string) =>
      mutate(() => deleteAccount(id, rowVer)),
  };
}
