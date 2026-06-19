import { useState } from 'react';
import {
  ArrowLeft, Receipt, CreditCard, Banknote, Smartphone,
  Percent, Tag, Printer, CheckCircle2, X, ChevronDown,
  Split, User, Phone, Hash, Building2, AlertCircle, Copy, LogOut
} from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';

interface BillItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  category: string;
}

interface TableBill {
  tableId: string;
  tableLabel: string;
  zone: string;
  customerName: string;
  serverName: string;
  items: BillItem[];
  seatedMins: number;
}

const MOCK_BILLS: TableBill[] = [
  {
    tableId: 't3', tableLabel: 'T3 · Window', zone: 'Window', customerName: 'ETHAN HUNT', serverName: 'Mia W.', seatedMins: 42,
    items: [
      { id: 'i1', name: 'Wok-fired Handmade Egg Noodles', qty: 2, unitPrice: 12.00, category: 'Mains' },
      { id: 'i2', name: 'Garden Fresh Tossed Salad', qty: 1, unitPrice: 9.50, category: 'Mains' },
      { id: 'i3', name: 'Peach Garden Strawberry Matcha Latte', qty: 2, unitPrice: 5.50, category: 'Drinks' },
      { id: 'i4', name: 'Signature Chili Soy Dipping Sauce', qty: 1, unitPrice: 1.50, category: 'Sides' },
    ],
  },
  {
    tableId: 't4', tableLabel: 'T4 · Window', zone: 'Window', customerName: 'ARIA VANCE', serverName: 'Sophia C.', seatedMins: 68,
    items: [
      { id: 'i5', name: 'Strawberry Icing Velvet Cake', qty: 2, unitPrice: 6.80, category: 'Sweets' },
      { id: 'i6', name: 'Double Matcha Crème Mille Crêpe', qty: 1, unitPrice: 7.90, category: 'Sweets' },
      { id: 'i7', name: 'Peach Oatmeal Cream Smoothie', qty: 2, unitPrice: 5.00, category: 'Drinks' },
      { id: 'i8', name: 'Creamy Potato & Egg Salad Plate', qty: 1, unitPrice: 4.80, category: 'Sides' },
    ],
  },
  {
    tableId: 'm5', tableLabel: 'T5 · Main Floor', zone: 'Main Floor', customerName: 'CHLOE GOMEZ', serverName: 'James K.', seatedMins: 55,
    items: [
      { id: 'i9',  name: 'Sesame Glazed Braised Pork Rice', qty: 2, unitPrice: 13.90, category: 'Mains' },
      { id: 'i10', name: 'Sichuan Sesame Chili Noodles', qty: 1, unitPrice: 11.50, category: 'Mains' },
      { id: 'i11', name: 'Sweet Raspberry Infusion Soda', qty: 3, unitPrice: 4.80, category: 'Drinks' },
      { id: 'i12', name: 'Diner Golden Egg Potato Croquettes', qty: 2, unitPrice: 5.20, category: 'Sides' },
      { id: 'i13', name: 'Coquette Berry Whipped Princess Cake', qty: 1, unitPrice: 8.20, category: 'Sweets' },
    ],
  },
  {
    tableId: 'p17', tableLabel: 'P3 · Patio Garden', zone: 'Patio Garden', customerName: 'SARA WILDE', serverName: 'Mia W.', seatedMins: 72,
    items: [
      { id: 'i14', name: 'Golden Peach Morning Oat Bowl', qty: 2, unitPrice: 8.50, category: 'Sweets' },
      { id: 'i15', name: 'Classic Berry Chia Oats Porridge', qty: 2, unitPrice: 7.50, category: 'Sweets' },
      { id: 'i16', name: 'Peach Garden Strawberry Matcha Latte', qty: 4, unitPrice: 5.50, category: 'Drinks' },
    ],
  },
];

type PaymentMethod = 'upi' | 'cash' | 'card';
type InvoiceView = 'billing' | 'gst-invoice';

const COUPON_CODES: Record<string, number> = {
  'SMART10': 10,
  'WELCOME5': 5,
  'FEAST15': 15,
};

const CGST_RATE = 0.025;
const SGST_RATE = 0.025;

interface SplitEntry { label: string; amount: number; paid: boolean; }

