export interface Account {
  id: string;
  username: string;
  roleCode: string;
  enabled: boolean;
  rowVer: string;
  createdAt: string;
}
export interface Credentials {
  username: string;
  password: string;
}
export interface AccountPage {
  items: Account[];
  total: number;
  page: number;
  pageSize: number;
}
export interface AccountUpdate {
  rowVer: string;
  roleCode?: string;
  enabled?: boolean;
  password?: string;
}

export interface AuthSession {
  token: string;
  account: Account;
}
export interface RoleChoice {
  roleCode: string;
}
export interface RolePage {
  items: RoleChoice[];
  total: number;
  page: number;
  pageSize: number;
}
