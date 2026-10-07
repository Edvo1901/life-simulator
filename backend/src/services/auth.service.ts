import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthTransactionRunner } from '../repositories/auth.transaction';
import { AuthSessions } from '../auth/auth.sessions';
import { AuthException } from '../exceptions/auth.exception';
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  validateUsername,
} from '../auth/password';
import { adelaideTime } from '../utils/adelaideTime';
import type {
  AccountCredentials,
  AccountUpdate,
  AuthIdentity,
} from '../types/auth/account';
@Injectable()
export class AuthService {
  private readonly dummyHash = hashPassword(randomBytes(32).toString('hex'));
  constructor(
    private readonly repository: AuthRepository,
    private readonly runner: AuthTransactionRunner,
    private readonly sessions: AuthSessions,
  ) {}
  private publicAccount(value: AccountCredentials) {
    return {
      id: value.id,
      username: value.username,
      roleCode: value.roleCode,
      enabled: value.enabled,
      rowVer: value.rowVer,
      createdAt: value.createdAt,
    };
  }
  private stamp() {
    return randomBytes(32).toString('hex');
  }
  async register(username: string, password: string) {
    validateUsername(username);
    const hash = await hashPassword(password);
    try {
      return this.publicAccount(
        await this.repository.create(
          username,
          hash,
          'user',
          this.stamp(),
          adelaideTime(),
        ),
      );
    } catch (error) {
      if (error && typeof error === 'object' && 'driverError' in error) {
        const driver = error.driverError as { number?: number };
        if (driver.number === 2601 || driver.number === 2627)
          throw new AuthException('USERNAME_TAKEN', 409);
      }
      throw error;
    }
  }
  async login(username: string, password: string) {
    validateUsername(username);
    validatePassword(password);
    const account = await this.repository.findByUsername(username);
    const hash = account?.passwordHash ?? (await this.dummyHash);
    const valid = await verifyPassword(password, hash);
    if (!account || !valid || !account.enabled)
      throw new AuthException('INVALID_CREDENTIALS', 401);
    return {
      token: this.sessions.issue(account.id, account.securityStamp),
      account: this.publicAccount(account),
    };
  }
  async identify(token: string): Promise<AuthIdentity> {
    const session = this.sessions.find(token);
    if (!session) throw new AuthException('UNAUTHENTICATED', 401);
    const user = await this.repository.findById(session.id);
    if (!user || !user.enabled || user.securityStamp !== session.stamp) {
      this.sessions.revoke(token);
      throw new AuthException('UNAUTHENTICATED', 401);
    }
    return { id: user.id, username: user.username, roleCode: user.roleCode };
  }
  logout(token: string) {
    this.sessions.revoke(token);
  }
  async current(identity: AuthIdentity) {
    const account = await this.repository.findById(identity.id);
    if (!account) throw new AuthException('UNAUTHENTICATED', 401);
    return this.publicAccount(account);
  }
  list(page: number, size: number, search: string) {
    return this.repository.list(page, size, search);
  }
  roles(page: number, pageSize: number) {
    return this.repository.roles(page, pageSize);
  }
  /** Recheck actor permission and last-admin invariant within the same serialized transaction. */
  async update(
    actor: AuthIdentity,
    id: string,
    input: AccountUpdate,
    deleted = false,
  ) {
    const hash =
      input.password === undefined
        ? undefined
        : await hashPassword(input.password);
    return this.runner.run(async (context) => {
      await this.repository.lockAdminChanges(context);
      const caller = await this.repository.findById(actor.id, context);
      if (!caller || !caller.enabled || caller.roleCode !== 'admin')
        throw new AuthException('FORBIDDEN', 403);
      const account = await this.repository.findById(id, context);
      if (!account) throw new AuthException('NOT_FOUND', 404);
      if (account.rowVer !== input.rowVer)
        throw new AuthException('CONFLICT', 409);
      const role = input.roleCode ?? account.roleCode,
        enabled = deleted ? false : (input.enabled ?? account.enabled);
      if (
        account.roleCode === 'admin' &&
        account.enabled &&
        (deleted || !enabled || role !== 'admin') &&
        (await this.repository.activeAdminCount(context)) <= 1
      )
        throw new AuthException('LAST_ADMIN', 409);
      const saved = await this.repository.update(
        id,
        input.rowVer,
        role,
        enabled,
        hash ?? account.passwordHash,
        this.stamp(),
        adelaideTime(),
        deleted,
        context,
      );
      if (!saved) throw new AuthException('CONFLICT', 409);
      return this.publicAccount(saved);
    });
  }
  async bootstrap(username: string, password: string) {
    validateUsername(username);
    const hash = await hashPassword(password);
    return this.runner.run(async (context) => {
      await this.repository.lockAdminChanges(context);
      if ((await this.repository.activeAdminCount(context)) > 0)
        throw new AuthException('ADMIN_ALREADY_EXISTS', 409);
      return this.publicAccount(
        await this.repository.create(
          username,
          hash,
          'admin',
          this.stamp(),
          adelaideTime(),
          context,
        ),
      );
    });
  }
}
