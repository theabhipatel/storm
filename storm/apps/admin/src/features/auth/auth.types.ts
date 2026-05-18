export type Role = "customer" | "admin";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  mobileVerified: boolean;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: PublicUser;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
}

export interface MeResponse {
  user: PublicUser;
}
