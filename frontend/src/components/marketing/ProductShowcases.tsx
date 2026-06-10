import { useState } from 'react';
import {
  QrCode, ChefHat, BarChart3, LayoutDashboard,
  Star, Plus, Minus, ShoppingBag, Check,
  Timer, Bell, TrendingUp, Users, Receipt,
  ArrowRight, ChevronRight, Leaf
} from 'lucide-react';
import cakeImg from '../../assets/images/cake.jpg';
import saladImg from '../../assets/images/salad.jpg';
import noodlesImg from '../../assets/images/noodles.jpg';
import oatsImg from '../../assets/images/oats.jpg';

// ─── Decorative SVGs (same language as existing site) ────────────────────────

const Sparkle4 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 26 26" className={className} fill="currentColor" aria-hidden>
    <path d="M13 0 L14.6 11.4 L26 13 L14.6 14.6 L13 26 L11.4 14.6 L0 13 L11.4 11.4 Z" />
  </svg>
);
const DoodleLeaf = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 26 44" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M13 42 Q4 28 7 14 C11 3 21 5 21 16 Q20 29 13 42Z" />
    <line x1="13" y1="42" x2="13" y2="15" />
    <line x1="13" y1="24" x2="18" y2="19" />
    <line x1="13" y1="32" x2="9"  y2="27" />
  </svg>
);
const DoodleDots = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 38" className={className} fill="currentColor" aria-hidden>
    <circle cx="8"  cy="10" r="4" /><circle cx="26" cy="6"  r="3" />
    <circle cx="44" cy="12" r="4.5" /><circle cx="58" cy="7" r="2.5" />
    <circle cx="16" cy="28" r="3" /><circle cx="36" cy="30" r="4" /><circle cx="52" cy="26" r="2.5" />
  </svg>
);
const FoodCircle = ({ src, className }: { src: string; className?: string }) => (
  <div className={`rounded-full overflow-hidden shadow-md border-2 border-pink-100 pointer-events-none select-none ${className}`} aria-hidden>
    <img src={src} alt="" className="w-full h-full object-cover" />
  </div>
);

// ─── Phone frame ─────────────────────────────────────────────────────────────

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 260, height: 530 }}>
      {/* Phone body */}
      <div className="absolute inset-0 rounded-[36px] bg-neutral-900 border-[7px] border-neutral-800 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-neutral-900 rounded-b-2xl z-20" />
        {/* Screen */}
        <div className="absolute inset-0 top-5 bg-neutral-50 overflow-hidden">
          {children}
        </div>
      </div>
      {/* Side button */}
      <div className="absolute right-[-9px] top-24 w-1.5 h-10 bg-neutral-700 rounded-r-full" />
      <div className="absolute left-[-9px] top-20 w-1.5 h-7 bg-neutral-700 rounded-l-full" />
      <div className="absolute left-[-9px] top-32 w-1.5 h-7 bg-neutral-700 rounded-l-full" />
    </div>
  );
}

// ─── Browser frame ────────────────────────────────────────────────────────────

function BrowserFrame({ children, url = 'app.smartdine.com' }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="rounded-xl bg-white border border-neutral-200 shadow-xl overflow-hidden">
      {/* Chrome */}
      <div className="bg-neutral-100 border-b border-neutral-200 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] font-mono text-neutral-400 border border-neutral-200 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Tablet frame ─────────────────────────────────────────────────────────────

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ width: '100%', maxWidth: 480 }}>
      <div className="rounded-[20px] bg-neutral-800 border-[6px] border-neutral-700 shadow-2xl overflow-hidden aspect-[4/3]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-neutral-700 rounded-full mb-2 z-10" />
        <div className="absolute inset-0 bg-white overflow-hidden rounded-[14px]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── QR Ordering Phone Mockup ─────────────────────────────────────────────────