export default function BillingPayments({ onExit }: { onExit: () => void }) {
  const logoutMutation = useLogout();
  const [selectedTableId, setSelectedTableId] = useState<string>('t3');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; pct: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [invoiceView, setInvoiceView] = useState<InvoiceView>('billing');
  const [showSplit, setShowSplit] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splitEntries, setSplitEntries] = useState<SplitEntry[]>([]);
  const [paymentDone, setPaymentDone] = useState(false);
  const [cashReceived, setCashReceived] = useState('');

  const bill = MOCK_BILLS.find(b => b.tableId === selectedTableId)!;
  const subtotal = bill.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discountAmt = appliedCoupon ? subtotal * (appliedCoupon.pct / 100) : 0;
  const afterDiscount = subtotal - discountAmt;
  const cgst = afterDiscount * CGST_RATE;
  const sgst = afterDiscount * SGST_RATE;
  const grandTotal = afterDiscount + cgst + sgst;

  // Convert to INR for display (1 USD ~ 83 INR)
  const inr = (usd: number) => `₹${(usd * 83).toFixed(2)}`;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPON_CODES[code]) {
      setAppliedCoupon({ code, pct: COUPON_CODES[code] });
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const buildSplitEntries = (count: number) => {
    const perPerson = grandTotal / count;
    setSplitEntries(
      Array.from({ length: count }, (_, i) => ({
        label: `Person ${i + 1}`,
        amount: perPerson,
        paid: false,
      }))
    );
    setShowSplit(true);
  };

  const toggleSplitPaid = (i: number) => {
    setSplitEntries(prev => prev.map((e, idx) => idx === i ? { ...e, paid: !e.paid } : e));
  };

  const handlePay = () => {
    setPaymentDone(true);
  };

  const invoiceNumber = `INV-2026-${bill.tableId.toUpperCase()}-${Date.now().toString().slice(-5)}`;

  if (paymentDone) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#1a1a1a] flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E8447A]/20 border-2 border-[#E8447A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[#E8447A]" />
          </div>
          <div>
            <h2 className="text-[20px] font-barlow font-black uppercase text-[#E8447A] tracking-wide">Payment Successful</h2>
            <p className="text-[13px] text-[#1a1a1a]/50 mt-1">{bill.tableLabel} · {bill.customerName}</p>
          </div>
          <div className="bg-white rounded-[22px] border border-[#E8447A]/40 p-4 text-left space-y-2">
            <InfoRow2 label="Amount Paid" value={inr(grandTotal)} highlight />
            <InfoRow2 label="Method" value={paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'cash' ? 'Cash' : 'Card'} />
            <InfoRow2 label="Invoice" value={invoiceNumber} />
            <InfoRow2 label="Server" value={bill.serverName} />
          </div>
          <button
            onClick={() => { setPaymentDone(false); setAppliedCoupon(null); }}
            className="w-full py-3 rounded-[100px] bg-[#1a1a1a] text-[#FFFFFF] text-[13px] font-medium uppercase tracking-wider hover:bg-[#1a1a1a]/80 transition-colors"
          >
            New Transaction
          </button>
          <button
            onClick={onExit}
            className="w-full py-2.5 rounded-xl border border-[rgba(26,26,26,0.18)] text-[12px] font-medium text-[#1a1a1a]/60 hover:bg-[rgba(26,26,26,0.05)]"
          >
            Exit Billing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#1a1a1a] flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#1a1a1a] border-b-2 border-[#E8447A]/60 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8447A] flex items-center justify-center">
            <Receipt className="w-4 h-4 text-[#1a1a1a]" />
          </div>
          <div>
            <h1 className="text-[13px] font-barlow font-black uppercase tracking-[0.15em] text-[#E8447A]">Billing & Payments</h1>
            <p className="text-[9px] text-[#E8447A]/50 uppercase tracking-widest">SMARTDINE · POS TERMINAL</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInvoiceView(invoiceView === 'billing' ? 'gst-invoice' : 'billing')}
            className="hidden md:flex items-center gap-1.5 text-[10px] font-mono border border-[#E8447A]/40 px-2.5 py-1.5 rounded-lg hover:bg-[#E8447A]/10 text-[#E8447A]/80 uppercase tracking-widest transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            {invoiceView === 'billing' ? 'GST Invoice' : 'Back to Billing'}
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-[10px] font-mono text-[#E8447A]/60 border border-[#E8447A]/30 px-2.5 py-1.5 rounded-lg hover:border-[#E8447A]/70 hover:text-[#E8447A] transition-all uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" />
            Exit
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 text-[10px] font-mono text-[#FFFFFF]/50 border border-[rgba(240,234,210,0.15)] px-2.5 py-1.5 rounded-lg hover:border-[#FFFFFF]/40 hover:text-[#FFFFFF] transition-all uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left Panel: Table Selector */}
        <div className="lg:w-52 border-b lg:border-b-0 lg:border-r border-[rgba(26,26,26,0.10)] bg-white overflow-x-auto lg:overflow-y-auto flex lg:flex-col gap-2 p-3 shrink-0">
          <p className="hidden lg:block text-[9px] font-mono text-[#E8447A] uppercase tracking-widest px-1 mb-1">Active Bills</p>
          <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
            {MOCK_BILLS.map(b => {
              const total = b.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
              const isActive = b.tableId === selectedTableId;
              return (
                <button
                  key={b.tableId}
                  onClick={() => { setSelectedTableId(b.tableId); setPaymentDone(false); setAppliedCoupon(null); setCashReceived(''); }}
                  className={`rounded-xl border p-3 text-left transition-all shrink-0 lg:shrink whitespace-nowrap lg:whitespace-normal
                    ${isActive ? 'border-[#E8447A] bg-[#E8447A]/15 shadow-[0_0_0_1px_#E8447A]' : 'border-[rgba(26,26,26,0.10)] hover:border-[#E8447A]/40 bg-white'}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-[12px] font-semibold ${isActive ? 'text-[#E8447A]' : 'text-[#1a1a1a]'}`}>{b.tableLabel}</p>
                    {isActive
                      ? <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full bg-[#E8447A] text-[#1a1a1a]">Active</span>
                      : <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full border border-[#E8447A]/60 text-[#E8447A]">Pending</span>
                    }
                  </div>
                  <p className="text-[10px] text-[#1a1a1a]/40 truncate mt-0.5">{b.customerName}</p>
                  <p className={`text-[11px] font-mono font-bold mt-1.5 ${isActive ? 'text-[#E8447A]' : 'text-[#1a1a1a]/60'}`}>
                    {inr(total)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Panel: Bill */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">

          {invoiceView === 'gst-invoice' ? (
            <GSTInvoice bill={bill} subtotal={subtotal} discountAmt={discountAmt} cgst={cgst} sgst={sgst} grandTotal={grandTotal} invoiceNumber={invoiceNumber} appliedCoupon={appliedCoupon} inr={inr} onClose={() => setInvoiceView('billing')} />
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Bill Header */}
              <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-[16px] font-barlow font-black uppercase text-[#E8447A]">{bill.tableLabel}</h2>
                    <p className="text-[12px] text-[#1a1a1a]/50 mt-0.5">{bill.customerName} · {bill.serverName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-[#E8447A] uppercase">Seated</p>
                    <p className="text-[13px] font-mono text-[#1a1a1a]">{bill.seatedMins}m ago</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-[rgba(26,26,26,0.08)] pt-4 space-y-2">
                  {bill.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-[#E8447A] w-5 shrink-0">{item.qty}×</span>
                        <div className="min-w-0">
                          <p className="text-[12px] text-[#1a1a1a] truncate">{item.name}</p>
                          <p className="text-[9px] font-mono text-[#E8447A] uppercase">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] font-mono text-[#1a1a1a]">{inr(item.qty * item.unitPrice)}</p>
                        <p className="text-[9px] font-mono text-[#1a1a1a]/40">{inr(item.unitPrice)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-[#E8447A]" />
                  <p className="text-[12px] font-medium text-[#E8447A]">Coupon / Discount</p>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#1BC8C8]/10 border border-[#1BC8C8]/30 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1BC8C8]" />
                      <span className="text-[12px] font-mono font-semibold text-[#1BC8C8]">{appliedCoupon.code}</span>
                      <span className="text-[11px] text-[#1BC8C8]">— {appliedCoupon.pct}% off</span>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)}>
                      <X className="w-3.5 h-3.5 text-[#1BC8C8]" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-[rgba(26,26,26,0.18)] rounded-xl px-3 py-2 text-[12px] font-mono uppercase outline-none focus:border-[#E8447A] focus:ring-2 focus:ring-[#E8447A]/20"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-[#1a1a1a] text-[#FFFFFF] rounded-xl text-[12px] font-medium hover:bg-[#1a1a1a]/80 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-500 mt-1.5">{couponError}</p>}
                <p className="text-[10px] text-[#E8447A] mt-2 font-mono">Try: SMART10 · WELCOME5 · FEAST15</p>
              </div>

              {/* Tax Breakdown */}
              <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Percent className="w-4 h-4 text-[#E8447A]" />
                  <p className="text-[12px] font-medium text-[#E8447A]">Tax Breakdown (GST)</p>
                </div>
                <TaxRow label="Subtotal" value={inr(subtotal)} />
                {appliedCoupon && (
                  <TaxRow label={`Discount (${appliedCoupon.code} −${appliedCoupon.pct}%)`} value={`− ${inr(discountAmt)}`} accent="text-[#E8447A]" />
                )}
                <TaxRow label="After Discount" value={inr(afterDiscount)} />
                <div className="border-t border-dashed border-[rgba(26,26,26,0.08)] pt-2 mt-2">
                  <TaxRow label="CGST @ 2.5%" value={inr(cgst)} accent="text-[#1a1a1a]/40" />
                  <TaxRow label="SGST @ 2.5%" value={inr(sgst)} accent="text-[#1a1a1a]/40" />
                </div>
                <div className="border-t border-[#E8447A]/40 pt-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#E8447A]">Grand Total</span>
                    <span className="text-[15px] font-bold text-[#E8447A] font-mono">{inr(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Split Bill */}
              <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4">
                <button
                  onClick={() => { setSplitCount(2); setShowSplit(!showSplit); if (!showSplit) buildSplitEntries(2); }}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Split className="w-4 h-4 text-[#E8447A]" />
                    <p className="text-[12px] font-medium text-[#E8447A]">Split Bill</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#1a1a1a]/40 transition-transform ${showSplit ? 'rotate-180' : ''}`} />
                </button>
                {showSplit && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#1a1a1a]/50">Split among</span>
                      {[2, 3, 4].map(n => (
                        <button
                          key={n}
                          onClick={() => { setSplitCount(n); buildSplitEntries(n); }}
                          className={`w-8 h-8 rounded-full text-[12px] font-mono font-bold border transition-all
                            ${splitCount === n ? 'bg-[#1a1a1a] border-[#1a1a1a] text-[#FFFFFF]' : 'border-[rgba(26,26,26,0.18)] text-[#1a1a1a]/60 hover:border-[#E8447A]'}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {splitEntries.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-[#1a1a1a]/40" />
                            <span className="text-[12px] text-[#1a1a1a]">{entry.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-mono font-bold text-[#1a1a1a]">{inr(entry.amount)}</span>
                            <button
                              onClick={() => toggleSplitPaid(i)}
                              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all
                                ${entry.paid ? 'bg-[#1BC8C8]/15 border-[#1BC8C8]' : 'border-[rgba(26,26,26,0.18)] hover:border-[#1a1a1a]/40'}`}
                            >
                              {entry.paid && <CheckCircle2 className="w-3.5 h-3.5 text-[#1BC8C8]" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {splitEntries.every(e => e.paid) && (
                      <div className="flex items-center gap-1.5 text-[#1BC8C8] text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        All portions paid
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Payment */}
        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-[rgba(26,26,26,0.10)] bg-white p-5 flex flex-col gap-4 shrink-0">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#E8447A] mb-3">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'upi',  icon: Smartphone, label: 'UPI' },
                { id: 'cash', icon: Banknote,   label: 'Cash' },
                { id: 'card', icon: CreditCard, label: 'Card' },
              ] as { id: PaymentMethod; icon: React.ElementType; label: string }[]).map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                      ${paymentMethod === m.id
                        ? 'border-[#E8447A] bg-[#E8447A]/20 text-[#E8447A] shadow-[0_0_0_1px_#E8447A]'
                        : 'border-[rgba(26,26,26,0.10)] hover:border-[#E8447A]/50 text-[#1a1a1a]/50'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-mono uppercase">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* UPI QR */}
          {paymentMethod === 'upi' && (
            <div className="rounded-xl bg-[#FFFFFF] border border-[rgba(26,26,26,0.10)] p-4 text-center space-y-3">
              <div className="mx-auto w-32 h-32 bg-white border border-[rgba(26,26,26,0.12)] rounded-xl flex items-center justify-center overflow-hidden">
                {/* Stylized QR placeholder */}
                <div className="grid grid-cols-7 gap-0.5 p-2">
                  {Array.from({ length: 49 }, (_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-[1px] ${Math.random() > 0.5 ? 'bg-[#1a1a1a]' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#1a1a1a]">Scan to Pay</p>
                <p className="text-[15px] font-bold text-[#1a1a1a] font-mono mt-1">{inr(grandTotal)}</p>
                <p className="text-[10px] font-mono text-[#1a1a1a]/40 mt-0.5">UPI ID: smartdine@upi</p>
              </div>
            </div>
          )}

          {/* Cash */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest block mb-1.5">Cash Received (₹)</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={e => setCashReceived(e.target.value)}
                  placeholder={`${(grandTotal * 83).toFixed(0)}`}
                  className="w-full border border-[rgba(26,26,26,0.18)] rounded-xl px-3 py-2.5 text-[14px] font-mono text-[#1a1a1a] outline-none focus:border-[#E8447A] focus:ring-2 focus:ring-[#E8447A]/20"
                />
              </div>
              {cashReceived && parseFloat(cashReceived) >= grandTotal * 83 && (
                <div className="bg-[#1BC8C8]/10 border border-[#1BC8C8]/30 rounded-xl px-3 py-2.5">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-[#1BC8C8]">Change Due</span>
                    <span className="text-[13px] font-mono font-bold text-[#1BC8C8]">
                      ₹{(parseFloat(cashReceived) - grandTotal * 83).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card */}
          {paymentMethod === 'card' && (
            <div className="rounded-xl bg-[#FFFFFF] border border-[rgba(26,26,26,0.10)] p-4 text-center space-y-2">
              <CreditCard className="w-8 h-8 text-[#1a1a1a]/40 mx-auto" />
              <p className="text-[12px] text-[#1a1a1a]/60">Present card to the POS terminal</p>
              <p className="text-[15px] font-bold text-[#1a1a1a] font-mono">{inr(grandTotal)}</p>
              <div className="flex items-center justify-center gap-3 pt-1">
                {['VISA', 'MC', 'AMEX', 'RUPAY'].map(c => (
                  <span key={c} className="text-[9px] font-mono text-[#1a1a1a]/40 border border-[rgba(26,26,26,0.15)] px-2 py-0.5 rounded">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E8447A]/30 p-3 space-y-1.5">
            <TaxRow label="Bill Total" value={inr(subtotal)} />
            {appliedCoupon && <TaxRow label={`Discount (${appliedCoupon.pct}%)`} value={`− ${inr(discountAmt)}`} accent="text-[#E8447A]" />}
            <TaxRow label="GST (5%)" value={inr(cgst + sgst)} accent="text-[#1a1a1a]/40" />
            <div className="flex justify-between items-center border-t border-[#E8447A]/40 pt-2 mt-1">
              <span className="text-[13px] font-bold text-[#E8447A]">Total</span>
              <span className="text-[15px] font-bold text-[#E8447A] font-mono">{inr(grandTotal)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2 mt-auto">
            <button
              onClick={handlePay}
              disabled={paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < grandTotal * 83)}
              className="w-full py-3.5 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 disabled:opacity-40 disabled:cursor-not-allowed text-[#FFFFFF] text-[13px] font-semibold uppercase tracking-wider transition-colors"
            >
              {paymentMethod === 'upi' ? 'Confirm UPI Payment' : paymentMethod === 'cash' ? 'Confirm Cash' : 'Charge Card'}
            </button>
            <button
              onClick={() => setInvoiceView(invoiceView === 'billing' ? 'gst-invoice' : 'billing')}
              className="w-full py-2.5 rounded-xl border-2 border-[#E8447A] text-[12px] text-[#E8447A] bg-[#E8447A]/10 hover:bg-[#E8447A]/20 flex items-center justify-center gap-1.5 transition-colors font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              {invoiceView === 'billing' ? 'View GST Invoice' : 'Back to Billing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaxRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-[#1a1a1a]/50">{label}</span>
      <span className={`text-[12px] font-mono font-medium ${accent ?? 'text-[#1a1a1a]'}`}>{value}</span>
    </div>
  );
}

function InfoRow2({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[11px] text-[#1a1a1a]/40">{label}</span>
      <span className={`text-[12px] font-mono font-medium ${highlight ? 'text-[#E8447A] font-bold' : 'text-[#1a1a1a]/70'}`}>{value}</span>
    </div>
  );
}

function GSTInvoice({
  bill, subtotal, discountAmt, cgst, sgst, grandTotal, invoiceNumber, appliedCoupon, inr, onClose
}: {
  bill: TableBill; subtotal: number; discountAmt: number; cgst: number; sgst: number;
  grandTotal: number; invoiceNumber: string; appliedCoupon: { code: string; pct: number } | null;
  inr: (n: number) => string; onClose: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] overflow-hidden shadow-sm">
        {/* Invoice Header */}
        <div className="bg-[#1a1a1a] text-[#FFFFFF] px-6 py-5 border-b-2 border-[#E8447A]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] font-barlow font-black uppercase tracking-wide text-[#E8447A]">SMARTDINE</h2>
              <p className="text-[11px] text-[#E8447A]/60 mt-0.5 uppercase tracking-widest">Tax Invoice</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#E8447A]/60 uppercase tracking-wider">Invoice No.</p>
              <p className="text-[12px] font-mono text-[#FFFFFF]/80 mt-0.5">{invoiceNumber}</p>
              <p className="text-[11px] text-[#FFFFFF]/40 mt-2">Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-[rgba(26,26,26,0.08)]">
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <p className="text-[#1a1a1a]/40 uppercase tracking-wider font-mono mb-1">From</p>
              <p className="font-semibold text-[#1a1a1a]">SmartDine Restron Co.</p>
              <p className="text-[#1a1a1a]/50">842 Pastel Blvd, Los Angeles, CA</p>
              <p className="text-[#1a1a1a]/50">GSTIN: 29ABCDE1234F1Z5</p>
              <p className="text-[#1a1a1a]/50">PAN: ABCDE1234F</p>
            </div>
            <div>
              <p className="text-[#1a1a1a]/40 uppercase tracking-wider font-mono mb-1">Bill To</p>
              <p className="font-semibold text-[#1a1a1a]">{bill.customerName}</p>
              <p className="text-[#1a1a1a]/50">{bill.tableLabel} · {bill.zone}</p>
              <p className="text-[#1a1a1a]/50">Server: {bill.serverName}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 py-4">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#E8447A]/40 text-[#E8447A] uppercase tracking-wider font-mono">
                <th className="pb-2 text-left font-medium">Item</th>
                <th className="pb-2 text-center font-medium w-12">Qty</th>
                <th className="pb-2 text-right font-medium w-20">Rate</th>
                <th className="pb-2 text-right font-medium w-20">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(26,26,26,0.04)]">
              {bill.items.map(item => (
                <tr key={item.id}>
                  <td className="py-2 text-[#1a1a1a]">{item.name}</td>
                  <td className="py-2 text-center font-mono text-[#1a1a1a]/50">{item.qty}</td>
                  <td className="py-2 text-right font-mono text-[#1a1a1a]/60">{inr(item.unitPrice)}</td>
                  <td className="py-2 text-right font-mono font-medium text-[#1a1a1a]">{inr(item.qty * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tax Summary */}
        <div className="border-t border-[rgba(26,26,26,0.10)] px-6 py-4 space-y-2 bg-[#FFFFFF]">
          <TaxRow label="Subtotal" value={inr(subtotal)} />
          {appliedCoupon && (
            <TaxRow label={`Discount — ${appliedCoupon.code} (${appliedCoupon.pct}%)`} value={`− ${inr(discountAmt)}`} accent="text-[#E8447A]" />
          )}
          <TaxRow label="Taxable Amount" value={inr(subtotal - discountAmt)} />
          <TaxRow label="CGST @ 2.5%" value={inr(cgst)} accent="text-[#1a1a1a]/40" />
          <TaxRow label="SGST @ 2.5%" value={inr(sgst)} accent="text-[#1a1a1a]/40" />
          <div className="flex justify-between items-center border-t border-[#E8447A]/40 pt-2 mt-2">
            <span className="text-[14px] font-bold text-[#E8447A]">Total</span>
            <span className="text-[16px] font-bold text-[#E8447A] font-mono">{inr(grandTotal)}</span>
          </div>
        </div>

        <div className="px-6 py-3 text-center border-t border-[rgba(26,26,26,0.08)]">
          <p className="text-[10px] text-[#1a1a1a]/40 font-mono uppercase tracking-widest">Thank you for dining with SmartDine · smartdine.com</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-[rgba(26,26,26,0.18)] text-[12px] font-medium text-[#1a1a1a]/60 hover:bg-[rgba(26,26,26,0.05)]"
        >
          Back to Billing
        </button>
        <button
          className="flex-1 py-2.5 rounded-[100px] bg-[#E8447A] text-[#1a1a1a] text-[12px] font-semibold hover:bg-[#E8447A] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Invoice
        </button>
      </div>
    </div>
  );
}
