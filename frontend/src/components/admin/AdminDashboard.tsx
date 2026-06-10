import { useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  Package,
  Star,
  ChefHat,
  Users,
  RefreshCw,
  Receipt,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useKpiDashboard,
  useSalesReport,
  useItemsReport,
  useInventoryReport,
} from '@/hooks/useReports';
import { useOrders } from '@/hooks/useOrders';
import { useSocket } from '@/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';

function fmtINR(n: number): string {
  return `₹${Math.round(n).toLocaleString()}`;
}

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString().slice(0, 10);
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function PipelineCard({
  label,
  count,
  color,
  icon: Icon,
}: {
  label: string;
  count: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`flex-1 rounded-xl border p-4 text-center ${color}`}>
      <Icon className="w-5 h-5 mx-auto mb-2 opacity-70" />
      <p className="text-2xl font-black">{count}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: ₹{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const qc = useQueryClient();
  const kpiQuery = useKpiDashboard();
  const salesQuery = useSalesReport({
    from: daysAgo(13),
    to: new Date().toISOString().slice(0, 10),
    groupBy: 'day',
  });
  const topItemsQuery = useItemsReport({
    from: daysAgo(29),
    sortBy: 'top',
    limit: 5,
  });
  const inventoryReport = useInventoryReport({ from: daysAgo(0) });
  const openOrdersQuery = useOrders({ status: 'placed', limit: 100 });
  const preparingQuery = useOrders({ status: 'preparing', limit: 100 });
  const readyQuery = useOrders({ status: 'ready', limit: 100 });
  const servedTodayQuery = useOrders({ status: 'served', from: daysAgo(0), limit: 100 });

  // Live updates — invalidate everything when orders or invoices change
  useSocket('/staff', {
    'order:new': () => qc.invalidateQueries({ queryKey: ['reports'] }),
    'order:status_changed': () => qc.invalidateQueries({ queryKey: ['reports'] }),
    'invoice:new': () => qc.invalidateQueries({ queryKey: ['reports'] }),
    'payment:received': () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });

  const kpi = kpiQuery.data;
  const sales = salesQuery.data;

  const salesChart = useMemo(() => {
    if (!sales) return [];
    return sales.buckets.map((b) => ({
      date: b.bucket.slice(5),
      gross: b.gross,
      net: b.net,
    }));
  }, [sales]);

  const lowStockItems = inventoryReport.data?.lowStock ?? [];
  const topItems = topItemsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => {
            kpiQuery.refetch();
            salesQuery.refetch();
            topItemsQuery.refetch();
            inventoryReport.refetch();
            openOrdersQuery.refetch();
            preparingQuery.refetch();
            readyQuery.refetch();
            servedTodayQuery.refetch();
          }}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${kpiQuery.isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Today's Revenue"
          value={fmtINR(kpi?.today.gross ?? 0)}
          sub={`${kpi?.today.orders ?? 0} invoice${kpi?.today.orders === 1 ? '' : 's'}`}
          icon={CreditCard}
          color="bg-pink-50 text-pink-600"
        />
        <KpiCard
          label="Week to Date"
          value={fmtINR(kpi?.week.gross ?? 0)}
          sub={`${kpi?.week.orders ?? 0} invoices`}
          icon={Receipt}
          color="bg-violet-50 text-violet-600"
        />
        <KpiCard
          label="Month to Date"
          value={fmtINR(kpi?.month.gross ?? 0)}
          sub={`${kpi?.month.orders ?? 0} invoices`}
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Open Orders"
          value={String(kpi?.openOrders ?? 0)}
          sub="Active in the system"
          icon={ShoppingBag}
          color="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Today Satisfaction"
          value={
            kpi?.todayFeedback.count
              ? `${kpi.todayFeedback.avgRating.toFixed(2)}/5`
              : '—'
          }
          sub={
            kpi?.todayFeedback.count
              ? `${kpi.todayFeedback.count} review${kpi.todayFeedback.count === 1 ? '' : 's'}`
              : 'No feedback yet'
          }
          icon={Star}
          color="bg-amber-50 text-amber-500"
        />
      </div>

      {/* Middle Row: Revenue chart + Pipeline + Low stock summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 14 days · gross vs net</p>
            </div>
            <div className="text-xs text-gray-500">
              Total: <strong>{fmtINR(sales?.totals.gross ?? 0)}</strong>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            {salesChart.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                {salesQuery.isLoading ? 'Loading...' : 'No sales in the last 14 days yet'}
              </div>
            ) : (
              <AreaChart data={salesChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="gross"
                  name="Gross"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fill="url(#grossArea)"
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  name="Net"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#netArea)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Order Pipeline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Order pipeline</h3>
            <div className="flex gap-2">
              <PipelineCard
                label="Placed"
                count={openOrdersQuery.data?.meta.total ?? 0}
                icon={ShoppingBag}
                color="bg-blue-50 border-blue-100 text-blue-700"
              />
              <PipelineCard
                label="Preparing"
                count={preparingQuery.data?.meta.total ?? 0}
                icon={ChefHat}
                color="bg-amber-50 border-amber-100 text-amber-700"
              />
              <PipelineCard
                label="Ready"
                count={readyQuery.data?.meta.total ?? 0}
                icon={Star}
                color="bg-emerald-50 border-emerald-100 text-emerald-700"
              />
              <PipelineCard
                label="Served"
                count={servedTodayQuery.data?.meta.total ?? 0}
                icon={Users}
                color="bg-gray-50 border-gray-200 text-gray-600"
              />
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Quick stats</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <p className="text-[10px] uppercase font-semibold text-blue-700">
                    Customers
                  </p>
                </div>
                <p className="text-xl font-black text-blue-900">{kpi?.totalCustomers ?? 0}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <p className="text-[10px] uppercase font-semibold text-amber-700">
                    Low stock
                  </p>
                </div>
                <p className="text-xl font-black text-amber-900">{kpi?.lowStockCount ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top items + Low stock detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top items (last 30 days)</h3>
            <p className="text-xs text-gray-400">Ranked by quantity sold</p>
          </div>
          {topItemsQuery.isLoading ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">Loading...</div>
          ) : topItems.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              No items sold yet in this window.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topItems.map((item, i) => (
                <div key={item.itemId} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-black text-gray-500">#{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.qty} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{fmtINR(item.revenue)}</p>
                    <p className="text-[10px] text-gray-400">{item.orderCount} orders</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Low stock</h3>
              <p className="text-xs text-gray-400">
                {lowStockItems.length} item{lowStockItems.length === 1 ? '' : 's'} need attention
              </p>
            </div>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          {lowStockItems.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              {inventoryReport.isLoading ? 'Loading...' : 'All stocked up — nothing low.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {lowStockItems.slice(0, 8).map((s) => {
                const ratio =
                  s.threshold > 0 ? Math.min(100, (s.currentStock / s.threshold) * 100) : 0;
                const critical = ratio < 40;
                return (
                  <div key={s.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          critical ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {critical ? 'Critical' : 'Low'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            critical ? 'bg-red-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 w-24 text-right shrink-0">
                        {s.currentStock}
                        {s.unit} / {s.threshold}
                        {s.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