function QROrderingMockup() {
  const [activeTab, setActiveTab] = useState('Sweets');
  const [cartCount, setCartCount] = useState(2);

  const items = [
    { name: 'Strawberry Velvet Cake', price: 565, rating: 4.9, img: cakeImg, tag: 'Bestseller', veg: true },
    { name: 'Garden Fresh Salad',     price: 789, rating: 4.6, img: saladImg, tag: 'Organic',    veg: true },
    { name: 'Sesame Chili Noodles',   price: 955, rating: 4.8, img: noodlesImg, tag: 'Spicy',   veg: false },
  ];

  const displayItems = activeTab === 'Sweets'
    ? items.slice(0, 2)
    : activeTab === 'Mains'
      ? [items[2]]
      : items.slice(0, 2);

  return (
    <PhoneFrame>
      <div className="h-full flex flex-col text-[9px]">
        {/* App header */}
        <div className="bg-white border-b border-neutral-100 px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-neutral-900 tracking-wider">SMARTDINE</p>
            <p className="text-[8px] text-neutral-400 font-mono">Table 4 · Rose Alcove</p>
          </div>
          <button
            onClick={() => setCartCount(c => c + 1)}
            className="relative"
          >
            <ShoppingBag className="w-4 h-4 text-neutral-700" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink-600 text-white rounded-full text-[7px] font-bold flex items-center justify-center">{cartCount}</span>
          </button>
        </div>

        {/* Category tabs */}
        <div className="bg-white px-2 py-1.5 flex gap-1.5 border-b border-neutral-100 overflow-x-auto scrollbar-none">
          {['All', 'Sweets', 'Mains', 'Drinks'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-[8px] font-medium transition-all
                ${activeTab === t ? 'bg-pink-600 text-white' : 'bg-neutral-100 text-neutral-500'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-neutral-50">
          {displayItems.map((item, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-sm">
              <div className="relative h-20 overflow-hidden">
                <img src={item.img} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-1.5 left-1.5 bg-pink-600 text-white text-[7px] font-mono px-1.5 py-0.5 rounded-full">{item.tag}</span>
                {item.veg && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white border border-emerald-500 rounded flex items-center justify-center">
                    <Leaf className="w-2 h-2 text-emerald-600" />
                  </span>
                )}
              </div>
              <div className="p-2 flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold text-neutral-900 leading-snug truncate">{item.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-[7px] text-neutral-500">{item.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-neutral-900">₹{item.price}</span>
                  <button
                    onClick={() => setCartCount(c => c + 1)}
                    className="w-5 h-5 rounded-full bg-pink-600 flex items-center justify-center shadow-sm"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart bar */}
        {cartCount > 0 && (
          <div className="bg-pink-600 mx-2 mb-2 rounded-xl px-3 py-2 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-white/20 text-[7px] font-bold text-white flex items-center justify-center">{cartCount}</span>
              <span className="text-[9px] text-white font-semibold">View Cart</span>
            </div>
            <span className="text-[9px] text-white font-mono font-bold">₹{(cartCount * 650).toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}

// ─── KDS Monitor Mockup ───────────────────────────────────────────────────────

interface KDSMockOrder {
  id: string; table: string; items: string[]; mins: number;
  status: 'new' | 'preparing' | 'ready'; urgent?: boolean;
}

function KDSMockup() {
  const [orders, setOrders] = useState<KDSMockOrder[]>([
    { id: '#4521', table: 'T-4 · Hearth',    items: ['2× Wok Noodles', '1× Salad'],      mins: 3,  status: 'new' },
    { id: '#4519', table: 'Takeaway #012',    items: ['1× Pork Rice', '1× Soda'],         mins: 8,  status: 'new', urgent: true },
    { id: '#4516', table: 'T-2 · Window',     items: ['2× Velvet Cake', '3× Smoothie'],   mins: 14, status: 'preparing' },
    { id: '#4507', table: 'T-8 · Bar',        items: ['1× Garlic Noodles', '1× Matcha'],  mins: 28, status: 'ready' },
  ]);

  const advance = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      if (o.status === 'new') return { ...o, status: 'preparing' as const };
      if (o.status === 'preparing') return { ...o, status: 'ready' as const };
      return o;
    }).filter(o => !(o.id === id && o.status === 'ready')));
  };

  const cols: { status: 'new' | 'preparing' | 'ready'; label: string; color: string; dot: string; btn: string; btnText: string }[] = [
    { status: 'new',      label: 'New',      color: 'text-blue-400',    dot: 'bg-blue-400 animate-pulse', btn: 'bg-blue-700 hover:bg-blue-600',    btnText: 'Start' },
    { status: 'preparing',label: 'Prep',     color: 'text-amber-400',   dot: 'bg-amber-400',              btn: 'bg-amber-700 hover:bg-amber-600',   btnText: 'Ready' },
    { status: 'ready',    label: 'Ready',    color: 'text-emerald-400', dot: 'bg-emerald-400',            btn: 'bg-emerald-800 hover:bg-emerald-700',btnText: 'Served' },
  ];

  return (
    <BrowserFrame url="kitchen.smartdine.com · Live KDS">
      <div className="bg-neutral-950 p-3 h-80 overflow-hidden flex flex-col">
        {/* KDS header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-pink-600 flex items-center justify-center">
              <ChefHat className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-white uppercase tracking-wider">Kitchen Display</span>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] font-mono text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Three columns */}
        <div className="flex-1 grid grid-cols-3 gap-2 overflow-hidden">
          {cols.map(col => {
            const colOrders = orders.filter(o => o.status === col.status);
            return (
              <div key={col.status} className="flex flex-col border border-neutral-800 rounded-lg overflow-hidden">
                <div className="px-2 py-1.5 flex items-center justify-between bg-neutral-900/80">
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    <span className={`text-[8px] font-mono font-bold ${col.color}`}>{col.label}</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold ${col.color}`}>{colOrders.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 bg-neutral-950/50">
                  {colOrders.length === 0 && (
                    <div className="flex items-center justify-center h-12 text-neutral-700">
                      <ChefHat className="w-4 h-4" />
                    </div>
                  )}
                  {colOrders.map(o => (
                    <div key={o.id} className={`rounded-lg border bg-neutral-900 p-2 ${o.urgent ? 'border-red-800/60' : 'border-neutral-800'}`}>
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-[8px] font-mono font-bold text-white">{o.id}</span>
                        <span className={`text-[8px] font-mono font-bold ${o.mins >= 15 ? 'text-red-400' : o.mins >= 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {o.mins}m
                        </span>
                      </div>
                      <p className="text-[7px] text-neutral-400 mb-1.5">{o.table}</p>
                      {o.items.map((item, i) => (
                        <p key={i} className="text-[7px] text-neutral-300">• {item}</p>
                      ))}
                      <button
                        onClick={() => advance(o.id)}
                        className={`mt-1.5 w-full py-1 rounded text-[7px] font-mono text-white transition-colors ${col.btn}`}
                      >
                        {col.btnText}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─── Analytics Dashboard Mockup ───────────────────────────────────────────────

function AnalyticsMockup() {
  const bars = [84, 92, 75, 98, 120, 154, 138];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxVal = 160;

  return (
    <BrowserFrame url="app.smartdine.com/analytics">
      <div className="bg-neutral-50 p-4 h-72 overflow-hidden">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Revenue', value: '₹1.24L', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Orders', value: '154',     icon: ShoppingBag, color: 'text-blue-600',   bg: 'bg-blue-50'   },
            { label: 'Guests',  value: '312',     icon: Users,       color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Avg Bill',value: '₹806',    icon: Receipt,     color: 'text-pink-600',   bg: 'bg-pink-50'   },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.bg} rounded-xl p-2 text-center border border-neutral-100`}>
                <Icon className={`w-3 h-3 ${s.color} mx-auto mb-1`} />
                <p className={`text-[11px] font-black font-mono ${s.color}`}>{s.value}</p>
                <p className="text-[8px] text-neutral-400 font-mono uppercase">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-3 mb-3">
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-2">Weekly Orders</p>
          <div className="flex items-end gap-1.5 h-16">
            {bars.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-t bg-pink-500 transition-all duration-700"
                  style={{ height: `${(val / maxVal) * 100}%` }}
                />
                <span className="text-[7px] font-mono text-neutral-400">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl border border-neutral-200 p-2">
            <p className="text-[8px] font-mono text-neutral-400 uppercase mb-2">Top Categories</p>
            {[
              { name: 'Sweets & Cakes', pct: 38, color: 'bg-pink-400' },
              { name: 'Mains',          pct: 32, color: 'bg-violet-400' },
              { name: 'Drinks',         pct: 18, color: 'bg-amber-400' },
            ].map(c => (
              <div key={c.name} className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color.replace('bg-', '#').replace('-400', '') }}>
                  <div className={`w-1.5 h-1.5 rounded-full ${c.color}`} />
                </div>
                <div className="flex-1 bg-neutral-100 rounded-full h-1">
                  <div className={`${c.color} h-1 rounded-full transition-all duration-700`} style={{ width: `${c.pct}%` }} />
                </div>
                <span className="text-[7px] font-mono text-neutral-500 w-5">{c.pct}%</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-2">
            <p className="text-[8px] font-mono text-neutral-400 uppercase mb-2">Peak Hours</p>
            {[
              { time: '12 PM', pct: 90, highlight: true },
              { time: '02 PM', pct: 75, highlight: false },
              { time: '07 PM', pct: 85, highlight: false },
            ].map(h => (
              <div key={h.time} className="flex items-center gap-1.5 mb-1">
                <span className="text-[7px] font-mono text-neutral-400 w-8">{h.time}</span>
                <div className="flex-1 bg-neutral-100 rounded-full h-1.5">
                  <div className={`${h.highlight ? 'bg-pink-500' : 'bg-neutral-300'} h-1.5 rounded-full`} style={{ width: `${h.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─── Table Management Tablet Mockup ──────────────────────────────────────────

function TableManagementMockup() {
  const tables = [
    { id: 'w1', label: 'T1', capacity: 2, status: 'vacant',        color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
    { id: 'w2', label: 'T2', capacity: 2, status: 'seated',        color: 'bg-blue-100    border-blue-300    text-blue-700'    },
    { id: 'w3', label: 'T3', capacity: 2, status: 'ordered',       color: 'bg-amber-100   border-amber-300   text-amber-700'   },
    { id: 'w4', label: 'T4', capacity: 2, status: 'awaiting-bill', color: 'bg-orange-100  border-orange-300  text-orange-700'  },
    { id: 'm5', label: 'T5', capacity: 4, status: 'ordered',       color: 'bg-amber-100   border-amber-300   text-amber-700'   },
    { id: 'm6', label: 'T6', capacity: 4, status: 'vacant',        color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
    { id: 'm7', label: 'T7', capacity: 4, status: 'seated',        color: 'bg-blue-100    border-blue-300    text-blue-700'    },
    { id: 'm8', label: 'T8', capacity: 4, status: 'cleaning',      color: 'bg-neutral-100 border-neutral-300 text-neutral-500' },
    { id: 'b1', label: 'B1', capacity: 1, status: 'ordered',       color: 'bg-amber-100   border-amber-300   text-amber-700'   },
    { id: 'b2', label: 'B2', capacity: 1, status: 'vacant',        color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
    { id: 'b3', label: 'B3', capacity: 1, status: 'vacant',        color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
    { id: 'p1', label: 'P1', capacity: 2, status: 'awaiting-bill', color: 'bg-orange-100  border-orange-300  text-orange-700'  },
    { id: 'p2', label: 'P2', capacity: 2, status: 'vacant',        color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  ];

  return (
    <TabletFrame>
      <div className="h-full bg-neutral-50 flex flex-col p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-pink-600 flex items-center justify-center">
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-800 uppercase tracking-wider">Floor Manager</span>
          </div>
          <div className="flex gap-2 text-[8px] font-mono">
            <span className="text-emerald-600">6 Vacant</span>
            <span className="text-amber-600">4 Occupied</span>
            <span className="text-orange-600">2 Bill Due</span>
          </div>
        </div>

        {/* Table grid */}
        <div className="grid grid-cols-4 gap-1.5 flex-1">
          {tables.map(t => (
            <div key={t.id} className={`rounded-xl border-2 p-2 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all ${t.color}`}>
              <span className="text-[12px] font-black leading-none">{t.label}</span>
              <span className="text-[6px] font-mono mt-0.5 uppercase">{t.capacity}p</span>
              <span className="text-[6px] mt-0.5 capitalize leading-snug text-center">{t.status.replace('-', ' ')}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { color: 'bg-emerald-400', label: 'Vacant' },
            { color: 'bg-blue-400',    label: 'Seated' },
            { color: 'bg-amber-400',   label: 'Ordered' },
            { color: 'bg-orange-400',  label: 'Bill Due' },
            { color: 'bg-neutral-400', label: 'Cleaning' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
              <span className="text-[7px] font-mono text-neutral-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </TabletFrame>
  );
}

// ─── Showcase section block ────────────────────────────────────────────────────

interface ShowcaseItem {
  id: string;
  badgeText: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: { icon: React.ElementType; text: string }[];
  mockup: React.ReactNode;
  reversed?: boolean;
  bg: string;
}

function ShowcaseBlock({ item, decorations }: { item: ShowcaseItem; decorations?: React.ReactNode }) {
  const content = (
    <div className="flex flex-col justify-center space-y-5 py-8 md:py-0">
      <span className={`text-[10px] font-mono uppercase tracking-[0.25em] ${item.badgeColor} self-start px-3 py-1 rounded-full border border-current/20`}>
        {item.badgeText}
      </span>
      <h3 className="text-4xl md:text-5xl font-display text-neutral-950 leading-tight">
        {item.title}
      </h3>
      <p className="text-[14px] text-neutral-600 font-script leading-relaxed">{item.description}</p>
      <ul className="space-y-2.5">
        {item.bullets.map((b, i) => {
          const Icon = b.icon;
          return (
            <li key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-2.5 h-2.5 text-pink-600" />
              </div>
              <span className="text-[12px] text-neutral-700 leading-snug">{b.text}</span>
            </li>
          );
        })}
      </ul>
      <div>
        <button
          onClick={() => document.getElementById('demo-request')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-pink-600 border-b-2 border-pink-400 hover:border-pink-600 transition-colors pb-0.5 group cursor-pointer"
        >
          See it live
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );

  const mockupBlock = (
    <div className="flex items-center justify-center py-8">
      {item.mockup}
    </div>
  );

  return (
    <section className={`${item.bg} border-b border-pink-100 overflow-hidden relative`}>
      {decorations}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-20 relative z-10">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center`}>
          {item.reversed ? <>{mockupBlock}{content}</> : <>{content}{mockupBlock}</>}
        </div>
      </div>
    </section>
  );
}

// ─── All showcases ─────────────────────────────────────────────────────────────

const SHOWCASES: ShowcaseItem[] = [
  {
    id: 'qr',
    badgeText: 'QR Ordering',
    badgeColor: 'text-pink-600',
    title: 'Customers Order Without Waiting',
    subtitle: 'No app. No queue.',
    description: 'Guests scan a QR code at their table, browse the full menu with photos and descriptions, customise their order, and send it straight to the kitchen — all from their own phone in seconds.',
    bullets: [
      { icon: QrCode,    text: 'No app download — works on any smartphone browser' },
      { icon: Check,     text: 'Live item availability and out-of-stock handling' },
      { icon: Timer,     text: 'Real-time order status updates for the customer' },
      { icon: ShoppingBag, text: 'Takeaway flow with token number and pickup board' },
    ],
    mockup: <QROrderingMockup />,
    bg: 'bg-white',
  },
  {
    id: 'kds',
    badgeText: 'Kitchen Display System',
    badgeColor: 'text-amber-600',
    title: 'Zero Paper. Zero Confusion.',
    subtitle: 'Live kitchen operations.',
    description: "The KDS replaces paper chits with a live, colour-coded display. Orders flow automatically from customer to kitchen the moment they're placed. Urgent alerts, allergy flags, and one-click status updates keep service moving.",
    bullets: [
      { icon: ChefHat,   text: 'Orders appear instantly on kitchen screens' },
      { icon: Bell,      text: 'Urgency colour-coding — green, amber, red by elapsed time' },
      { icon: Check,     text: 'Allergy and special instruction alerts shown prominently' },
      { icon: Timer,     text: 'Dine-in and takeaway orders managed in one view' },
    ],
    mockup: <KDSMockup />,
    reversed: true,
    bg: 'bg-[#FFFDF9]',
  },
  {
    id: 'analytics',
    badgeText: 'Reports & Analytics',
    badgeColor: 'text-indigo-600',
    title: 'Data That Drives Decisions.',
    subtitle: 'Business intelligence, daily.',
    description: 'From daily revenue to peak-hour heat maps and per-dish profitability, SmartDine gives you the insights to optimise your menu, staff your shifts right, and grow revenue — without a spreadsheet in sight.',
    bullets: [
      { icon: TrendingUp, text: 'Revenue trends by day, week, month, and category' },
      { icon: BarChart3,  text: 'Peak hour analysis to plan staffing and prep' },
      { icon: Star,       text: 'Top-performing dishes and slow-movers at a glance' },
      { icon: Receipt,    text: 'One-click export to CSV, PDF, and GST filing format' },
    ],
    mockup: <AnalyticsMockup />,
    bg: 'bg-white',
  },
  {
    id: 'tables',
    badgeText: 'Table Operations',
    badgeColor: 'text-teal-600',
    title: 'Your Floor Plan, Live.',
    subtitle: 'Every table, every status.',
    description: "See every table on your floor in real time — who's seated, what they've ordered, and who needs the bill. Merge tables for large parties, move orders between seats, and send tables to cleaning with a single tap.",
    bullets: [
      { icon: LayoutDashboard, text: '5 table status states: Vacant · Seated · Ordered · Bill Due · Cleaning' },
      { icon: Users,           text: 'Merge and move orders between tables instantly' },
      { icon: Check,           text: 'Server assignment and guest name tracking' },
      { icon: Timer,           text: 'Seated duration timer for every occupied table' },
    ],
    mockup: <TableManagementMockup />,
    reversed: true,
    bg: 'bg-[#FFF5F7]',
  },
];

// Named export: renders only the QR Ordering showcase with full decorations
export function QROrderingSection() {
  const decorations = (
    <>
      {/* Doodles */}
      <DoodleLeaf    className="absolute top-8   right-8  w-16 h-24 text-pink-300 pointer-events-none hidden md:block" />
      <Sparkle4      className="absolute top-10  left-10  w-8  h-8  text-pink-300 pointer-events-none hidden sm:block" />
      <Sparkle4      className="absolute bottom-10 right-12 w-6 h-6  text-pink-300 pointer-events-none hidden sm:block" />
      <DoodleDots    className="absolute bottom-6  left-8   w-36 h-20 text-pink-200 pointer-events-none hidden md:block" />
      <DoodleDots    className="absolute top-8    right-40  w-28 h-16 text-pink-200 pointer-events-none hidden lg:block" />
      {/* Food circles */}
      <FoodCircle src={noodlesImg} className="absolute top-8    left-4 w-24 h-24 hidden xl:block" />
      <FoodCircle src={oatsImg}    className="absolute bottom-8 right-4 w-20 h-20 hidden xl:block" />
    </>
  );
  return <ShowcaseBlock item={SHOWCASES[0]} decorations={decorations} />;
}

export default function ProductShowcases() {
  return (
    <>
      {SHOWCASES.map(s => (
        <ShowcaseBlock key={s.id} item={s} />
      ))}
    </>
  );
}
