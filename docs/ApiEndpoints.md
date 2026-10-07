# API endpoint summary

Prefix: API_PREFIX / NEXT_PUBLIC_API_PREFIX. See [calling contracts](../wiki/API-Docs.md) and Project.postman_collection.json.

| Method | Path under /[apiPrefix]/                 | Access        |
| ------ | ---------------------------------------- | ------------- |
| POST   | auth/accounts                            | Public        |
| POST   | auth/sessions                            | Public        |
| DELETE | auth/sessions/current                    | Authenticated |
| GET    | auth/accounts/current                    | Authenticated |
| GET    | auth/accounts?page=1&pageSize=20&search= | Admin         |
| GET    | auth/roles                               | Admin         |
| PATCH  | auth/accounts/{{accountId}}              | Admin         |
| DELETE | auth/accounts/{{accountId}}              | Admin         |

Paging, safe errors, backend guards, rowVer, soft deletion, and last-admin protection apply. Password hashes/security stamps are excluded from every response.
