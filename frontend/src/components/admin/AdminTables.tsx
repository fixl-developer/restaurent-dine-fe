import { useState } from 'react';
import { Users, Clock, X, ArrowRight, GitMerge, MoveRight } from 'lucide-react';
import { ADMIN_TABLES, AdminTable, TableStatus } from './adminMockData';

const STATUS_CONFIG: Record<TableStatus, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  Vacant:        { bg: 'bg-white',           border: 'border-gray-200', text: 'text-gray-500',   badge: 'bg-gray-50 text-gray-500 border-gray-200',   dot: 'bg-gray-300'    },
  Seated:        { bg: 'bg-blue-50',         border: 'border-blue-200', text: 'text-blue-700',   badge: 'bg-blue-50 text-blue-700 border-blue-200',   dot: 'bg-blue-500'    },
  Ordered:       { bg: 'bg-amber-50',        border: 'border-amber-200',text: 'text-amber-700',  badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500'   },
  'Awaiting Bill': { bg: 'bg-violet-50',     border: 'border-violet-200',text: 'text-violet-700',badge: 'bg-violet-50 text-violet-700 border-violet-200',dot: 'bg-violet-500' },
  Cleaning:      { bg: 'bg-gray-50',         border: 'border-gray-200', text: 'text-gray-500',   badge: 'bg-gray-100 text-gray-500 border-gray-200',  dot: 'bg-gray-400'    },
};

const SECTIONS = ['All Sections', 'Main Hall', 'Patio', 'Private Room', 'Bar Counter'];
const ALL_STATUSES: TableStatus[] = ['Vacant', 'Seated', 'Ordered', 'Awaiting Bill', 'Cleaning'];

export default function AdminTables() {
  const [tables, setTables] = useState<AdminTable[]>(ADMIN_TABLES);
  const [section, setSection] = useState('All Sections');
  const [selected, setSelected] = useState<AdminTable | null>(null);
  const [mergeWith, setMergeWith] = useState<number | null>(null);

  const visible = section === 'All Sections' ? tables : tables.filter(t => t.section === section);

  const statCounts: Record<TableStatus, number> = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = tables.filter(t => t.status === s).length;
    return acc;
  }, {} as Record<TableStatus, number>);

  function changeStatus(id: number, status: TableStatus) {
    setTables(prev => prev.map(t => {
      if (t.id !== id) return t;
      const reset = status === 'Vacant' || status === 'Cleaning';
      return { ...t, status, ...(reset ? { guestCount: undefined, seatedAt: undefined, orderId: undefined, amount: undefined } : {}) };
    }));
    setSelected(t => t?.id === id ? { ...t, status } : t);
  }

  function seatGuests(id: number, count: number) {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTables(prev => prev.map(t => t.id === id ? { ...t, status: 'Seated', guestCount: count, seatedAt: now } : t));
    setSelected(t => t?.id === id ? { ...t, status: 'Seated', guestCount: count, seatedAt: now } : t);
  }

  function mergeTables(id1: number, id2: number) {
    setTables(prev => prev.map(t => t.id === id2 ? { ...t, status: 'Vacant', guestCount: undefined, orderId: undefined, amount: undefined } : t));
    setMergeWith(null);
    setSelected(null);
  }

  const occupancy = Math.round(((tables.length - statCounts.Vacant - statCounts.Cleaning) / tables.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Table Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Restaurant floor layout — real-time table status</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{occupancy}%</p>
          <p className="text-xs text-gray-400">Current occupancy</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        {ALL_STATUSES.map(s => {
          const c = STATUS_CONFIG[s];
          return (
            <div key={s} className={`rounded-xl border p-3 text-center ${c.bg} ${c.border}`}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>{s}</span>
              </div>
              <p className={`text-2xl font-black ${c.text}`}>{statCounts[s]}</p>
            </div>
          );
        })}
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${section === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s}
            {s !== 'All Sections' && <span className="ml-2 text-[10px] opacity-70">{tables.filter(t => t.section === s).length}</span>}
          </button>
        ))}
      </div>

      {/* Floor layout grouped by section */}
      <div className="space-y-6">
        {(section === 'All Sections' ? ['Main Hall', 'Patio', 'Private Room', 'Bar Counter'] : [section]).map(sec => {
          const secTables = tables.filter(t => t.section === sec);
          if (!secTables.length) return null;
          return (
            <div key={sec}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{sec}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {secTables.map(table => {
                  const c = STATUS_CONFIG[table.status];
                  const isSelected = selected?.id === table.id;
                  const isMergeTarget = mergeWith !== null && table.id !== mergeWith && table.status === 'Vacant';
                  return (
                    <div key={table.id}
                      onClick={() => {
                        if (isMergeTarget) { mergeTables(mergeWith, table.id); return; }
                        setSelected(isSelected ? null : table);
                        setMergeWith(null);
                      }}
                      className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all select-none
                        ${c.bg} ${isSelected ? 'border-pink-500 shadow-lg shadow-pink-100' : isMergeTarget ? 'border-blue-400 shadow-lg shadow-blue-100 animate-pulse' : c.border}
                        hover:shadow-md`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-lg font-black ${c.text}`}>{table.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${c.badge}`}>{table.status}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-xs ${c.text} opacity-70`}>
                        <Users className="w-3.5 h-3.5" />
                        <span>{table.guestCount ?? '—'} / {table.capacity}</span>
                      </div>
                      {table.seatedAt && (
                        <div className={`flex items-center gap-1 text-[10px] ${c.text} opacity-60 mt-0.5`}>
                          <Clock className="w-3 h-3" />{table.seatedAt}
                        </div>
                      )}
                      {table.amount && table.status !== 'Vacant' && (
                        <p className={`text-xs font-bold mt-1.5 ${c.text}`}>₹{table.amount.toLocaleString()}</p>
                      )}
                      {table.waiter && <p className={`text-[9px] mt-1 ${c.text} opacity-60 truncate`}>{table.waiter}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Action Panel */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-transparent z-30" onClick={() => { setSelected(null); setMergeWith(null); }} />
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-[480px] max-w-[90vw] animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{selected.name} — {selected.section}</h3>
                <p className="text-xs text-gray-500">Capacity {selected.capacity} · {selected.status}</p>
              </div>
              <button onClick={() => { setSelected(null); setMergeWith(null); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['Vacant', 'Seated', 'Ordered', 'Awaiting Bill', 'Cleaning'] as TableStatus[]).map(s => (
                <button key={s} onClick={() => changeStatus(selected.id, s)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${selected.status === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                  {s}
                </button>
              ))}
            </div>

            {selected.status === 'Vacant' && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Seat guests</p>
                <div className="flex gap-2">
                  {Array.from({ length: selected.capacity }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => seatGuests(selected.id, n)}
                      className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-200">
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setMergeWith(selected.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <GitMerge className="w-3.5 h-3.5" /> Merge Table
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <MoveRight className="w-3.5 h-3.5" /> Move Order
              </button>
            </div>
            {mergeWith && (
              <p className="text-center text-xs text-blue-600 mt-2 font-medium animate-pulse">
                Now click a vacant table to merge with
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
