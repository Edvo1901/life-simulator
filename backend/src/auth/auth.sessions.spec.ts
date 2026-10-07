import { jest } from '@jest/globals';
import { AuthSessions } from './auth.sessions';
test('opaque sessions expire, revoke, and do not survive process/service recreation', () => {
  const store = new AuthSessions(),
    token = store.issue('USR-00001', 'stamp');
  expect(store.find(token)?.id).toBe('USR-00001');
  expect(new AuthSessions().find(token)).toBeNull();
  store.revoke(token);
  expect(store.find(token)).toBeNull();
  const expiring = store.issue('USR-00001', 'stamp');
  jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 9 * 60 * 60 * 1000);
  expect(store.find(expiring)).toBeNull();
  jest.restoreAllMocks();
});
