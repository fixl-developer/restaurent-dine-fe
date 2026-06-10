import { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';

interface CanProps {
  /** A permission key (e.g. "user:create") or an array. */
  perm: string | string[];
  /** Match logic for arrays. Default: 'any' (mirrors RequirePermission). */
  match?: 'all' | 'any';
  /** Fallback to render when the user lacks the permission(s). */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditional inline render based on the current staff permissions.
 * Owner / wildcard (`*`) passes every check.
 *
 * Example:
 *   <Can perm="user:create">
 *     <button>Add user</button>
 *   </Can>
 */
export function Can({ perm, match = 'any', fallback = null, children }: CanProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const perms = Array.isArray(perm) ? perm : [perm];
  const ok =
    match === 'all' ? perms.every((p) => hasPermission(p)) : perms.some((p) => hasPermission(p));
  return ok ? <>{children}</> : <>{fallback}</>;
}

/** Hook form for inline conditionals. */
export function useCan(perm: string | string[], match: 'all' | 'any' = 'any'): boolean {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const perms = Array.isArray(perm) ? perm : [perm];
  return match === 'all' ? perms.every((p) => hasPermission(p)) : perms.some((p) => hasPermission(p));
}
