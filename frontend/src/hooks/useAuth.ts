/**
 * Auth-related React Query mutations + the `useMe` rehydrate query.
 *
 * The auth store handles persisted token state; this file owns the *interaction*
 * with the backend (login, OTP-verify, logout, /auth/me refresh).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthUser, LoginResponse, LoginResult } from '@/lib/types';

export interface StaffLoginInput {
  email: string;
  password: string;
}

export function useStaffLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (input: StaffLoginInput) =>
      api.post<LoginResult>('/auth/staff/login', input, { noAuth: true }),
    onSuccess: (data) => {
      if (data.mfaRequired) return; // caller handles the MFA step
      setSession(data as LoginResponse);
      toast.success(`Welcome back, ${data.user.name}`);
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.message : 'Login failed';
      toast.error(message);
    },
  });
}

export interface StaffVerify2faInput {
  userId: string;
  code: string;
}

export function useStaffVerify2fa() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (input: StaffVerify2faInput) =>
      api.post<LoginResponse>('/auth/staff/2fa/verify', input, { noAuth: true }),
    onSuccess: (data) => {
      setSession(data);
      toast.success(`Welcome back, ${data.user.name}`);
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.message : 'OTP verification failed';
      toast.error(message);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post('/auth/staff/logout', refreshToken ? { refreshToken } : {});
      } catch {
        // Best-effort server logout — local state is the source of truth.
      }
    },
    onSettled: () => {
      logout();
      queryClient.clear();
      toast.success('Signed out');
      navigate('/staff', { replace: true });
    },
  });
}

/**
 * Rehydrate the current user from the backend on app load. Only runs when we
 * have an access token already stored. Failure clears the session.
 */
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  return useQuery({
    queryKey: ['auth', 'me'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      try {
        const user = await api.get<AuthUser>('/auth/me');
        setUser(user);
        return user;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout();
        }
        throw err;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}
