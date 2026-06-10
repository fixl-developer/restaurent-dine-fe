import { useState } from 'react';
import {
  Download, Calendar, TrendingUp, TrendingDown, ShoppingBag,
  CreditCard, Users, Package, Star, ChevronDown, FileText
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  MONTHLY_REVENUE, MONTHLY_DAILY, PAYMENT_BREAKDOWN, PAYMENT_COLORS,
  TAX_REPORT, STAFF_PERFORMANCE, INVENTORY_REPORT, FEEDBACK_SUMMARY,
  RECENT_FEEDBACK, CATEGORY_SALES
} from './adminMockData';

type ReportTab = 'sales' | 'tax' | 'payments' | 'staff' | 'inventory' | 'feedback';

// ─── KPI Summary Card ─────────────────────────────────────────────────────────
function ReportKpi({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${positive ? 'text-emerald-600' : positive === false ? 'text-red-500' : 'text-gray-400'}`}>
          {positive !== undefined && (positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-gray-100 pb-3 mb-5">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function DataTable({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map(h => (
              <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? `₹${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Sales Tab ────────────────────────────────────────────────────────────────
function SalesReport() {
  const totalRevenue = MONTHLY_DAILY.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = MONTHLY_DAILY.reduce((s, d) => s + d.orders, 0);
  const avgDaily = Math.round(totalRevenue / MONTHLY_DAILY.length);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpi label="Total Revenue" value={`₹${(totalRevenue / 100000).toFixed(2)}L`} sub="+18.4% vs last month" positive={true} />
        <ReportKpi label="Total Orders"  value={totalOrders.toString()} sub="+12.1% vs last month" positive={true} />
        <ReportKpi label="Avg Daily Revenue" value={`₹${avgDaily.toLocaleString()}`} />
        <ReportKpi label="Peak Day" value="May 29" sub="₹71,200 revenue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Daily Revenue — May 2026" subtitle="30-day revenue trend" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_DAILY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                interval={4} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#ec4899" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Revenue by Category" subtitle="Monthly contribution" />
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={CATEGORY_SALES} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={70} strokeWidth={2} stroke="#fff">
                  {CATEGORY_SALES.map((_, i) => <Cell key={i} fill={PAYMENT_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              {CATEGORY_SALES.map((c, i) => (
                <div key={c.category} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PAYMENT_COLORS[i] }} />
                  <span className="text-gray-600 font-medium">{c.category}</span>
                  <span className="text-gray-400 ml-auto pl-4">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Weekly Breakdown" subtitle="Revenue, orders, and tax" />
        <DataTable
          headers={['Week', 'Revenue', 'Orders', 'Avg Order', 'Tax Collected']}
          rows={MONTHLY_REVENUE.map(w => [
            w.week,
            `₹${w.revenue.toLocaleString()}`,
            w.orders,
            `₹${Math.round(w.revenue / w.orders).toLocaleString()}`,
            `₹${w.tax.toLocaleString()}`
          ])}
        />
      </div>
    </div>
  );
}

// ─── Tax Tab ─────────────────────────────────────────────────────────────────
function TaxReport() {
  const totalTax = TAX_REPORT.reduce((s, t) => s + t.total, 0);
  const totalTaxable = TAX_REPORT.reduce((s, t) => s + t.taxable, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpi label="Total Taxable" value={`₹${totalTaxable.toLocaleString()}`} />
        <ReportKpi label="Total Tax Collected" value={`₹${totalTax.toLocaleString()}`} sub="CGST + SGST @ 5% each" />
        <ReportKpi label="CGST Collected" value={`₹${TAX_REPORT.reduce((s, t) => s + t.cgst, 0).toLocaleString()}`} />
        <ReportKpi label="SGST Collected" value={`₹${TAX_REPORT.reduce((s, t) => s + t.sgst, 0).toLocaleString()}`} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Tax Breakdown by Category" subtitle="GST applicable on all food items @ 5% CGST + 5% SGST" />
        <DataTable
          headers={['Category', 'Taxable Amount', 'CGST (5%)', 'SGST (5%)', 'Total Tax', 'Effective Rate']}
          rows={TAX_REPORT.map(t => [
            t.category,
            `₹${t.taxable.toLocaleString()}`,
            `₹${t.cgst.toLocaleString()}`,
            `₹${t.sgst.toLocaleString()}`,
            <span className="font-semibold text-gray-900">₹{t.total.toLocaleString()}</span>,
            t.taxable > 0 ? '10%' : '—'
          ])}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Monthly Tax Trend" subtitle="Tax collected per week" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
            <Bar dataKey="tax" name="Tax" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Payments Tab ────────────────────────────────────────────────────────────
function PaymentsReport() {
  const total = PAYMENT_BREAKDOWN.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpi label="Total Collected" value={`₹${(total / 100000).toFixed(2)}L`} sub="+15.3% vs last month" positive={true} />
        <ReportKpi label="Transactions" value={PAYMENT_BREAKDOWN.reduce((s, p) => s + p.count, 0).toString()} />
        <ReportKpi label="Top Method" value="UPI" sub="43% of payments" />
        <ReportKpi label="Avg Transaction" value={`₹${Math.round(total / PAYMENT_BREAKDOWN.reduce((s, p) => s + p.count, 0)).toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Payment Method Split" subtitle="By transaction volume (₹)" />
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={PAYMENT_BREAKDOWN} dataKey="amount" nameKey="method" cx="50%" cy="50%"
                  outerRadius={80} innerRadius={45} strokeWidth={2} stroke="#fff">
                  {PAYMENT_BREAKDOWN.map((_, i) => <Cell key={i} fill={PAYMENT_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 text-xs">
              {PAYMENT_BREAKDOWN.map((p, i) => (
                <div key={p.method}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PAYMENT_COLORS[i] }} />
                    <span className="font-semibold text-gray-800">{p.method}</span>
                    <span className="text-gray-400 ml-auto pl-4">{p.pct}%</span>
                  </div>
                  <p className="text-gray-400 pl-4">₹{p.amount.toLocaleString()} · {p.count} txns</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Payment Methods Table" subtitle="Detailed breakdown" />
          <DataTable
            headers={['Method', 'Amount', 'Transactions', 'Share', 'Avg Value']}
            rows={PAYMENT_BREAKDOWN.map((p, i) => [
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: PAYMENT_COLORS[i] }} />
                <span className="font-medium">{p.method}</span>
              </div>,
              `₹${p.amount.toLocaleString()}`,
              p.count,
              `${p.pct}%`,
              `₹${Math.round(p.amount / p.count).toLocaleString()}`
            ])}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Staff Tab ───────────────────────────────────────────────────────────────
function StaffReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpi label="Total Staff" value="5" sub="3 waiters, 1 chef, 1 cashier" />
        <ReportKpi label="Avg Orders/Staff" value={Math.round(STAFF_PERFORMANCE.reduce((s, p) => s + p.ordersServed, 0) / STAFF_PERFORMANCE.length).toString()} />
        <ReportKpi label="Best Performer" value="Dev Kumar" sub="4.9 rating · 198 orders" positive={true} />
        <ReportKpi label="Avg Service Time" value="12 min" sub="-1.4 min vs last month" positive={true} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Staff Performance Overview" subtitle="Current month · all roles" />
        <DataTable
          headers={['Name', 'Role', 'Orders Served', 'Avg Service Time', 'Rating', 'Revenue Handled']}
          rows={STAFF_PERFORMANCE.map(s => [
            <span className="font-semibold text-gray-900">{s.name}</span>,
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s.role}</span>,
            s.ordersServed,
            s.avgTime,
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-semibold">{s.rating}</span>
            </div>,
            s.revenue > 0 ? `₹${s.revenue.toLocaleString()}` : '—'
          ])}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Orders Served by Staff" subtitle="Current month comparison" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={STAFF_PERFORMANCE} layout="vertical" margin={{ top: 4, right: 20, left: 80, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} axisLine={false} width={80} />
            <Tooltip formatter={(v: number) => [`${v} orders`, 'Orders Served']} />
            <Bar dataKey="ordersServed" name="Orders" fill="#ec4899" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Inventory Tab ────────────────────────────────────────────────────────────
function InventoryReport() {
  const critical = INVENTORY_REPORT.filter(i => i.status === 'Critical').length;
  const low = INVENTORY_REPORT.filter(i => i.status === 'Low').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpi label="Total Items Tracked" value={INVENTORY_REPORT.length.toString()} />
        <ReportKpi label="Critical Stock" value={critical.toString()} sub="Immediate reorder needed" positive={false} />
        <ReportKpi label="Low Stock" value={low.toString()} sub="Order within 24 hours" />
        <ReportKpi label="Items OK" value={INVENTORY_REPORT.filter(i => i.status === 'OK').length.toString()} sub="Sufficient stock levels" positive={true} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Inventory Consumption Report" subtitle="Opening → Closing stock for current period" />
        <DataTable
          headers={['Item', 'Unit', 'Opening', 'Consumed', 'Closing', 'Reorder At', 'Status']}
          rows={INVENTORY_REPORT.map(i => {
            const statusColor =
              i.status === 'Critical' ? 'bg-red-50 text-red-600' :
              i.status === 'Low' ? 'bg-amber-50 text-amber-600' :
              'bg-emerald-50 text-emerald-600';
            return [
              <span className="font-medium">{i.item}</span>,
              i.unit,
              `${i.opening} ${i.unit}`,
              `${i.consumed} ${i.unit}`,
              <span className={i.closing <= i.reorderAt ? 'font-bold text-red-600' : 'text-gray-700'}>{i.closing} {i.unit}</span>,
              `${i.reorderAt} ${i.unit}`,
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>{i.status}</span>
            ];
          })}
        />
      </div>
    </div>
  );
}

// ─── Feedback Tab ────────────────────────────────────────────────────────────
function FeedbackReport() {
  const f = FEEDBACK_SUMMARY;
  const bars = [
    { stars: 5, count: f.fivestar },
    { stars: 4, count: f.fourstar },
    { stars: 3, count: f.threestar },
    { stars: 2, count: f.twostar },
    { stars: 1, count: f.onestar },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpi label="Average Rating" value={`${f.avg}/5`} sub="+0.2 vs last month" positive={true} />
        <ReportKpi label="Total Reviews" value={f.total.toString()} sub="This month" />
        <ReportKpi label="5-Star Reviews" value={`${Math.round((f.fivestar / f.total) * 100)}%`} sub={`${f.fivestar} reviews`} positive={true} />
        <ReportKpi label="Below 3-Star" value={`${f.twostar + f.onestar}`} sub="Need attention" positive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Rating Distribution" subtitle="All customer reviews this month" />
          <div className="space-y-3">
            {bars.map(b => (
              <div key={b.stars} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-0.5 w-14 shrink-0">
                  {Array.from({ length: b.stars }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(b.count / f.total) * 100}%` }}
                  />
                </div>
                <span className="text-gray-400 w-10 text-right">{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Recent Feedback" subtitle="Latest customer reviews" />
          <div className="space-y-3 overflow-y-auto max-h-[240px]">
            {RECENT_FEEDBACK.map((fb, i) => (
              <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-800">{fb.guest}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: fb.rating }).map((_, j) => (
                      <Star key={j} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">{fb.comment}</p>
                <p className="text-[10px] text-gray-400 mt-1">Table {fb.table} · {fb.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Reports Component ───────────────────────────────────────────────────
export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [dateRange, setDateRange] = useState('May 2026');

  const tabs: { id: ReportTab; label: string; icon: React.ElementType }[] = [
    { id: 'sales',     label: 'Sales',         icon: TrendingUp  },
    { id: 'tax',       label: 'Tax',           icon: FileText    },
    { id: 'payments',  label: 'Payments',      icon: CreditCard  },
    { id: 'staff',     label: 'Staff',         icon: Users       },
    { id: 'inventory', label: 'Inventory',     icon: Package     },
    { id: 'feedback',  label: 'Feedback',      icon: Star        },
  ];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Detailed business insights and performance data</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-[fadeIn_0.2s_ease-out]">
        {activeTab === 'sales'     && <SalesReport />}
        {activeTab === 'tax'       && <TaxReport />}
        {activeTab === 'payments'  && <PaymentsReport />}
        {activeTab === 'staff'     && <StaffReport />}
        {activeTab === 'inventory' && <InventoryReport />}
        {activeTab === 'feedback'  && <FeedbackReport />}
      </div>

    </div>
  );
}
