import { useState } from 'react';
import {
  ArrowLeft, Users, Clock, CheckCircle2, AlertCircle,
  Sparkles, CreditCard, Merge, MoveRight, Scissors,
  X, ChevronRight, Eye, RefreshCw
} from 'lucide-react';

type TableStatus = 'vacant' | 'seated' | 'ordered' | 'awaiting-bill' | 'cleaning';

interface FloorTable {
  id: string;
  number: number;
  label: string;
  zone: string;
  capacity: number;
  shape: 'round' | 'square' | 'rect';
  status: TableStatus;
  customerName?: string;
  serverName?: string;
  seatedMins?: number;
  orderTotal?: number;
  itemCount?: number;
  mergedWith?: string;
}

const FLOOR_TABLES: FloorTable[] = [
  // Window Zone
  { id: 'w1', number: 1, label: 'T1', zone: 'Window', capacity: 2, shape: 'round', status: 'vacant' },
  { id: 'w2', number: 2, label: 'T2', zone: 'Window', capacity: 2, shape: 'round', status: 'seated', customerName: 'BEATRICE LEE', serverName: 'Sophia C.', seatedMins: 8 },
  { id: 'w3', number: 3, label: 'T3', zone: 'Window', capacity: 2, shape: 'round', status: 'ordered', customerName: 'ETHAN HUNT', serverName: 'Mia W.', seatedMins: 22, orderTotal: 22.10, itemCount: 4 },
  { id: 'w4', number: 4, label: 'T4', zone: 'Window', capacity: 2, shape: 'round', status: 'awaiting-bill', customerName: 'ARIA VANCE', serverName: 'Sophia C.', seatedMins: 48, orderTotal: 34.60 },
  // Main Floor
  { id: 'm5', number: 5, label: 'T5', zone: 'Main Floor', capacity: 4, shape: 'square', status: 'ordered', customerName: 'CHLOE GOMEZ', serverName: 'James K.', seatedMins: 31, orderTotal: 56.80, itemCount: 7 },
  { id: 'm6', number: 6, label: 'T6', zone: 'Main Floor', capacity: 4, shape: 'square', status: 'vacant' },
  { id: 'm7', number: 7, label: 'T7', zone: 'Main Floor', capacity: 4, shape: 'square', status: 'seated', customerName: 'LUCAS RIO', serverName: 'Mia W.', seatedMins: 5 },
  { id: 'm8', number: 8, label: 'T8', zone: 'Main Floor', capacity: 4, shape: 'square', status: 'cleaning' },
  { id: 'm9', number: 9, label: 'T9', zone: 'Main Floor', capacity: 6, shape: 'rect', status: 'ordered', customerName: 'PRIYA SHARMA', serverName: 'James K.', seatedMins: 18, orderTotal: 78.40, itemCount: 10 },
  { id: 'm10', number: 10, label: 'T10', zone: 'Main Floor', capacity: 6, shape: 'rect', status: 'vacant' },
  // Bar Counter
  { id: 'b11', number: 11, label: 'B1', zone: 'Bar Counter', capacity: 1, shape: 'round', status: 'seated', customerName: 'NOAH K.', serverName: 'Ethan B.', seatedMins: 12 },
  { id: 'b12', number: 12, label: 'B2', zone: 'Bar Counter', capacity: 1, shape: 'round', status: 'ordered', customerName: 'ZOE M.', serverName: 'Ethan B.', seatedMins: 20, orderTotal: 9.70, itemCount: 1 },
  { id: 'b13', number: 13, label: 'B3', zone: 'Bar Counter', capacity: 1, shape: 'round', status: 'vacant' },
  { id: 'b14', number: 14, label: 'B4', zone: 'Bar Counter', capacity: 1, shape: 'round', status: 'vacant' },
  // Patio
  { id: 'p15', number: 15, label: 'P1', zone: 'Patio Garden', capacity: 2, shape: 'round', status: 'ordered', customerName: 'IAN FROST', serverName: 'Sophia C.', seatedMins: 26, orderTotal: 18.20, itemCount: 3 },
  { id: 'p16', number: 16, label: 'P2', zone: 'Patio Garden', capacity: 2, shape: 'round', status: 'vacant' },
  { id: 'p17', number: 17, label: 'P3', zone: 'Patio Garden', capacity: 4, shape: 'square', status: 'awaiting-bill', customerName: 'SARA WILDE', serverName: 'Mia W.', seatedMins: 65, orderTotal: 51.30 },
];

