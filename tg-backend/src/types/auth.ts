export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'user';
  tenantId: number;
}
