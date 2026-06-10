import { useState } from 'react';
import {
  CreditCard, Smartphone, Wallet, Banknote, Percent, Split,
  CheckCircle, Printer, Clock, X, Plus, Minus, Users
} from 'lucide-react';
import { ADMIN_TABLES, ADMIN_ORDERS, PAYMENT_HISTORY } from './adminMockData';

type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Wallet';

const METHOD_CONFIG: Record<PaymentMethod, { icon: React.ElementType; color: string; label: string }> = {
  UPI:    { icon: Smartphone, color: 'text-pink-600 bg-pink-50 border-pink-200',    label: 'UPI / QR' },
  Card:   { icon: CreditCard, color: 'text-blue-600 bg-blue-50 border-blue-200',    label: 'Card'     },
  Cash:   { icon: Banknote,   color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Cash' },
  Wallet: { icon: Wallet,     color: 'text-violet-600 bg-violet-50 border-violet-200', label: 'Wallet' },
};

const STATUS_PILL: Record<string, string> = {
  Success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Failed:  'bg-red-50 text-red-600 border-red-200',
};

export default function AdminBilling() {
  const occupiedTables = ADMIN_TABLES.filter(t => t.status === 'Ordered' || t.status === 'Awaiting Bill' || t.status === 'Seated');
  const [selectedTableId, setSelectedTableId] = useState(occupiedTables[0]?.id ?? null);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [discount, setDiscount] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [paid, setPaid] = useState<typeof PAYMENT_HISTORY>([...PAYMENT_HISTORY]);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedTable = ADMIN_TABLES.find(t => t.id === selectedTableId);
  const order = ADMIN_ORDERS.find(o => o.id === selectedTable?.orderId);

  const subtotal = order?.subtotal ?? 0;
  const tax = order?.tax ?? 0;
  const discountAmt = Math.round(subtotal * (parseFloat(discount || '0') / 100));
  const total = Math.max(0, subtotal + tax - discountAmt);
  const splitAmount = isSplit ? Math.ceil(total / splitCount) : total;

  function handleConfirm() {
    if (!selectedTable || !order) return;
    const newPayment = {
      id: `p${Date.now()}`,
      orderId: order.id,
      table: selectedTable.name,
      method,
      amount: total,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Success',
      customer: order.customer || 'Walk-in',
    };
    setPaid(prev => [newPayment, ...prev]);
    setSuccess(`₹${total.toLocaleString()} collected via ${method} from ${selectedTable.name}`);
    setTimeout(() => setSuccess(null), 4000);
    setDiscount('');
    setIsSplit(false);
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate bills, collect payments, and view history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: Table Selector ───────────────────────────── */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Active Tables</h3>
            <p className="text-xs text-gray-400">{occupiedTables.length} with open bills</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {occupiedTables.map(t => {
              const o = ADMIN_ORDERS.find(ord => ord.id === t.orderId);
              const isSelected = t.id === selectedTableId;
              return (
                <div key={t.id} onClick={() => setSelectedTableId(t.id)}
                  className={`px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-pink-50 border-r-2 border-pink-500' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">{t.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      t.status === 'Awaiting Bill' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Users className="w-3 h-3" /> {t.guestCount ?? 1} guests
                  </div>
                  {o && <p className="text-sm font-bold text-gray-900 mt-1">₹{o.total.toLocaleString()}</p>}
                </div>
              );
            })}
            {occupiedTables.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400">No active bills</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Center: Bill Preview ───────────────────────────── */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Invoice Preview</h3>
              {selectedTable && <p className="text-xs text-gray-400">{selectedTable.name} · {order?.time}</p>}
            </div>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>

          {order ? (
            <>
              <div className="flex-1 overflow-y-auto">
                {/* Restaurant header */}
                <div className="px-5 py-4 text-center border-b border-dashed border-gray-100">
                  <p className="font-bold text-gray-900">SmartDine Restaurant</p>
                  <p className="text-xs text-gray-400">842 Pastel Blvd, Los Angeles, CA</p>
                  <p className="text-xs text-gray-400">GSTIN: 27AAXXX1234Z1Z5</p>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-0.5">
                  <div className="grid grid-cols-12 text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
                    <span className="col-span-6">Item</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Rate</span>
                    <span className="col-span-2 text-right">Amt</span>
                  </div>
                  {order.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 text-sm py-1.5 border-b border-gray-50">
                      <span className="col-span-6 text-gray-800 font-medium">{item.name}</span>
                      <span className="col-span-2 text-center text-gray-500">{item.qty}</span>
                      <span className="col-span-2 text-right text-gray-500">₹{item.price}</span>
                      <span className="col-span-2 text-right text-gray-800 font-semibold">₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-5 py-4 space-y-1.5 border-t border-dashed border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>CGST (5%)</span><span>₹{Math.round(tax / 2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>SGST (5%)</span><span>₹{Math.round(tax / 2).toLocaleString()}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-medium">
                      <span>Discount ({discount}%)</span><span>−₹{discountAmt.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                    <span>TOTAL</span><span>₹{total.toLocaleString()}</span>
                  </div>
                  {isSplit && (
                    <div className="flex justify-between text-sm font-bold text-pink-600">
                      <span>Per Person ({splitCount} guests)</span><span>₹{splitAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center py-16">
              <div>
                <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Select a table to view bill</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Payment Panel ───────────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Discount */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Percent className="w-4 h-4 text-gray-400" /> Discount
            </h3>
            <div className="flex gap-2">
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                placeholder="0" min="0" max="100"
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400" />
              <span className="flex items-center text-sm text-gray-500 font-medium">%</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[5, 10, 15, 20].map(d => (
                <button key={d} onClick={() => setDiscount(d.toString())}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${discount === d.toString() ? 'bg-pink-400 text-white border-pink-400' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'}`}>
                  {d}%
                </button>
              ))}
            </div>
          </div>

          {/* Split Bill */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <Split className="w-4 h-4 text-gray-400" /> Split Bill
              </h3>
              <button onClick={() => setIsSplit(p => !p)}>
                {isSplit
                  ? <div className="w-10 h-5 bg-pink-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" /></div>
                  : <div className="w-10 h-5 bg-gray-200 rounded-full relative"><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" /></div>}
              </button>
            </div>
            {isSplit && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Number of guests</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSplitCount(p => Math.max(2, p - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="text-lg font-bold text-gray-900 w-8 text-center">{splitCount}</span>
                  <button onClick={() => setSplitCount(p => Math.min(10, p + 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                {order && <p className="text-sm font-bold text-pink-600 mt-2">₹{splitAmount.toLocaleString()} per person</p>}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(METHOD_CONFIG) as PaymentMethod[]).map(m => {
                const cfg = METHOD_CONFIG[m];
                return (
                  <button key={m} onClick={() => setMethod(m)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${method === m ? cfg.color + ' border-current' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <cfg.icon className="w-4 h-4 shrink-0" /> {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <button onClick={handleConfirm} disabled={!order}
            className="w-full py-4 bg-pink-400 text-white rounded-2xl text-base font-bold hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Collect ₹{total.toLocaleString()} via {method}
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Payment History</h3>
            <p className="text-xs text-gray-400">Today's completed transactions</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-4 h-4" />
            Total: ₹{paid.reduce((s, p) => s + p.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Txn ID', 'Order', 'Table', 'Customer', 'Method', 'Amount', 'Time', 'Status'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paid.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.orderId}</td>
                  <td className="px-4 py-3 text-gray-600">{p.table}</td>
                  <td className="px-4 py-3 text-gray-600">{p.customer}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      p.method === 'UPI' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                      p.method === 'Card' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      p.method === 'Cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-violet-50 text-violet-700 border-violet-200'}`}>
                      {p.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">₹{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.time}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_PILL[p.status] || STATUS_PILL.Pending}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
