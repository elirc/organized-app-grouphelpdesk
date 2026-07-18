// Author: Morgan Lee
// Issue: #9 â€” Define shared user types

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  REQUESTER = 'REQUESTER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId: string | null;
  organizationId: string | null;
}

export interface AuthUser extends User {
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
