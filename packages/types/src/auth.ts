export type AuthProvider = "google" | "github";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
}

export interface LoginRequest {
  code: string;
  provider: AuthProvider;
  redirectUri?: string;
  codeVerifier?: string;
  clientId?: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}
