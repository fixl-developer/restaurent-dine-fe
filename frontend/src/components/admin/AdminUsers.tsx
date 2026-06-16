import { useMemo, useState, Fragment } from 'react';
import {
  Search,
  Plus,
  X,
  Check,
  Shield,
  Pencil,
  Trash2,
  Save,
  Lock,
  Activity,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/useUsers';
import {
  useRoles,
  useAllPermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/hooks/useRoles';
import { useAuthStore } from '@/stores/auth.store';
import { Can, useCan } from '@/components/auth/Can';
import {
  groupPermissions,
  PERMISSION_GROUP_LABELS,
  type CreateUserInput,
  type RoleDto,
  type UpdateUserInput,
  type UserDto,
} from '@/lib/dto/rbac';
import { confirmToast } from '@/lib/confirmToast';

type Tab = 'users' | 'roles' | 'matrix';

function Avatar({ name }: { name: string }) {
  const colors = [
    'bg-pink-500',
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-orange-500',
  ];
  const color = colors[(name.charCodeAt(0) || 0) % colors.length];
  return (
    <div
      className={`${color} w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-xs`}
    >
      {name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
}

function formatLastLogin(iso?: string): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString();
}

export default function AdminUsers() {
  const [tab, setTab] = useState<Tab>('users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Users, Roles & Permissions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Staff accounts and role-based access control
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 max-w-md">
        {[
          { id: 'users' as const, label: 'Users', icon: UserPlus },
          { id: 'roles' as const, label: 'Roles', icon: Shield },
          { id: 'matrix' as const, label: 'Permission Matrix', icon: Activity },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-[fadeIn_0.2s_ease-out]">
        {tab === 'users' && <UsersTab />}
        {tab === 'roles' && <RolesTab />}
        {tab === 'matrix' && <MatrixTab />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Users tab
// ─────────────────────────────────────────────────────────────────────────────
function UsersTab() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editing, setEditing] = useState<UserDto | 'new' | null>(null);

  const usersQuery = useUsers({
    q: search.trim() || undefined,
    roleKey: roleFilter !== 'all' ? roleFilter : undefined,
    isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
  });
  const rolesQuery = useRoles();
  const deleteUser = useDeleteUser();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const canCreate = useCan('user:create');
  const canUpdate = useCan('user:update');
  const canDelete = useCan('user:delete');

  const users = usersQuery.data?.items ?? [];
  const roles = rolesQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white w-64"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-white"
        >
          <option value="all">All roles</option>
          {roles.map((r) => (
            <option key={r.key} value={r.key}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-white"
        >
          <option value="all">Any status</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">
          {usersQuery.isLoading
            ? 'Loading...'
            : `${users.length} staff member${users.length === 1 ? '' : 's'}`}
        </span>
        <Can perm="user:create">
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </Can>
      </div>

      {!canCreate && !canUpdate && !canDelete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          You have read-only access to users.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Staff Member', 'Role', 'Status', '2FA', 'Last Login', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {u.name}
                            {isSelf && (
                              <span className="text-[10px] font-bold text-pink-500 ml-2">YOU</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          {u.phone && <p className="text-[10px] text-gray-400">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.role ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-200">
                          {u.role.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">No role</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.twoFactorEnabled ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <span className="text-[10px] text-gray-400">Off</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatLastLogin(u.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Can perm="user:update">
                          <button
                            onClick={() => setEditing(u)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </Can>
                        <Can perm="user:delete">
                          <button
                            onClick={async () => {
                              if (isSelf) {
                                toast.error("You can't delete yourself");
                                return;
                              }
                              if (await confirmToast({ title: `Delete user "${u.name}"?`, destructive: true })) {
                                await deleteUser.mutateAsync(u.id);
                              }
                            }}
                            disabled={isSelf}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSelf ? "Can't delete yourself" : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!usersQuery.isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <UserEditor
          user={editing === 'new' ? null : editing}
          roles={roles}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function UserEditor({
  user,
  roles,
  onClose,
}: {
  user: UserDto | null;
  roles: RoleDto[];
  onClose: () => void;
}) {
  const isNew = !user;
  const create = useCreateUser();
  const update = useUpdateUser();

  const [form, setForm] = useState({
    email: user?.email ?? '',
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    password: '',
    roleKey: user?.role?.key ?? roles[0]?.key ?? '',
    isActive: user?.isActive ?? true,
  });

  async function submit() {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (isNew) {
      if (!form.email.trim() || !form.password) {
        toast.error('Email and password are required');
        return;
      }
      const payload: CreateUserInput = {
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        phone: form.phone || undefined,
        roleKey: form.roleKey,
      };
      await create.mutateAsync(payload);
    } else {
      const patch: UpdateUserInput = {
        name: form.name.trim(),
        phone: form.phone || undefined,
        roleKey: form.roleKey,
        isActive: form.isActive,
      };
      if (form.password) patch.password = form.password;
      await update.mutateAsync({ id: user!.id, patch });
    }
    onClose();
  }

  return (
    <Modal title={isNew ? 'Add User' : `Edit ${user!.name}`} onClose={onClose}>
      <div className="space-y-3">
        <Field
          label="Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="staff@example.com"
          type="email"
          disabled={!isNew}
        />
        <Field
          label="Full name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder="Priya Sharma"
        />
        <Field
          label="Phone (optional)"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="+919876543210"
        />
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
          <select
            value={form.roleKey}
            onChange={(e) => setForm({ ...form, roleKey: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400 bg-white"
          >
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
                {r.isSystem ? ' (system)' : ''}
              </option>
            ))}
          </select>
        </div>
        <Field
          label={isNew ? 'Password' : 'New password (leave blank to keep current)'}
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          placeholder={isNew ? 'min 8 chars' : ''}
          type="password"
        />
        {!isNew && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            User is active (uncheck to disable login)
          </label>
        )}
      </div>
      <ModalFooter
        onCancel={onClose}
        onSubmit={submit}
        submitting={create.isPending || update.isPending}
        submitLabel={isNew ? 'Create User' : 'Save'}
      />
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Roles tab
// ─────────────────────────────────────────────────────────────────────────────
function RolesTab() {
  const rolesQuery = useRoles();
  const usersQuery = useUsers({ limit: 100 });
  const deleteRole = useDeleteRole();
  const [editing, setEditing] = useState<RoleDto | 'new' | null>(null);
  const canCreate = useCan('role:create');

  const roles = rolesQuery.data ?? [];
  const users = usersQuery.data?.items ?? [];

  const memberCounts = useMemo(() => {
    const map = new Map<string, number>();
    users.forEach((u) => {
      if (u.role) map.set(u.role.key, (map.get(u.role.key) ?? 0) + 1);
    });
    return map;
  }, [users]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {roles.length} role{roles.length === 1 ? '' : 's'} ·{' '}
          {roles.filter((r) => r.isSystem).length} system, {roles.filter((r) => !r.isSystem).length}{' '}
          custom
        </p>
        {canCreate && (
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Role
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((r) => {
          const memberCount = memberCounts.get(r.key) ?? 0;
          const permCount = r.permissions.includes('*') ? '∞' : r.permissions.length;
          return (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{r.name}</h4>
                    {r.isSystem && (
                      <span className="text-[9px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                        <Lock className="w-2.5 h-2.5" /> System
                      </span>
                    )}
                  </div>
                  <code className="text-[10px] text-gray-400 font-mono">{r.key}</code>
                </div>
              </div>
              {r.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{r.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
                  <p className="text-lg font-black text-gray-900">{permCount}</p>
                  <p className="text-[10px] uppercase text-gray-500">Permissions</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
                  <p className="text-lg font-black text-gray-900">{memberCount}</p>
                  <p className="text-[10px] uppercase text-gray-500">Members</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Can perm="role:update">
                  <button
                    onClick={() => setEditing(r)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </Can>
                {!r.isSystem && (
                  <Can perm="role:delete">
                    <button
                      onClick={async () => {
                        if (memberCount > 0) {
                          toast.error(`Cannot delete: ${memberCount} member(s) still use this role`);
                          return;
                        }
                        if (await confirmToast({ title: `Delete role "${r.name}"?`, destructive: true })) {
                          await deleteRole.mutateAsync(r._id);
                        }
                      }}
                      className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Can>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <RoleEditor role={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function RoleEditor({ role, onClose }: { role: RoleDto | null; onClose: () => void }) {
  const isNew = !role;
  const create = useCreateRole();
  const update = useUpdateRole();
  const permsQuery = useAllPermissions();
  const allPerms = permsQuery.data ?? [];

  const [form, setForm] = useState({
    key: role?.key ?? '',
    name: role?.name ?? '',
    description: role?.description ?? '',
    permissions: role?.permissions ?? [],
  });

  const groupedAll = useMemo(() => groupPermissions(allPerms), [allPerms]);

  function togglePerm(p: string) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(p)
        ? prev.permissions.filter((x) => x !== p)
        : [...prev.permissions, p],
    }));
  }

  function toggleGroup(group: string) {
    const groupPerms = groupedAll[group] ?? [];
    const allOn = groupPerms.every((p) => form.permissions.includes(p));
    setForm((prev) => ({
      ...prev,
      permissions: allOn
        ? prev.permissions.filter((p) => !groupPerms.includes(p))
        : [...new Set([...prev.permissions, ...groupPerms])],
    }));
  }

  async function submit() {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (isNew && !form.key.trim()) {
      toast.error('Key is required');
      return;
    }
    if (form.permissions.length === 0) {
      toast.error('Pick at least one permission');
      return;
    }
    if (isNew) {
      await create.mutateAsync({
        key: form.key.trim().toLowerCase(),
        name: form.name.trim(),
        description: form.description || undefined,
        permissions: form.permissions,
      });
    } else {
      await update.mutateAsync({
        id: role!._id,
        patch: {
          name: form.name.trim(),
          description: form.description || undefined,
          permissions: form.permissions,
        },
      });
    }
    onClose();
  }

  const hasWildcard = form.permissions.includes('*');

  return (
    <Drawer title={isNew ? 'New Role' : `Edit ${role!.name}`} onClose={onClose}>
      <Field
        label="Key (lowercase, no spaces — cannot change later)"
        value={form.key}
        onChange={(v) => setForm({ ...form, key: v.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
        placeholder="e.g. host"
        disabled={!isNew}
      />
      <Field
        label="Display name"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        placeholder="Host"
      />
      <Field
        label="Description"
        value={form.description}
        onChange={(v) => setForm({ ...form, description: v })}
        placeholder="Greets guests and seats them..."
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600">
            Permissions ({form.permissions.length} selected)
          </label>
          {!hasWildcard && (
            <button
              onClick={() => setForm({ ...form, permissions: [...allPerms] })}
              className="text-[10px] text-pink-600 hover:text-pink-700 font-semibold"
            >
              Grant all
            </button>
          )}
        </div>
        {hasWildcard && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 mb-3 text-xs text-violet-800">
            <strong>Wildcard granted</strong> — this role can do everything.
          </div>
        )}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {Object.entries(groupedAll).map(([group, perms]) => {
            const selectedInGroup = perms.filter((p) => form.permissions.includes(p)).length;
            const allOn = selectedInGroup === perms.length;
            return (
              <div key={group} className="border border-gray-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => toggleGroup(group)}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-800"
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        allOn
                          ? 'border-pink-500 bg-pink-500'
                          : selectedInGroup > 0
                            ? 'border-pink-300 bg-pink-100'
                            : 'border-gray-300'
                      }`}
                    >
                      {allOn && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {PERMISSION_GROUP_LABELS[group] ?? group}
                  </button>
                  <span className="text-[10px] text-gray-400">
                    {selectedInGroup}/{perms.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pl-6">
                  {perms.map((p) => {
                    const isOn = form.permissions.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePerm(p)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          isOn
                            ? 'bg-pink-50 text-pink-700 border-pink-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DrawerFooter
        onCancel={onClose}
        onSubmit={submit}
        submitting={create.isPending || update.isPending}
        submitLabel={isNew ? 'Create Role' : 'Save'}
      />
    </Drawer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission matrix tab
// ─────────────────────────────────────────────────────────────────────────────
function MatrixTab() {
  const rolesQuery = useRoles();
  const permsQuery = useAllPermissions();
  const updateRole = useUpdateRole();
  const roles = rolesQuery.data ?? [];
  const perms = permsQuery.data ?? [];
  const canUpdate = useCan('role:update');

  const grouped = useMemo(() => groupPermissions(perms), [perms]);

  async function toggle(role: RoleDto, perm: string) {
    if (role.isSystem) {
      toast.error('System roles cannot be edited');
      return;
    }
    const next = role.permissions.includes(perm)
      ? role.permissions.filter((p) => p !== perm)
      : [...role.permissions, perm];
    await updateRole.mutateAsync({ id: role._id, patch: { permissions: next } });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Click a cell to toggle. System roles are read-only — clone them via the Roles tab.
        {!canUpdate && ' You need `role:update` permission.'}
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 sticky left-0 bg-gray-50 z-10 min-w-[180px]">
                  Permission
                </th>
                {roles.map((r) => (
                  <th
                    key={r._id}
                    className="px-3 py-3 text-center min-w-[100px]"
                    title={r.description ?? r.key}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200">
                        {r.name}
                      </span>
                      {r.isSystem && (
                        <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                          <Lock className="w-2 h-2" /> system
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([group, groupPerms]) => (
                <Fragment key={group}>
                  <tr className="bg-gray-50 border-y border-gray-100">
                    <td
                      colSpan={1 + roles.length}
                      className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 sticky left-0 bg-gray-50"
                    >
                      {PERMISSION_GROUP_LABELS[group] ?? group}
                    </td>
                  </tr>
                  {groupPerms.map((p) => (
                    <tr key={p} className="hover:bg-gray-50 border-b border-gray-50">
                      <td className="px-4 py-2 font-mono text-[11px] text-gray-700 sticky left-0 bg-white hover:bg-gray-50">
                        {p}
                      </td>
                      {roles.map((r) => {
                        const hasWildcard = r.permissions.includes('*');
                        const has = hasWildcard || r.permissions.includes(p);
                        const disabled = r.isSystem || !canUpdate;
                        return (
                          <td key={r._id} className="px-3 py-2 text-center">
                            <button
                              disabled={disabled}
                              onClick={() => toggle(r, p)}
                              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all ${
                                has
                                  ? r.isSystem
                                    ? 'bg-violet-100 border-violet-300'
                                    : 'bg-pink-100 border-pink-400 hover:bg-pink-200'
                                  : 'bg-gray-50 border-gray-200 hover:border-gray-400'
                              } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              {has && (
                                <Check
                                  className={`w-3 h-3 ${r.isSystem ? 'text-violet-600' : 'text-pink-600'}`}
                                />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate pr-3">{title}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({
  onCancel,
  onSubmit,
  submitting,
  submitLabel,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex gap-3 pt-5 mt-3 border-t border-gray-100">
      <button
        onClick={onCancel}
        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" /> {submitLabel}
      </button>
    </div>
  );
}

function Drawer({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto z-10">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900 truncate pr-3">{title}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function DrawerFooter({
  onCancel,
  onSubmit,
  submitting,
  submitLabel,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex gap-3 pt-5 mt-3 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
      <button
        onClick={onCancel}
        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" /> {submitLabel}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}
