/**
 * Backend DTO mirrors. Phase 0 only declares the cross-cutting shapes (auth +
 * standard response envelope); feature-specific types land in their phase.
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export interface AuthRole {
  key: string;
  name: string;
  permissions: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: AuthRole;
}

export interface LoginResponse {
  mfaRequired: false;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string;
  user: AuthUser;
}

export interface LoginMfaRequired {
  mfaRequired: true;
  userId: string;
  maskedPhone: string;
}

export type LoginResult = LoginResponse | LoginMfaRequired;
