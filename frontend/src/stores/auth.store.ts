/**
 * Auth state — staff JWT + user + permissions, persisted to localStorage.
 * Phase 0 ships the skeleton; Phase 1 wires login/refresh through the API.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, LoginResponse } from '@/lib/types';
import { api, configureApiAuth } from '@/lib/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;

  setSession: (s: LoginResponse) => void;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;

  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setSession: (s) =>
        set({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }),
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      hasPermission: (perm) => {
        const u = get().user;
        if (!u) return false;
        if (u.role.permissions.includes('*')) return true;
        return u.role.permissions.includes(perm);
      },
    }),
    {
      name: 'smartdine.auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
    },
  ),
);

// Wire the api client to read tokens from this store and refresh via backend.
configureApiAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) return null;
    try {
      const { accessToken } = await api.post<{ accessToken: string; user: AuthUser }>(
        '/auth/staff/refresh',
        { refreshToken },
        { noAuth: true },
      );
      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    } catch {
      useAuthStore.getState().logout();
      return null;
    }
  },
  handleUnauthorized: () => {
    useAuthStore.getState().logout();
  },
});
