import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChefHat, Clock, Bell, CheckCheck, AlertTriangle, Utensils, Package, ArrowLeft,
  Timer, X, ArrowRight, Volume2, VolumeX, Loader2, LogOut,
} from 'lucide-react';
import { useKdsQueue, useUpdateKdsItemStatus } from '@/hooks/useKds';
import { useLogout } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import type { KdsOrderDto, OrderItemStatus } from '@/lib/dto/orders';

// ── Audio chime via Web Audio (no external file) ─────────────────────────────
function useChime() {
  const ctxRef = useRef<AudioContext | null>(null);
  return () => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // audio disabled / autoplay blocked — silent
    }
  };
}

// ── Visual helpers ───────────────────────────────────────────────────────────
function ageMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
}

function timerColor(secs: number) {
  const m = ageMinutes(secs);
  if (m >= 20) return 'text-red-600';
  if (m >= 10) return 'text-amber-600';
  return 'text-emerald-600';
}
function timerBg(secs: number) {
  const m = ageMinutes(secs);
  if (m >= 20) return 'bg-red-50 border-red-200';
  if (m >= 10) return 'bg-amber-50 border-amber-200';
  return 'bg-emerald-50 border-emerald-200';
}
function cardBorder(secs: number) {
  const m = ageMinutes(secs);
  if (m >= 20) return 'border-red-300';
  if (m >= 10) return 'border-amber-300';
  return 'border-neutral-200';
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface PendingConfirm {
  orderId: string;
  itemId?: string;
  orderLabel: string;
  fromLabel: string;
  toLabel: string;
  status: OrderItemStatus;
  bulk: boolean; // if true, transition every item on the order at once
  btnLabel: string;
  btnClass: string;
}

function OrderCard({
  order,
  onAdvance,
  onComplete,
}: {
  order: KdsOrderDto;
  onAdvance: () => void;
  onComplete: () => void;
}) {
  const allReady = order.items.every((i) => i.status === 'ready');
  const anyPreparing = order.items.some((i) => i.status === 'preparing');
  const anyPending = order.items.some((i) => i.status === 'pending' || i.status === 'accepted');

  const label = anyPending && !anyPreparing && !allReady
    ? 'Start Preparing'
    : !allReady
    ? 'Mark Ready'
    : 'Mark Served';

  const Icon = anyPending && !anyPreparing && !allReady ? ChefHat : !allReady ? Bell : CheckCheck;

  const btnClass = !allReady
    ? anyPreparing
      ? 'bg-amber-500 hover:bg-amber-400 text-white'
      : 'bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-white'
    : 'bg-[#1BC8C8] hover:bg-[#1BC8C8]/80 text-white';

  const onClick = allReady ? onComplete : onAdvance;

  return (
    <div className={`rounded-[18px] border-2 bg-white flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all ${cardBorder(order.ageSeconds)}`}>
      {/* Header */}
      <div className="px-3.5 pt-3.5 pb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-mono font-bold text-[#1a1a1a]">{order.orderNumber}</span>
            {order.channel === 'window' && (
              <span className="text-[9px] font-mono bg-[#E8447A]/20 text-[#1a1a1a] border border-[#E8447A]/40 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Window
              </span>
            )}
            {order.channel === 'assisted' && (
              <span className="text-[9px] font-mono bg-orange-100 text-orange-800 border border-orange-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Assisted
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#1a1a1a]/60 mt-0.5 font-medium truncate">
            {order.windowToken ?? (order.tableId ? `Table` : 'Counter')}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${timerBg(order.ageSeconds)}`}>
            <Timer className={`w-2.5 h-2.5 ${timerColor(order.ageSeconds)}`} />
            <span className={`text-[10px] font-mono font-bold ${timerColor(order.ageSeconds)}`}>{ageMinutes(order.ageSeconds)}m</span>
          </div>
          <p className="text-[9px] text-[#1a1a1a]/40 mt-1 font-mono">{fmtTime(order.createdAt)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-[rgba(26,26,26,0.08)] px-3.5 py-2.5 space-y-1.5">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <span className="text-[11px] font-mono text-[#E8447A] w-5 text-right shrink-0 pt-px">{item.qty}×</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[#1a1a1a] leading-snug">
                {item.name}
                {item.variantName && <span className="text-[#1a1a1a]/40"> · {item.variantName}</span>}
              </p>
              {item.modifiers.length > 0 && (
                <p className="text-[10px] text-[#1a1a1a]/50 leading-snug">{item.modifiers.join(', ')}</p>
              )}
              {item.notes && (
                <p className="text-[10px] text-amber-700 italic mt-0.5">↳ {item.notes}</p>
              )}
            </div>
            <span className="text-[8px] uppercase font-bold tracking-wider text-[#1a1a1a]/30">{item.status}</span>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="px-3.5 pb-3.5">
        <button
          onClick={onClick}
          className={`w-full py-2.5 rounded-[100px] active:scale-[0.98] text-[10px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${btnClass}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      </div>
    </div>
  );
}

function KDSColumn({
  title, statusColor, dotClass, headerBg, borderClass,
  orders, emptyIcon: EmptyIcon, onAdvance, onComplete,
}: {
  title: string; statusColor: string; dotClass: string;
  headerBg: string; borderClass: string;
  orders: KdsOrderDto[];
  emptyIcon: React.ElementType;
  onAdvance: (o: KdsOrderDto) => void;
  onComplete: (o: KdsOrderDto) => void;
}) {
  return (
    <div className={`flex flex-col border-r ${borderClass} last:border-r-0 min-h-0 overflow-hidden`}>
      <div className={`px-4 py-3 border-b ${borderClass} flex items-center justify-between ${headerBg} shrink-0`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span className={`text-[11px] font-mono uppercase tracking-widest font-bold ${statusColor}`}>{title}</span>
        </div>
        <span className={`text-[14px] font-mono font-bold ${statusColor}`}>{orders.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-[#FFFFFF]/60">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <EmptyIcon className="w-8 h-8 text-[#1a1a1a]/20 mb-3" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#1a1a1a]/30">No orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAdvance={() => onAdvance(order)}
              onComplete={() => onComplete(order)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function KitchenDisplaySystem({ onExit }: { onExit: () => void }) {
  const logoutMutation = useLogout();
  const qc = useQueryClient();
  const [station, setStation] = useState<string | undefined>(undefined);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [pendingConfirm, setPending] = useState<PendingConfirm | null>(null);

  const { data: orders = [], isLoading } = useKdsQueue(station);
  const updateStatus = useUpdateKdsItemStatus();
  const chime = useChime();

  // Detect all stations present (for the selector)
  const stations = useMemo(() => {
    const set = new Set<string>();
    for (const o of orders) for (const i of o.items) if (i.station) set.add(i.station);
    return Array.from(set).sort();
  }, [orders]);

  // Real-time updates + audio alert on new order
  const seenIdsRef = useRef<Set<string>>(new Set(orders.map((o) => o.id)));
  useEffect(() => {
    const seen = seenIdsRef.current;
    for (const o of orders) {
      if (!seen.has(o.id)) {
        seen.add(o.id);
        if (audioEnabled && seen.size > 1) chime(); // skip chime on initial load
      }
    }
  }, [orders, audioEnabled, chime]);

  useSocket('/kds', {
    'order:new': () => {
      qc.invalidateQueries({ queryKey: ['kds'] });
    },
    'order:updated': () => qc.invalidateQueries({ queryKey: ['kds'] }),
    'order:item_status_changed': () => qc.invalidateQueries({ queryKey: ['kds'] }),
    'order:cancelled': () => qc.invalidateQueries({ queryKey: ['kds'] }),
  });

  const newOrders = orders.filter((o) => o.items.every((i) => i.status === 'pending' || i.status === 'accepted') && o.items.some((i) => i.status !== 'preparing' && i.status !== 'ready'));
  const preparingOrders = orders.filter((o) => o.items.some((i) => i.status === 'preparing') && !o.items.every((i) => i.status === 'ready' || i.status === 'cancelled'));
  const readyOrders = orders.filter((o) => o.items.length > 0 && o.items.every((i) => i.status === 'ready' || i.status === 'cancelled') && o.items.some((i) => i.status === 'ready'));

  const totalItems = orders.reduce((s, o) => s + o.items.length, 0);

  function requestAdvance(o: KdsOrderDto) {
    const anyPending = o.items.some((i) => i.status === 'pending' || i.status === 'accepted');
    const next: OrderItemStatus = anyPending ? 'preparing' : 'ready';
    setPending({
      orderId: o.id,
      orderLabel: `${o.orderNumber} · ${o.windowToken ?? (o.tableId ? 'Table' : 'Counter')}`,
      fromLabel: anyPending ? 'New' : 'Preparing',
      toLabel: anyPending ? 'Preparing' : 'Ready',
      status: next,
      bulk: true,
      btnLabel: anyPending ? 'Move to Preparing' : 'Mark as Ready',
      btnClass: anyPending ? 'bg-blue-600 hover:bg-blue-500' : 'bg-amber-500 hover:bg-amber-400',
    });
  }

  function requestComplete(o: KdsOrderDto) {
    setPending({
      orderId: o.id,
      orderLabel: `${o.orderNumber} · ${o.windowToken ?? (o.tableId ? 'Table' : 'Counter')}`,
      fromLabel: 'Ready',
      toLabel: 'Served',
      status: 'served',
      bulk: true,
      btnLabel: 'Mark as Served',
      btnClass: 'bg-emerald-600 hover:bg-emerald-500',
    });
  }

  async function confirmAction() {
    if (!pendingConfirm) return;
    const o = orders.find((x) => x.id === pendingConfirm.orderId);
    if (!o) return;

    if (pendingConfirm.bulk) {
      // Transition every applicable item to the next state.
      const applicable = o.items.filter((i) => {
        if (pendingConfirm.status === 'preparing') return i.status === 'pending' || i.status === 'accepted';
        if (pendingConfirm.status === 'ready') return i.status === 'preparing' || i.status === 'accepted' || i.status === 'pending';
        if (pendingConfirm.status === 'served') return i.status === 'ready';
        return false;
      });
      await Promise.all(
        applicable.map((i) =>
          updateStatus.mutateAsync({
            orderId: o.id,
            itemId: i.id,
            status: pendingConfirm.status,
            station: i.station,
          }),
        ),
      );
    } else if (pendingConfirm.itemId) {
      await updateStatus.mutateAsync({
        orderId: o.id,
        itemId: pendingConfirm.itemId,
        status: pendingConfirm.status,
      });
    }
    setPending(null);
  }

  return (
    <div className="h-screen bg-[#FFFFFF] text-[#1a1a1a] flex flex-col font-sans overflow-hidden">
      {/* Top Bar */}
      <div className="border-b border-[rgba(26,26,26,0.12)] px-4 md:px-6 py-3 flex items-center justify-between bg-[#1a1a1a] shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8447A] flex items-center justify-center shrink-0">
            <ChefHat className="w-4 h-4 text-[#1a1a1a]" />
          </div>
          <div>
            <h1 className="text-[13px] font-black uppercase tracking-[0.15em] text-[#FFFFFF]">Kitchen Display</h1>
            <p className="text-[9px] text-[#FFFFFF]/40 uppercase tracking-widest">SMARTDINE · LIVE KITCHEN VIEW</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Station picker */}
          <select
            value={station ?? ''}
            onChange={(e) => setStation(e.target.value || undefined)}
            className="bg-[rgba(255,255,255,0.05)] border border-[rgba(240,234,210,0.15)] text-[#FFFFFF]/80 rounded-lg text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 hover:border-[#FFFFFF]/40 transition-colors focus:outline-none"
          >
            <option value="">ALL STATIONS</option>
            {stations.map((s) => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>

          {/* Stats pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            {[
              { label: 'New', count: newOrders.length, color: 'text-[#E8447A]', bg: 'bg-[#E8447A]/15 border-[#E8447A]/40' },
              { label: 'Prep', count: preparingOrders.length, color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-700/40' },
              { label: 'Ready', count: readyOrders.length, color: 'text-[#1BC8C8]', bg: 'bg-[#1BC8C8]/15 border-[#1BC8C8]/40' },
            ].map((s) => (
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

          <button
            onClick={() => setAudioEnabled((v) => !v)}
            title={audioEnabled ? 'Mute alerts' : 'Unmute alerts'}
            className="flex items-center gap-1.5 text-[10px] text-[#FFFFFF]/50 border border-[rgba(240,234,210,0.15)] px-2 py-1 rounded hover:border-[#FFFFFF]/40 hover:text-[#FFFFFF] transition-all"
          >
            {audioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>

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
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 text-[10px] font-mono text-[#E8447A]/70 border border-[#E8447A]/20 px-2.5 py-1.5 rounded hover:border-[#E8447A]/60 hover:text-[#E8447A] transition-all uppercase tracking-widest cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Timer Legend */}
      <div className="border-b border-[rgba(26,26,26,0.10)] px-4 md:px-6 py-1.5 flex items-center gap-6 bg-[#FFFFFF] shrink-0">
        <span className="text-[9px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest">Timer:</span>
        {[
          { label: '< 10 min — On track', color: 'text-[#1BC8C8]', dot: 'bg-[#1BC8C8]' },
          { label: '10–20 min — Watch', color: 'text-amber-600', dot: 'bg-amber-500' },
          { label: '> 20 min — Urgent', color: 'text-red-600', dot: 'bg-red-500' },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
            <span className={`text-[9px] font-mono ${t.color}`}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Three Columns */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#1a1a1a]/40 text-sm inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading kitchen queue…
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden min-h-0">
          <KDSColumn
            title="New Orders"
            statusColor="text-[#E8447A]"
            dotClass="bg-[#E8447A] animate-pulse"
            headerBg="bg-[#E8447A]/15"
            borderClass="border-[#E8447A]/30"
            orders={newOrders}
            emptyIcon={Clock}
            onAdvance={requestAdvance}
            onComplete={requestComplete}
          />
          <KDSColumn
            title="Preparing"
            statusColor="text-amber-600"
            dotClass="bg-amber-500"
            headerBg="bg-amber-50"
            borderClass="border-amber-200"
            orders={preparingOrders}
            emptyIcon={ChefHat}
            onAdvance={requestAdvance}
            onComplete={requestComplete}
          />
          <KDSColumn
            title="Ready to Serve"
            statusColor="text-[#1BC8C8]"
            dotClass="bg-[#1BC8C8]"
            headerBg="bg-[#1BC8C8]/10"
            borderClass="border-[#1BC8C8]/25"
            orders={readyOrders}
            emptyIcon={Package}
            onAdvance={requestAdvance}
            onComplete={requestComplete}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setPending(null)}
        >
          <div className="bg-[#FFFFFF] rounded-[22px] border border-[rgba(26,26,26,0.18)] shadow-2xl p-6 max-w-sm w-full animate-[fadeIn_0.2s_ease-out] relative">
            <button
              onClick={() => setPending(null)}
              className="absolute top-4 right-4 text-[#1a1a1a]/40 hover:text-[#1a1a1a] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#E8447A]/20 border border-[#E8447A]/40 flex items-center justify-center mb-4">
              {pendingConfirm.status === 'served' ? (
                <CheckCheck className="w-5 h-5 text-[#1a1a1a]" />
              ) : (
                <ArrowRight className="w-5 h-5 text-[#1a1a1a]" />
              )}
            </div>

            <h3 className="text-[15px] font-black uppercase text-[#1a1a1a] mb-1">
              {pendingConfirm.status === 'served' ? 'Mark as Served?' : 'Move Order?'}
            </h3>

            <div className="flex items-center gap-2 my-3">
              <span className="text-[12px] font-mono font-semibold text-[#1a1a1a] bg-[rgba(26,26,26,0.08)] px-2.5 py-1 rounded-lg">
                {pendingConfirm.fromLabel}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1a1a1a]/40 shrink-0" />
              <span className="text-[12px] font-mono font-semibold text-[#1a1a1a] bg-[rgba(26,26,26,0.08)] px-2.5 py-1 rounded-lg">
                {pendingConfirm.toLabel}
              </span>
            </div>

            <p className="text-[12px] text-[#1a1a1a]/50 mb-1">
              <span className="font-medium text-[#1a1a1a]">{pendingConfirm.orderLabel}</span>
            </p>

            <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 mt-3 text-[10px] text-amber-700">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              This transitions every applicable item on the order.
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setPending(null)}
                className="flex-1 py-2.5 rounded-xl border border-[rgba(26,26,26,0.18)] text-[12px] font-medium text-[#1a1a1a]/60 hover:bg-[rgba(26,26,26,0.05)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={updateStatus.isPending}
                className={`flex-1 py-2.5 rounded-[100px] text-white text-[12px] font-semibold transition-colors cursor-pointer shadow-sm inline-flex items-center justify-center gap-2 ${pendingConfirm.btnClass} disabled:opacity-50`}
              >
                {updateStatus.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {pendingConfirm.btnLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
