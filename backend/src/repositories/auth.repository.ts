import { Injectable } from '@nestjs/common';
import { AuthTransactionRunner } from './auth.transaction';
import type { AuthTransaction } from '../types/auth/account';
import type { AccountCredentials, AccountPage } from '../types/auth/account';
@Injectable()
export class AuthRepository {
  constructor(private readonly runner: AuthTransactionRunner) {}
  private query<T>(
    text: string,
    parameters: unknown[] = [],
    context?: AuthTransaction,
  ): Promise<T> {
    return this.runner.manager(context).query(text, parameters);
  }
  private map(row: Record<string, unknown>): AccountCredentials {
    return {
      id: String(row.id),
      username: String(row.username),
      roleCode: String(row.role_code),
      enabled: Boolean(row.enabled),
      passwordHash: String(row.password_hash),
      securityStamp: String(row.security_stamp),
      rowVer: (row.row_ver as Buffer).toString('hex'),
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    };
  }
  async findByUsername(username: string, context?: AuthTransaction) {
    const rows = await this.query<Record<string, unknown>[]>(
      'SELECT * FROM auth.users WHERE username=@0 AND deleted_at IS NULL',
      [username],
      context,
    );
    return rows[0] ? this.map(rows[0]) : null;
  }
  async findById(id: string, context?: AuthTransaction) {
    const rows = await this.query<Record<string, unknown>[]>(
      'SELECT * FROM auth.users WHERE id=@0 AND deleted_at IS NULL',
      [id],
      context,
    );
    return rows[0] ? this.map(rows[0]) : null;
  }
  async create(
    username: string,
    passwordHash: string,
    roleCode: string,
    stamp: string,
    time: string,
    context?: AuthTransaction,
  ) {
    const rows = await this.query<Record<string, unknown>[]>(
      "INSERT auth.users(id,username,password_hash,role_code,enabled,security_stamp,created_at,updated_at) OUTPUT inserted.* VALUES ('USR-'+RIGHT('00000'+CAST(NEXT VALUE FOR auth.user_id_seq AS VARCHAR(5)),5),@0,@1,@2,1,@3,CAST(@4 AS DATETIMEOFFSET),CAST(@4 AS DATETIMEOFFSET))",
      [username, passwordHash, roleCode, stamp, time],
      context,
    );
    return this.map(rows[0]);
  }
  async roles(page: number, pageSize: number) {
    const items = await this.query<{ roleCode: string }[]>(
      'SELECT role_code AS roleCode FROM auth.roles ORDER BY role_code OFFSET @0 ROWS FETCH NEXT @1 ROWS ONLY',
      [(page - 1) * pageSize, pageSize],
    );
    const rows = await this.query<{ total: number }[]>(
      'SELECT COUNT(*) AS total FROM auth.roles',
    );
    return { items, total: rows[0].total, page, pageSize };
  }
  async list(
    page: number,
    pageSize: number,
    search: string,
  ): Promise<AccountPage> {
    const pattern = '%' + search.replace(/[[%_]/g, (x) => '[' + x + ']') + '%';
    const rows = await this.query<Record<string, unknown>[]>(
      'SELECT id,username,role_code,enabled,row_ver,created_at FROM auth.users WHERE deleted_at IS NULL AND username LIKE @0 ORDER BY created_at DESC,id DESC OFFSET @1 ROWS FETCH NEXT @2 ROWS ONLY',
      [pattern, (page - 1) * pageSize, pageSize],
    );
    const counts = await this.query<{ total: number }[]>(
      'SELECT COUNT(*) AS total FROM auth.users WHERE deleted_at IS NULL AND username LIKE @0',
      [pattern],
    );
    return {
      items: rows.map((row) => {
        const value = this.map(row);
        return {
          id: value.id,
          username: value.username,
          roleCode: value.roleCode,
          enabled: value.enabled,
          rowVer: value.rowVer,
          createdAt: value.createdAt,
        };
      }),
      total: counts[0].total,
      page,
      pageSize,
    };
  }
  async lockAdminChanges(context: AuthTransaction): Promise<void> {
    await this.query(
      "DECLARE @result INT; EXEC @result=sys.sp_getapplock @Resource=N'life-simulator-auth-admin',@LockMode=N'Exclusive',@LockOwner=N'Transaction',@LockTimeout=5000; IF @result<0 THROW 51001,'Admin operation lock unavailable',1;",
      [],
      context,
    );
  }
  async activeAdminCount(context: AuthTransaction): Promise<number> {
    const rows = await this.query<{ count: number }[]>(
      "SELECT COUNT(*) AS count FROM auth.users WITH(UPDLOCK,HOLDLOCK) WHERE role_code=N'admin' AND enabled=1 AND deleted_at IS NULL",
      [],
      context,
    );
    return rows[0].count;
  }
  async update(
    id: string,
    rowVer: string,
    roleCode: string,
    enabled: boolean,
    passwordHash: string,
    stamp: string,
    time: string,
    deleted: boolean,
    context: AuthTransaction,
  ) {
    const rows = await this.query<Record<string, unknown>[]>(
      'UPDATE auth.users SET role_code=@2,enabled=@3,password_hash=@4,security_stamp=@5,updated_at=CAST(@6 AS DATETIMEOFFSET),deleted_at=CASE WHEN @7=1 THEN CAST(@6 AS DATETIMEOFFSET) ELSE NULL END OUTPUT inserted.* WHERE id=@0 AND row_ver=@1 AND deleted_at IS NULL',
      [
        id,
        Buffer.from(rowVer, 'hex'),
        roleCode,
        enabled,
        passwordHash,
        stamp,
        time,
        deleted,
      ],
      context,
    );
    return rows[0] ? this.map(rows[0]) : null;
  }
}
