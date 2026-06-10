import { useState } from 'react';
import {
  Download,
  CalendarRange,
  Receipt,
  Package,
  Star,
  Users,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Percent,
  ChefHat,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  useSalesReport,
  useItemsReport,
  useTaxReport,
  usePaymentsReport,
  useStaffReport,
  useFootfallReport,
  useInventoryReport,
  useFeedbackReport,
  useProfitabilityReport,
  downloadReportExport,
} from '@/hooks/useReports';
import {
  CHANNEL_NAMES,
  PAYMENT_MODE_LABELS,
  formatHour,
  type ExportFormat,
  type ReportChannel,
  type ReportGroupBy,
  type ReportType,
} from '@/lib/dto/reports';

type Tab =
  | 'sales'
  | 'items'
  | 'tax'
  | 'payments'
  | 'staff'
  | 'footfall'
  | 'inventory'
  | 'feedback'
  | 'profitability';

const CHANNEL_COLORS = ['#ec4899', '#8b5cf6', '#3b82f6'];

function fmtINR(n: number): string {
  return `₹${Math.round(n).toLocaleString()}`;
}

function fmtINR2(n: number): string {
  return `₹${n.toFixed(2)}`;
}

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminReports() {
  const [tab, setTab] = useState<Tab>('sales');
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(daysAgo(0));

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'items', label: 'Items', icon: ShoppingBag },
    { id: 'profitability', label: 'Profitability', icon: Percent },
    { id: 'tax', label: 'Tax', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'footfall', label: 'Footfall', icon: ChefHat },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'feedback', label: 'Feedback', icon: Star },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live numbers, sliceable by date range</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DateRangeBar
            from={from}
            to={to}
            onChange={(f, t) => {
              setFrom(f);
              setTo(t);
            }}
          />
          <ExportMenu
            type={tab}
            range={{ from, to }}
          />
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-[fadeIn_0.2s_ease-out]">
        {tab === 'sales' && <SalesTab from={from} to={to} />}
        {tab === 'items' && <ItemsTab from={from} to={to} />}
        {tab === 'profitability' && <ProfitabilityTab from={from} to={to} />}
        {tab === 'tax' && <TaxTab from={from} to={to} />}
        {tab === 'payments' && <PaymentsTab from={from} to={to} />}
        {tab === 'staff' && <StaffTab from={from} to={to} />}
        {tab === 'footfall' && <FootfallTab from={from} to={to} />}
        {tab === 'inventory' && <InventoryTab from={from} to={to} />}
        {tab === 'feedback' && <FeedbackTab from={from} to={to} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Date range bar
// ─────────────────────────────────────────────────────────────────────────────
function DateRangeBar({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const presets = [
    { label: 'Today', from: daysAgo(0), to: daysAgo(0) },
    { label: '7d', from: daysAgo(6), to: daysAgo(0) },
    { label: '30d', from: daysAgo(29), to: daysAgo(0) },
    { label: '90d', from: daysAgo(89), to: daysAgo(0) },
  ];
  return (
    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2 py-1">
      <CalendarRange className="w-3.5 h-3.5 text-gray-400 mx-1.5" />
      <input
        type="date"
        value={from}
        onChange={(e) => onChange(e.target.value, to)}
        className="text-xs border-0 focus:outline-none bg-transparent"
      />
      <span className="text-xs text-gray-300">→</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onChange(from, e.target.value)}
        className="text-xs border-0 focus:outline-none bg-transparent"
      />
      <div className="flex gap-0.5 ml-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(p.from, p.to)}
            className="text-[10px] font-semibold px-2 py-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExportMenu({
  type,
  range,
}: {
  type: ReportType;
  range: { from: string; to: string };
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Download className="w-4 h-4" /> Export
      </button>
      {open && (
        <div className="absolute right-0 top-11 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-20">
          {(['csv', 'xlsx', 'pdf'] as ExportFormat[]).map((f) => (
            <button
              key={f}
              onClick={async () => {
                setOpen(false);
                await downloadReportExport(type, f, range);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors uppercase"
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function ReportKpi({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ElementType;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        {Icon && color && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function DataTable({
  headers,
  rows,
  empty,
  loading,
}: {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  empty?: string;
  loading?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-gray-400">
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-gray-400">
                {empty ?? 'No data for the selected range.'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RefreshButton({ onClick, busy }: { onClick: () => void; busy?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
      title="Refresh"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sales tab
// ─────────────────────────────────────────────────────────────────────────────
function SalesTab({ from, to }: { from: string; to: string }) {
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('day');
  const [channel, setChannel] = useState<ReportChannel | 'all'>('all');

  const query = useSalesReport({
    from,
    to,
    groupBy,
    channel: channel === 'all' ? undefined : channel,
  });

  const data = query.data;
  const chartData = (data?.buckets ?? []).map((b) => ({
    bucket: b.bucket.slice(5),
    gross: b.gross,
    net: b.net,
    discount: b.discount,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <ReportKpi label="Gross" value={fmtINR(data?.totals.gross ?? 0)} icon={CreditCard} color="bg-pink-50 text-pink-600" />
        <ReportKpi label="Discount" value={fmtINR(data?.totals.discount ?? 0)} icon={Percent} color="bg-amber-50 text-amber-600" />
        <ReportKpi label="Tax" value={fmtINR(data?.totals.tax ?? 0)} icon={Receipt} color="bg-violet-50 text-violet-600" />
        <ReportKpi label="Service Charge" value={fmtINR(data?.totals.serviceCharge ?? 0)} icon={CreditCard} color="bg-blue-50 text-blue-600" />
        <ReportKpi label="Invoices" value={String(data?.totals.invoiceCount ?? 0)} icon={Receipt} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Revenue over time</h3>
            <p className="text-xs text-gray-400">Grouped by {groupBy}</p>
          </div>
          <div className="flex gap-1.5">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as ReportGroupBy)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-pink-400 bg-white"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as ReportChannel | 'all')}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-pink-400 bg-white"
            >
              <option value="all">All channels</option>
              <option value="dine_in">Dine-In</option>
              <option value="window">Window</option>
              <option value="assisted">Assisted</option>
            </select>
            <RefreshButton onClick={() => query.refetch()} busy={query.isFetching} />
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              {query.isLoading ? 'Loading...' : 'No sales in this range'}
            </div>
          ) : (
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={((v: unknown) => fmtINR(Number(v))) as never} />
              <Area type="monotone" dataKey="gross" name="Gross" stroke="#ec4899" strokeWidth={2} fill="url(#salesGross)" />
              <Area type="monotone" dataKey="net" name="Net" stroke="#8b5cf6" strokeWidth={2} fill="transparent" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">By channel</h3>
        <div className="grid grid-cols-3 gap-3">
          {(data?.byChannel ?? []).map((c) => (
            <div key={c.channel ?? 'unknown'} className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] uppercase font-semibold text-gray-500">
                {c.channel ? CHANNEL_NAMES[c.channel] : 'Unknown'}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">{fmtINR(c.gross)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{c.invoiceCount} invoices</p>
            </div>
          ))}
          {(data?.byChannel ?? []).length === 0 && (
            <p className="text-xs text-gray-400 col-span-3">No channel data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Items tab
// ─────────────────────────────────────────────────────────────────────────────
function ItemsTab({ from, to }: { from: string; to: string }) {
  const [sortBy, setSortBy] = useState<'top' | 'slow'>('top');
  const query = useItemsReport({ from, to, sortBy, limit: 30 });
  const items = query.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
          {(['top', 'slow'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg ${
                sortBy === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {s === 'top' ? 'Top sellers' : 'Slow movers'}
            </button>
          ))}
        </div>
        <RefreshButton onClick={() => query.refetch()} busy={query.isFetching} />
      </div>

      <DataTable
        headers={['Rank', 'Item', 'Qty Sold', 'Revenue', 'Order Count', 'Avg Per Order']}
        loading={query.isLoading}
        empty={`No ${sortBy === 'top' ? 'top sellers' : 'slow movers'} in this range`}
        rows={items.map((item, i) => [
          <span key="r" className="text-xs font-black text-gray-400">
            #{i + 1}
          </span>,
          <span key="n" className="font-semibold text-gray-900">
            {item.name}
          </span>,
          item.qty,
          fmtINR(item.revenue),
          item.orderCount,
          item.orderCount > 0 ? (item.qty / item.orderCount).toFixed(1) : '—',
        ])}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profitability
// ─────────────────────────────────────────────────────────────────────────────
function ProfitabilityTab({ from, to }: { from: string; to: string }) {
  const query = useProfitabilityReport({ from, to });
  const items = query.data?.items ?? [];

  const totalRev = items.reduce((s, i) => s + i.revenue, 0);
  const totalCost = items.reduce((s, i) => s + i.cost, 0);
  const totalProfit = totalRev - totalCost;
  const margin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <ReportKpi label="Revenue" value={fmtINR(totalRev)} icon={CreditCard} color="bg-pink-50 text-pink-600" />
        <ReportKpi label="Ingredient Cost" value={fmtINR(totalCost)} icon={Package} color="bg-amber-50 text-amber-600" />
        <ReportKpi label="Gross Profit" value={fmtINR(totalProfit)} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
        <ReportKpi label="Margin" value={`${margin.toFixed(1)}%`} icon={Percent} color="bg-violet-50 text-violet-600" />
      </div>
      <p className="text-[11px] text-gray-400 italic">
        Cost is computed from each item's base recipe (no variant overrides yet). Items without a
        recipe show as zero cost.
      </p>

      <DataTable
        headers={['Item', 'Qty', 'Revenue', 'Cost', 'Gross Profit', 'Margin']}
        loading={query.isLoading}
        empty="No item sales in this range — or no recipes configured"
        rows={items.map((p) => [
          <span key="n" className="font-semibold text-gray-900">
            {p.name}
          </span>,
          p.qty,
          fmtINR(p.revenue),
          p.cost > 0 ? fmtINR(p.cost) : <span className="text-gray-400">—</span>,
          <span key="gp" className={p.grossProfit < 0 ? 'text-red-600 font-bold' : 'text-gray-900'}>
            {fmtINR(p.grossProfit)}
          </span>,
          <span key="m" className={p.margin < 30 ? 'text-amber-600' : 'text-emerald-600'}>
            {p.margin.toFixed(1)}%
          </span>,
        ])}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tax
// ─────────────────────────────────────────────────────────────────────────────
function TaxTab({ from, to }: { from: string; to: string }) {
  const query = useTaxReport({ from, to });
  const data = query.data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <ReportKpi
          label="Invoices"
          value={String(data?.summary.invoiceCount ?? 0)}
          icon={Receipt}
          color="bg-blue-50 text-blue-600"
        />
        <ReportKpi
          label="Taxable Turnover"
          value={fmtINR(data?.summary.taxableTurnover ?? 0)}
          icon={CreditCard}
          color="bg-violet-50 text-violet-600"
        />
        <ReportKpi
          label="Total Tax"
          value={fmtINR(data?.summary.totalTax ?? 0)}
          icon={Percent}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <DataTable
        headers={['Tax Name', 'Type', 'Rate', 'Amount Collected']}
        loading={query.isLoading}
        empty="No tax breakdown yet"
        rows={(data?.breakup ?? []).map((b) => [
          <span key="n" className="font-semibold text-gray-900">
            {b.name}
          </span>,
          <span key="t" className="text-xs uppercase text-gray-500">
            {b.type}
          </span>,
          `${b.rate}%`,
          fmtINR2(b.amount),
        ])}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────────────────────────────────────
function PaymentsTab({ from, to }: { from: string; to: string }) {
  const query = usePaymentsReport({ from, to });
  const data = query.data;

  const pieData = (data?.byMode ?? []).map((m) => ({
    name: PAYMENT_MODE_LABELS[m.mode] ?? m.mode,
    value: m.gross,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <ReportKpi
          label="Total Collected"
          value={fmtINR((data?.byMode ?? []).reduce((s, m) => s + m.gross, 0))}
          icon={CreditCard}
          color="bg-emerald-50 text-emerald-600"
        />
        <ReportKpi
          label="Refunded"
          value={fmtINR((data?.byMode ?? []).reduce((s, m) => s + m.refunded, 0))}
          icon={Receipt}
          color="bg-red-50 text-red-600"
        />
        <ReportKpi
          label="Voided Invoices"
          value={String(data?.voidedInvoices ?? 0)}
          icon={Receipt}
          color="bg-gray-50 text-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">By payment mode</h3>
          <ResponsiveContainer width="100%" height={220}>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                {query.isLoading ? 'Loading...' : 'No payments yet'}
              </div>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={((v: unknown) => fmtINR(Number(v))) as never} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Mode breakdown</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Mode', 'Count', 'Gross', 'Refunded', 'Net'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.byMode ?? []).map((m) => (
                <tr key={m.mode} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-semibold text-gray-900">
                    {PAYMENT_MODE_LABELS[m.mode] ?? m.mode}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{m.count}</td>
                  <td className="px-4 py-2.5">{fmtINR(m.gross)}</td>
                  <td className="px-4 py-2.5 text-red-600">{fmtINR(m.refunded)}</td>
                  <td className="px-4 py-2.5 font-bold">{fmtINR(m.net)}</td>
                </tr>
              ))}
              {(data?.byMode ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                    No payment data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DataTable
        headers={['Refund Method', 'Count', 'Amount']}
        loading={query.isLoading}
        empty="No refunds in this range"
        rows={(data?.refunds ?? []).map((r) => [
          <span key="m" className="font-semibold text-gray-900 capitalize">
            {r.method}
          </span>,
          r.count,
          fmtINR(r.amount),
        ])}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────────────────────────────
function StaffTab({ from, to }: { from: string; to: string }) {
  const query = useStaffReport({ from, to });
  const data = query.data;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Waiters</h3>
        </div>
        <DataTable
          headers={['Waiter', 'Orders', 'Gross', 'Cancelled']}
          loading={query.isLoading}
          empty="No waiter activity in this range"
          rows={(data?.waiters ?? []).map((w) => [
            <span key="n" className="font-semibold text-gray-900">
              {w.name ?? w.email ?? 'Unknown'}
            </span>,
            w.orderCount,
            fmtINR(w.gross),
            w.cancelled > 0 ? (
              <span key="c" className="text-red-600">
                {w.cancelled}
              </span>
            ) : (
              '—'
            ),
          ])}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Cashiers</h3>
        </div>
        <DataTable
          headers={['Cashier', 'Invoices', 'Gross', 'Discount Given']}
          loading={query.isLoading}
          empty="No cashier activity in this range"
          rows={(data?.cashiers ?? []).map((c) => [
            <span key="n" className="font-semibold text-gray-900">
              {c.name ?? c.email ?? 'Unknown'}
            </span>,
            c.invoiceCount,
            fmtINR(c.gross),
            fmtINR(c.discount),
          ])}
        />
      </div>

      {(data?.itemVoidsByActor ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Item voids by staff</h3>
            <p className="text-[11px] text-gray-400">Investigate spikes here</p>
          </div>
          <DataTable
            headers={['Staff', 'Voids']}
            loading={false}
            rows={data!.itemVoidsByActor.map((v) => [
              <span key="n" className="font-semibold text-gray-900">
                {v.name ?? v.email ?? 'Unknown'}
              </span>,
              <span key="c" className="text-red-600 font-bold">
                {v.voidCount}
              </span>,
            ])}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Footfall
// ─────────────────────────────────────────────────────────────────────────────
function FootfallTab({ from, to }: { from: string; to: string }) {
  const query = useFootfallReport({ from, to });
  const data = query.data;

  const peakChart = (data?.peakHours ?? []).map((p) => ({
    hour: formatHour(p.hour),
    orders: p.count,
    gross: p.gross,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <ReportKpi
          label="Sessions"
          value={String(data?.diningRoom.sessionCount ?? 0)}
          icon={Users}
          color="bg-violet-50 text-violet-600"
        />
        <ReportKpi
          label="Avg Dwell"
          value={`${data?.diningRoom.avgDwellMinutes ?? 0} min`}
          icon={CalendarRange}
          color="bg-blue-50 text-blue-600"
        />
        <ReportKpi
          label="Avg Ticket"
          value={fmtINR(data?.diningRoom.avgTicket ?? 0)}
          icon={CreditCard}
          color="bg-emerald-50 text-emerald-600"
        />
        <ReportKpi
          label="Avg Guests"
          value={(data?.diningRoom.avgGuestCount ?? 0).toFixed(1)}
          icon={Users}
          color="bg-pink-50 text-pink-600"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Peak hours</h3>
        <ResponsiveContainer width="100%" height={240}>
          {peakChart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              {query.isLoading ? 'Loading...' : 'No order data in this range'}
            </div>
          ) : (
            <BarChart data={peakChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#ec4899" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <DataTable
        headers={['Channel', 'Order Count']}
        loading={query.isLoading}
        empty="No channel data yet"
        rows={(data?.channelMix ?? []).map((c) => [
          <span key="c" className="font-semibold text-gray-900">
            {c.channel ? CHANNEL_NAMES[c.channel] : 'Unknown'}
          </span>,
          c.count,
        ])}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────────────────────────────────────────
function InventoryTab({ from, to }: { from: string; to: string }) {
  const query = useInventoryReport({ from, to });
  const data = query.data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Consumption (recipe deductions)</h3>
          </div>
          <DataTable
            headers={['Item', 'Consumed', 'Value']}
            loading={query.isLoading}
            empty="No consumption — recipes may not be configured or no orders settled"
            rows={(data?.consumption ?? []).map((c) => [
              <span key="n" className="font-semibold text-gray-900">
                {c.name}
              </span>,
              `${c.consumed} ${c.unit}`,
              c.costValue !== null ? fmtINR2(c.costValue) : <span className="text-gray-400">—</span>,
            ])}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Waste</h3>
          </div>
          <DataTable
            headers={['Item', 'Wasted', 'Cost Loss']}
            loading={query.isLoading}
            empty="No waste recorded in this range"
            rows={(data?.wastage ?? []).map((w) => [
              <span key="n" className="font-semibold text-gray-900">
                {w.name}
              </span>,
              <span key="q" className="text-red-600">
                {w.wasted} {w.unit}
              </span>,
              w.costValue !== null ? (
                <span key="v" className="text-red-700 font-bold">
                  {fmtINR2(w.costValue)}
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              ),
            ])}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Currently low stock</h3>
        </div>
        <DataTable
          headers={['Item', 'Current', 'Threshold', 'Gap']}
          loading={query.isLoading}
          empty="Nothing low — well stocked!"
          rows={(data?.lowStock ?? []).map((l) => [
            <span key="n" className="font-semibold text-gray-900">
              {l.name}
            </span>,
            `${l.currentStock} ${l.unit}`,
            `${l.threshold} ${l.unit}`,
            <span key="g" className="text-amber-600 font-bold">
              {(l.threshold - l.currentStock).toFixed(2)} {l.unit}
            </span>,
          ])}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feedback
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackTab({ from, to }: { from: string; to: string }) {
  const query = useFeedbackReport({ from, to });
  const data = query.data;

  const trendChart = (data?.trend ?? []).map((t) => ({
    day: t.day.slice(5),
    count: t.count,
    rating: t.avgRating,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <ReportKpi
          label="Total"
          value={String(data?.summary.total ?? 0)}
          icon={Star}
          color="bg-amber-50 text-amber-600"
        />
        <ReportKpi
          label="Avg Rating"
          value={data?.summary.avgRating ? data.summary.avgRating.toFixed(2) : '—'}
          icon={Star}
          color="bg-emerald-50 text-emerald-600"
        />
        <ReportKpi
          label="Positive / Negative"
          value={`${data?.summary.positive ?? 0} / ${data?.summary.negative ?? 0}`}
          sub={`Neutral: ${data?.summary.neutral ?? 0}`}
          icon={TrendingUp}
          color="bg-violet-50 text-violet-600"
        />
        <ReportKpi
          label="Channels reporting"
          value={String((data?.byChannel ?? []).length)}
          icon={ShoppingBag}
          color="bg-blue-50 text-blue-600"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Daily volume & rating</h3>
        <ResponsiveContainer width="100%" height={220}>
          {trendChart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              {query.isLoading ? 'Loading...' : 'No feedback in this range'}
            </div>
          ) : (
            <BarChart data={trendChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" name="Reviews" fill="#ec4899" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {(data?.tagDistribution ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Top mentioned tags</h3>
          <div className="flex flex-wrap gap-2">
            {data!.tagDistribution.map((t) => (
              <span
                key={t.tag}
                className="text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-gray-700"
              >
                {t.tag} <span className="text-gray-400">×{t.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <DataTable
        headers={['Channel', 'Reviews', 'Avg Rating']}
        loading={query.isLoading}
        empty="No feedback by channel"
        rows={(data?.byChannel ?? []).map((c) => [
          <span key="n" className="font-semibold text-gray-900">
            {c.channel ? CHANNEL_NAMES[c.channel] : 'Unknown'}
          </span>,
          c.count,
          c.avgRating.toFixed(2),
        ])}
      />
    </div>
  );
}
