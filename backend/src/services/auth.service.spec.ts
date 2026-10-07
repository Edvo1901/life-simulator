import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthTransactionRunner } from '../repositories/auth.transaction';
import { AuthSessions } from '../auth/auth.sessions';
test('registration never permits admin and creates Adelaide timestamps without exposing hashes', async () => {
  const repository = {
    create: jest.fn(
      async (
        username: string,
        hash: string,
        roleCode: string,
        _stamp: string,
        time: string,
      ) => ({
        id: 'USR-00001',
        username,
        passwordHash: hash,
        securityStamp: 'private',
        roleCode,
        enabled: true,
        rowVer: '0000000000000001',
        createdAt: time,
      }),
    ),
  };
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: AuthRepository, useValue: repository },
      { provide: AuthTransactionRunner, useValue: {} },
      AuthSessions,
    ],
  }).compile();
  const result = await module
    .get(AuthService)
    .register('CaseSensitive', 'Test-password-2026');
  expect(result.roleCode).toBe('user');
  expect(result.createdAt).toMatch(/\+(09:30|10:30)$/);
  expect(result).not.toHaveProperty('passwordHash');
  expect(result).not.toHaveProperty('securityStamp');
  await module.close();
});
test('invalid password bytes/length are rejected before repository writes', async () => {
  const repository = { create: jest.fn() };
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: AuthRepository, useValue: repository },
      { provide: AuthTransactionRunner, useValue: {} },
      AuthSessions,
    ],
  }).compile();
  await expect(
    module.get(AuthService).register('Valid', 'short'),
  ).rejects.toThrow();
  await expect(
    module.get(AuthService).register('Valid', '🙂'.repeat(20)),
  ).rejects.toThrow();
  expect(repository.create).not.toHaveBeenCalled();
  await module.close();
});

import type { AccountCredentials } from '../types/auth/account';
import type { AuthTransaction } from '../types/auth/account';
async function adminFixture() {
  const account: AccountCredentials = {
    id: 'USR-00001',
    username: 'Admin',
    roleCode: 'admin',
    enabled: true,
    rowVer: '0000000000000001',
    createdAt: '2026-10-08T00:00:00Z',
    passwordHash: 'private',
    securityStamp: 'old-stamp',
  };
  const repository = {
    lockAdminChanges: jest.fn(async () => {}),
    findById: jest.fn(async (): Promise<AccountCredentials | null> => account),
    activeAdminCount: jest.fn(async () => 1),
    create: jest.fn(async () => account),
    update: jest.fn(
      async (
        _id: string,
        _rowVer: string,
        roleCode: string,
        enabled: boolean,
        passwordHash: string,
        securityStamp: string,
        createdAt: string,
      ) => ({
        ...account,
        roleCode,
        enabled,
        passwordHash,
        securityStamp,
        createdAt,
      }),
    ),
  };
  const runner = {
    async run<T>(
      operation: (context: AuthTransaction) => Promise<T>,
    ): Promise<T> {
      return operation({ scope: Symbol('test') });
    },
  };
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: AuthRepository, useValue: repository },
      { provide: AuthTransactionRunner, useValue: runner },
      AuthSessions,
    ],
  }).compile();
  return { account, repository, module, service: module.get(AuthService) };
}
test.each([{ enabled: false }, { roleCode: 'user' }])(
  'service protects final active admin from %j',
  async (change) => {
    const fixture = await adminFixture();
    try {
      await expect(
        fixture.service.update(fixture.account, fixture.account.id, {
          rowVer: fixture.account.rowVer,
          ...change,
        }),
      ).rejects.toMatchObject({ response: { code: 'LAST_ADMIN' } });
      expect(fixture.repository.update).not.toHaveBeenCalled();
    } finally {
      await fixture.module.close();
    }
  },
);
test('service rechecks actor access and loaded row version before mutation', async () => {
  const fixture = await adminFixture();
  try {
    fixture.repository.findById.mockResolvedValueOnce({
      ...fixture.account,
      roleCode: 'user',
    });
    await expect(
      fixture.service.update(fixture.account, fixture.account.id, {
        rowVer: fixture.account.rowVer,
      }),
    ).rejects.toMatchObject({ response: { code: 'FORBIDDEN' } });
    await expect(
      fixture.service.update(fixture.account, fixture.account.id, {
        rowVer: '0000000000000002',
      }),
    ).rejects.toMatchObject({ response: { code: 'CONFLICT' } });
    expect(fixture.repository.update).not.toHaveBeenCalled();
  } finally {
    await fixture.module.close();
  }
});
test('allowed status change rotates stamps, timestamps and returns only public fields', async () => {
  const fixture = await adminFixture();
  try {
    fixture.repository.activeAdminCount.mockResolvedValue(2);
    const result = await fixture.service.update(
      fixture.account,
      fixture.account.id,
      { rowVer: fixture.account.rowVer, enabled: false },
    );
    expect(result.enabled).toBe(false);
    expect(fixture.repository.update.mock.calls[0][5]).not.toBe(
      fixture.account.securityStamp,
    );
    expect(fixture.repository.update.mock.calls[0][6]).toMatch(
      /\+(09:30|10:30)$/,
    );
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('securityStamp');
  } finally {
    await fixture.module.close();
  }
});
test('one-time bootstrap refuses an existing active administrator', async () => {
  const fixture = await adminFixture();
  try {
    await expect(
      fixture.service.bootstrap('AnotherAdmin', 'Test-password-2026'),
    ).rejects.toMatchObject({ response: { code: 'ADMIN_ALREADY_EXISTS' } });
    expect(fixture.repository.create).not.toHaveBeenCalled();
  } finally {
    await fixture.module.close();
  }
});
