import 'reflect-metadata';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import {
  Global,
  Module,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../services/auth.service';
import { databaseOptions } from '../config/database';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import type { Account } from '../types/auth/account';
const integration =
  process.env.DB_HOST && process.env.DB_PASSWORD ? describe : describe.skip;
integration('isolated SQL Server auth and HTTP contracts', () => {
  let master: DataSource,
    database: DataSource,
    app: INestApplication,
    base: string;
  const name = 'LifeSimulatorAuthTest_' + randomBytes(6).toString('hex');
  const password = 'Test-password-2026';
  let admin: Account, adminToken: string, user: Account, userToken: string;
  @Global()
  @Module({
    providers: [{ provide: DataSource, useFactory: () => database }],
    exports: [DataSource],
  })
  class TestDatabaseModule {}
  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    token?: string,
  ) {
    const response = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return {
      status: response.status,
      body: response.status === 204 ? null : ((await response.json()) as T),
    };
  }
  beforeAll(async () => {
    if (!/^LifeSimulatorAuthTest_[a-f0-9]{12}$/.test(name))
      throw new Error('Unsafe test database name');
    master = new DataSource(
      databaseOptions({ ...process.env, DB_NAME: 'master' }),
    );
    await master.initialize();
    await master.query('CREATE DATABASE [' + name + ']');
    database = new DataSource(
      databaseOptions({ ...process.env, DB_NAME: name }),
    );
    await database.initialize();
    await database.query(
      readFileSync(
        resolve(process.cwd(), '../SQL-Table/schema_v1.sql'),
        'utf8',
      ),
    );
    const module = await Test.createTestingModule({
      imports: [TestDatabaseModule, AuthModule],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.setGlobalPrefix('apiv9');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()) + '/apiv9/auth/';
    admin = await module.get(AuthService).bootstrap('AdminTest', password);
    const session = await request<{ token: string }>('POST', 'sessions', {
      username: 'AdminTest',
      password,
    });
    adminToken = session.body!.token;
  }, 30000);
  afterAll(async () => {
    await app?.close();
    if (database?.isInitialized) await database.destroy();
    if (master?.isInitialized) {
      if (/^LifeSimulatorAuthTest_[a-f0-9]{12}$/.test(name))
        await master.query(
          'ALTER DATABASE [' +
            name +
            '] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [' +
            name +
            ']',
        );
      await master.destroy();
    }
  });
  test('registration/login is case-sensitive, unique, hashed, and denies role injection', async () => {
    const injection = await request('POST', 'accounts', {
      username: 'Injected',
      password,
      roleCode: 'admin',
    });
    expect(injection.status).toBe(400);
    const created = await request<Account>('POST', 'accounts', {
      username: 'AliceTest',
      password,
    });
    expect(created.status).toBe(201);
    user = created.body!;
    expect(user.roleCode).toBe('user');
    expect(JSON.stringify(created.body)).not.toMatch(/password|securityStamp/);
    expect(
      (await request('POST', 'accounts', { username: 'alicetest', password }))
        .status,
    ).toBe(201);
    const duplicate = await request<{ error: { code: string } }>(
      'POST',
      'accounts',
      { username: 'AliceTest', password },
    );
    expect(duplicate.status).toBe(409);
    expect(duplicate.body?.error.code).toBe('USERNAME_TAKEN');
    const stored = (await database.query(
      'SELECT password_hash FROM auth.users WHERE id=@0',
      [user.id],
    )) as { password_hash: string }[];
    expect(stored[0].password_hash).toMatch(/^\$2[ab]\$12\$/);
    expect(stored[0].password_hash).not.toBe(password);
    const session = await request<{ token: string }>('POST', 'sessions', {
      username: 'AliceTest',
      password,
    });
    expect(session.status).toBe(200);
    userToken = session.body!.token;
    expect(
      (await request('POST', 'sessions', { username: 'ALICETEST', password }))
        .status,
    ).toBe(401);
  }, 15000);
  test('permissions, bounded paging, roles, and invalid input', async () => {
    expect((await request('GET', 'accounts')).status).toBe(401);
    expect(
      (await request('GET', 'accounts', undefined, userToken)).status,
    ).toBe(403);
    expect(
      (await request('GET', 'accounts?pageSize=201', undefined, adminToken))
        .status,
    ).toBe(400);
    const page = await request<{ items: Account[]; total: number }>(
      'GET',
      'accounts?search=AliceTest&pageSize=1',
      undefined,
      adminToken,
    );
    expect(page.status).toBe(200);
    expect(page.body?.items).toHaveLength(1);
    expect(page.body?.total).toBe(1);
    expect((await request('GET', 'roles', undefined, adminToken)).status).toBe(
      200,
    );
    expect(
      (
        await request('POST', 'accounts', {
          username: 'LongPassword',
          password: '🙂'.repeat(20),
        })
      ).status,
    ).toBe(400);
  });
  test('loaded rowVer protects updates; disable/reset/delete revoke sessions', async () => {
    const updated = await request<Account>(
      'PATCH',
      'accounts/' + user.id,
      { rowVer: user.rowVer, enabled: false },
      adminToken,
    );
    expect(updated.status).toBe(200);
    expect(
      (await request('GET', 'accounts/current', undefined, userToken)).status,
    ).toBe(401);
    expect(
      (
        await request(
          'PATCH',
          'accounts/' + user.id,
          { rowVer: user.rowVer, enabled: true },
          adminToken,
        )
      ).status,
    ).toBe(409);
    user = updated.body!;
    const reset = await request<Account>(
      'PATCH',
      'accounts/' + user.id,
      { rowVer: user.rowVer, enabled: true, password: 'New-password-2026' },
      adminToken,
    );
    expect(reset.status).toBe(200);
    user = reset.body!;
    expect(
      (await request('POST', 'sessions', { username: user.username, password }))
        .status,
    ).toBe(401);
    const login = await request<{ token: string }>('POST', 'sessions', {
      username: user.username,
      password: 'New-password-2026',
    });
    expect(login.status).toBe(200);
    expect(
      (
        await request(
          'DELETE',
          'accounts/' + user.id,
          { rowVer: user.rowVer },
          adminToken,
        )
      ).status,
    ).toBe(204);
    expect(
      (await request('GET', 'accounts/current', undefined, login.body!.token))
        .status,
    ).toBe(401);
    const deleted = (await database.query(
      'SELECT deleted_at FROM auth.users WHERE id=@0',
      [user.id],
    )) as { deleted_at: unknown }[];
    expect(deleted[0].deleted_at).not.toBeNull();
  }, 15000);
  test('last active admin cannot be disabled, demoted, or deleted', async () => {
    for (const update of [{ enabled: false }, { roleCode: 'user' }]) {
      const result = await request<{ error: { code: string } }>(
        'PATCH',
        'accounts/' + admin.id,
        { rowVer: admin.rowVer, ...update },
        adminToken,
      );
      expect(result.status).toBe(409);
      expect(result.body?.error.code).toBe('LAST_ADMIN');
    }
    expect(
      (
        await request(
          'DELETE',
          'accounts/' + admin.id,
          { rowVer: admin.rowVer },
          adminToken,
        )
      ).status,
    ).toBe(409);
  });
  test('concurrent duplicate registration has only one effect', async () => {
    const responses = await Promise.all([
      request('POST', 'accounts', { username: 'Concurrent', password }),
      request('POST', 'accounts', { username: 'Concurrent', password }),
    ]);
    expect(responses.map((x) => x.status).sort()).toEqual([201, 409]);
  }, 15000);
  test('concurrent admin removals preserve one active administrator', async () => {
    const created = await request<Account>('POST', 'accounts', {
      username: 'SecondAdmin',
      password,
    });
    const promoted = await request<Account>(
      'PATCH',
      'accounts/' + created.body!.id,
      { rowVer: created.body!.rowVer, roleCode: 'admin' },
      adminToken,
    );
    const login = await request<{ token: string }>('POST', 'sessions', {
      username: 'SecondAdmin',
      password,
    });
    const results = await Promise.all([
      request(
        'PATCH',
        'accounts/' + admin.id,
        { rowVer: admin.rowVer, enabled: false },
        adminToken,
      ),
      request(
        'PATCH',
        'accounts/' + promoted.body!.id,
        { rowVer: promoted.body!.rowVer, enabled: false },
        login.body!.token,
      ),
    ]);
    expect(results.filter((x) => x.status === 200)).toHaveLength(1);
    const rows = (await database.query(
      "SELECT COUNT(*) AS count FROM auth.users WHERE role_code=N'admin' AND enabled=1 AND deleted_at IS NULL",
    )) as { count: number }[];
    expect(rows[0].count).toBe(1);
  }, 15000);
  test('sequence permits the five-digit upper bound and fails safely after it', async () => {
    await database.query('ALTER SEQUENCE auth.user_id_seq RESTART WITH 99999');
    const last = await request<Account>('POST', 'accounts', {
      username: 'Boundary',
      password,
    });
    expect(last.status).toBe(201);
    expect(last.body?.id).toBe('USR-99999');
    expect(
      (
        await request('POST', 'accounts', {
          username: 'BeyondBoundary',
          password,
        })
      ).status,
    ).toBe(500);
  }, 15000);
});
