SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF SCHEMA_ID(N'auth') IS NOT NULL THROW 51000,'Auth schema already exists; review before applying.',1;
EXEC(N'CREATE SCHEMA auth');
CREATE SEQUENCE auth.user_id_seq AS INT START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 99999 NO CYCLE;
CREATE TABLE auth.roles(role_code NVARCHAR(20) NOT NULL PRIMARY KEY,created_at DATETIMEOFFSET(0) NOT NULL,updated_at DATETIMEOFFSET(0) NOT NULL,row_ver ROWVERSION NOT NULL,CONSTRAINT ck_auth_roles CHECK(role_code IN(N'user',N'admin')));
CREATE TABLE auth.users(
 id NVARCHAR(20) NOT NULL PRIMARY KEY,
 username NVARCHAR(50) COLLATE Latin1_General_100_BIN2 NOT NULL,
 password_hash VARCHAR(60) NOT NULL,role_code NVARCHAR(20) NOT NULL,enabled BIT NOT NULL,security_stamp VARCHAR(64) NOT NULL,
 created_at DATETIMEOFFSET(0) NOT NULL,updated_at DATETIMEOFFSET(0) NOT NULL,deleted_at DATETIMEOFFSET(0) NULL,row_ver ROWVERSION NOT NULL,
 CONSTRAINT uq_auth_users_username UNIQUE(username),
 CONSTRAINT fk_auth_users_role FOREIGN KEY(role_code) REFERENCES auth.roles(role_code) ON DELETE NO ACTION,
 CONSTRAINT ck_auth_users_id CHECK(id LIKE N'USR-[0-9][0-9][0-9][0-9][0-9]' AND id<>N'USR-00000'),
 CONSTRAINT ck_auth_users_username CHECK(LEN(username)>0 AND DATALENGTH(username)=DATALENGTH(LTRIM(RTRIM(username))))
);
CREATE INDEX ix_auth_users_role_enabled ON auth.users(role_code,enabled,deleted_at);
-- Required reference rows, explicit Adelaide offset; no sample user/password.
INSERT auth.roles(role_code,created_at,updated_at) VALUES
(N'user','2026-10-08T00:00:00+10:30','2026-10-08T00:00:00+10:30'),
(N'admin','2026-10-08T00:00:00+10:30','2026-10-08T00:00:00+10:30');
COMMIT TRANSACTION;