const STATUS_CONFIG: Record<TableStatus, { label: string; bg: string; border: string; text: string; dot: string; icon: React.ElementType }> = {
  vacant:         { label: 'Vacant',        bg: 'bg-emerald-50',  border: 'border-emerald-200',  text: 'text-emerald-700',  dot: 'bg-emerald-400', icon: CheckCircle2 },
  seated:         { label: 'Seated',        bg: 'bg-blue-50',     border: 'border-blue-200',     text: 'text-blue-700',     dot: 'bg-blue-400',    icon: Users },
  ordered:        { label: 'Ordered',       bg: 'bg-amber-50',    border: 'border-amber-200',    text: 'text-amber-700',    dot: 'bg-amber-400',   icon: Sparkles },
  'awaiting-bill':{ label: 'Awaiting Bill', bg: 'bg-orange-50',   border: 'border-orange-300',   text: 'text-orange-700',   dot: 'bg-orange-400',  icon: CreditCard },
  cleaning:       { label: 'Cleaning',      bg: 'bg-neutral-100', border: 'border-neutral-300',  text: 'text-neutral-500',  dot: 'bg-neutral-400', icon: RefreshCw },
};

type ActionMode = null | 'merge-select' | 'move-select';

interface MergeConfirmState {
  sourceId: string;
  targetId: string;
}

