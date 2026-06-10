import { useState } from 'react';
import {
  ChefHat, Clock, Bell, CheckCheck, AlertTriangle,
  Utensils, Package, ArrowLeft, Timer, X, ArrowRight
} from 'lucide-react';

interface KDSItem  { name: string; qty: number; notes?: string; }

interface KDSOrder {
  id: string;
  tableLabel: string;
  orderType: 'dine-in' | 'takeaway';
  items: KDSItem[];
  status: 'new' | 'preparing' | 'ready';
  placedAt: string;
  elapsedMins: number;
  notes?: string;
  customerName?: string;
  itemCount: number;
}

interface PendingConfirm {
  orderId: string;
  orderLabel: string;
  fromLabel: string;
  toLabel: string;
  actionType: 'advance' | 'complete';
  btnLabel: string;
  btnClass: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_KDS: KDSOrder[] = [
  {
    id: '#4521', tableLabel: 'Table 4 · Cozy Hearth', orderType: 'dine-in',
    items: [
      { name: 'Wok-fired Handmade Egg Noodles',          qty: 2 },
      { name: 'Garden Fresh Tossed Salad',                qty: 1, notes: 'No cucumber please' },
      { name: 'Peach Garden Strawberry Matcha Latte',     qty: 2 },
    ],
    status: 'new', placedAt: '11:42 AM', elapsedMins: 2, itemCount: 5,
    notes: '⚠ Allergy: Peanuts — kitchen must verify',
  },
  {
    id: '#4522', tableLabel: 'Table 7 · Marble Counter', orderType: 'dine-in',
    items: [
      { name: 'Sesame Glazed Braised Pork Rice',    qty: 1 },
      { name: 'Signature Chili Soy Dipping Sauce',  qty: 2 },
    ],
    status: 'new', placedAt: '11:39 AM', elapsedMins: 5, itemCount: 3,
  },
  {
    id: '#4519', tableLabel: 'Takeaway #012', orderType: 'takeaway',
    customerName: 'PRIYA M.',
    items: [
      { name: 'Sichuan Sesame Chili Noodles',         qty: 1, notes: 'Extra spicy' },
      { name: 'Sweet Raspberry Infusion Soda',         qty: 1 },
      { name: 'Creamy Potato & Egg Salad Plate',       qty: 1 },
    ],
    status: 'new', placedAt: '11:36 AM', elapsedMins: 8, itemCount: 3,
  },
  {
    id: '#4516', tableLabel: 'Table 2 · Patio Window', orderType: 'dine-in',
    items: [
      { name: 'Strawberry Icing Velvet Cake',      qty: 2 },
      { name: 'Double Matcha Crème Mille Crêpe',   qty: 1 },
      { name: 'Peach Oatmeal Cream Smoothie',      qty: 3 },
    ],
    status: 'preparing', placedAt: '11:30 AM', elapsedMins: 14, itemCount: 6,
  },
  {
    id: '#4514', tableLabel: 'Table 5 · Peachy Corner', orderType: 'dine-in',
    items: [
      { name: 'Golden Peach Morning Oat Bowl',        qty: 2 },
      { name: 'Classic Berry Chia Oats Porridge',     qty: 1, notes: 'No honey' },
    ],
    status: 'preparing', placedAt: '11:28 AM', elapsedMins: 16, itemCount: 3,
  },
  {
    id: '#4510', tableLabel: 'Takeaway #008', orderType: 'takeaway',
    customerName: 'ARJUN S.',
    items: [
      { name: 'Coquette Berry Whipped Princess Cake',  qty: 1 },
      { name: 'Creamy Potato & Egg Salad Plate',       qty: 2 },
    ],
    status: 'preparing', placedAt: '11:22 AM', elapsedMins: 22, itemCount: 3,
  },
  {
    id: '#4507', tableLabel: 'Table 8 · Matcha Bar', orderType: 'dine-in',
    items: [
      { name: 'Saucier Garlic Soft Noodles',              qty: 1 },
      { name: 'Peach Garden Strawberry Matcha Latte',     qty: 1 },
    ],
    status: 'ready', placedAt: '11:15 AM', elapsedMins: 29, itemCount: 2,
  },
  {
    id: '#4504', tableLabel: 'Table 1 · Patio Bloom', orderType: 'dine-in',
    items: [
      { name: 'Diner Golden Egg Potato Croquettes',  qty: 2 },
      { name: 'Garden Fresh Tossed Salad',           qty: 1 },
      { name: 'Sweet Raspberry Infusion Soda',       qty: 2 },
    ],
    status: 'ready', placedAt: '11:10 AM', elapsedMins: 34, itemCount: 5,
  },
  {
    id: '#4501', tableLabel: 'Takeaway #005', orderType: 'takeaway',
    customerName: 'LEILA R.',
    items: [
      { name: 'Sesame Glazed Braised Pork Rice',   qty: 2 },
      { name: 'Peach Oatmeal Cream Smoothie',      qty: 1 },
    ],
    status: 'ready', placedAt: '11:05 AM', elapsedMins: 39, itemCount: 3,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timerColor(mins: number) {
  if (mins >= 20) return 'text-red-600';
  if (mins >= 10) return 'text-amber-600';
  return 'text-emerald-600';
}
function timerBg(mins: number) {
  if (mins >= 20) return 'bg-red-50 border-red-200';
  if (mins >= 10) return 'bg-amber-50 border-amber-200';
  return 'bg-emerald-50 border-emerald-200';
}
function cardBorder(mins: number) {
  if (mins >= 20) return 'border-red-300';
  if (mins >= 10) return 'border-amber-300';
  return 'border-neutral-200';
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onAction,
}: {
  order: KDSOrder;
  onAction: (id: string, type: 'advance' | 'complete') => void;
}) {
  return (
    <div className={`rounded-[18px] border-2 bg-white flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all ${cardBorder(order.elapsedMins)}`}>

      {/* Card Header */}
      <div className="px-3.5 pt-3.5 pb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-mono font-bold text-[#1a1a1a]">{order.id}</span>
            {order.orderType === 'takeaway' && (
              <span className="text-[9px] font-mono bg-[#E8447A]/20 text-[#1a1a1a] border border-[#E8447A]/40 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Takeaway
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#1a1a1a]/60 mt-0.5 font-medium truncate">{order.tableLabel}</p>
          {order.customerName && (
            <p className="text-[10px] text-[#1a1a1a]/40 mt-0.5 uppercase tracking-wider">{order.customerName}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          {/* Timer badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${timerBg(order.elapsedMins)}`}>
            <Timer className={`w-2.5 h-2.5 ${timerColor(order.elapsedMins)}`} />
            <span className={`text-[10px] font-mono font-bold ${timerColor(order.elapsedMins)}`}>{order.elapsedMins}m</span>
          </div>
          <p className="text-[9px] text-[#1a1a1a]/40 mt-1 font-mono">{order.placedAt}</p>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-[rgba(26,26,26,0.08)] px-3.5 py-2.5 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[11px] font-mono text-[#E8447A] w-5 text-right shrink-0 pt-px">{item.qty}×</span>
            <div className="min-w-0">
              <p className="text-[11px] text-[#1a1a1a] leading-snug">{item.name}</p>
              {item.notes && (
                <p className="text-[10px] text-amber-700 italic mt-0.5">↳ {item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Allergy note */}
      {order.notes && (
        <div className="mx-3.5 mb-2.5 flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-2">
          <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-red-700 leading-snug">{order.notes}</p>
        </div>
      )}

      {/* Action button */}
      <div className="px-3.5 pb-3.5">
        {order.status === 'new' && (
          <button
            onClick={() => onAction(order.id, 'advance')}
            className="w-full py-2.5 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 active:scale-[0.98] text-[#FFFFFF] text-[10px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <ChefHat className="w-3.5 h-3.5" />
            Start Preparing
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => onAction(order.id, 'advance')}
            className="w-full py-2.5 rounded-[100px] bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-white text-[10px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => onAction(order.id, 'complete')}
            className="w-full py-2.5 rounded-[100px] bg-[#1BC8C8] hover:bg-[#1BC8C8]/80 active:scale-[0.98] text-white text-[10px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Served ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KDSColumn({
  title, statusColor, dotClass, headerBg, borderClass,
  orders, emptyIcon: EmptyIcon, onAction,
}: {
  title: string; statusColor: string; dotClass: string;
  headerBg: string; borderClass: string;
  orders: KDSOrder[];
  emptyIcon: React.ElementType;
  onAction: (id: string, type: 'advance' | 'complete') => void;
}) {
  return (
    <div className={`flex flex-col border-r ${borderClass} last:border-r-0 min-h-0 overflow-hidden`}>
      {/* Column header */}
      <div className={`px-4 py-3 border-b ${borderClass} flex items-center justify-between ${headerBg} shrink-0`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span className={`text-[11px] font-mono uppercase tracking-widest font-bold ${statusColor}`}>
            {title}
          </span>
        </div>
        <span className={`text-[14px] font-mono font-bold ${statusColor}`}>{orders.length}</span>
      </div>
      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-[#FFFFFF]/60">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <EmptyIcon className="w-8 h-8 text-[#1a1a1a]/20 mb-3" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#1a1a1a]/30">No orders</p>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard key={order.id} order={order} onAction={onAction} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KitchenDisplaySystem({ onExit }: { onExit: () => void }) {
  const [orders, setOrders]           = useState<KDSOrder[]>(MOCK_KDS);
  const [pendingConfirm, setPending]  = useState<PendingConfirm | null>(null);

  const newOrders      = orders.filter(o => o.status === 'new');
  const preparingOrders= orders.filter(o => o.status === 'preparing');
  const readyOrders    = orders.filter(o => o.status === 'ready');
  const totalItems     = orders.reduce((s, o) => s + o.itemCount, 0);

  // Called by card buttons — builds the confirmation state
  const requestAction = (id: string, type: 'advance' | 'complete') => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    if (type === 'advance' && order.status === 'new') {
      setPending({
        orderId: id,
        orderLabel: `${order.id} · ${order.tableLabel}`,
        fromLabel: 'New Orders',
        toLabel: 'Preparing',
        actionType: 'advance',
        btnLabel: 'Move to Preparing',
        btnClass: 'bg-blue-600 hover:bg-blue-500',
      });
    } else if (type === 'advance' && order.status === 'preparing') {
      setPending({
        orderId: id,
        orderLabel: `${order.id} · ${order.tableLabel}`,
        fromLabel: 'Preparing',
        toLabel: 'Ready to Serve',
        actionType: 'advance',
        btnLabel: 'Mark as Ready',
        btnClass: 'bg-amber-500 hover:bg-amber-400',
      });
    } else if (type === 'complete') {
      setPending({
        orderId: id,
        orderLabel: `${order.id} · ${order.tableLabel}`,
        fromLabel: 'Ready to Serve',
        toLabel: 'Served',
        actionType: 'complete',
        btnLabel: 'Mark as Served',
        btnClass: 'bg-emerald-600 hover:bg-emerald-500',
      });
    }
  };

  // Called when the user confirms the modal
  const confirmAction = () => {
    if (!pendingConfirm) return;
    const { orderId, actionType } = pendingConfirm;
    if (actionType === 'advance') {
      setOrders(prev =>
        prev.map(o => {
          if (o.id !== orderId) return o;
          const next: KDSOrder['status'] = o.status === 'new' ? 'preparing' : 'ready';
          return { ...o, status: next };
        })
      );
    } else {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
    setPending(null);
  };

  return (
    <div className="h-screen bg-[#FFFFFF] text-[#1a1a1a] flex flex-col font-sans overflow-hidden">

      {/* Top Bar */}
      <div className="border-b border-[rgba(26,26,26,0.12)] px-4 md:px-6 py-3 flex items-center justify-between bg-[#1a1a1a] shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8447A] flex items-center justify-center shrink-0">
            <ChefHat className="w-4 h-4 text-[#1a1a1a]" />
          </div>
          <div>
            <h1 className="text-[13px] font-barlow font-black uppercase tracking-[0.15em] text-[#FFFFFF]">Kitchen Display</h1>
            <p className="text-[9px] text-[#FFFFFF]/40 uppercase tracking-widest">SMARTDINE · LIVE KITCHEN VIEW</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            {[
              { label: 'New',   count: newOrders.length,      color: 'text-[#E8447A]',    bg: 'bg-[#E8447A]/15 border-[#E8447A]/40'    },
              { label: 'Prep',  count: preparingOrders.length, color: 'text-amber-400',    bg: 'bg-amber-900/30 border-amber-700/40'    },
              { label: 'Ready', count: readyOrders.length,    color: 'text-[#1BC8C8]',    bg: 'bg-[#1BC8C8]/15 border-[#1BC8C8]/40'   },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${s.bg}`}>
                <span className={`text-[12px] font-mono font-bold ${s.color}`}>{s.count}</span>
                <span className="text-[9px] text-[#FFFFFF]/50 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-[#FFFFFF]/50 border border-[rgba(240,234,210,0.15)] px-2 py-1 rounded">
            <Utensils className="w-3 h-3" />
            <span>{totalItems} items active</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#1BC8C8] border border-[#1BC8C8]/40 bg-[#1BC8C8]/15 px-2.5 py-1 rounded">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1BC8C8] animate-pulse" />
            Live
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-[10px] font-mono text-[#FFFFFF]/50 border border-[rgba(240,234,210,0.15)] px-2.5 py-1.5 rounded hover:border-[#FFFFFF]/40 hover:text-[#FFFFFF] transition-all uppercase tracking-widest cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            Exit
          </button>
        </div>
      </div>

      {/* Timer Legend */}
      <div className="border-b border-[rgba(26,26,26,0.10)] px-4 md:px-6 py-1.5 flex items-center gap-6 bg-[#FFFFFF] shrink-0">
        <span className="text-[9px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest">Timer:</span>
        {[
          { label: '< 10 min — On track', color: 'text-[#1BC8C8]', dot: 'bg-[#1BC8C8]' },
          { label: '10–20 min — Watch',   color: 'text-amber-600', dot: 'bg-amber-500' },
          { label: '> 20 min — Urgent',   color: 'text-red-600',   dot: 'bg-red-500'   },
        ].map(t => (
          <div key={t.label} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
            <span className={`text-[9px] font-mono ${t.color}`}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Three Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden min-h-0">
        <KDSColumn
          title="New Orders"
          statusColor="text-[#E8447A]"
          dotClass="bg-[#E8447A] animate-pulse"
          headerBg="bg-[#E8447A]/15"
          borderClass="border-[#E8447A]/30"
          orders={newOrders}
          emptyIcon={Clock}
          onAction={requestAction}
        />
        <KDSColumn
          title="Preparing"
          statusColor="text-amber-600"
          dotClass="bg-amber-500"
          headerBg="bg-amber-50"
          borderClass="border-amber-200"
          orders={preparingOrders}
          emptyIcon={ChefHat}
          onAction={requestAction}
        />
        <KDSColumn
          title="Ready to Serve"
          statusColor="text-[#1BC8C8]"
          dotClass="bg-[#1BC8C8]"
          headerBg="bg-[#1BC8C8]/10"
          borderClass="border-[#1BC8C8]/25"
          orders={readyOrders}
          emptyIcon={Package}
          onAction={requestAction}
        />
      </div>

      {/* ── Confirmation Modal ────────────────────────────────────────────── */}
      {pendingConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setPending(null)}
        >
          <div className="bg-[#FFFFFF] rounded-[22px] border border-[rgba(26,26,26,0.18)] shadow-2xl p-6 max-w-sm w-full animate-[fadeIn_0.2s_ease-out]">

            {/* Close */}
            <button
              onClick={() => setPending(null)}
              className="absolute top-4 right-4 text-[#1a1a1a]/40 hover:text-[#1a1a1a] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#E8447A]/20 border border-[#E8447A]/40 flex items-center justify-center mb-4">
              <ArrowRight className="w-5 h-5 text-[#1a1a1a]" />
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-barlow font-black uppercase text-[#1a1a1a] mb-1">
              {pendingConfirm.actionType === 'complete' ? 'Mark as Served?' : 'Move Order?'}
            </h3>

            {/* Move description */}
            <div className="flex items-center gap-2 my-3">
              <span className="text-[12px] font-mono font-semibold text-[#1a1a1a] bg-[rgba(26,26,26,0.08)] px-2.5 py-1 rounded-lg">
                {pendingConfirm.fromLabel}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1a1a1a]/40 shrink-0" />
              <span className="text-[12px] font-mono font-semibold text-[#1a1a1a] bg-[rgba(26,26,26,0.08)] px-2.5 py-1 rounded-lg">
                {pendingConfirm.toLabel}
              </span>
            </div>

            {/* Order label */}
            <p className="text-[12px] text-[#1a1a1a]/50 mb-1">
              <span className="font-medium text-[#1a1a1a]">{pendingConfirm.orderLabel}</span>
            </p>

            {pendingConfirm.actionType === 'complete' && (
              <p className="text-[11px] text-[#1a1a1a]/40 mb-4">
                This will remove the order from the board.
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setPending(null)}
                className="flex-1 py-2.5 rounded-xl border border-[rgba(26,26,26,0.18)] text-[12px] font-medium text-[#1a1a1a]/60 hover:bg-[rgba(26,26,26,0.05)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-2.5 rounded-[100px] text-white text-[12px] font-semibold transition-colors cursor-pointer shadow-sm ${pendingConfirm.btnClass}`}
              >
                {pendingConfirm.btnLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
