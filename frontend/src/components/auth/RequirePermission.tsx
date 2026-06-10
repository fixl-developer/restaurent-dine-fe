import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

interface Props {
  /** Backend permission key, e.g. 'menu:edit'. Pass an array for OR-of-perms. */
  perm: string | string[];
  /** What to render when permission is missing. Defaults to a "no access" card. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Hides UI from users without the required backend permission. Use this in
 * sidebars and on action buttons so we mirror the backend's RBAC client-side.
 *
 * Example:
 *   <RequirePermission perm="menu:edit"><EditButton /></RequirePermission>
 */
export default function RequirePermission({ perm, fallback, children }: Props) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const required = Array.isArray(perm) ? perm : [perm];
  const allowed = required.some((p) => hasPermission(p));

  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] text-center px-6 py-10">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
        <Lock className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700">No access</p>
      <p className="text-xs text-gray-400 mt-1">
        Needs permission: <code className="text-[11px] bg-gray-50 px-1.5 py-0.5 rounded">{required.join(' or ')}</code>
      </p>
    </div>
  );
}