export default function TableOperations({ onExit }: { onExit: () => void }) {
  const [tables, setTables] = useState<FloorTable[]>(FLOOR_TABLES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [mergeTarget, setMergeTarget] = useState<MergeConfirmState | null>(null);
  const [moveTarget, setMoveTarget] = useState<MergeConfirmState | null>(null);
  const [showStatusChange, setShowStatusChange] = useState(false);

  const selected = tables.find(t => t.id === selectedId) ?? null;

  const zones = ['Window', 'Main Floor', 'Bar Counter', 'Patio Garden'];

  const vacantCount  = tables.filter(t => t.status === 'vacant').length;
  const occupiedCount = tables.filter(t => t.status !== 'vacant' && t.status !== 'cleaning').length;
  const awaitingBill = tables.filter(t => t.status === 'awaiting-bill').length;

  const handleTableClick = (t: FloorTable) => {
    if (actionMode === 'merge-select' && selectedId && t.id !== selectedId) {
      setMergeTarget({ sourceId: selectedId, targetId: t.id });
      setActionMode(null);
      return;
    }
    if (actionMode === 'move-select' && selectedId && t.id !== selectedId) {
      setMoveTarget({ sourceId: selectedId, targetId: t.id });
      setActionMode(null);
      return;
    }
    setSelectedId(t.id === selectedId ? null : t.id);
    setShowStatusChange(false);
  };

  const changeStatus = (id: string, status: TableStatus) => {
    setTables(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (status === 'vacant') return { ...t, status, customerName: undefined, serverName: undefined, seatedMins: undefined, orderTotal: undefined, itemCount: undefined };
      return { ...t, status };
    }));
    setShowStatusChange(false);
  };

  const confirmMerge = () => {
    if (!mergeTarget) return;
    const source = tables.find(t => t.id === mergeTarget.sourceId);
    const target = tables.find(t => t.id === mergeTarget.targetId);
    if (!source || !target) return;
    setTables(prev => prev.map(t => {
      if (t.id === mergeTarget.sourceId) {
        return {
          ...t,
          capacity: t.capacity + (target.capacity),
          label: `${t.label}+${target.label}`,
          mergedWith: target.id,
        };
      }
      if (t.id === mergeTarget.targetId) {
        return { ...t, status: 'vacant' as TableStatus, customerName: undefined, serverName: undefined, seatedMins: undefined, orderTotal: undefined, itemCount: undefined };
      }
      return t;
    }));
    setMergeTarget(null);
    setSelectedId(null);
  };

  const confirmMove = () => {
    if (!moveTarget) return;
    const source = tables.find(t => t.id === moveTarget.sourceId);
    const target = tables.find(t => t.id === moveTarget.targetId);
    if (!source || !target) return;
    setTables(prev => prev.map(t => {
      if (t.id === moveTarget.targetId) {
        return {
          ...t,
          status: source.status,
          customerName: source.customerName,
          serverName: source.serverName,
          seatedMins: source.seatedMins,
          orderTotal: source.orderTotal,
          itemCount: source.itemCount,
        };
      }
      if (t.id === moveTarget.sourceId) {
        return { ...t, status: 'vacant' as TableStatus, customerName: undefined, serverName: undefined, seatedMins: undefined, orderTotal: undefined, itemCount: undefined };
      }
      return t;
    }));
    setMoveTarget(null);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#1a1a1a] flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#1a1a1a] border-b border-[rgba(240,234,210,0.10)] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8447A] flex items-center justify-center">
            <Users className="w-4 h-4 text-[#1a1a1a]" />
          </div>
          <div>
            <h1 className="text-[13px] font-barlow font-black uppercase tracking-[0.15em] text-[#FFFFFF]">Table Operations</h1>
            <p className="text-[9px] text-[#FFFFFF]/40 uppercase tracking-widest">SMARTDINE · FLOOR MANAGER</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono">
            <span><span className="text-[#1BC8C8] font-bold">{vacantCount}</span> <span className="text-[#FFFFFF]/40 uppercase">Vacant</span></span>
            <span><span className="text-amber-400 font-bold">{occupiedCount}</span> <span className="text-[#FFFFFF]/40 uppercase">Occupied</span></span>
            <span><span className="text-[#E8447A] font-bold">{awaitingBill}</span> <span className="text-[#FFFFFF]/40 uppercase">Bill Due</span></span>
          </div>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-[10px] font-mono text-[#FFFFFF]/50 border border-[rgba(240,234,210,0.15)] px-2.5 py-1.5 rounded-lg hover:border-[#FFFFFF]/40 hover:text-[#FFFFFF] transition-all uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" />
            Exit
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Floor Plan */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 min-w-0">

          {/* Action Mode Banner */}
          {actionMode && (
            <div className="bg-[#E8447A]/15 border border-[#E8447A]/40 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E8447A] animate-pulse" />
                <p className="text-[12px] font-medium text-[#1a1a1a]">
                  {actionMode === 'merge-select'
                    ? `Select a table to merge with Table ${selected?.label}`
                    : `Select a destination table for Table ${selected?.label}'s order`}
                </p>
              </div>
              <button onClick={() => setActionMode(null)} className="text-[#1a1a1a]/50 hover:text-[#1a1a1a]">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Status Legend */}
          <div className="flex flex-wrap gap-2">
            {(Object.entries(STATUS_CONFIG) as [TableStatus, typeof STATUS_CONFIG[TableStatus]][]).map(([key, cfg]) => (
              <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </div>
            ))}
          </div>

          {/* Zones */}
          {zones.map(zone => {
            const zoneTables = tables.filter(t => t.zone === zone);
            return (
              <div key={zone}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#1a1a1a]/40">{zone}</span>
                  <div className="flex-1 h-px bg-[rgba(26,26,26,0.08)]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {zoneTables.map(table => {
                    const cfg = STATUS_CONFIG[table.status];
                    const Icon = cfg.icon;
                    const isSelected = selectedId === table.id;
                    const isActionTarget = (actionMode === 'merge-select' || actionMode === 'move-select') && selectedId !== table.id;
                    return (
                      <button
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`relative rounded-xl border-2 p-3 text-left transition-all cursor-pointer group
                          ${isSelected
                            ? 'border-pink-400 bg-pink-50 shadow-md shadow-pink-100'
                            : isActionTarget
                              ? 'border-dashed border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
                              : `${cfg.border} ${cfg.bg} hover:shadow-sm`
                          }
                        `}
                      >
                        {/* Table number */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-[18px] font-bold text-neutral-800 leading-none">{table.label}</span>
                            <div className="text-[9px] font-mono text-neutral-400 mt-0.5 uppercase">{table.capacity}-seat</div>
                          </div>
                          <Icon className={`w-4 h-4 ${cfg.text} mt-0.5`} />
                        </div>

                        {/* Status badge */}
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                          <div className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </div>

                        {/* Guest info */}
                        {table.customerName && (
                          <p className="text-[10px] text-neutral-700 font-medium mt-1.5 leading-snug truncate">
                            {table.customerName}
                          </p>
                        )}
                        {table.serverName && (
                          <p className="text-[9px] text-neutral-400 truncate">{table.serverName}</p>
                        )}
                        {table.seatedMins != null && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-2.5 h-2.5 text-neutral-400" />
                            <span className="text-[9px] font-mono text-neutral-400">{table.seatedMins}m</span>
                          </div>
                        )}
                        {table.orderTotal != null && (
                          <p className="text-[11px] font-mono font-bold text-neutral-800 mt-1">
                            ₹{(table.orderTotal * 83).toFixed(0)}
                          </p>
                        )}

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar: Selected Table Actions */}
        {selected && (
          <div className="w-72 border-l border-[rgba(26,26,26,0.10)] bg-white flex flex-col shrink-0 overflow-y-auto">
            <div className="px-4 py-3 border-b border-[rgba(26,26,26,0.08)] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-barlow font-black uppercase text-[#1a1a1a]">
                  Table {selected.label}
                </h3>
                <p className="text-[10px] text-[#1a1a1a]/40 uppercase tracking-widest">{selected.zone}</p>
              </div>
              <button onClick={() => { setSelectedId(null); setActionMode(null); }}>
                <X className="w-4 h-4 text-[#1a1a1a]/40 hover:text-[#1a1a1a]" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {/* Status badge */}
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#1a1a1a]/40 mb-2">Current Status</p>
                {(() => {
                  const cfg = STATUS_CONFIG[selected.status];
                  const Icon = cfg.icon;
                  return (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                      <Icon className={`w-4 h-4 ${cfg.text}`} />
                      <span className={`text-[12px] font-medium ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Table info */}
              <div className="rounded-xl bg-[#FFFFFF] border border-[rgba(26,26,26,0.10)] p-3 space-y-2">
                <InfoRow label="Capacity" value={`${selected.capacity} seats`} />
                {selected.customerName && <InfoRow label="Guest" value={selected.customerName} />}
                {selected.serverName && <InfoRow label="Server" value={selected.serverName} />}
                {selected.seatedMins != null && <InfoRow label="Seated" value={`${selected.seatedMins} min ago`} />}
                {selected.orderTotal != null && <InfoRow label="Bill Total" value={`₹${(selected.orderTotal * 83).toFixed(0)}`} highlight />}
                {selected.itemCount != null && <InfoRow label="Items" value={`${selected.itemCount} items ordered`} />}
                {selected.mergedWith && <InfoRow label="Merged" value="Yes — combined table" />}
              </div>

              {/* Change Status */}
              <div>
                <button
                  onClick={() => setShowStatusChange(!showStatusChange)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[rgba(26,26,26,0.15)] bg-white hover:bg-[#FFFFFF] transition-colors"
                >
                  <span className="text-[11px] font-medium text-[#1a1a1a]">Change Status</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-[#1a1a1a]/40 transition-transform ${showStatusChange ? 'rotate-90' : ''}`} />
                </button>
                {showStatusChange && (
                  <div className="mt-2 grid grid-cols-1 gap-1.5">
                    {(Object.keys(STATUS_CONFIG) as TableStatus[]).map(s => {
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => changeStatus(selected.id, s)}
                          disabled={selected.status === s}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-[11px] font-medium
                            ${selected.status === s
                              ? `${cfg.bg} ${cfg.border} ${cfg.text} opacity-60 cursor-default`
                              : 'border-[rgba(26,26,26,0.15)] hover:border-[#E8447A] hover:bg-[#E8447A]/10 text-[#1a1a1a]'
                            }
                          `}
                        >
                          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Table Actions */}
              <div className="space-y-2">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#1a1a1a]/40">Table Actions</p>
                <button
                  onClick={() => setActionMode('merge-select')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[rgba(26,26,26,0.15)] hover:border-[#E8447A] hover:bg-[#E8447A]/10 transition-all text-[11px] font-medium text-[#1a1a1a]"
                >
                  <Merge className="w-4 h-4" />
                  Merge with another table
                </button>
                {selected.status !== 'vacant' && selected.status !== 'cleaning' && (
                  <button
                    onClick={() => setActionMode('move-select')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[rgba(26,26,26,0.15)] hover:border-[#1BC8C8] hover:bg-[#1BC8C8]/10 transition-all text-[11px] font-medium text-[#1a1a1a]"
                  >
                    <MoveRight className="w-4 h-4" />
                    Move order to another table
                  </button>
                )}
                {(selected.status === 'ordered' || selected.status === 'awaiting-bill') && (
                  <button
                    onClick={() => changeStatus(selected.id, 'cleaning')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[rgba(26,26,26,0.15)] hover:border-amber-400 hover:bg-amber-50 transition-all text-[11px] font-medium text-[#1a1a1a]"
                  >
                    <Scissors className="w-4 h-4" />
                    Clear &amp; Send to Cleaning
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Merge Confirm Modal */}
      {mergeTarget && (() => {
        const src = tables.find(t => t.id === mergeTarget.sourceId);
        const tgt = tables.find(t => t.id === mergeTarget.targetId);
        if (!src || !tgt) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] rounded-[22px] border border-[rgba(26,26,26,0.18)] shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-[15px] font-barlow font-black uppercase text-[#1a1a1a] mb-1">Merge Tables</h3>
              <p className="text-[12px] text-[#1a1a1a]/50 mb-4">
                Merge <strong>{src.label}</strong> with <strong>{tgt.label}</strong>?
                The combined table will seat <strong>{src.capacity + tgt.capacity} guests</strong>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMergeTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[rgba(26,26,26,0.18)] text-[12px] font-medium text-[#1a1a1a]/60 hover:bg-[rgba(26,26,26,0.05)]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMerge}
                  className="flex-1 py-2.5 rounded-[100px] bg-[#1a1a1a] text-[#FFFFFF] text-[12px] font-medium hover:bg-[#1a1a1a]/80"
                >
                  Confirm Merge
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Move Confirm Modal */}
      {moveTarget && (() => {
        const src = tables.find(t => t.id === moveTarget.sourceId);
        const tgt = tables.find(t => t.id === moveTarget.targetId);
        if (!src || !tgt) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] rounded-[22px] border border-[rgba(26,26,26,0.18)] shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-[15px] font-barlow font-black uppercase text-[#1a1a1a] mb-1">Move Order</h3>
              <p className="text-[12px] text-[#1a1a1a]/50 mb-4">
                Move {src.customerName ? <strong>{src.customerName}</strong> : 'the order'} from{' '}
                <strong>{src.label}</strong> to <strong>{tgt.label}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMoveTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[rgba(26,26,26,0.18)] text-[12px] font-medium text-[#1a1a1a]/60 hover:bg-[rgba(26,26,26,0.05)]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMove}
                  className="flex-1 py-2.5 rounded-[100px] bg-[#1BC8C8] text-white text-[12px] font-medium hover:bg-[#1BC8C8]/80"
                >
                  Confirm Move
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-mono text-[#1a1a1a]/40 uppercase tracking-wider shrink-0">{label}</span>
      <span className={`text-[11px] font-medium truncate text-right ${highlight ? 'text-[#1a1a1a] font-bold' : 'text-[#1a1a1a]/70'}`}>
        {value}
      </span>
    </div>
  );
}
