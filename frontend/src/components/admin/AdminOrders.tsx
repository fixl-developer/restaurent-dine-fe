import { useState } from 'react';
import {
  Search, X, ChevronRight, Clock, User, Phone, MapPin,
  CreditCard, FileText, CheckCircle, Circle, Loader
} from 'lucide-react';
import { ADMIN_ORDERS, AdminOrder, OrderStatus, OrderChannel } from './adminMockData';

const STATUS_STYLES: Record<OrderStatus, string> = {
  New:       'bg-blue-50 text-blue-700 border-blue-200',
  Preparing: 'bg-amber-50 text-amber-700 border-amber-200',
  Ready:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Served:    'bg-gray-50 text-gray-600 border-gray-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const CHANNEL_STYLES: Record<OrderChannel, string> = {
  'Dine-In':  'bg-violet-50 text-violet-700',
  'Takeaway': 'bg-blue-50 text-blue-700',
  'Delivery': 'bg-orange-50 text-orange-700',
};

const STATUS_FLOW: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Served'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>(ADMIN_ORDERS);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [channelFilter, setChannelFilter] = useState<OrderChannel | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminOrder | null>(orders[0]);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchChannel = channelFilter === 'All' || o.channel === channelFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.table.toLowerCase().includes(q) || (o.customer || '').toLowerCase().includes(q);
    return matchStatus && matchChannel && matchSearch;
  });

  const counts: Record<string, number> = {
    All: orders.length,
    New: orders.filter(o => o.status === 'New').length,
    Preparing: orders.filter(o => o.status === 'Preparing').length,
    Ready: orders.filter(o => o.status === 'Ready').length,
    Served: orders.filter(o => o.status === 'Served').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  function advanceStatus(id: string) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id || o.status === 'Served' || o.status === 'Cancelled') return o;
      const idx = STATUS_FLOW.indexOf(o.status);
      const next = STATUS_FLOW[idx + 1] || o.status;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const tl = o.timeline.map((t, i) => i === idx + 1 ? { ...t, time: now, done: true } : t);
      return { ...o, status: next, timeline: tl };
    }));
    if (selected?.id === id) {
      setSelected(o => o ? { ...o, status: (o => {
        const idx = STATUS_FLOW.indexOf(o.status);
        return STATUS_FLOW[idx + 1] || o.status;
      })(o) } : null);
    }
  }

  function cancelOrder(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o));
    if (selected?.id === id) setSelected(o => o ? { ...o, status: 'Cancelled' } : null);
  }

  return (
    <div className="flex gap-0 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Order List ───────────────────────────────────────────────── */}
      <div className="w-[380px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search orders, tables..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50" />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {(['All', 'New', 'Preparing', 'Ready', 'Served', 'Cancelled'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${statusFilter === s ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusFilter === s ? 'bg-white/30 text-white' : 'bg-white text-gray-500'}`}>{counts[s]}</span>
              </button>
            ))}
          </div>

          {/* Channel filter */}
          <div className="flex gap-1">
            {(['All', 'Dine-In', 'Takeaway', 'Delivery'] as const).map(c => (
              <button key={c} onClick={() => setChannelFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${channelFilter === c ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map(order => (
            <div key={order.id}
              onClick={() => setSelected(order)}
              className={`px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === order.id ? 'bg-pink-50 border-r-2 border-pink-500' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">{order.id}</span>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${CHANNEL_STYLES[order.channel]}`}>{order.channel}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[order.status]}`}>{order.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-700 font-medium">{order.table}</p>
                  {order.customer && <p className="text-[10px] text-gray-400">{order.customer}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-0.5 justify-end">
                    <Clock className="w-3 h-3" />{order.time}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 truncate">{order.items.map(i => `${i.qty}× ${i.name}`).join(', ')}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <FileText className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Order Detail ─────────────────────────────────────────────── */}
      {selected ? (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-2xl mx-auto p-6 space-y-5">

            {/* Detail Header */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-gray-900">{selected.id}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CHANNEL_STYLES[selected.channel]}`}>{selected.channel}</span>
                  </div>
                  <p className="text-sm text-gray-500">{selected.table} · {selected.time} · {selected.duration} ago</p>
                </div>
                {selected.waiter && <p className="text-xs text-gray-400">Waiter: <span className="font-medium text-gray-700">{selected.waiter}</span></p>}
              </div>

              {/* Action buttons */}
              {selected.status !== 'Served' && selected.status !== 'Cancelled' && (
                <div className="flex gap-3">
                  <button onClick={() => advanceStatus(selected.id)}
                    className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
                    {selected.status === 'New' ? '→ Start Preparing' :
                      selected.status === 'Preparing' ? '→ Mark Ready' : '→ Mark Served'}
                  </button>
                  <button onClick={() => cancelOrder(selected.id)}
                    className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Order Items</h3>
                <span className="text-xs text-gray-400">{selected.items.reduce((s, i) => s + i.qty, 0)} items</span>
              </div>
              <div className="divide-y divide-gray-50">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">× {item.qty}</span>
                      <span className="text-sm font-semibold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>₹{selected.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span>GST (10%)</span><span>₹{selected.tax.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-gray-200"><span>Total</span><span>₹{selected.total.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Order Timeline</h3>
              <div className="space-y-4">
                {selected.timeline.filter(t => t.label).map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${t.done ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-200'}`}>
                      {t.done
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        : <Circle className="w-3.5 h-3.5 text-gray-300" />}
                    </div>
                    <div className="pt-0.5">
                      <p className={`text-sm font-medium ${t.done ? 'text-gray-900' : 'text-gray-400'}`}>{t.label}</p>
                      {t.time && <p className="text-xs text-gray-400">{t.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer + Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm">Customer</h3>
                {selected.customer ? (
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" />{selected.customer}</div>
                    {selected.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{selected.phone}</div>}
                    {selected.address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /><span className="text-xs">{selected.address}</span></div>}
                  </div>
                ) : <p className="text-xs text-gray-400">Walk-in customer</p>}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm">Payment</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Status</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selected.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      selected.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-gray-50 text-gray-500 border-gray-200'}`}>{selected.paymentStatus}</span>
                  </div>
                  {selected.paymentMethod && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Method</span>
                      <span className="text-xs font-medium text-gray-700">{selected.paymentMethod}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-sm font-bold text-gray-900">₹{selected.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selected.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                <h3 className="font-semibold text-amber-800 text-sm mb-1">Order Notes</h3>
                <p className="text-sm text-amber-700">{selected.notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <Loader className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Select an order to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}
