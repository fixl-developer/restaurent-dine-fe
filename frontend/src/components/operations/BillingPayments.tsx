import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Receipt, CreditCard, Banknote, Smartphone,
  Wallet, Percent, Printer, CheckCircle2, X, Loader2,
  Download, LogOut, RefreshCw, Clock, Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLogout } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import {
  useGenerateInvoice, useRecordPayment, useUpiQr,
  downloadInvoicePdf, openInvoicePdf, useInvoice,
  useCurrentCashSession, useOpenCashSession, useCloseCashSession,
} from '@/hooks/useBilling';
import { useSocket } from '@/hooks/useSocket';
import type { OrderDto } from '@/lib/dto/orders';
import { type PaymentMode, PAYMENT_MODE_LABELS } from '@/lib/dto/billing';

function fmtINR(n: number) {
  return `₹${n.toFixed(2)}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const METHOD_CONFIG: Record<PaymentMode, { icon: React.ElementType; color: string }> = {
  cash:          { icon: Banknote,   color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  upi:           { icon: Smartphone, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  card:          { icon: CreditCard, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  wallet:        { icon: Wallet,     color: 'text-violet-600 bg-violet-50 border-violet-200' },
  online_prepay: { icon: Smartphone, color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

export default function BillingPayments({ onExit }: { onExit: () => void }) {
  const qc = useQueryClient();
  const logoutMutation = useLogout();

  // Load all active orders (not settled/cancelled) — staff picks which to bill
  const ordersQuery = useOrders({ limit: 100 });
  const { data: cashSession } = useCurrentCashSession();
  const openCashSession = useOpenCashSession();
  const closeCashSession = useCloseCashSession();
  const generateInvoice = useGenerateInvoice();
  const recordPayment = useRecordPayment();
  const upiQr = useUpiQr();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMode>('cash');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashTendered, setCashTendered] = useState('');
  const [openingFloat, setOpeningFloat] = useState('');
  const [showCashOpen, setShowCashOpen] = useState(false);
  const [showCashClose, setShowCashClose] = useState(false);
  const [actualCash, setActualCash] = useState('');
  const [upiQrData, setUpiQrData] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'bill' | 'pay' | 'done'>('select');

  const invoiceQuery = useInvoice(invoiceId);
  const invoice = invoiceQuery.data;

  const orders = (ordersQuery.data?.items ?? []).filter(
    (o) => o.status !== 'settled' && o.status !== 'cancelled',
  );

  // Real-time updates
  useSocket('/billing', {
    'order:updated': () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
    'invoice:updated': () => qc.invalidateQueries({ queryKey: ['invoices'] }),
    'payment:recorded': () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  async function handleGenerateInvoice() {
    if (!selectedOrderId) return;
    const result = await generateInvoice.mutateAsync({
      orderId: selectedOrderId,
      input: {
        couponCode: discountCode || undefined,
        discount: discountAmount > 0 ? discountAmount : undefined,
      },
    });
    setInvoiceId(result._id);
    setStep('pay');
  }

  async function handleRecordPayment() {
    if (!invoiceId || !invoice) return;
    const amount = invoice.amountDue;
    const tendered = paymentMethod === 'cash' ? parseFloat(cashTendered) || amount : undefined;

    if (paymentMethod === 'upi') {
      const qrData = await upiQr.mutateAsync(invoiceId);
      setUpiQrData(qrData.upiDeeplink ?? 'UPI QR generated — check terminal');
      return;
    }

    await recordPayment.mutateAsync({
      invoiceId,
      input: {
        mode: paymentMethod,
        amount,
        cashTendered: tendered,
      },
    });
    setStep('done');
  }

  function resetFlow() {
    setSelectedOrderId(null);
    setInvoiceId(null);
    setStep('select');
    setDiscountCode('');
    setDiscountAmount(0);
    setCashTendered('');
    setUpiQrData(null);
  }

  const selectedOrder = orders.find((o) => o._id === selectedOrderId);

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#1a1a1a] flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#1a1a1a] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8447A] flex items-center justify-center">
            <Receipt className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[13px] font-black uppercase tracking-[0.15em] text-white">Billing & Payments</h1>
            <p className="text-[9px] text-white/40 uppercase tracking-widest">
              {cashSession?.status === 'open'
                ? `Cash Session Open · Float ₹${cashSession.openingFloat}`
                : 'No Cash Session'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cashSession?.status !== 'open' && (
            <button
              onClick={() => setShowCashOpen(true)}
              className="text-[10px] font-mono text-emerald-400 border border-emerald-400/30 px-2.5 py-1.5 rounded-lg hover:border-emerald-400 transition-all uppercase tracking-widest"
            >
              Open Cash
            </button>
          )}
          {cashSession?.status === 'open' && (
            <button
              onClick={() => setShowCashClose(true)}
              className="text-[10px] font-mono text-amber-400 border border-amber-400/30 px-2.5 py-1.5 rounded-lg hover:border-amber-400 transition-all uppercase tracking-widest"
            >
              Close Cash
            </button>
          )}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 border border-white/15 px-2.5 py-1.5 rounded-lg hover:text-white transition-all uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" /> Exit
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 text-[10px] font-mono text-[#E8447A]/70 border border-[#E8447A]/20 px-2.5 py-1.5 rounded-lg hover:text-[#E8447A] transition-all uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Order list */}
        <div className="w-72 border-r border-gray-200 overflow-y-auto bg-gray-50/50">
          <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Active Orders</p>
            <button onClick={() => ordersQuery.refetch()} className="text-gray-400 hover:text-gray-700">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {ordersQuery.isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          )}

          {orders.length === 0 && !ordersQuery.isLoading && (
            <p className="text-center text-xs text-gray-400 py-12">No active orders</p>
          )}

          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <button
                key={order._id}
                onClick={() => {
                  setSelectedOrderId(order._id);
                  setStep('bill');
                  setInvoiceId(null);
                  setUpiQrData(null);
                }}
                className={`w-full text-left px-3 py-3 hover:bg-white transition-colors ${
                  selectedOrderId === order._id ? 'bg-white border-l-2 border-[#E8447A]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-900">#{order.orderNumber}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                    order.status === 'served' ? 'bg-green-100 text-green-700' :
                    order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{order.status}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {order.channel.replace('_', '-')}
                  </span>
                  <span className="font-mono font-bold text-gray-700">{fmtINR(order.totals.grand)}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                  <Clock className="w-3 h-3" />
                  {fmtTime(order.createdAt)}
                  <span className="ml-1">{order.items.length} items</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Billing panel */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selectedOrder && (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">Select an order to bill</p>
                <p className="text-xs text-gray-400 mt-1">All served and active orders appear on the left</p>
              </div>
            </div>
          )}

          {selectedOrder && step === 'bill' && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h2>
                <button onClick={resetFlow} className="text-gray-400 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Line items */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700">Items</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {selectedOrder.items.filter((i) => i.status !== 'cancelled').map((item) => (
                    <div key={item._id} className="px-4 py-2.5 flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900">{item.qty}× {item.name}</p>
                        {item.variantName && (
                          <p className="text-[10px] text-gray-400">{item.variantName}</p>
                        )}
                      </div>
                      <span className="text-xs font-mono text-gray-700">{fmtINR(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-mono">{fmtINR(selectedOrder.totals.subtotal)}</span>
                  </div>
                  {selectedOrder.totals.discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Discount</span>
                      <span className="font-mono">−{fmtINR(selectedOrder.totals.discount)}</span>
                    </div>
                  )}
                  {selectedOrder.totals.tax > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Tax</span>
                      <span className="font-mono">{fmtINR(selectedOrder.totals.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total</span>
                    <span className="font-mono">{fmtINR(selectedOrder.totals.grand)}</span>
                  </div>
                </div>
              </div>

              {/* Discount */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-pink-500" /> Discount / Coupon
                </p>
                <div className="flex gap-2">
                  <input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code (optional)"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-400"
                  />
                </div>
                <input
                  type="number"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Manual discount amount (₹)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-400"
                />
              </div>

              <button
                onClick={handleGenerateInvoice}
                disabled={generateInvoice.isPending}
                className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generateInvoice.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                Generate Invoice
              </button>
            </div>
          )}

          {step === 'pay' && invoice && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h2>
                <button onClick={resetFlow} className="text-gray-400 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Invoice summary */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{fmtINR(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Discount</span>
                    <span className="font-mono">−{fmtINR(invoice.discount)}</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tax</span>
                    <span className="font-mono">{fmtINR(invoice.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span className="font-mono">{fmtINR(invoice.grand)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#E8447A] pt-1">
                  <span>Amount Due</span>
                  <span className="font-mono">{fmtINR(invoice.amountDue)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-700">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(METHOD_CONFIG) as PaymentMode[]).map((mode) => {
                    const { icon: Icon, color } = METHOD_CONFIG[mode];
                    return (
                      <button
                        key={mode}
                        onClick={() => setPaymentMethod(mode)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                          paymentMethod === mode
                            ? `${color} border-current`
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {PAYMENT_MODE_LABELS[mode]}
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'cash' && (
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1.5">Cash Tendered</p>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder={`₹${invoice.amountDue.toFixed(2)}`}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-pink-400"
                    />
                    {cashTendered && parseFloat(cashTendered) > invoice.amountDue && (
                      <p className="text-xs text-emerald-600 mt-1 font-medium">
                        Change: {fmtINR(parseFloat(cashTendered) - invoice.amountDue)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* UPI QR */}
              {upiQrData && (
                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 text-center space-y-2">
                  <p className="text-xs font-semibold text-pink-700">UPI QR Code</p>
                  <p className="text-[10px] text-pink-600">{upiQrData}</p>
                  <button
                    onClick={() => recordPayment.mutateAsync({ invoiceId: invoice._id, input: { mode: 'upi', amount: invoice.amountDue } }).then(() => setStep('done'))}
                    className="text-xs text-pink-700 font-medium underline"
                  >
                    Mark as paid manually
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await openInvoicePdf(invoice._id);
                  }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 flex items-center justify-center gap-1.5 hover:border-gray-300"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => downloadInvoicePdf(invoice._id, invoice.invoiceNumber)}
                  className="py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 flex items-center gap-1.5 hover:border-gray-300"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={recordPayment.isPending || upiQr.isPending}
                  className="flex-1 py-2.5 bg-[#E8447A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {recordPayment.isPending || upiQr.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Collect {fmtINR(invoice.amountDue)}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="max-w-lg mx-auto flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Payment Collected!</h2>
                <p className="text-sm text-gray-500 mt-1">Order has been settled.</p>
              </div>
              <div className="flex gap-3">
                {invoiceId && (
                  <button
                    onClick={() => downloadInvoicePdf(invoiceId, invoice?.invoiceNumber ?? 'INV')}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm flex items-center gap-1.5 text-gray-600 hover:border-gray-300"
                  >
                    <Download className="w-4 h-4" /> Receipt
                  </button>
                )}
                <button
                  onClick={resetFlow}
                  className="px-6 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-sm font-bold"
                >
                  Next Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cash Session Open Modal */}
      {showCashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">Open Cash Session</h3>
            <input
              type="number"
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
              placeholder="Opening float (₹)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCashOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
              <button
                onClick={() => openCashSession.mutateAsync({ openingFloat: parseFloat(openingFloat) || 0 }).then(() => setShowCashOpen(false))}
                disabled={openCashSession.isPending}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Session Close Modal */}
      {showCashClose && cashSession && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-1">Close Cash Session</h3>
            <p className="text-xs text-gray-500 mb-4">Expected cash: {fmtINR(cashSession.expectedCash ?? 0)}</p>
            <input
              type="number"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              placeholder="Actual cash counted (₹)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCashClose(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
              <button
                onClick={() => closeCashSession.mutateAsync({ id: cashSession._id, actualCash: parseFloat(actualCash) || 0 }).then(() => setShowCashClose(false))}
                disabled={closeCashSession.isPending}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                Close Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
