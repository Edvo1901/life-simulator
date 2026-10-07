import { useContext } from 'react';
import { AuthContext } from '@/components/layout/AuthProvider';
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider is missing');
  return auth;
}
