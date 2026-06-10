import { useState } from 'react';
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, Table2, CreditCard,
  Bell, AlertTriangle, Package, Star, Zap, Plus, QrCode, FileText,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, ChefHat, Bike
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { ADMIN_IMAGES } from './adminMockData';
import {
  DASHBOARD_KPIS, SALES_TREND_14D, HOURLY_TODAY, ORDER_PIPELINE,
  TOP_ITEMS, SLOW_ITEMS, LOW_STOCK_ALERTS, NOTIFICATIONS
} from './adminMockData';

const TOP_ITEM_IMAGES: Record<string, string> = {
  'Butter Chicken': ADMIN_IMAGES.sauce,
  'Paneer Tikka':   ADMIN_IMAGES.sauce,
  'Matcha Latte':   ADMIN_IMAGES.decor,
  'Velvet Cake':    ADMIN_IMAGES.cake,
  'Avocado Toast':  ADMIN_IMAGES.oats,
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, change, icon: Icon, color
}: {
  label: string; value: string; sub?: string; change?: number;
  icon: React.ElementType; color: string;
}) {
  const positive = change !== undefined && change >= 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{positive ? '+' : ''}{change}% vs yesterday</span>
        </div>
      )}
    </div>
  );
}

// ─── Pipeline Status Card ─────────────────────────────────────────────────────
function PipelineCard({ label, count, color, icon: Icon }: { label: string; count: number; color: string; icon: React.ElementType }) {
  return (
    <div className={`flex-1 rounded-xl border p-4 text-center ${color}`}>
      <Icon className="w-5 h-5 mx-auto mb-2 opacity-70" />
      <p className="text-2xl font-black">{count}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: ₹{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function OrderTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="font-medium text-pink-600">₹{payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [chartView, setChartView] = useState<'14d' | 'today'>('14d');
  const [notifRead, setNotifRead] = useState<Set<string>>(new Set());

  const kpis = DASHBOARD_KPIS;
  const unread = NOTIFICATIONS.filter(n => !n.read && !notifRead.has(n.id)).length;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Today, May 30 2026 · SmartDine, Los Angeles</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <FileText className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Today's Revenue"
          value={`₹${kpis.todayRevenue.toLocaleString()}`}
          change={kpis.todayRevenueChange}
          icon={CreditCard}
          color="bg-pink-50 text-pink-600"
        />
        <KpiCard
          label="Total Orders"
          value={`${kpis.totalOrders}`}
          sub="across all channels"
          change={kpis.totalOrdersChange}
          icon={ShoppingBag}
          color="bg-violet-50 text-violet-600"
        />
        <KpiCard
          label="Active Tables"
          value={`${kpis.activeTables}/${kpis.totalTables}`}
          sub="60% occupancy"
          icon={Table2}
          color="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Avg Order Value"
          value={`₹${kpis.avgOrderValue.toLocaleString()}`}
          change={kpis.avgOrderValueChange}
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Satisfaction"
          value={`${kpis.satisfaction}/5`}
          sub="Based on 47 reviews today"
          change={kpis.satisfactionChange}
          icon={Star}
          color="bg-amber-50 text-amber-500"
        />
      </div>

      {/* Middle Row: Chart + Pipeline + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sales Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Dine-in vs Takeaway</p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1 text-xs font-medium">
              <button
                onClick={() => setChartView('14d')}
                className={`px-3 py-1.5 rounded-md transition-colors ${chartView === '14d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                14 Days
              </button>
              <button
                onClick={() => setChartView('today')}
                className={`px-3 py-1.5 rounded-md transition-colors ${chartView === 'today' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Today
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            {chartView === '14d' ? (
              <AreaChart data={SALES_TREND_14D} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dineIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="takeaway" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="dineIn" name="Dine-in" stroke="#ec4899" strokeWidth={2} fill="url(#dineIn)" />
                <Area type="monotone" dataKey="takeaway" name="Takeaway" stroke="#8b5cf6" strokeWidth={2} fill="url(#takeaway)" />
              </AreaChart>
            ) : (
              <BarChart data={HOURLY_TODAY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<OrderTooltip />} />
                <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Right Column: Pipeline + Notifications */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* Order Pipeline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Order Pipeline</h3>
            <div className="flex gap-2">
              <PipelineCard label="New" count={ORDER_PIPELINE.new} icon={Bell}
                color="bg-blue-50 border-blue-100 text-blue-700" />
              <PipelineCard label="Preparing" count={ORDER_PIPELINE.preparing} icon={ChefHat}
                color="bg-amber-50 border-amber-100 text-amber-700" />
              <PipelineCard label="Ready" count={ORDER_PIPELINE.ready} icon={CheckCircle}
                color="bg-emerald-50 border-emerald-100 text-emerald-700" />
              <PipelineCard label="Served" count={ORDER_PIPELINE.served} icon={Bike}
                color="bg-gray-50 border-gray-200 text-gray-600" />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-pink-400 text-white rounded-full px-2 py-0.5">{unread}</span>
                )}
              </div>
              <button
                onClick={() => setNotifRead(new Set(NOTIFICATIONS.map(n => n.id)))}
                className="text-xs text-pink-600 hover:underline font-medium"
              >
                Mark all read
              </button>
            </div>
            <div className="overflow-y-auto max-h-[220px] divide-y divide-gray-50">
              {NOTIFICATIONS.map(n => {
                const isRead = n.read || notifRead.has(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => setNotifRead(prev => new Set([...prev, n.id]))}
                    className={`px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!isRead ? 'bg-pink-50/40' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!isRead ? 'bg-pink-500' : 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${!isRead ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Row: Top Items + Low Stock + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Top Selling Items */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top Selling Items</h3>
            <p className="text-xs text-gray-400">Last 30 days</p>
          </div>
          <div className="divide-y divide-gray-50">
            {TOP_ITEMS.map(item => {
              const img = TOP_ITEM_IMAGES[item.name];
              return (
              <div key={item.rank} className="px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 flex items-center justify-center">
                  {img
                    ? <img src={img} alt={item.name} className="w-full h-full object-cover" />
                    : <span className="text-[11px] font-black text-gray-300">#{item.rank}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">{item.category} · {item.qtySold} sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{item.revenue.toLocaleString()}</p>
                  <p className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${item.trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {item.trend >= 0 ? '+' : ''}{item.trend}%
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
              <p className="text-xs text-gray-400">{LOW_STOCK_ALERTS.length} items need attention</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="divide-y divide-gray-50">
            {LOW_STOCK_ALERTS.map(s => {
              const pct = Math.round((s.current / s.threshold) * 100);
              const critical = pct < 40;
              return (
                <div key={s.item} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.item}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${critical ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      {critical ? 'Critical' : 'Low'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${critical ? 'bg-red-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 w-20 text-right shrink-0">
                      {s.current}{s.unit} / {s.threshold}{s.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions + Slow Movers */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Add Item',      icon: Plus,     color: 'bg-pink-50 text-pink-700 hover:bg-pink-100'    },
                { label: 'View Orders',   icon: ShoppingBag, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
                { label: 'Print QR',      icon: QrCode,   color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'    },
                { label: 'Reports',       icon: FileText,  color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                { label: 'Inventory',     icon: Package,  color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                { label: 'Staff',         icon: Users,    color: 'bg-gray-50 text-gray-700 hover:bg-gray-100'    },
              ].map(a => (
                <button key={a.label} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${a.color}`}>
                  <a.icon className="w-4 h-4" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slow Movers */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex-1">
            <h3 className="font-semibold text-gray-900 mb-3">Slow-Moving Items</h3>
            <div className="space-y-3">
              {SLOW_ITEMS.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.qtySold} sold · {s.lastSold}</p>
                  </div>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{s.category}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
