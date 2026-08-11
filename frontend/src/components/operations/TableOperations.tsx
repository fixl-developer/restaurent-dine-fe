import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Users, CheckCircle2,
  Sparkles, CreditCard, Merge, MoveRight, Scissors,
  X, ChevronRight, RefreshCw, LogOut, Loader2, ShoppingCart,
} from 'lucide-react';
import FloorPlanView, { type TableOccupant } from '@/components/floorplan/FloorPlanView';
import {
  useTables, useTableStatus, useMergeTables, useMoveTableSession,
  useOpenTableSessions,
} from '@/hooks/useTables';
import { useSocket } from '@/hooks/useSocket';
import { useLogout } from '@/hooks/useAuth';
import {
  TABLE_STATUS_LABELS, type TableDto, type TableStatus,
} from '@/lib/dto/tables';

const STATUS_CONFIG: Record<TableStatus, { bg: string; border: string; text: string; dot: string; icon: React.ElementType }> = {
  vacant:        { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: CheckCircle2 },
  seated:        { bg: 'bg-blue-50',     border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-400',    icon: Users },
  ordered:       { bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-400',   icon: Sparkles },
  awaiting_bill: { bg: 'bg-orange-50',   border: 'border-orange-300',  text: 'text-orange-700',  dot: 'bg-orange-400',  icon: CreditCard },
  cleaning:      { bg: 'bg-neutral-100', border: 'border-neutral-300', text: 'text-neutral-500', dot: 'bg-neutral-400', icon: RefreshCw },
};

type ActionMode = null | 'merge-select' | 'move-select';

export default function TableOperations({ onExit }: { onExit: () => void }) {
  const qc = useQueryClient();
  const logoutMutation = useLogout();

  const { data: tables = [], isLoading } = useTables({ includeInactive: false });
  const { data: sessions = [] } = useOpenTableSessions();
  const changeStatus = useTableStatus();
  const mergeTables = useMergeTables();
  const moveSession = useMoveTableSession();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [mergeTarget, setMergeTarget] = useState<{ sourceId: string; targetId: string } | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ sourceId: string; targetId: string } | null>(null);
  const [showStatusChange, setShowStatusChange] = useState(false);

  // Real-time updates
  useSocket('/tables', {
    'table:updated': () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['table-sessions'] });
    },
    'table:status_changed': () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['table-sessions'] });
    },
    'session:opened': () => qc.invalidateQueries({ queryKey: ['table-sessions'] }),
    'session:closed': () => qc.invalidateQueries({ queryKey: ['table-sessions'] }),
  });

  const selected = tables.find((t) => t._id === selectedId) ?? null;

  // Build occupant map from open sessions
  const occupants = useMemo<Record<string, TableOccupant>>(() => {
    const map: Record<string, TableOccupant> = {};
    for (const s of sessions) {
      map[s.tableId] = {
        guestCount: s.guestCount,
        runningTotal: s.runningTotal,
        seatedMins: s.openedAt
          ? Math.floor((Date.now() - new Date(s.openedAt).getTime()) / 60_000)
          : undefined,
      };
    }
    return map;
  }, [sessions]);

  const vacantCount = tables.filter((t) => t.status === 'vacant').length;
  const occupiedCount = tables.filter((t) => t.status !== 'vacant' && t.status !== 'cleaning').length;
  const awaitingBill = tables.filter((t) => t.status === 'awaiting_bill').length;

  const highlightedIds = useMemo(() => {
    if (!actionMode || !selectedId) return undefined;
    return new Set(tables.filter((t) => t.status === 'vacant' && t._id !== selectedId).map((t) => t._id));
  }, [actionMode, selectedId, tables]);

  function handleTableClick(t: TableDto) {
    if (actionMode === 'merge-select' && selectedId && t._id !== selectedId) {
      setMergeTarget({ sourceId: selectedId, targetId: t._id });
      setActionMode(null);
      return;
    }
    if (actionMode === 'move-select' && selectedId && t._id !== selectedId) {
      setMoveTarget({ sourceId: selectedId, targetId: t._id });
      setActionMode(null);
      return;
    }
    setSelectedId(t._id === selectedId ? null : t._id);
    setShowStatusChange(false);
  }

  async function confirmMerge() {
    if (!mergeTarget) return;
    await mergeTables.mutateAsync({
      primaryId: mergeTarget.sourceId,
      secondaryIds: [mergeTarget.targetId],
    });
    setMergeTarget(null);
    setSelectedId(null);
  }

  async function confirmMove() {
    if (!moveTarget) return;
    await moveSession.mutateAsync({
      fromTableId: moveTarget.sourceId,
      toTableId: moveTarget.targetId,
    });
    setMoveTarget(null);
    setSelectedId(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E8447A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#1a1a1a] flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#1a1a1a] border-b border-[rgba(240,234,210,0.10)] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8447A] flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[13px] font-barlow font-black uppercase tracking-[0.15em] text-white">Table Operations</h1>
            <p className="text-[9px] text-white/40 uppercase tracking-widest">SMARTDINE · FLOOR MANAGER</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono">
            <span><span className="text-[#1BC8C8] font-bold">{vacantCount}</span> <span className="text-white/40 uppercase">Vacant</span></span>
            <span><span className="text-amber-400 font-bold">{occupiedCount}</span> <span className="text-white/40 uppercase">Occupied</span></span>
            <span><span className="text-[#E8447A] font-bold">{awaitingBill}</span> <span className="text-white/40 uppercase">Bill Due</span></span>
          </div>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 border border-[rgba(240,234,210,0.15)] px-2.5 py-1.5 rounded-lg hover:border-white/40 hover:text-white transition-all uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" />
            Exit
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 text-[10px] font-mono text-[#E8447A]/70 border border-[#E8447A]/20 px-2.5 py-1.5 rounded-lg hover:border-[#E8447A]/60 hover:text-[#E8447A] transition-all uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
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
                    ? `Select a table to merge with Table ${selected?.number}`
                    : `Select a destination table for Table ${selected?.number}'s order`}
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
                {TABLE_STATUS_LABELS[key]}
              </div>
            ))}
          </div>

          {tables.length === 0 ? (
            <div className="text-center py-24 text-sm text-gray-400">
              No tables found. Add tables via Admin → Table Management.
            </div>
          ) : (
            <FloorPlanView
              tables={tables}
              occupants={occupants}
              selectedId={selectedId}
              highlightedIds={highlightedIds}
              onTableClick={handleTableClick}
            />
          )}
        </div>

        {/* Sidebar: Selected Table Actions */}
        {selected && (
          <div className="w-72 border-l border-[rgba(26,26,26,0.10)] bg-white flex flex-col shrink-0 overflow-y-auto">
            <div className="px-4 py-3 border-b border-[rgba(26,26,26,0.08)] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-barlow font-black uppercase text-[#1a1a1a]">
                  Table {selected.number}
                </h3>
                <p className="text-[10px] text-[#1a1a1a]/40 uppercase tracking-widest">{selected.zone ?? 'Floor'}</p>
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
                      <span className={`text-[12px] font-medium ${cfg.text}`}>{TABLE_STATUS_LABELS[selected.status]}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Table info */}
              <div className="rounded-xl bg-white border border-[rgba(26,26,26,0.10)] p-3 space-y-2">
                <InfoRow label="Capacity" value={`${selected.capacity} seats`} />
                {occupants[selected._id]?.guestCount != null && (
                  <InfoRow label="Guests" value={`${occupants[selected._id].guestCount} seated`} />
                )}
                {occupants[selected._id]?.seatedMins != null && (
                  <InfoRow label="Seated" value={`${occupants[selected._id].seatedMins} min ago`} />
                )}
                {occupants[selected._id]?.runningTotal != null && (
                  <InfoRow label="Running Total" value={`₹${occupants[selected._id].runningTotal!.toFixed(0)}`} highlight />
                )}
                {selected.mergedWithTableIds.length > 0 && (
                  <InfoRow label="Merged" value="Yes — combined table" />
                )}
              </div>

              {/* Change Status */}
              <div>
                <button
                  onClick={() => setShowStatusChange(!showStatusChange)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[rgba(26,26,26,0.15)] bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[11px] font-medium text-[#1a1a1a]">Change Status</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-[#1a1a1a]/40 transition-transform ${showStatusChange ? 'rotate-90' : ''}`} />
                </button>
                {showStatusChange && (
                  <div className="mt-2 grid grid-cols-1 gap-1.5">
                    {(Object.keys(STATUS_CONFIG) as TableStatus[]).map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => {
                            changeStatus.mutate({ id: selected._id, status: s });
                            setShowStatusChange(false);
                          }}
                          disabled={selected.status === s || changeStatus.isPending}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-[11px] font-medium
                            ${selected.status === s
                              ? `${cfg.bg} ${cfg.border} ${cfg.text} opacity-60 cursor-default`
                              : 'border-[rgba(26,26,26,0.15)] hover:border-[#E8447A] hover:bg-[#E8447A]/10 text-[#1a1a1a]'
                            }
                          `}
                        >
                          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          {TABLE_STATUS_LABELS[s]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Table Actions */}
              <div className="space-y-2">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#1a1a1a]/40">Table Actions</p>
                {selected.status === 'seated' && (
                  <button
                    onClick={() => window.location.href = `/order?table=${selected._id}`}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[rgba(26,26,26,0.15)] hover:border-[#10B981] hover:bg-[#10B981]/10 transition-all text-[11px] font-medium text-[#1a1a1a]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Take Order
                  </button>
                )}
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
                {(selected.status === 'ordered' || selected.status === 'awaiting_bill') && (
                  <button
                    onClick={() => changeStatus.mutate({ id: selected._id, status: 'cleaning' })}
                    disabled={changeStatus.isPending}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[rgba(26,26,26,0.15)] hover:border-amber-400 hover:bg-amber-50 transition-all text-[11px] font-medium text-[#1a1a1a] disabled:opacity-50"
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
        const src = tables.find((t) => t._id === mergeTarget.sourceId);
        const tgt = tables.find((t) => t._id === mergeTarget.targetId);
        if (!src || !tgt) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-[15px] font-barlow font-black uppercase text-[#1a1a1a] mb-1">Merge Tables</h3>
              <p className="text-[12px] text-[#1a1a1a]/50 mb-4">
                Merge <strong>{src.number}</strong> with <strong>{tgt.number}</strong>?
                The combined table will seat <strong>{src.capacity + tgt.capacity} guests</strong>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMergeTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[rgba(26,26,26,0.18)] text-[12px] font-medium text-[#1a1a1a]/60 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMerge}
                  disabled={mergeTables.isPending}
                  className="flex-1 py-2.5 rounded-[100px] bg-[#1a1a1a] text-white text-[12px] font-medium hover:bg-[#1a1a1a]/80 disabled:opacity-50"
                >
                  {mergeTables.isPending ? 'Merging...' : 'Confirm Merge'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Move Confirm Modal */}
      {moveTarget && (() => {
        const src = tables.find((t) => t._id === moveTarget.sourceId);
        const tgt = tables.find((t) => t._id === moveTarget.targetId);
        if (!src || !tgt) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-[15px] font-barlow font-black uppercase text-[#1a1a1a] mb-1">Move Order</h3>
              <p className="text-[12px] text-[#1a1a1a]/50 mb-4">
                Move the order from <strong>Table {src.number}</strong> to <strong>Table {tgt.number}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMoveTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[rgba(26,26,26,0.18)] text-[12px] font-medium text-[#1a1a1a]/60 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMove}
                  disabled={moveSession.isPending}
                  className="flex-1 py-2.5 rounded-[100px] bg-[#1BC8C8] text-white text-[12px] font-medium hover:bg-[#1BC8C8]/80 disabled:opacity-50"
                >
                  {moveSession.isPending ? 'Moving...' : 'Confirm Move'}
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
