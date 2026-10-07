import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import type { AuthTransaction } from '../types/auth/account';
@Injectable()
export class AuthTransactionRunner {
  private readonly managers = new WeakMap<AuthTransaction, EntityManager>();
  constructor(private readonly database: DataSource) {}
  async run<T>(
    operation: (context: AuthTransaction) => Promise<T>,
  ): Promise<T> {
    return this.database.transaction('SERIALIZABLE', async (manager) => {
      const context = { scope: Symbol('auth') };
      this.managers.set(context, manager);
      try {
        return await operation(context);
      } finally {
        this.managers.delete(context);
      }
    });
  }
  manager(context?: AuthTransaction): EntityManager {
    if (!context) return this.database.manager;
    const manager = this.managers.get(context);
    if (!manager) throw new Error('Invalid transaction context');
    return manager;
  }
}
