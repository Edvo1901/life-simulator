# Database design

Microsoft SQL Server with TypeORM 1.1.1 and mssql 12.7.2. SQL-auth settings are read only in the backend. synchronize/migrationsRun are false; all stored timestamps originate in adelaideTime.ts as Adelaide DATETIMEOFFSET(0), with options.useUTC=false.

## Auth schema

- auth.roles: immutable user/admin role_code business keys, created_at/updated_at, row_ver. These are required reference rows, not editable business options or provider identities.
- auth.users: five-digit prefixed id, case-sensitive username (Latin1_General_100_BIN2), bcrypt password_hash, role_code FK with NO ACTION deletion, enabled flag, security_stamp, Adelaide timestamps, deleted_at, row_ver.
- Exact usernames are unique across all rows, including soft-deleted ones. Case variants are separate. Password hashes/stamps never appear in responses.
- auth.user_id_seq allocates USR-00001 through USR-99999 without cycling. Owner expects 10,000 lifetime accounts; four digits are insufficient. USR is reserved. Failed/rolled-back writes may consume sequence values; IDs are never reused.
- ix_auth_users_role_enabled supports active-admin checks and the role FK. Lists have deterministic created_at/id ordering and bounded paging/search.
- AuthTransactionRunner supplies opaque shared SERIALIZABLE contexts. Repository-owned queries use parameters; an application lock serializes admin mutations/bootstrap so concurrent changes cannot remove every active admin.
- Sessions are backend memory state keyed by hashed opaque tokens, expire after eight hours, and validate the current account/security stamp on every protected request. There is no session table, second persistence store, or browser token persistence.

## Scripts and verification

Run 0001_auth_create_accounts.sql once on a verified empty target. schema_v1.sql is the owner-selected single snapshot, identical in schema/reference content. Both refuse an existing auth schema and perform no destructive change. Never run both on the same database; the snapshot is an alternative initial setup, not an additional migration. There are no test accounts/passwords in these scripts.

The script/snapshot were executed only in an automatically named isolated SQL test database, subsequently removed. Target database execution remains pending explicit approval. No account data was added there by the tests. Repository/HTTP tests cover uniqueness/case, role FK/auth boundaries, concurrency, resets/revocation, row versions, soft deletion, and the ID upper bound. Dropping/rebuilding auth is not an approved rollback; preserve future user data and use a reviewed follow-up script for schema correction.
