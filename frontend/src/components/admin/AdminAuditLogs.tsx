import { useState, useMemo } from 'react';
import {
  Search, Filter, Download, Clock, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, RefreshCw, X
} from 'lucide-react';
import { AUDIT_LOGS, AuditLog } from './adminMockData';

const STATUS_PILL: Record<string, string> = {
  Success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Warning: 'bg-amber-50 text-amber-700 border-amber-200',
  Failed:  'bg-red-50 text-red-600 border-red-200',
};
const STATUS_ICON: Record<string, React.ElementType> = {
  Success: CheckCircle,
  Warning: AlertTriangle,
  Failed:  XCircle,
};
const MODULE_COLORS: Record<string, string> = {
  Billing:   'bg-pink-50 text-pink-700',
  Orders:    'bg-violet-50 text-violet-700',
  Menu:      'bg-blue-50 text-blue-700',
  Inventory: 'bg-amber-50 text-amber-700',
  Tables:    'bg-emerald-50 text-emerald-700',
  Settings:  'bg-gray-100 text-gray-600',
  Staff:     'bg-orange-50 text-orange-700',
  Auth:      'bg-red-50 text-red-600',
  Loyalty:   'bg-purple-50 text-purple-700',
  Coupons:   'bg-teal-50 text-teal-700',
  Reports:   'bg-indigo-50 text-indigo-700',
};

const ALL_MODULES = ['All', ...Array.from(new Set(AUDIT_LOGS.map(l => l.module)))];
const ALL_STATUSES = ['All', 'Success', 'Warning', 'Failed'];
const ALL_ROLES = ['All', ...Array.from(new Set(AUDIT_LOGS.map(l => l.role).filter(r => r !== '—')))];

function KpiCard({ label, value, color, icon: Icon }:
  { label: string; value: string | number; color: string; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" /></div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return AUDIT_LOGS.filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q)
        || l.details.toLowerCase().includes(q) || l.module.toLowerCase().includes(q);
      const matchModule = moduleFilter === 'All' || l.module === moduleFilter;
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchRole   = roleFilter === 'All'   || l.role === roleFilter;
      return matchSearch && matchModule && matchStatus && matchRole;
    });
  }, [search, moduleFilter, statusFilter, roleFilter]);

  const successCount = AUDIT_LOGS.filter(l => l.status === 'Success').length;
  const warningCount = AUDIT_LOGS.filter(l => l.status === 'Warning').length;
  const failedCount  = AUDIT_LOGS.filter(l => l.status === 'Failed').length;

  const hasFilters = moduleFilter !== 'All' || statusFilter !== 'All' || roleFilter !== 'All' || search;

  function clearFilters() {
    setSearch(''); setModuleFilter('All'); setStatusFilter('All'); setRoleFilter('All');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete activity history across all modules</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Events" value={AUDIT_LOGS.length} color="bg-blue-50 text-blue-600" icon={Clock} />
        <KpiCard label="Successful"   value={successCount}      color="bg-emerald-50 text-emerald-600" icon={CheckCircle} />
        <KpiCard label="Warnings"     value={warningCount}      color="bg-amber-50 text-amber-600"  icon={AlertTriangle} />
        <KpiCard label="Failed"       value={failedCount}       color="bg-red-50 text-red-600"      icon={XCircle} />
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by user, action, module, or details..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-2.5"><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>}
          </div>
          <button onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" /> Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-pink-500" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-pink-600 transition-colors font-medium">Clear all</button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Module</label>
              <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-white min-w-[130px]">
                {ALL_MODULES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-white min-w-[120px]">
                {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Role</label>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-white min-w-[130px]">
                {ALL_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 justify-end">
              <span className="text-xs text-gray-400 mb-2">{filtered.length} of {AUDIT_LOGS.length} results</span>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Timestamp', 'User', 'Module', 'Action', 'Status', 'IP Address', ''].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(log => {
              const Icon = STATUS_ICON[log.status];
              const isExpanded = expanded === log.id;
              return (
                <>
                  <tr key={log.id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                    onClick={() => setExpanded(isExpanded ? null : log.id)}>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-xs">{log.user}</p>
                        <p className="text-[10px] text-gray-400">{log.role}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${MODULE_COLORS[log.module] || 'bg-gray-100 text-gray-600'}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 font-medium whitespace-nowrap">{log.action}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" style={{
                          color: log.status === 'Success' ? '#059669' : log.status === 'Warning' ? '#d97706' : '#dc2626'
                        }} />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_PILL[log.status]}`}>{log.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-400">{log.ip}</td>
                    <td className="px-4 py-3">
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${log.id}-detail`} className="bg-blue-50/30">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.status === 'Success' ? 'bg-emerald-500' : log.status === 'Warning' ? 'bg-amber-400' : 'bg-red-500'}`} />
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-0.5">Event Details</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{log.details}</p>
                            <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
                              <span>Event ID: {log.id}</span>
                              <span>IP: {log.ip}</span>
                              <span>Role: {log.role}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-8 h-8 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No logs match your filters</p>
            <button onClick={clearFilters} className="mt-2 text-sm text-pink-600 hover:underline font-medium">Clear filters</button>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {AUDIT_LOGS.length} log entries</p>
          <button className="text-xs text-pink-600 hover:underline font-medium">Load more</button>
        </div>
      </div>
    </div>
  );
}
