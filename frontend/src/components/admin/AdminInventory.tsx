import { useState } from 'react';
import {
  Plus, Minus, AlertTriangle, Package, TrendingDown, X, Search,
  ArrowUpCircle, ArrowDownCircle, Filter, CheckCircle
} from 'lucide-react';
import { ADMIN_INVENTORY, InventoryItem } from './adminMockData';

const STATUS_COLORS: Record<string, string> = {
  OK:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  Low:      'bg-amber-50 text-amber-700 border-amber-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
  Out:      'bg-gray-50 text-gray-500 border-gray-200',
};

function KpiCard({ label, value, sub, color, icon: Icon }:
  { label: string; value: string | number; sub?: string; color: string; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

type ModalType = 'in' | 'out' | null;

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>(ADMIN_INVENTORY);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('Consumed');
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const statuses = ['All', 'OK', 'Low', 'Critical', 'Out'];

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    const matchCat = catFilter === 'All' || i.category === catFilter;
    const matchStatus = statusFilter === 'All' || i.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const critical = items.filter(i => i.status === 'Critical' || i.status === 'Out');
  const low = items.filter(i => i.status === 'Low');
  const totalValue = items.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function openModal(type: ModalType, item: InventoryItem) {
    setModal(type); setSelectedItem(item); setQty(''); setReason('Consumed'); setSupplier(''); setNote('');
  }

  function submitStockIn() {
    const q = parseFloat(qty);
    if (!q || q <= 0 || !selectedItem) return;
    setItems(prev => prev.map(i => {
      if (i.id !== selectedItem.id) return i;
      const next = i.currentStock + q;
      const status: InventoryItem['status'] = next <= 0 ? 'Out' : next < i.minStock * 0.4 ? 'Critical' : next < i.minStock ? 'Low' : 'OK';
      return { ...i, currentStock: next, lastRestocked: 'Today', status };
    }));
    showToast(`+${q} ${selectedItem.unit} added to ${selectedItem.name}`);
    setModal(null);
  }

  function submitStockOut() {
    const q = parseFloat(qty);
    if (!q || q <= 0 || !selectedItem) return;
    setItems(prev => prev.map(i => {
      if (i.id !== selectedItem.id) return i;
      const next = Math.max(0, i.currentStock - q);
      const status: InventoryItem['status'] = next <= 0 ? 'Out' : next < i.minStock * 0.4 ? 'Critical' : next < i.minStock ? 'Low' : 'OK';
      const isWaste = reason === 'Wasted' || reason === 'Damaged';
      return { ...i, currentStock: next, status,
        consumedToday: isWaste ? i.consumedToday : i.consumedToday + q,
        wastedToday: isWaste ? i.wastedToday + q : i.wastedToday };
    }));
    showToast(`-${q} ${selectedItem.unit} recorded as ${reason} from ${selectedItem.name}`);
    setModal(null);
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track stock levels, consumption, and wastage</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setModal('in'); setSelectedItem(items[0]); setQty(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
            <ArrowUpCircle className="w-4 h-4" /> Stock In
          </button>
          <button onClick={() => { setModal('out'); setSelectedItem(items[0]); setQty(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <ArrowDownCircle className="w-4 h-4" /> Stock Out
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Items" value={items.length} sub="Tracked ingredients" color="bg-blue-50 text-blue-600" icon={Package} />
        <KpiCard label="Critical / Out" value={critical.length} sub="Immediate reorder needed" color="bg-red-50 text-red-600" icon={AlertTriangle} />
        <KpiCard label="Low Stock" value={low.length} sub="Order within 24 hrs" color="bg-amber-50 text-amber-600" icon={TrendingDown} />
        <KpiCard label="Total Stock Value" value={`₹${Math.round(totalValue).toLocaleString()}`} sub="At current cost" color="bg-emerald-50 text-emerald-600" icon={Package} />
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50">
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {items.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Item', 'Category', 'Current Stock', 'Min / Max', 'Today Consumed', 'Wasted', 'Cost/Unit', 'Last Restocked', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => {
                const pct = Math.min(100, (item.currentStock / item.minStock) * 100);
                const barColor = item.status === 'Critical' || item.status === 'Out' ? 'bg-red-500' :
                  item.status === 'Low' ? 'bg-amber-400' : 'bg-emerald-500';
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{item.category}</td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap font-medium">{item.currentStock} {item.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{item.minStock} / {item.maxStock} {item.unit}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{item.consumedToday} {item.unit}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={item.wastedToday > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}>{item.wastedToday} {item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">₹{item.costPerUnit}/{item.unit}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{item.lastRestocked}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openModal('in', item)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Stock In">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openModal('out', item)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Stock Out">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In / Out Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${modal === 'in' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-3">
                {modal === 'in'
                  ? <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                  : <ArrowDownCircle className="w-5 h-5 text-red-500" />}
                <h3 className="font-semibold text-gray-900">{modal === 'in' ? 'Record Stock In' : 'Record Stock Out'}</h3>
              </div>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Item</label>
                <select value={selectedItem?.id} onChange={e => setSelectedItem(items.find(i => i.id === e.target.value) || null)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400">
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} (Current: {i.currentStock} {i.unit})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Quantity ({selectedItem?.unit})
                </label>
                <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
              </div>
              {modal === 'in' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier / Source</label>
                  <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g. Amul Dairy"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
                </div>
              )}
              {modal === 'out' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Reason</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Consumed', 'Wasted', 'Damaged', 'Transfer'].map(r => (
                      <button key={r} onClick={() => setReason(r)}
                        className={`py-2 text-sm rounded-xl border font-medium transition-colors ${reason === r ? 'bg-pink-400 text-white border-pink-400' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Additional information..."
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
              </div>
            </div>

            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={modal === 'in' ? submitStockIn : submitStockOut}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${modal === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'}`}>
                {modal === 'in' ? 'Add Stock' : 'Record Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
