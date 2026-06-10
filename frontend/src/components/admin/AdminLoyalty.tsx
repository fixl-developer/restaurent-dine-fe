import { useState } from 'react';
import {
  Star, Gift, Tag, Megaphone, Plus, ToggleRight, ToggleLeft,
  TrendingUp, Users, Award, X, Check, Calendar
} from 'lucide-react';
import {
  LOYALTY_STATS, ADMIN_REWARDS, ADMIN_COUPONS, ADMIN_CAMPAIGNS,
  ADMIN_CUSTOMERS, AdminReward, AdminCoupon, Campaign
} from './adminMockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type LoyaltyTab = 'overview' | 'rewards' | 'coupons' | 'campaigns';

const TIER_CONFIG: Record<string, { color: string; bg: string; min: number }> = {
  Bronze:   { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',   min: 0    },
  Silver:   { color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-300',     min: 300  },
  Gold:     { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-300', min: 700  },
  Platinum: { color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', min: 1200 },
};

const STATUS_PILL: Record<string, string> = {
  Active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Expired:   'bg-gray-50 text-gray-500 border-gray-200',
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Ended:     'bg-gray-50 text-gray-400 border-gray-200',
  Upcoming:  'bg-amber-50 text-amber-700 border-amber-200',
};

function KpiCard({ label, value, sub, icon: Icon, color }:
  { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const tierData = Object.entries(TIER_CONFIG).map(([tier, cfg]) => ({
    tier,
    count: ADMIN_CUSTOMERS.filter(c => c.tier === tier).length,
    ...cfg
  }));
  const chartData = ADMIN_CUSTOMERS.map(c => ({ name: c.name.split(' ')[0], points: c.loyaltyPoints }))
    .sort((a, b) => b.points - a.points).slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Members"    value={LOYALTY_STATS.totalMembers.toString()}       sub={`${LOYALTY_STATS.activeMembers} active`}      icon={Users}      color="bg-pink-50 text-pink-600"    />
        <KpiCard label="Points Issued"    value={LOYALTY_STATS.pointsIssued.toLocaleString()} sub="This month"                                    icon={Star}       color="bg-amber-50 text-amber-600"  />
        <KpiCard label="Points Redeemed" value={LOYALTY_STATS.pointsRedeemed.toLocaleString()} sub={`${LOYALTY_STATS.redemptionRate}% rate`}     icon={Award}      color="bg-violet-50 text-violet-600"/>
        <KpiCard label="Avg Points/Member" value={LOYALTY_STATS.avgPointsPerMember.toString()} sub="Across all members"                          icon={TrendingUp} color="bg-emerald-50 text-emerald-600"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tier breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Member Tier Breakdown</h3>
          <div className="space-y-3">
            {tierData.map(t => (
              <div key={t.tier} className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border w-20 text-center ${t.bg} ${t.color}`}>{t.tier}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(t.count / ADMIN_CUSTOMERS.length) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-700 w-6 text-right">{t.count}</span>
                <span className="text-xs text-gray-400">≥ {t.min} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top members chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Top Members by Points</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number) => [`${v} pts`, 'Points']} />
              <Bar dataKey="points" fill="#ec4899" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Member table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">All Loyalty Members</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Member', 'Tier', 'Points', 'Total Spend', 'Visits', 'Last Visit'].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ADMIN_CUSTOMERS.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).map(c => {
              const t = TIER_CONFIG[c.tier];
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${t.bg} ${t.color}`}>{c.tier}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">{c.loyaltyPoints.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">₹{c.totalSpend.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{c.totalVisits}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.lastVisit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Rewards Tab ───────────────────────────────────────────────────────────────
function RewardsTab() {
  const [rewards, setRewards] = useState<AdminReward[]>(ADMIN_REWARDS);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{rewards.filter(r => r.active).length} active rewards</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Reward
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rewards.map(r => (
          <div key={r.id} className={`bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md ${r.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{r.icon}</div>
                <button onClick={() => setRewards(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x))}>
                  {r.active ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                </button>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">{r.name}</h4>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.description}</p>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                <div className="flex-1 text-center">
                  <p className="text-base font-black text-pink-600">{r.pointsRequired}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Points</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="flex-1 text-center">
                  <p className="text-base font-black text-gray-900">{r.redemptions}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Redeemed</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="flex-1 text-center">
                  <p className="text-xs font-bold text-gray-600">{r.valueType}</p>
                  <p className="text-[10px] text-gray-400">{r.value > 0 ? (r.valueType === 'Discount %' ? `${r.value}%` : `₹${r.value}`) : 'Free'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Coupons Tab ───────────────────────────────────────────────────────────────
function CouponsTab() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>(ADMIN_COUPONS);
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newType, setNewType] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [newMinOrder, setNewMinOrder] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newExpiry, setNewExpiry] = useState('');

  function addCoupon() {
    if (!newCode || !newDiscount) return;
    const c: AdminCoupon = {
      id: `cp${Date.now()}`, code: newCode.toUpperCase(), discount: +newDiscount,
      type: newType, minOrder: +newMinOrder || 0, usageLimit: +newLimit || 100,
      usedCount: 0, validFrom: 'Jun 1', validTo: newExpiry || 'Jun 30',
      status: 'Active', appliesTo: 'All items', createdBy: 'Admin',
    };
    setCoupons(prev => [c, ...prev]);
    setShowForm(false); setNewCode(''); setNewDiscount(''); setNewMinOrder(''); setNewLimit(''); setNewExpiry('');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{coupons.filter(c => c.status === 'Active').length} active coupons</p>
        <button onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-pink-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">New Coupon</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Coupon Code *</label>
              <input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20" className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-pink-400 uppercase" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Discount *</label>
              <div className="flex gap-2">
                <input type="number" value={newDiscount} onChange={e => setNewDiscount(e.target.value)}
                  placeholder="20" className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400" />
                <select value={newType} onChange={e => setNewType(e.target.value as any)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400">
                  <option value="Percentage">%</option>
                  <option value="Fixed">₹</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Min Order (₹)</label>
              <input type="number" value={newMinOrder} onChange={e => setNewMinOrder(e.target.value)}
                placeholder="500" className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Usage Limit</label>
              <input type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)}
                placeholder="100" className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400" />
            </div>
          </div>
          <button onClick={addCoupon} className="w-full py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Create Coupon
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Code', 'Discount', 'Min Order', 'Usage', 'Valid Until', 'Applies To', 'Status', ''].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-gray-900 text-xs">{c.code}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {c.type === 'Percentage' ? `${c.discount}%` : `₹${c.discount}`} off
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">₹{c.minOrder}</td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` }} />
                    </div>
                    <span>{c.usedCount}/{c.usageLimit}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{c.validFrom} – {c.validTo}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.appliesTo}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_PILL[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setCoupons(prev => prev.filter(x => x.id !== c.id))} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Campaigns Tab ─────────────────────────────────────────────────────────────
function CampaignsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{ADMIN_CAMPAIGNS.filter(c => c.status === 'Active').length} active campaigns</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ADMIN_CAMPAIGNS.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{c.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_PILL[c.status]}`}>{c.status}</span>
                </div>
                <p className="text-xs text-gray-400">{c.type} · {c.targetAudience}</p>
              </div>
              <span className="text-sm font-bold text-pink-600">{c.discount}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-gray-100">
              <div>
                <p className="text-base font-black text-gray-900">{c.redemptions}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Redeemed</p>
              </div>
              <div>
                <p className="text-base font-black text-gray-900">₹{(c.revenue / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Revenue</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">{c.startDate}–{c.endDate}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Duration</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminLoyalty() {
  const [tab, setTab] = useState<LoyaltyTab>('overview');
  const tabs: { id: LoyaltyTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',   label: 'Overview',   icon: TrendingUp },
    { id: 'rewards',    label: 'Rewards',    icon: Gift       },
    { id: 'coupons',    label: 'Coupons',    icon: Tag        },
    { id: 'campaigns',  label: 'Campaigns',  icon: Megaphone  },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Loyalty & Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage rewards, coupons, and promotional campaigns</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      <div className="animate-[fadeIn_0.2s_ease-out]">
        {tab === 'overview'  && <OverviewTab />}
        {tab === 'rewards'   && <RewardsTab />}
        {tab === 'coupons'   && <CouponsTab />}
        {tab === 'campaigns' && <CampaignsTab />}
      </div>
    </div>
  );
}
