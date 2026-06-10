import { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  X,
  Eye,
  CalendarRange,
  User,
  Activity,
  FileText,
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAudit';
import { useUsers } from '@/hooks/useUsers';
import type { AuditLogDto } from '@/lib/dto/rbac';

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString().slice(0, 10);
}

const ENTITY_COLORS: Record<string, string> = {
  User: 'bg-blue-50 text-blue-700',
  Role: 'bg-violet-50 text-violet-700',
  Order: 'bg-pink-50 text-pink-700',
  Invoice: 'bg-emerald-50 text-emerald-700',
  Payment: 'bg-emerald-50 text-emerald-700',
  Item: 'bg-amber-50 text-amber-700',
  Category: 'bg-amber-50 text-amber-700',
  Table: 'bg-blue-50 text-blue-700',
  QrCode: 'bg-violet-50 text-violet-700',
  InventoryItem: 'bg-orange-50 text-orange-700',
  Recipe: 'bg-orange-50 text-orange-700',
  Customer: 'bg-pink-50 text-pink-700',
  Discount: 'bg-rose-50 text-rose-700',
  Coupon: 'bg-rose-50 text-rose-700',
  Feedback: 'bg-amber-50 text-amber-700',
  Restaurant: 'bg-gray-100 text-gray-700',
  NotificationTemplate: 'bg-purple-50 text-purple-700',
  LoyaltyAccount: 'bg-pink-50 text-pink-700',
  LoyaltyConfig: 'bg-pink-50 text-pink-700',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  }
  return d.toLocaleString();
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [actorId, setActorId] = useState<string>('all');
  const [entity, setEntity] = useState<string>('all');
  const [action, setAction] = useState<string>('all');
  const [from, setFrom] = useState(daysAgo(6));
  const [to, setTo] = useState(daysAgo(0));
  const [detail, setDetail] = useState<AuditLogDto | null>(null);

  const logsQuery = useAuditLogs({
    actorId: actorId !== 'all' ? actorId : undefined,
    entity: entity !== 'all' ? entity : undefined,
    action: action !== 'all' ? action : undefined,
    from: from || undefined,
    to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
    limit: 200,
  });
  const usersQuery = useUsers({ limit: 100 });

  const logs = logsQuery.data?.items ?? [];
  const users = usersQuery.data?.items ?? [];

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        (l.actorEmail ?? '').toLowerCase().includes(q) ||
        (l.entityId ?? '').toLowerCase().includes(q),
    );
  }, [logs, search]);

  // KPI totals
  const kpis = useMemo(() => {
    const actions = new Set(logs.map((l) => l.action));
    const entities = new Set(logs.map((l) => l.entity));
    const actors = new Set(logs.map((l) => l.actorId).filter(Boolean));
    return {
      total: logs.length,
      actions: actions.size,
      entities: entities.size,
      actors: actors.size,
    };
  }, [logs]);

  // Distinct values for filter dropdowns
  const distinctEntities = useMemo(
    () => Array.from(new Set(logs.map((l) => l.entity))).sort(),
    [logs],
  );
  const distinctActions = useMemo(
    () => Array.from(new Set(logs.map((l) => l.action))).sort(),
    [logs],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Full history of every privileged action with before/after diffs
          </p>
        </div>
        <button
          onClick={() => logsQuery.refetch()}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${logsQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Events" value={kpis.total} icon={Activity} color="bg-pink-50 text-pink-600" />
        <KpiCard
          label="Distinct Actions"
          value={kpis.actions}
          icon={Activity}
          color="bg-violet-50 text-violet-600"
        />
        <KpiCard
          label="Entities Touched"
          value={kpis.entities}
          icon={FileText}
          color="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Active Actors"
          value={kpis.actors}
          icon={User}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, entity, email..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50 w-64"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="all">Any actor</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <select
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="all">Any entity</option>
              {distinctEntities.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="all">Any action</option>
              {distinctActions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2">
              <CalendarRange className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="text-xs bg-transparent focus:outline-none px-1 py-1.5"
              />
              <span className="text-xs text-gray-400">→</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="text-xs bg-transparent focus:outline-none px-1 py-1.5"
              />
            </div>
          </div>
          <span className="text-xs text-gray-400 ml-auto">
            {logsQuery.isLoading ? 'Loading...' : `${filteredLogs.length} of ${logs.length} events`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['When', 'Actor', 'Action', 'Entity', 'Entity ID', ''].map((h) => (
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
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                    {formatTime(log.at)}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {log.actorEmail ? (
                      <>
                        <p className="font-semibold text-gray-700 truncate max-w-[180px]">
                          {log.actorEmail}
                        </p>
                        {log.actorRole && (
                          <p className="text-[10px] text-gray-400 uppercase">{log.actorRole}</p>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">system</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <code className="text-[11px] font-mono text-gray-800">{log.action}</code>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ENTITY_COLORS[log.entity] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {log.entity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {log.entityId ? (
                      <code className="text-[10px] text-gray-400 font-mono">
                        {log.entityId.slice(-8)}
                      </code>
                    ) : (
                      <span className="text-[10px] text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {(log.before !== undefined || log.after !== undefined || log.metadata) && (
                      <button
                        onClick={() => setDetail(log)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        title="View diff"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!logsQuery.isLoading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    No audit events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && <AuditDetailDrawer log={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function AuditDetailDrawer({ log, onClose }: { log: AuditLogDto; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full overflow-y-auto z-10">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
              Audit Event
            </p>
            <h3 className="font-bold text-gray-900 truncate">
              <code className="text-sm font-mono">{log.action}</code>
            </h3>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Info label="When" value={new Date(log.at).toLocaleString()} />
            <Info label="Actor" value={log.actorEmail ?? 'system'} />
            <Info label="Actor Role" value={log.actorRole ?? '—'} />
            <Info label="Entity" value={log.entity} />
            <Info label="Entity ID" value={log.entityId ?? '—'} mono />
            <Info label="IP" value={log.ip ?? '—'} mono />
            <Info label="Request ID" value={log.requestId ?? '—'} mono />
          </div>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <DiffSection title="Metadata" data={log.metadata} />
          )}

          {(log.before !== undefined || log.after !== undefined) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {log.before !== undefined && (
                <DiffSection title="Before" data={log.before} tone="red" />
              )}
              {log.after !== undefined && (
                <DiffSection title="After" data={log.after} tone="emerald" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">{label}</p>
      <p className={`text-sm text-gray-800 ${mono ? 'font-mono text-xs' : ''} truncate`}>{value}</p>
    </div>
  );
}

function DiffSection({
  title,
  data,
  tone,
}: {
  title: string;
  data: unknown;
  tone?: 'red' | 'emerald';
}) {
  const headerStyle =
    tone === 'red'
      ? 'bg-red-50 text-red-700 border-red-200'
      : tone === 'emerald'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <div className={`rounded-xl border overflow-hidden ${headerStyle}`}>
      <div className="px-3 py-1.5 border-b border-current/10">
        <p className="text-[10px] uppercase font-bold tracking-wider">{title}</p>
      </div>
      <pre className="text-[11px] font-mono p-3 bg-white text-gray-800 overflow-x-auto max-h-96 whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
