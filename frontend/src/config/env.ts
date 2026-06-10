/**
 * Typed environment access. Centralizes all VITE_* env vars so the rest of the
 * codebase never reads `import.meta.env` directly.
 */
function read(key: string, fallback?: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (!value) {
    if (fallback !== undefined) return fallback;
    // eslint-disable-next-line no-console
    console.warn(`Missing env var ${key}`);
    return '';
  }
  return value;
}

export const env = {
  apiBaseUrl: read('VITE_API_BASE_URL', 'http://localhost:4000/api/v1'),
  publicBaseUrl: read('VITE_PUBLIC_BASE_URL', 'http://localhost:4000'),
  socketUrl: read('VITE_SOCKET_URL', 'http://localhost:4000'),
  guestAppUrl: read('VITE_GUEST_APP_URL', 'http://localhost:3000'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
