import { useState } from 'react';
import {
  Search, Star, Phone, Mail, Calendar, ShoppingBag,
  TrendingUp, Tag, X, MessageSquare, Heart, ChevronRight
} from 'lucide-react';
import { ADMIN_CUSTOMERS, AdminCustomer } from './adminMockData';

const TAG_COLORS: Record<string, string> = {
  VIP:          'bg-violet-100 text-violet-700 border-violet-200',
  Regular:      'bg-blue-100 text-blue-700 border-blue-200',
  New:          'bg-emerald-100 text-emerald-700 border-emerald-200',
  Inactive:     'bg-gray-100 text-gray-500 border-gray-200',
  'Food Lover': 'bg-orange-100 text-orange-700 border-orange-200',
};

const TIER_CONFIG: Record<string, { color: string; bg: string }> = {
  Bronze:   { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'   },
  Silver:   { color: 'text-gray-600',    bg: 'bg-gray-50 border-gray-300'     },
  Gold:     { color: 'text-yellow-600',  bg: 'bg-yellow-50 border-yellow-300' },
  Platinum: { color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200' },
};

const ALL_TAGS = ['All', 'VIP', 'Regular', 'New', 'Food Lover', 'Inactive'];

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  const colors = ['bg-pink-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-orange-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
      ))}
      <span className="text-xs text-gray-500 ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

export default function AdminCustomers() {
  const [customers] = useState<AdminCustomer[]>(ADMIN_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('All');
  const [selected, setSelected] = useState<AdminCustomer | null>(customers[0]);
  const [profileTab, setProfileTab] = useState<'overview' | 'visits' | 'feedback'>('overview');

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    const matchTag = tagFilter === 'All' || c.tags.includes(tagFilter);
    return matchSearch && matchTag;
  });

  return (
    <div className="flex gap-0 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Customer List ─────────────────────────────────────────────── */}
      <div className="w-[340px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Customers</h2>
            <span className="text-xs text-gray-400">{customers.length} total</span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ALL_TAGS.map(t => (
              <button key={t} onClick={() => setTagFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${tagFilter === t ? 'bg-pink-400 text-white border-pink-400' : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map(c => (
            <div key={c.id} onClick={() => { setSelected(c); setProfileTab('overview'); }}
              className={`px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-pink-50 border-r-2 border-pink-500' : ''}`}>
              <div className="flex items-center gap-3">
                <Avatar name={c.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${TIER_CONFIG[c.tier]?.bg} ${TIER_CONFIG[c.tier]?.color} shrink-0`}>{c.tier}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={c.rating} />
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-400">{c.totalVisits} visits</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">₹{(c.totalSpend / 1000).toFixed(1)}K</p>
                  <p className="text-[10px] text-gray-400">{c.lastVisit}</p>
                </div>
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {c.tags.map(t => (
                  <span key={t} className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${TAG_COLORS[t] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>{t}</span>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-sm text-gray-400">No customers found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Customer Profile ──────────────────────────────────────────── */}
      {selected ? (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto p-6 space-y-5">

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-5">
                <Avatar name={selected.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${TIER_CONFIG[selected.tier]?.bg} ${TIER_CONFIG[selected.tier]?.color}`}>
                      {selected.tier} · {selected.loyaltyPoints} pts
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selected.tags.map(t => (
                      <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${TAG_COLORS[t]}`}>{t}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{selected.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{selected.phone}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />Member since {selected.joined}</div>
                    <div className="flex items-center gap-2"><ShoppingBag className="w-3.5 h-3.5" />Last visit: {selected.lastVisit}</div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="px-4 py-2 bg-pink-400 text-white rounded-xl text-xs font-medium hover:bg-pink-500 transition-colors">Send Offer</button>
                  <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors">Edit Tags</button>
                </div>
              </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Visits',    value: selected.totalVisits.toString(),                   icon: Calendar,    color: 'bg-blue-50 text-blue-600'    },
                { label: 'Total Spend',     value: `₹${selected.totalSpend.toLocaleString()}`,        icon: TrendingUp,  color: 'bg-emerald-50 text-emerald-600'},
                { label: 'Avg Order Value', value: `₹${selected.avgOrderValue.toLocaleString()}`,     icon: ShoppingBag, color: 'bg-violet-50 text-violet-600' },
                { label: 'Loyalty Points',  value: selected.loyaltyPoints.toLocaleString(),           icon: Star,        color: 'bg-amber-50 text-amber-600'   },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${k.color}`}>
                    <k.icon className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{k.value}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(['overview', 'visits', 'feedback'] as const).map(t => (
                <button key={t} onClick={() => setProfileTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${profileTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t === 'visits' ? `Visit History (${selected.visitHistory.length})` : t === 'feedback' ? `Feedback (${selected.feedback.length})` : 'Overview'}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {profileTab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                {/* Favourite Items */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" /> Favourite Items
                  </h3>
                  <div className="space-y-2">
                    {selected.favoriteItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-black text-gray-300">#{i + 1}</span>
                        <p className="text-sm text-gray-800 font-medium">{item}</p>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Tags */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" /> Customer Tags
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selected.tags.map(t => (
                      <div key={t} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${TAG_COLORS[t]}`}>
                        {t}
                        <button className="hover:opacity-70"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-pink-400 hover:text-pink-600 transition-colors flex items-center justify-center gap-1.5">
                    + Add Tag
                  </button>
                </div>
              </div>
            )}

            {/* Visit History Tab */}
            {profileTab === 'visits' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">Visit History</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Date', 'Order ID', 'Items', 'Channel', 'Amount'].map(h => (
                        <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selected.visitHistory.map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-700 font-medium">{v.date}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.orderId}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">{v.items}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.channel === 'Dine-In' ? 'bg-violet-50 text-violet-700' : v.channel === 'Delivery' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                            {v.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">₹{v.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Feedback Tab */}
            {profileTab === 'feedback' && (
              <div className="space-y-3">
                {selected.feedback.map((fb, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-2">
                      <StarRating value={fb.rating} />
                      <span className="text-xs text-gray-400">{fb.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{fb.comment}</p>
                  </div>
                ))}
                {selected.feedback.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No feedback yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Select a customer to view profile</p>
        </div>
      )}
    </div>
  );
}
