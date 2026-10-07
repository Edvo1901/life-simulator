export interface Account {
  id: string;
  username: string;
  roleCode: string;
  enabled: boolean;
  rowVer: string;
  createdAt: string;
}
export interface AccountCredentials extends Account {
  passwordHash: string;
  securityStamp: string;
}
export interface AccountUpdate {
  rowVer: string;
  roleCode?: string;
  enabled?: boolean;
  password?: string;
}
export interface AccountPage {
  items: Account[];
  total: number;
  page: number;
  pageSize: number;
}
export interface AuthIdentity {
  id: string;
  username: string;
  roleCode: string;
}

export interface AuthTransaction {
  readonly scope: symbol;
}
export interface AuthRequest {
  headers: Record<string, string | undefined>;
  identity: AuthIdentity;
  authToken: string;
}
