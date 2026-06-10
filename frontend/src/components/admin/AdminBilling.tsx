import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CreditCard, Smartphone, Wallet, Banknote, Percent, Split,
  CheckCircle, Printer, Clock, Loader2, Receipt, Download, Users, Ban,
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import {
  useGenerateInvoice, useRecordPayment, useUpiQr, useSplitInvoice,
  useVoidInvoice, downloadInvoicePdf, openInvoicePdf, usePayments, useInvoice,
  useCurrentCashSession, useOpenCashSession, useCloseCashSession,
} from '@/hooks/useBilling';
import { useSocket } from '@/hooks/useSocket';
import type { OrderDto } from '@/lib/dto/orders';
import {
  type InvoiceDto, type PaymentMode, PAYMENT_MODE_LABELS,
} from '@/lib/dto/billing';

const METHOD_CONFIG: Record<PaymentMode, { icon: React.ElementType; color: string }> = {
  cash:          { icon: Banknote,   color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  upi:           { icon: Smartphone, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  card:          { icon: CreditCard, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  wallet:        { icon: Wallet,     color: 'text-violet-600 bg-violet-50 border-violet-200' },
  online_prepay: { icon: Smartphone, color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AdminBilling() {
  const qc = useQueryClient();

  // Orders ready to bill — anything past 'ready' that isn't settled / cancelled
  const { data: ordersPage } = useOrders({ limit: 100 });
  const billableOrders = (ordersPage?.items ?? []).filter(
    (o) => !['settled', 'cancelled'].includes(o.status),
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const { data: liveInvoice } = useInvoice(invoiceId);

  // Promotion / customer inputs
  const [discount, setDiscount] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Payment inputs
  const [mode, setMode] = useState<PaymentMode>('upi');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<string>('');
  const [txnRef, setTxnRef] = useState('');

  // Split UI
  const [splitMode, setSplitMode] = useState<'none' | 'equal'>('none');
  const [splitCount, setSplitCount] = useState(2);

  // UPI QR modal
  const [upiQrInfo, setUpiQrInfo] = useState<{ amount: number; deeplink: string; mocked: boolean } | null>(null);

  const generateMutation = useGenerateInvoice();
  const recordMutation = useRecordPayment();
  const upiMutation = useUpiQr();
  const splitMutation = useSplitInvoice();
  const voidMutation = useVoidInvoice();

  // Payment history (today's payments globally)
  const { data: paymentsPage } = usePayments({ status: 'success', limit: 50 });
  const payments = paymentsPage?.items ?? [];

  // Live updates
  useSocket('/staff', {
    'order:settled': () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const selectedOrder = useMemo(
    () => billableOrders.find((o) => o._id === selectedOrderId) ?? null,
    [billableOrders, selectedOrderId],
  );

  // Auto-select first billable order
  useEffect(() => {
    if (!selectedOrderId && billableOrders.length > 0) {
      setSelectedOrderId(billableOrders[0]._id);
    }
  }, [billableOrders, selectedOrderId]);

  // When invoice loads, default the pay amount to the due
  useEffect(() => {
    if (liveInvoice) setPayAmount(liveInvoice.amountDue);
  }, [liveInvoice]);

  // When the user picks a different order, clear the invoice
  useEffect(() => {
    setInvoiceId(null);
    setDiscount('');
    setCouponCode('');
    setLoyaltyPoints('');
    setCustomerName('');
    setCustomerPhone('');
    setSplitMode('none');
  }, [selectedOrderId]);

  function handleGenerate() {
    if (!selectedOrder) return;
    const points = parseInt(loyaltyPoints, 10);
    const disc = parseFloat(discount);
    generateMutation.mutate(
      {
        orderId: selectedOrder._id,
        input: {
          discount: Number.isFinite(disc) && disc > 0 ? disc : undefined,
          couponCode: couponCode.trim() || undefined,
          loyaltyPoints: Number.isFinite(points) && points > 0 ? points : undefined,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
        },
      },
      { onSuccess: (inv) => setInvoiceId(inv._id) },
    );
  }

  function handleRecord() {
    if (!liveInvoice || payAmount <= 0) return;
    recordMutation.mutate({
      invoiceId: liveInvoice._id,
      input: {
        mode,
        amount: payAmount,
        cashTendered: mode === 'cash' && cashTendered ? Number(cashTendered) : undefined,
        txnRef: txnRef.trim() || undefined,
      },
    }, {
      onSuccess: () => {
        setCashTendered('');
        setTxnRef('');
      },
    });
  }

  async function handleUpiQr() {
    if (!liveInvoice) return;
    const res = await upiMutation.mutateAsync(liveInvoice._id);
    if (res.upiDeeplink) {
      setUpiQrInfo({ amount: res.amount, deeplink: res.upiDeeplink, mocked: res.mocked });
    }
  }

  function handleSplit() {
    if (!liveInvoice) return;
    splitMutation.mutate({ id: liveInvoice._id, mode: 'equal', equalCount: splitCount });
  }

  function handleVoid() {
    if (!liveInvoice) return;
    const reason = prompt('Reason for voiding this invoice?');
    if (!reason || reason.trim().length < 3) return;
    voidMutation.mutate({ id: liveInvoice._id, reason: reason.trim() });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate invoices, collect payments, and view history</p>
        </div>
        <CashSessionWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left: Order Selector ───────────────────────────── */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Orders Ready to Bill</h3>
            <p className="text-xs text-gray-400">{billableOrders.length} open</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {billableOrders.map((o) => (
              <OrderRow
                key={o._id}
                order={o}
                selected={selectedOrderId === o._id}
                onSelect={() => setSelectedOrderId(o._id)}
              />
            ))}
            {billableOrders.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400">No bills to collect</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Center: Invoice Preview ───────────────────────────── */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Invoice Preview</h3>
              {selectedOrder && (
                <p className="text-xs text-gray-400">
                  Order {selectedOrder.orderNumber} · {fmtTime(selectedOrder.createdAt)}
                </p>
              )}
            </div>
            {liveInvoice && (
              <div className="flex gap-2">
                <button
                  onClick={() => openInvoicePdf(liveInvoice._id)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Open PDF
                </button>
                <button
                  onClick={() => downloadInvoicePdf(liveInvoice._id, liveInvoice.invoiceNumber)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            )}
          </div>

          {!selectedOrder ? (
            <div className="flex-1 flex items-center justify-center text-center py-16">
              <div>
                <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Pick an order to start billing</p>
              </div>
            </div>
          ) : !liveInvoice ? (
            <OrderPreview order={selectedOrder} />
          ) : (
            <InvoiceView invoice={liveInvoice} onVoid={handleVoid} />
          )}
        </div>

        {/* ── Right: Promo + Payment Panel ───────────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Promotions / customer info — only before invoice */}
          {selectedOrder && !liveInvoice && (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-400" /> Promotions
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Discount (₹)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                      className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Coupon Code</label>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="WELCOME100"
                      className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Loyalty points</label>
                    <input
                      type="number"
                      value={loyaltyPoints}
                      onChange={(e) => setLoyaltyPoints(e.target.value)}
                      placeholder="0"
                      className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" /> Customer (optional)
                </h3>
                <div className="space-y-2">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                  />
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full py-4 bg-pink-400 text-white rounded-2xl text-base font-bold hover:bg-pink-500 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
              >
                {generateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />}
                Generate Invoice
              </button>
            </>
          )}

          {/* Split + Payment — only after invoice exists */}
          {liveInvoice && liveInvoice.paymentStatus !== 'paid' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Split className="w-4 h-4 text-gray-400" /> Split bill
                </h3>
                {liveInvoice.splitMode === 'none' ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => setSplitMode((m) => (m === 'none' ? 'equal' : 'none'))}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${splitMode === 'equal' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                      >
                        Equal {splitMode === 'equal' ? '✓' : ''}
                      </button>
                      {splitMode === 'equal' && (
                        <input
                          type="number"
                          min={2}
                          max={20}
                          value={splitCount}
                          onChange={(e) => setSplitCount(Number(e.target.value))}
                          className="w-20 border border-gray-200 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:border-pink-400"
                        />
                      )}
                    </div>
                    {splitMode === 'equal' && (
                      <button
                        onClick={handleSplit}
                        disabled={splitMutation.isPending}
                        className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-black disabled:opacity-50"
                      >
                        {splitMutation.isPending ? 'Splitting…' : `Split into ${splitCount} guests`}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-1.5">
                    {liveInvoice.splits.map((s) => (
                      <div key={s._id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 font-medium">{s.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-bold">₹{s.amount.toLocaleString()}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            s.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                            s.status === 'partial' ? 'bg-amber-50 text-amber-700' :
                            'bg-gray-50 text-gray-500'
                          }`}>{s.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm">Record Payment</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(METHOD_CONFIG) as PaymentMode[]).map((m) => {
                    const cfg = METHOD_CONFIG[m];
                    return (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border-2 transition-all font-medium text-xs ${mode === m ? cfg.color + ' border-current' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        <cfg.icon className="w-4 h-4" />
                        {PAYMENT_MODE_LABELS[m]}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
                {mode === 'cash' && (
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Cash tendered</label>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder={String(payAmount)}
                      className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                    {cashTendered && Number(cashTendered) >= payAmount && (
                      <p className="text-xs text-emerald-600 font-medium mt-1">
                        Change: ₹{(Number(cashTendered) - payAmount).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                {(mode === 'card' || mode === 'wallet') && (
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Reference / Txn ID</label>
                    <input
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                      placeholder="Last 4 / UTR / wallet ref"
                      className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                )}
                {mode === 'upi' && (
                  <button
                    onClick={handleUpiQr}
                    disabled={upiMutation.isPending}
                    className="w-full py-2 border border-pink-200 text-pink-700 rounded-xl text-xs font-medium hover:bg-pink-50 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {upiMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                    Generate dynamic UPI QR
                  </button>
                )}
                <button
                  onClick={handleRecord}
                  disabled={recordMutation.isPending || payAmount <= 0}
                  className="w-full py-3 bg-pink-400 text-white rounded-xl text-sm font-bold hover:bg-pink-500 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                >
                  {recordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Collect ₹{payAmount.toLocaleString()}
                </button>
              </div>
            </>
          )}

          {liveInvoice && liveInvoice.paymentStatus === 'paid' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-6 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-base font-bold text-emerald-800">Invoice paid in full</p>
              <p className="text-xs text-emerald-700 mt-1">Order settled · cash drawer updated</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Recent Payments</h3>
            <p className="text-xs text-gray-400">Latest successful transactions</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-4 h-4" />
            Total: ₹{payments.reduce((s, p) => s + (p.amount - p.refundedAmount), 0).toLocaleString()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Payment', 'Order', 'Method', 'Amount', 'Cashier', 'Time'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p._id.slice(-8)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.orderId.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-700 border-gray-200 capitalize">
                      {p.mode.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">₹{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">{p.cashierId?.slice(-6) ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.receivedAt ? fmtTime(p.receivedAt) : '—'}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No payments yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPI QR modal */}
      {upiQrInfo && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setUpiQrInfo(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-80 text-center">
              <h3 className="font-bold text-gray-900 mb-1">Show this to the guest</h3>
              <p className="text-xs text-gray-500 mb-4">UPI payment for ₹{(upiQrInfo.amount / 100).toFixed(2)}</p>
              {upiQrInfo.mocked && (
                <div className="bg-amber-50 text-amber-800 text-xs rounded-lg px-3 py-2 mb-3">
                  Razorpay not configured — this is a mock UPI link
                </div>
              )}
              <a
                href={upiQrInfo.deeplink}
                target="_blank"
                rel="noreferrer"
                className="block bg-pink-50 border border-pink-200 rounded-xl py-3 px-2 text-xs font-mono text-pink-700 break-all hover:bg-pink-100 transition-colors"
              >
                {upiQrInfo.deeplink}
              </a>
              <p className="text-xs text-gray-400 mt-3">After the guest pays, Razorpay's webhook will auto-settle the order.</p>
              <button
                onClick={() => setUpiQrInfo(null)}
                className="mt-4 w-full py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OrderRow({ order, selected, onSelect }: { order: OrderDto; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${selected ? 'bg-pink-50 border-r-2 border-pink-500' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono font-bold text-gray-900 text-xs">{order.orderNumber}</span>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 uppercase">
          {order.status}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-600">{order.windowToken ?? (order.tableId ? 'Table' : 'Counter')}</p>
        <p className="text-sm font-bold text-gray-900">₹{order.totals.grand.toLocaleString()}</p>
      </div>
    </div>
  );
}

function OrderPreview({ order }: { order: OrderDto }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 py-4 text-center border-b border-dashed border-gray-100">
        <p className="font-semibold text-gray-900">Order {order.orderNumber}</p>
        <p className="text-xs text-gray-400">Awaiting invoice generation</p>
      </div>
      <div className="px-5 py-3 space-y-0.5">
        <div className="grid grid-cols-12 text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
          <span className="col-span-6">Item</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Rate</span>
          <span className="col-span-2 text-right">Amt</span>
        </div>
        {order.items.filter((i) => i.status !== 'cancelled').map((item) => (
          <div key={item._id} className="grid grid-cols-12 text-sm py-1.5 border-b border-gray-50">
            <span className="col-span-6 text-gray-800 font-medium">
              {item.name}
              {item.variantName && <span className="text-gray-400 font-normal"> · {item.variantName}</span>}
            </span>
            <span className="col-span-2 text-center text-gray-500">{item.qty}</span>
            <span className="col-span-2 text-right text-gray-500">₹{item.basePrice}</span>
            <span className="col-span-2 text-right text-gray-800 font-semibold">₹{item.lineTotal.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="px-5 py-4 space-y-1.5 border-t border-dashed border-gray-200">
        <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>₹{order.totals.subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-xs text-gray-500"><span>Tax</span><span>₹{order.totals.tax.toLocaleString()}</span></div>
        <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
          <span>TOTAL</span><span>₹{order.totals.grand.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function InvoiceView({ invoice, onVoid }: { invoice: InvoiceDto; onVoid: () => void }) {
  const r = invoice.restaurantSnapshot;
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 py-4 text-center border-b border-dashed border-gray-100">
        <p className="font-bold text-gray-900">{r.name}</p>
        {r.address && <p className="text-xs text-gray-400">{r.address}</p>}
        {r.gstin && <p className="text-xs text-gray-400">GSTIN: {r.gstin}</p>}
        {r.fssai && <p className="text-xs text-gray-400">FSSAI: {r.fssai}</p>}
      </div>

      <div className="px-5 py-3 flex justify-between items-center text-xs">
        <div>
          <p className="font-bold font-mono text-gray-800">{invoice.invoiceNumber}</p>
          <p className="text-gray-400">Order {invoice.orderNumberSnapshot}</p>
          {invoice.tableNumber && <p className="text-gray-400">Table {invoice.tableNumber}</p>}
        </div>
        <div className="text-right">
          <p className="text-gray-500">{new Date(invoice.issueDate).toLocaleString()}</p>
          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            invoice.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            invoice.paymentStatus === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            {invoice.paymentStatus.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="px-5 py-3 space-y-0.5">
        <div className="grid grid-cols-12 text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
          <span className="col-span-6">Item</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Rate</span>
          <span className="col-span-2 text-right">Amt</span>
        </div>
        {invoice.lineItems.map((li, i) => (
          <div key={i} className="grid grid-cols-12 text-sm py-1.5 border-b border-gray-50">
            <span className="col-span-6 text-gray-800 font-medium">
              {li.name}
              {li.variantName && <span className="text-gray-400 font-normal"> · {li.variantName}</span>}
            </span>
            <span className="col-span-2 text-center text-gray-500">{li.qty}</span>
            <span className="col-span-2 text-right text-gray-500">₹{li.unitPrice}</span>
            <span className="col-span-2 text-right text-gray-800 font-semibold">₹{li.lineTotal.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 space-y-1.5 border-t border-dashed border-gray-200">
        <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>₹{(invoice.subtotal + invoice.modifierTotal).toLocaleString()}</span></div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-xs text-emerald-600 font-medium">
            <span>Discount</span><span>−₹{invoice.discount.toLocaleString()}</span>
          </div>
        )}
        {invoice.serviceCharge > 0 && (
          <div className="flex justify-between text-xs text-gray-500"><span>Service Charge</span><span>₹{invoice.serviceCharge.toLocaleString()}</span></div>
        )}
        {invoice.taxBreakup.map((t, i) => (
          <div key={i} className="flex justify-between text-xs text-gray-500">
            <span>{t.name} @{t.rate}%</span><span>₹{t.amount.toLocaleString()}</span>
          </div>
        ))}
        {invoice.roundOff !== 0 && (
          <div className="flex justify-between text-xs text-gray-500"><span>Round-off</span><span>₹{invoice.roundOff.toFixed(2)}</span></div>
        )}
        <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
          <span>TOTAL</span><span>₹{invoice.grand.toLocaleString()}</span>
        </div>
        <p className="text-[10px] italic text-gray-400 pt-1">{invoice.amountInWords}</p>
        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Paid</span><span>₹{invoice.amountPaid.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-pink-700">
          <span>Due</span><span>₹{invoice.amountDue.toLocaleString()}</span>
        </div>
      </div>

      {invoice.promotions && (
        <div className="mx-5 mb-5 bg-violet-50 border border-violet-200 rounded-xl p-3 text-xs space-y-1">
          {invoice.promotions.discount && (
            <p>Discount <span className="font-semibold">{invoice.promotions.discount.name}</span> — ₹{invoice.promotions.discount.amount}</p>
          )}
          {invoice.promotions.coupon && (
            <p>Coupon <span className="font-mono font-semibold">{invoice.promotions.coupon.code}</span> — ₹{invoice.promotions.coupon.amount}</p>
          )}
          {invoice.promotions.loyalty && (
            <p>Loyalty <span className="font-semibold">{invoice.promotions.loyalty.pointsRedeemed} pts</span> — ₹{invoice.promotions.loyalty.amount}</p>
          )}
        </div>
      )}

      {invoice.status === 'final' && invoice.paymentStatus !== 'paid' && (
        <div className="mx-5 mb-5">
          <button
            onClick={onVoid}
            className="w-full py-2 border border-red-200 text-red-600 rounded-xl text-xs font-medium hover:bg-red-50 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Ban className="w-3.5 h-3.5" /> Void invoice
          </button>
        </div>
      )}
    </div>
  );
}

function CashSessionWidget() {
  const { data: session } = useCurrentCashSession();
  const openMutation = useOpenCashSession();
  const closeMutation = useCloseCashSession();
  const [openInput, setOpenInput] = useState('2000');
  const [closeInput, setCloseInput] = useState('');
  const [open, setOpen] = useState(false);

  if (!session) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400">Cash session</p>
          <p className="text-xs font-semibold text-gray-700">Not open</p>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={openInput}
            onChange={(e) => setOpenInput(e.target.value)}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400"
          />
          <button
            onClick={() => openMutation.mutate({ openingFloat: Number(openInput) })}
            disabled={openMutation.isPending}
            className="px-3 py-1.5 bg-pink-400 text-white rounded-lg text-xs font-medium hover:bg-pink-500 disabled:opacity-50"
          >
            {openMutation.isPending ? '…' : 'Open'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-emerald-600">Cash session open</p>
        <p className="text-xs text-gray-700">
          Float ₹{session.openingFloat.toLocaleString()} · Expected ₹{session.expectedCash.toLocaleString()}
        </p>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-black"
      >
        Close session
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[95vw] p-6">
              <h3 className="font-bold text-gray-900 mb-1">Close cash session</h3>
              <p className="text-xs text-gray-500 mb-4">Expected ₹{session.expectedCash.toLocaleString()} based on cash payments collected</p>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Actual cash counted</label>
              <input
                type="number"
                autoFocus
                value={closeInput}
                onChange={(e) => setCloseInput(e.target.value)}
                placeholder={String(session.expectedCash)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
              />
              {closeInput && (
                <p className={`mt-2 text-xs font-semibold ${
                  Number(closeInput) === session.expectedCash ? 'text-emerald-600' :
                  Number(closeInput) > session.expectedCash ? 'text-blue-600' :
                  'text-red-600'
                }`}>
                  Variance: ₹{(Number(closeInput) - session.expectedCash).toLocaleString()}
                </p>
              )}
              <div className="flex gap-3 mt-5">
                <button onClick={() => setOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!closeInput) return;
                    closeMutation.mutate({ id: session._id, actualCash: Number(closeInput) }, {
                      onSuccess: () => { setOpen(false); setCloseInput(''); },
                    });
                  }}
                  disabled={closeMutation.isPending || !closeInput}
                  className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 disabled:opacity-50"
                >
                  {closeMutation.isPending ? 'Closing…' : 'Close session'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
