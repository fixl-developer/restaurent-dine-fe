import { useState } from 'react';
import {
  Search, Plus, X, Check, Shield, ChevronDown,
  Clock, Activity, Edit2
} from 'lucide-react';
import { ADMIN_USERS, ADMIN_ROLES, ALL_PERMISSIONS, AdminUser, AdminRole } from './adminMockData';

const STATUS_PILL: Record<string, string> = {
  Active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Off Duty':'bg-amber-50 text-amber-700 border-amber-200',
  Inactive:  'bg-gray-50 text-gray-500 border-gray-200',
};
const STATUS_DOT: Record<string, string> = {
  Active: 'bg-emerald-500', 'Off Duty': 'bg-amber-400', Inactive: 'bg-gray-300',
};

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const colors = ['bg-pink-500','bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-orange-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>
      {name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
    </div>
  );
}

type ActiveView = 'staff' | 'matrix';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);
  const [roles, setRoles] = useState<AdminRole[]>(ADMIN_ROLES);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [view, setView] = useState<ActiveView>('staff');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('waiter');
  const [newPhone, setNewPhone] = useState('');

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'All' || u.roleId === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  function addUser() {
    if (!newName || !newEmail) return;
    const u: AdminUser = {
      id: `u${Date.now()}`, name: newName, email: newEmail, phone: newPhone,
      roleId: newRole, status: 'Active', lastLogin: '—', lastActivity: 'Just added',
      ordersToday: 0, joinedDate: 'May 2026', avatar: newName.split(' ').map(n => n[0]).join(''),
    };
    setUsers(prev => [...prev, u]);
    setAddOpen(false); setNewName(''); setNewEmail(''); setNewPhone(''); setNewRole('waiter');
  }

  function changeRole(userId: string, roleId: string) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, roleId } : u));
    setEditUser(null);
  }

  function togglePermission(roleId: string, perm: string) {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const has = r.permissions.includes(perm);
      return { ...r, permissions: has ? r.permissions.filter(p => p !== perm) : [...r.permissions, perm] };
    }));
  }

  const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || id;
  const getRoleColor = (id: string) => roles.find(r => r.id === id)?.color || 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User & Role Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff accounts, roles, and permissions</p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* View toggle + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button onClick={() => setView('staff')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'staff' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Staff List
          </button>
          <button onClick={() => setView('matrix')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${view === 'matrix' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Shield className="w-3.5 h-3.5" /> Permission Matrix
          </button>
        </div>
        {view === 'staff' && (
          <>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white w-52" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-white">
              <option value="All">All Roles</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-white">
              {['All', 'Active', 'Off Duty', 'Inactive'].map(s => <option key={s}>{s}</option>)}
            </select>
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} staff members</span>
          </>
        )}
      </div>

      {/* ── Staff List ─────────────────────────────────────────────────── */}
      {view === 'staff' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Staff Member', 'Role', 'Status', 'Today\'s Activity', 'Last Login', 'Joined', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} />
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${getRoleColor(u.roleId)}`}>{getRoleName(u.roleId)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${STATUS_DOT[u.status]}`} />
                      <span className="text-xs text-gray-600 font-medium">{u.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.ordersToday > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Activity className="w-3.5 h-3.5 text-pink-500" />
                        {u.ordersToday} orders handled
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No activity</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-600">{u.lastLogin}</p>
                      <p className="text-[10px] text-gray-400">{u.lastActivity}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.joinedDate}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setEditUser(u)}
                      className="p-1.5 rounded-lg hover:bg-pink-50 text-gray-400 hover:text-pink-600 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Permission Matrix ──────────────────────────────────────────── */}
      {view === 'matrix' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Role Permissions Matrix</h3>
            <p className="text-xs text-gray-400 mt-0.5">Click cells to toggle permissions per role</p>
          </div>
          <div className="overflow-x-auto">
            <table className="text-xs min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 w-48 bg-gray-50">Permission</th>
                  {roles.map(r => (
                    <th key={r.id} className="px-3 py-3 text-center min-w-[100px] bg-gray-50">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${r.color}`}>{r.name}</span>
                      <p className="text-[9px] text-gray-400 mt-0.5">{r.members} members</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_PERMISSIONS.map(perm => (
                  <tr key={perm} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-xs text-gray-700 font-medium">{perm}</td>
                    {roles.map(r => {
                      const has = r.permissions.includes(perm);
                      const isOwner = r.id === 'owner';
                      return (
                        <td key={r.id} className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => !isOwner && togglePermission(r.id, perm)}
                            disabled={isOwner}
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all ${
                              has
                                ? isOwner ? 'bg-violet-100 border-violet-300' : 'bg-pink-100 border-pink-400 hover:bg-pink-200'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-400'
                            } ${isOwner ? 'cursor-default' : 'cursor-pointer'}`}>
                            {has && <Check className="w-3 h-3 text-pink-600" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editUser && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setEditUser(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Edit Staff Member</h3>
                <button onClick={() => setEditUser(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="px-5 py-5 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Avatar name={editUser.name} />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{editUser.name}</p>
                    <p className="text-xs text-gray-400">{editUser.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Assign Role</label>
                  <div className="space-y-2">
                    {roles.map(r => (
                      <button key={r.id} onClick={() => changeRole(editUser.id, r.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${editUser.roleId === r.id ? 'border-pink-400 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${r.color}`}>{r.name}</span>
                        <span className="text-xs text-gray-500 flex-1">{r.description}</span>
                        {editUser.roleId === r.id && <Check className="w-4 h-4 text-pink-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Status</label>
                  <div className="flex gap-2">
                    {(['Active', 'Off Duty', 'Inactive'] as const).map(s => (
                      <button key={s} onClick={() => setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, status: s } : u))}
                        className={`flex-1 py-2 text-xs rounded-xl border font-medium transition-colors ${editUser.status === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => setEditUser(null)}
                  className="w-full py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Staff Modal */}
      {addOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setAddOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Add Staff Member</h3>
                <button onClick={() => setAddOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="px-5 py-5 space-y-3">
                {[
                  { label: 'Full Name *',  val: newName,  set: setNewName,  ph: 'e.g. Priya Sharma'         },
                  { label: 'Email *',      val: newEmail, set: setNewEmail, ph: 'e.g. priya@smartdine.app'  },
                  { label: 'Phone',        val: newPhone, set: setNewPhone, ph: '+91 98765 XXXXX'            },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400">
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-3">
                <button onClick={() => setAddOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={addUser}
                  className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">Add Staff</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
