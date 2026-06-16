import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Clock, X, GitMerge, MoveRight, Plus, Loader2, Split, Trash2, LayoutGrid, Map as MapIcon, Edit3, Save } from 'lucide-react';
import {
  useTables, useTableStatus, useCreateTable, useBulkCreateTables, useDeleteTable,
  useMergeTables, useSplitTable, useMoveTableSession, useOpenTableSession,
  useUpdateTable,
} from '@/hooks/useTables';
import { useSocket } from '@/hooks/useSocket';
import {
  TABLE_STATUSES, TABLE_STATUS_LABELS, type TableDto, type TableStatus,
} from '@/lib/dto/tables';
import { confirmToast } from '@/lib/confirmToast';
import FloorPlanView, { type TableOccupant } from '@/components/floorplan/FloorPlanView';

const STATUS_CONFIG: Record<TableStatus, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  vacant:        { bg: 'bg-white',     border: 'border-gray-200', text: 'text-gray-500',   badge: 'bg-gray-50 text-gray-500 border-gray-200',     dot: 'bg-gray-300'  },
  seated:        { bg: 'bg-blue-50',   border: 'border-blue-200', text: 'text-blue-700',   badge: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500'  },
  ordered:       { bg: 'bg-amber-50',  border: 'border-amber-200',text: 'text-amber-700',  badge: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  awaiting_bill: { bg: 'bg-violet-50', border: 'border-violet-200',text: 'text-violet-700',badge: 'bg-violet-50 text-violet-700 border-violet-200',dot: 'bg-violet-500' },
  cleaning:      { bg: 'bg-gray-50',   border: 'border-gray-200', text: 'text-gray-500',   badge: 'bg-gray-100 text-gray-500 border-gray-200',    dot: 'bg-gray-400'  },
};

export default function AdminTables() {
  const qc = useQueryClient();
  const { data: tables = [], isLoading } = useTables({ includeInactive: false });

  const [viewMode, setViewMode] = useState<'plan' | 'grid'>('plan');
  const [editLayout, setEditLayout] = useState(false);
  const updateMutation = useUpdateTable();

  const statusMutation = useTableStatus();
  const createMutation = useCreateTable();
  const bulkCreateMutation = useBulkCreateTables();
  const deleteMutation = useDeleteTable();
  const mergeMutation = useMergeTables();
  const splitMutation = useSplitTable();
  const moveMutation = useMoveTableSession();
  const openSessionMutation = useOpenTableSession();

  const [zone, setZone] = useState<string>('All');
  const [selected, setSelected] = useState<TableDto | null>(null);
  const [mergeWith, setMergeWith] = useState<string | null>(null);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', zone: '', capacity: 4 });
  const [bulkInput, setBulkInput] = useState({ prefix: 'T-', count: 5, zone: '', capacity: 4 });

  useEffect(() => {
    if (!selected) return;
    const fresh = tables.find((t) => t._id === selected._id);
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [tables, selected]);

  useSocket('/staff', {
    'table:status_changed': () => qc.invalidateQueries({ queryKey: ['tables'] }),
    'table:updated': () => qc.invalidateQueries({ queryKey: ['tables'] }),
    'table:merged': () => qc.invalidateQueries({ queryKey: ['tables'] }),
    'table:split': () => qc.invalidateQueries({ queryKey: ['tables'] }),
    'table:moved': () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });

  const zones = useMemo(() => {
    const set = new Set<string>();
    for (const t of tables) if (t.zone) set.add(t.zone);
    return ['All', ...Array.from(set).sort()];
  }, [tables]);

  const visible = zone === 'All' ? tables : tables.filter((t) => t.zone === zone);

  const statCounts = TABLE_STATUSES.reduce((acc, s) => {
    acc[s] = tables.filter((t) => t.status === s).length;
    return acc;
  }, {} as Record<TableStatus, number>);

  const occupied = tables.length - statCounts.vacant - statCounts.cleaning;
  const occupancy = tables.length === 0 ? 0 : Math.round((occupied / tables.length) * 100);

  function handleStatus(table: TableDto, status: TableStatus) {
    statusMutation.mutate({ id: table._id, status });
  }
  function handleSeatGuests(table: TableDto, count: number) {
    openSessionMutation.mutate({ tableId: table._id, guestCount: count });
  }
  function handleClickTable(table: TableDto) {
    if (moveFrom && moveFrom !== table._id) {
      moveMutation.mutate({ fromTableId: moveFrom, toTableId: table._id });
      setMoveFrom(null); setSelected(null); return;
    }
    if (mergeWith && mergeWith !== table._id) {
      mergeMutation.mutate({ primaryId: mergeWith, secondaryIds: [table._id] });
      setMergeWith(null); setSelected(null); return;
    }
    setSelected((prev) => (prev?._id === table._id ? null : table));
    setMergeWith(null); setMoveFrom(null);
  }
  function handleAddTable() {
    if (!newTable.number.trim()) return;
    createMutation.mutate(
      { number: newTable.number.trim(), zone: newTable.zone.trim() || undefined, capacity: newTable.capacity },
      { onSuccess: () => { setNewTable({ number: '', zone: '', capacity: 4 }); setAddOpen(false); } },
    );
  }
  function handleBulkAdd() {
    if (!bulkInput.count || bulkInput.count < 1) return;
    const arr = Array.from({ length: bulkInput.count }, (_, i) => ({
      number: `${bulkInput.prefix}${i + 1}`,
      zone: bulkInput.zone.trim() || undefined,
      capacity: bulkInput.capacity,
    }));
    bulkCreateMutation.mutate(arr, {
      onSuccess: () => { setBulkInput({ prefix: 'T-', count: 5, zone: '', capacity: 4 }); setBulkOpen(false); },
    });
  }
  async function handleDeleteTable(table: TableDto) {
    const ok = await confirmToast({
      title: `Delete table "${table.number}"?`,
      description: 'This action cannot be undone.',
      destructive: true,
    });
    if (!ok) return;
    deleteMutation.mutate(table._id, { onSuccess: () => setSelected(null) });
  }
  function handleSplit(table: TableDto) {
    if (table.mergedWithTableIds.length === 0) return;
    splitMutation.mutate(table._id, { onSuccess: () => setSelected(null) });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading tables…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Table Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Restaurant floor layout — real-time table status</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setViewMode('plan'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'plan' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Floor Plan
            </button>
            <button
              onClick={() => { setViewMode('grid'); setEditLayout(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
          </div>
          {viewMode === 'plan' && (
            <button
              onClick={() => setEditLayout((e) => !e)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                editLayout
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {editLayout ? <><Save className="w-3.5 h-3.5" /> Done editing</> : <><Edit3 className="w-3.5 h-3.5" /> Edit layout</>}
            </button>
          )}
          <button onClick={() => setBulkOpen(true)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Bulk Add
          </button>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
            <Plus className="w-4 h-4" /> Add Table
          </button>
          <div className="text-right ml-2">
            <p className="text-2xl font-bold text-gray-900">{occupancy}%</p>
            <p className="text-xs text-gray-400">Occupancy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {TABLE_STATUSES.map((s) => {
          const c = STATUS_CONFIG[s];
          return (
            <div key={s} className={`rounded-xl border p-3 text-center ${c.bg} ${c.border}`}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>{TABLE_STATUS_LABELS[s]}</span>
              </div>
              <p className={`text-2xl font-black ${c.text}`}>{statCounts[s]}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        {zones.map((z) => (
          <button key={z} onClick={() => setZone(z)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${zone === z ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {z}
            {z !== 'All' && <span className="ml-2 text-[10px] opacity-70">{tables.filter((t) => t.zone === z).length}</span>}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-sm text-gray-500">No tables yet</p>
          <button onClick={() => setAddOpen(true)} className="text-sm text-pink-600 hover:underline mt-2">Add your first table</button>
        </div>
      ) : viewMode === 'plan' ? (
        <FloorPlanView
          tables={visible}
          editable={editLayout}
          selectedId={selected?._id ?? null}
          highlightedIds={
            mergeWith
              ? new Set(visible.filter((t) => t._id !== mergeWith && t.status === 'vacant').map((t) => t._id))
              : moveFrom
                ? new Set(visible.filter((t) => t._id !== moveFrom && t.status === 'vacant').map((t) => t._id))
                : undefined
          }
          onTableClick={(t) => handleClickTable(t)}
          onPositionChange={(id, position) => updateMutation.mutate({ id, patch: { position } })}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...visible].sort((a, b) => a.sortOrder - b.sortOrder || a.number.localeCompare(b.number)).map((table) => {
            const c = STATUS_CONFIG[table.status];
            const isSelected = selected?._id === table._id;
            const isMergeTarget = mergeWith !== null && table._id !== mergeWith && table.status === 'vacant';
            const isMoveTarget = moveFrom !== null && table._id !== moveFrom && table.status === 'vacant';
            return (
              <div key={table._id} onClick={() => handleClickTable(table)}
                className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all select-none ${c.bg}
                  ${isSelected ? 'border-pink-500 shadow-lg shadow-pink-100' : (isMergeTarget || isMoveTarget) ? 'border-blue-400 shadow-lg shadow-blue-100 animate-pulse' : c.border}
                  hover:shadow-md`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-black ${c.text}`}>{table.number}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${c.badge}`}>{TABLE_STATUS_LABELS[table.status]}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs ${c.text} opacity-70`}>
                  <Users className="w-3.5 h-3.5" />
                  <span>{table.capacity} seats</span>
                </div>
                {table.zone && (
                  <div className={`flex items-center gap-1 text-[10px] ${c.text} opacity-60 mt-0.5`}>
                    <Clock className="w-3 h-3" />{table.zone}
                  </div>
                )}
                {table.mergedWithTableIds.length > 0 && (
                  <p className={`text-[9px] font-semibold mt-1 ${c.text} opacity-70`}>Merged ({table.mergedWithTableIds.length + 1})</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <>
          <div className="fixed inset-0 bg-transparent z-30" onClick={() => { setSelected(null); setMergeWith(null); setMoveFrom(null); }} />
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-[520px] max-w-[90vw] animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{selected.number}{selected.zone && <span className="text-gray-500 font-normal"> — {selected.zone}</span>}</h3>
                <p className="text-xs text-gray-500">Capacity {selected.capacity} · {TABLE_STATUS_LABELS[selected.status]}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleDeleteTable(selected)} title="Delete table" className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => { setSelected(null); setMergeWith(null); setMoveFrom(null); }}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {TABLE_STATUSES.map((s) => (
                <button key={s} onClick={() => handleStatus(selected, s)} disabled={statusMutation.isPending}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${selected.status === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 disabled:opacity-50'}`}>
                  {TABLE_STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {selected.status === 'vacant' && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Seat guests</p>
                <div className="flex gap-2">
                  {Array.from({ length: selected.capacity }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => handleSeatGuests(selected, n)} disabled={openSessionMutation.isPending}
                      className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 disabled:opacity-50 transition-colors border border-blue-200">
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              {selected.mergedWithTableIds.length === 0 ? (
                <button onClick={() => setMergeWith(selected._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <GitMerge className="w-3.5 h-3.5" /> Merge with…
                </button>
              ) : (
                <button onClick={() => handleSplit(selected)} disabled={splitMutation.isPending} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Split className="w-3.5 h-3.5" /> Split merged
                </button>
              )}
              <button onClick={() => setMoveFrom(selected._id)} disabled={!selected.currentSessionId}
                title={selected.currentSessionId ? 'Move active session to a vacant table' : 'No active session to move'}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <MoveRight className="w-3.5 h-3.5" /> Move session
              </button>
            </div>
            {(mergeWith || moveFrom) && (
              <p className="text-center text-xs text-blue-600 mt-2 font-medium animate-pulse">
                {moveFrom ? 'Click a vacant table to move the session' : 'Click a vacant table to merge with'}
              </p>
            )}
          </div>
        </>
      )}

      {addOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setAddOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[95vw] p-6">
              <h3 className="font-bold text-gray-900 mb-1">Add Table</h3>
              <p className="text-xs text-gray-500 mb-4">A single table entry</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Table number *</label>
                  <input autoFocus value={newTable.number} onChange={(e) => setNewTable((s) => ({ ...s, number: e.target.value }))}
                    placeholder="AC-1" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Zone</label>
                    <input value={newTable.zone} onChange={(e) => setNewTable((s) => ({ ...s, zone: e.target.value }))}
                      placeholder="AC / Garden" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Capacity</label>
                    <input type="number" value={newTable.capacity} onChange={(e) => setNewTable((s) => ({ ...s, capacity: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddTable} disabled={createMutation.isPending} className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 disabled:bg-pink-200">
                  {createMutation.isPending ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {bulkOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setBulkOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[95vw] p-6">
              <h3 className="font-bold text-gray-900 mb-1">Bulk Add Tables</h3>
              <p className="text-xs text-gray-500 mb-4">Generates tables numbered {bulkInput.prefix}1 through {bulkInput.prefix}{bulkInput.count}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prefix</label>
                  <input value={bulkInput.prefix} onChange={(e) => setBulkInput((s) => ({ ...s, prefix: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Count</label>
                  <input type="number" min={1} max={200} value={bulkInput.count} onChange={(e) => setBulkInput((s) => ({ ...s, count: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Zone</label>
                  <input value={bulkInput.zone} onChange={(e) => setBulkInput((s) => ({ ...s, zone: e.target.value }))}
                    placeholder="AC / Garden" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Capacity each</label>
                  <input type="number" value={bulkInput.capacity} onChange={(e) => setBulkInput((s) => ({ ...s, capacity: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setBulkOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleBulkAdd} disabled={bulkCreateMutation.isPending} className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 disabled:bg-pink-200">
                  {bulkCreateMutation.isPending ? 'Adding…' : `Add ${bulkInput.count}`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
