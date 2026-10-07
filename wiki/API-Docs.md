# API calling contracts

API_PREFIX and NEXT_PUBLIC_API_PREFIX configure the prefix. Postman baseUrl includes host and prefix once; adjust its port locally. Credential/token variables are empty. All bodies/queries use DTO validation; unexpected/null fields are rejected. Protected routes require a Bearer token. Errors use {error:{code,message}}, plus X-Request-ID, without SQL or stack traces.

## Register

POST /[apiPrefix]/auth/accounts

Access: Public.

Body:

```json
{
  "username": "{{username}}",
  "password": "{{password}}"
}
```

## Login

POST /[apiPrefix]/auth/sessions

Access: Public.

Body:

```json
{
  "username": "{{username}}",
  "password": "{{password}}"
}
```

## Logout

DELETE /[apiPrefix]/auth/sessions/current

Access: Authenticated.

## Current account

GET /[apiPrefix]/auth/accounts/current

Access: Authenticated.

## List accounts

GET /[apiPrefix]/auth/accounts?page=1&pageSize=20&search=

Access: Admin.

## Roles

GET /[apiPrefix]/auth/roles

Access: Admin.

## Update account

PATCH /[apiPrefix]/auth/accounts/{{accountId}}

Access: Admin.

Body:

```json
{
  "rowVer": "{{rowVer}}",
  "roleCode": "user",
  "enabled": true
}
```

## Soft-delete account

DELETE /[apiPrefix]/auth/accounts/{{accountId}}

Access: Admin.

Body:

```json
{
  "rowVer": "{{rowVer}}"
}
```

## Rules and response contracts

Registration: 201 created, 400 invalid, 409 duplicate, 429 throttled. Always assigns user.
Login: 200 with {token,account}, 400 invalid, 401 bad credentials, 429 throttled. Unknown/disabled accounts have the same credential error.
Protected reads: 200, 401 unauthenticated, 403 non-admin, 400 invalid query.
Update: 200, 400 invalid, 401/403 denied, 404 missing, 409 stale rowVer/last-admin conflict.
Logout/deletion: 204 without a body, or 401/403/404/409 where applicable.
500 is always a safe unexpected-error response.

Accounts return {id,username,roleCode,enabled,rowVer,createdAt}, never hashes/stamps. rowVer is 16 lowercase hexadecimal characters.
Lists return {items,total,page,pageSize}; page >=1, pageSize 1–200 (default 50), optional search <=50, deterministic created_at/id order.
Roles use the same paged contract and return SQL-backed roleCode values user/admin in items.
PATCH requires rowVer and optional roleCode/enabled/password; omitted means unchanged, null is invalid. Password reset uses the same route with a locally supplied password variable.
Status/role/password changes and soft deletion revoke sessions. The final enabled undeleted administrator is protected.
Bootstrap is a local command, not an endpoint. No email recovery endpoint exists.

Example safe account:

```json
{
  "id": "USR-00001",
  "username": "ExampleUser",
  "roleCode": "user",
  "enabled": true,
  "rowVer": "0000000000000001",
  "createdAt": "2026-10-08T10:30:00+10:30"
}
```

Example error:

```json
{
  "error": {
    "code": "LAST_ADMIN",
    "message": "The request could not be completed."
  }
}
```

Stable codes include INVALID_REQUEST, INVALID_USERNAME, INVALID_PASSWORD, INVALID_CREDENTIALS, UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, USERNAME_TAKEN, CONFLICT, LAST_ADMIN, RATE_LIMITED, and INTERNAL_ERROR. Screens translate codes from language resources. Public credential requests are limited to 20/minute per IP/endpoint. Never export/share locally populated Postman credentials/tokens.
