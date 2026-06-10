import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, ChefHat, Bell, Sparkles, Clock,
  Plus, Minus, Star, Phone, Droplets, UtensilsCrossed,
  X, Receipt, ShoppingBag, MessageSquare, Heart,
  Navigation, Package, MapPin, Smile, Home
} from 'lucide-react';
import { CartItem } from '../types';
import { DECOR_IMAGES } from '../foodData';

// ─── Types ────────────────────────────────────────────────────────────────────

type DiningStatus = 'placed' | 'accepted' | 'preparing' | 'ready' | 'served';
type SplitMode = 'equal' | 'custom';
type ActivePanel = null | 'bill' | 'feedback';

interface OrderLine { name: string; qty: number; unitPrice: number; notes?: string; }

interface Props {
  cartItems: CartItem[];
  checkoutData: { address: string; notes: string; totalCost: number; itemsList?: CartItem[] };
  onResetOrder: () => void;
  setActivePage: (page: string) => void;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const STATUS_STEPS: { id: DiningStatus; label: string; desc: string; Icon: React.ElementType }[] = [
  { id: 'placed',    label: 'Order Placed',  desc: 'Kitchen received your order',   Icon: Receipt      },
  { id: 'accepted',  label: 'Accepted',       desc: 'Kitchen confirmed your order',  Icon: CheckCircle2 },
  { id: 'preparing', label: 'Preparing',       desc: 'Chef is preparing your meal',   Icon: ChefHat      },
  { id: 'ready',     label: 'Ready',           desc: 'Your food is ready to serve',   Icon: Bell         },
  { id: 'served',    label: 'Served',          desc: 'Enjoy your meal!',              Icon: Sparkles     },
];

const DEMO_ITEMS: OrderLine[] = [
  { name: 'Wok-fired Handmade Egg Noodles',       qty: 2, unitPrice: 12.00 },
  { name: 'Garden Fresh Tossed Salad',             qty: 1, unitPrice:  9.50, notes: 'No cucumber' },
  { name: 'Peach Garden Strawberry Matcha Latte',  qty: 2, unitPrice:  5.50 },
];

const TIP_OPTIONS = [0, 10, 15, 18];
const FEEDBACK_TAGS = ['Fast service', 'Delicious', 'Friendly staff', 'Great ambiance', 'Fresh ingredients', 'Good value'];

const inr  = (usd: number) => `₹${(usd * 83).toFixed(0)}`;
const tick = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerOrderTracker({ cartItems, checkoutData, onResetOrder, setActivePage }: Props) {

  const orderLines: OrderLine[] = checkoutData.itemsList?.length
    ? checkoutData.itemsList.map(i => ({ name: i.name, qty: i.quantity, unitPrice: i.price }))
    : DEMO_ITEMS;

  const subtotal  = orderLines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const gst       = subtotal * 0.05;
  const orderId   = useRef(`#ORD-${Math.floor(Math.random() * 8000 + 1000)}`).current;

  // ── Status & timestamps ───────────────────────────────────────────────────
  const [status, setStatus]         = useState<DiningStatus>('placed');
  const [timestamps, setTimestamps] = useState<Partial<Record<DiningStatus, string>>>({ placed: tick() });

  useEffect(() => {
    setTimestamps(prev => ({ ...prev, [status]: tick() }));
  }, [status]);

  // Auto-advance for demo
  useEffect(() => {
    const steps: { delay: number; next: DiningStatus }[] = [
      { delay: 3000,  next: 'accepted'  },
      { delay: 9000,  next: 'preparing' },
      { delay: 22000, next: 'ready'     },
    ];
    const timers = steps.map(s => setTimeout(() => setStatus(s.next), s.delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Map / drone animation (original design element) ───────────────────────
  const [droneCoords, setDroneCoords] = useState({ x: 20, y: 70 });
  const statusIdx = STATUS_STEPS.findIndex(s => s.id === status);

  useEffect(() => {
    if (statusIdx >= 2) {
      const t = setInterval(() => {
        setDroneCoords(prev => ({ x: Math.min(prev.x + 3, 76), y: Math.max(prev.y - 1.6, 30) }));
      }, 320);
      return () => clearInterval(t);
    }
    if (statusIdx >= 4) setDroneCoords({ x: 76, y: 30 });
  }, [statusIdx]);

  const resetSimulation = () => {
    setStatus('placed');
    setDroneCoords({ x: 20, y: 70 });
    setTimestamps({ placed: tick() });
  };

  // ── Bill & payment ────────────────────────────────────────────────────────
  const [tipPct,      setTipPct]      = useState(15);
  const [customTip,   setCustomTip]   = useState('');
  const [splitMode,   setSplitMode]   = useState<SplitMode>('equal');
  const [splitCount,  setSplitCount]  = useState(2);
  const [paymentDone, setPaymentDone] = useState(false);

  const tipAmount  = tipPct === -1 ? (parseFloat(customTip || '0') * 83) : (subtotal + gst) * 83 * (tipPct / 100);
  const grandTotal = (subtotal + gst) * 83 + tipAmount;
  const perPerson  = grandTotal / Math.max(splitCount, 1);

  // ── Feedback ──────────────────────────────────────────────────────────────
  const [rating,       setRating]       = useState(0);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewText,   setReviewText]   = useState('');
  const [feedbackDone, setFeedbackDone] = useState(false);

  // ── Panels & toasts ───────────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [toast,       setToast]       = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleWaiter = () => showToast('🔔 Waiter notified — they will be at your table shortly.');
  const handleWater  = () => showToast('💧 Water request sent — arriving in a moment!');

  const handlePay = () => {
    setPaymentDone(true);
    setActivePanel(null);
    setTimeout(() => { setStatus('served'); setTimeout(() => setActivePanel('feedback'), 1000); }, 600);
  };

  const toggleTag = (t: string) =>
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FFE8EE] animate-[fadeIn_0.4s_ease-out] flex flex-col">

      {/* ── Sticky top bar with back button ── */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
        style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,.08)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-1.5 cursor-pointer border-none transition-opacity hover:opacity-75"
            style={{ background: 'rgba(255,255,255,.12)', color: '#FFE8EE', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '7px 14px', borderRadius: 100, fontFamily: 'inherit' }}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '1px' }}>›</span>
          <span
            className="font-barlow font-black uppercase"
            style={{ fontSize: 14, color: '#E8447A', letterSpacing: '1px' }}
          >
            Order Tracker
          </span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          SmartDine
        </span>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] text-[#FFE8EE] text-[12px] font-medium px-5 py-3 rounded-2xl shadow-xl max-w-sm text-center animate-[fadeIn_0.25s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex-1 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-1 border-b border-[rgba(26,26,26,0.12)] pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-barlow font-black uppercase text-[#1a1a1a]">Order Tracker</h2>
            <p className="text-[11px] text-[#1a1a1a]/50 font-mono mt-0.5 uppercase tracking-wider">
              {orderId} · Table 4 · Rose Alcove
            </p>
          </div>
          {/* Live status chip */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border
            ${status === 'served' ? 'bg-[#1BC8C8]/15 border-[#1BC8C8]/40 text-[#1BC8C8]' : 'bg-[#E8447A]/20 border-[#E8447A]/60 text-[#1a1a1a]'}`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status === 'served' ? 'bg-[#1BC8C8]' : 'bg-[#E8447A]'}`} />
            {STATUS_STEPS.find(s => s.id === status)?.label}
          </div>
        </div>
      </div>

      {/* ── Main 2-column grid ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Status + order + actions */}
        <div className="lg:col-span-6 space-y-5">

          {/* Status Timeline */}
          <div className="bg-white border border-[rgba(26,26,26,0.18)] rounded-[22px] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[rgba(26,26,26,0.08)] pb-3">
              <Clock className="w-4 h-4 text-[#E8447A]" />
              <h3 className="text-[12px] font-barlow font-black text-[#1a1a1a] uppercase tracking-wide">Order Progress</h3>
              <span className="ml-auto text-[10px] font-mono text-[#1a1a1a]/40">{timestamps[status] ?? ''}</span>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-[rgba(26,26,26,0.08)]" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-[#E8447A] transition-all duration-1000"
                style={{ width: `calc(${(statusIdx / (STATUS_STEPS.length - 1)) * 100}% - 2.5rem)` }}
              />
              <div className="flex justify-between relative">
                {STATUS_STEPS.map((step, i) => {
                  const done = i < statusIdx; const active = i === statusIdx;
                  const { Icon } = step;
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                      <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center z-10 relative transition-all duration-500
                        ${done ? 'bg-[#1BC8C8]/15 border-[#1BC8C8]' : active ? 'bg-[#E8447A] border-[#E8447A] scale-110 shadow-md shadow-[#E8447A]/30' : 'bg-white border-[rgba(26,26,26,0.15)]'}`}>
                        <Icon className={`w-4 h-4 ${done ? 'text-[#1BC8C8]' : active ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/25'}`} />
                      </div>
                      <p className={`text-[9px] font-mono uppercase tracking-wide text-center leading-snug
                        ${active ? 'text-[#1a1a1a] font-bold' : done ? 'text-[#1BC8C8]' : 'text-[#1a1a1a]/40'}`}>
                        {step.label}
                      </p>
                      {timestamps[step.id] && (
                        <p className="text-[8px] text-[#1a1a1a]/40 font-mono">{timestamps[step.id]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active state description */}
            <div className={`rounded-xl px-4 py-2.5 text-center text-[13px] font-lora italic
              ${status === 'served' ? 'bg-[#1BC8C8]/10 text-[#1BC8C8]' : 'bg-[#E8447A]/15 text-[#1a1a1a]'}`}>
              {STATUS_STEPS.find(s => s.id === status)?.desc}
            </div>

            {/* Bill summary */}
            <div className="border-t border-dashed border-[rgba(26,26,26,0.08)] pt-3 flex justify-between font-mono text-[10.5px]">
              <div className="text-[#1a1a1a]/50">
                <span className="block uppercase tracking-wider text-[9px] mb-0.5">Order location</span>
                <strong className="text-[#1a1a1a] block uppercase font-black">
                  {checkoutData.address || 'Table 4 · Rose Alcove'}
                </strong>
                {checkoutData.notes && (
                  <span className="text-[9.5px] text-[#1a1a1a]/40 block">"{checkoutData.notes}"</span>
                )}
              </div>
              <div className="text-right">
                <span className="block uppercase tracking-wider text-[9px] mb-0.5 text-[#1a1a1a]/50">Bill Total</span>
                <strong className="text-[#1a1a1a] font-black text-[13px]">{inr(subtotal + gst)}</strong>
              </div>
            </div>

            {/* Served celebration */}
            {status === 'served' && (
              <div className="bg-[#1BC8C8]/10 border border-[#1BC8C8]/30 text-[#1BC8C8] rounded-2xl p-4 text-center space-y-3">
                <Smile className="w-8 h-8 text-[#1BC8C8] mx-auto animate-bounce" />
                <div>
                  <h5 className="font-lora italic text-lg text-[#1BC8C8]">Your meal has arrived!</h5>
                  <p className="text-[11px] text-[#1a1a1a]/50 mt-1">Thank you for dining with SmartDine.</p>
                </div>
                <button
                  onClick={() => { onResetOrder(); setActivePage('home'); }}
                  className="w-full py-2 bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#FFE8EE] rounded-[100px] text-[10px] font-mono uppercase tracking-widest font-black transition-all cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-[rgba(26,26,26,0.18)] rounded-[22px] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-[rgba(26,26,26,0.08)] pb-3">
              <ShoppingBag className="w-4 h-4 text-[#E8447A]" />
              <h3 className="text-[12px] font-barlow font-black text-[#1a1a1a] uppercase tracking-wide">Your Order</h3>
            </div>
            <div className="space-y-2">
              {orderLines.map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[11px] font-mono text-[#E8447A] w-6 shrink-0 pt-px text-right">{line.qty}×</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-lora italic text-[#1a1a1a] leading-snug">{line.name}</p>
                    {line.notes && <p className="text-[10px] text-amber-600 italic mt-0.5">↳ {line.notes}</p>}
                  </div>
                  <p className="text-[11px] font-mono font-semibold text-[#1a1a1a] shrink-0">{inr(line.qty * line.unitPrice)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-[rgba(26,26,26,0.08)] pt-3 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#1a1a1a]/50">Subtotal</span>
                <span className="font-mono">{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#1a1a1a]/50">GST (5%)</span>
                <span className="font-mono text-[#1a1a1a]/40">{inr(gst)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold pt-1 border-t border-[rgba(26,26,26,0.08)]">
                <span>Total</span>
                <span className="font-mono text-[#1a1a1a]">{inr(subtotal + gst)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {status !== 'served' && !paymentDone && (
            <div className="bg-white border border-[rgba(26,26,26,0.18)] rounded-[22px] p-5 shadow-sm space-y-3">
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#1a1a1a]/40">Table Requests</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Droplets,       label: 'Request Water',   fn: handleWater  },
                  { icon: Phone,          label: 'Call Waiter',      fn: handleWaiter },
                  { icon: UtensilsCrossed,label: 'Order More',       fn: () => { onResetOrder(); setActivePage('home'); } },
                  { icon: MessageSquare,  label: 'Special Request',  fn: () => showToast('Your special request has been noted!') },
                ].map(btn => {
                  const Icon = btn.icon;
                  return (
                    <button key={btn.label} onClick={btn.fn}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[rgba(26,26,26,0.12)] hover:border-[#E8447A] hover:bg-[#E8447A]/10 transition-all text-left group cursor-pointer">
                      <div className="w-7 h-7 rounded-lg bg-[#E8447A]/15 border border-[#E8447A]/30 flex items-center justify-center shrink-0 group-hover:bg-[#E8447A]/25 transition-colors">
                        <Icon className="w-3.5 h-3.5 text-[#1a1a1a]" />
                      </div>
                      <span className="text-[11px] font-medium text-[#1a1a1a] group-hover:text-[#1a1a1a]">{btn.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setActivePanel('bill')}
                className="w-full py-3 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#FFE8EE] text-[12px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                Request Bill
              </button>
            </div>
          )}

          {/* Feedback card (after payment, in page — not overlay) */}
          {paymentDone && status === 'served' && activePanel !== 'feedback' && (
            <div className="bg-white border border-[rgba(26,26,26,0.18)] rounded-[22px] p-5 shadow-sm space-y-4">
              {feedbackDone ? (
                <div className="text-center py-6 space-y-3">
                  <div className="text-4xl">🎉</div>
                  <p className="text-[17px] font-lora italic text-[#1a1a1a]">Thank you for your feedback!</p>
                  <button onClick={() => { onResetOrder(); setActivePage('home'); }}
                    className="flex items-center gap-2 mx-auto text-[11px] font-mono uppercase tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a]/30 hover:border-[#1a1a1a] cursor-pointer">
                    <Home className="w-3.5 h-3.5" /> Back to SmartDine
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#E8447A]" />
                    <h3 className="text-[12px] font-barlow font-black text-[#1a1a1a] uppercase tracking-wide">How was your meal?</h3>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)} className="transition-transform hover:scale-125 cursor-pointer">
                        <Star className={`w-8 h-8 transition-colors ${(hoverRating || rating) >= s ? 'text-amber-400 fill-amber-400' : 'text-[#1a1a1a]/15'}`} />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FEEDBACK_TAGS.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all cursor-pointer
                          ${selectedTags.includes(tag) ? 'bg-[#1a1a1a] border-[#1a1a1a] text-[#FFE8EE]' : 'border-[rgba(26,26,26,0.18)] text-[#1a1a1a]/60 hover:border-[#E8447A] hover:text-[#1a1a1a]'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                    placeholder="Write a few words… (optional)" rows={2}
                    className="w-full border border-[rgba(26,26,26,0.18)] rounded-xl px-3 py-2.5 text-[12px] text-[#1a1a1a] outline-none focus:border-[#E8447A] focus:ring-2 focus:ring-[#E8447A]/20 resize-none" />
                  <button disabled={rating === 0} onClick={() => setFeedbackDone(true)}
                    className="w-full py-3 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 disabled:opacity-40 disabled:cursor-not-allowed text-[#FFE8EE] text-[12px] font-semibold uppercase tracking-wider transition-colors cursor-pointer">
                    Submit Feedback
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Visual kitchen-to-table tracking map */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#1a1a1a]/40 tracking-widest font-bold">
            <span>Kitchen-to-Table Tracker</span>
            <span className={`${statusIdx >= 2 ? 'text-[#E8447A]' : 'text-[#1a1a1a]/40'}`}>
              {statusIdx >= 4 ? '✓ Served!' : statusIdx >= 2 ? 'Order En Route' : 'Awaiting Kitchen'}
            </span>
          </div>

          {/* Map canvas */}
          <div className="w-full h-80 bg-gingham border border-[rgba(26,26,26,0.12)] rounded-[32px] p-6 relative overflow-hidden flex items-center justify-center">

            {/* Flight paths SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 400 300">
              <line x1="20" y1="70" x2="160" y2="150" stroke="#E8447A" strokeWidth="6" strokeDasharray="3 3" />
              <line x1="160" y1="150" x2="280" y2="80" stroke="#E8447A" strokeWidth="6" strokeDasharray="3 3" />
              <line x1="280" y1="80" x2="350" y2="120" stroke="#E8447A" strokeWidth="6" strokeDasharray="3 3" />
              <path d="M 50 210 Q 150 110 320 90" fill="none" stroke="#1BC8C8" strokeWidth="2.5" strokeDasharray="6 4" />
            </svg>

            {/* Kitchen pin */}
            <div className="absolute left-6 bottom-16 text-center space-y-1 shrink-0">
              <div className="w-10 h-10 bg-white border border-[rgba(26,26,26,0.12)] rounded-full flex items-center justify-center shadow-lg mx-auto animate-pulse">
                <Package className="w-5 h-5 text-[#1BC8C8]" />
              </div>
              <span className="text-[8.5px] font-mono bg-white font-extrabold uppercase py-0.5 px-2 tracking-tighter border border-[rgba(26,26,26,0.10)] rounded">
                Kitchen
              </span>
            </div>

            {/* Table destination pin */}
            <div className="absolute right-12 top-14 text-center space-y-1 shrink-0">
              <div className="w-10 h-10 bg-[#E8447A] border-2 border-white rounded-full flex items-center justify-center shadow-lg mx-auto animate-[pulse_1.5s_infinite]">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-[8.5px] font-mono bg-white font-extrabold uppercase py-0.5 px-2 tracking-tighter border border-[rgba(26,26,26,0.10)] rounded block">
                Your Table
              </span>
            </div>

            {/* Animated order indicator */}
            <div
              className="absolute pointer-events-none transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none"
              style={{ left: `${droneCoords.x}%`, top: `${droneCoords.y}%` }}
            >
              <div className="w-12 h-12 bg-white border-2 border-[#E8447A] rounded-2xl flex items-center justify-center shadow-md relative">
                <Navigation className="w-6 h-6 text-[#1a1a1a] rotate-45 shrink-0" />
                {statusIdx >= 2 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#1BC8C8] rounded-full border border-white animate-ping" />
                )}
              </div>
              <span className="text-[7.5px] font-mono font-black text-[#1a1a1a] uppercase bg-[#E8447A]/20 px-1.5 py-0.5 rounded shadow-sm border border-[#E8447A]/40 mt-1">
                ORDER
              </span>
            </div>

            {/* Reset button */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 font-mono text-[9px] bg-white p-2 rounded-xl border border-[rgba(26,26,26,0.10)] shadow-sm uppercase items-center">
              <span className="text-[#1a1a1a]/40">Simulation:</span>
              <button
                onClick={resetSimulation}
                className="bg-[#FFE8EE] hover:bg-[#FFE8EE]/70 py-0.5 px-1.5 rounded transition-all cursor-pointer font-bold border border-[rgba(26,26,26,0.12)] text-[#1a1a1a]"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Instructions panel */}
          <div className="bg-[#E8447A]/10 border border-dashed border-[#E8447A]/40 rounded-2xl p-4 font-sans text-[11px] text-[#1a1a1a]/50 space-y-1 leading-relaxed">
            <span className="font-bold text-[#1a1a1a]/50 uppercase text-[9px] block tracking-wider">HOW TO TEST</span>
            <p>Go to <strong>Home</strong>, add items to your cart, and place your order. This tracker updates automatically as your order progresses through the kitchen.</p>
          </div>
        </div>
      </div>
      </div>{/* end flex-1 scroll area */}

      {/* ── Bill Panel (overlay bottom sheet) ─────────────────────────────── */}
      {activePanel === 'bill' && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={e => e.target === e.currentTarget && setActivePanel(null)}>
          <div className="bg-[#FFE8EE] w-full max-w-lg rounded-t-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.25s_ease-out]">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[rgba(26,26,26,0.15)]" />
            </div>
            <div className="px-5 pb-8 pt-2 space-y-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4.5 h-4.5 text-[#E8447A]" style={{width:18,height:18}} />
                  <h3 className="text-[15px] font-barlow font-black uppercase text-[#1a1a1a]">Your Bill</h3>
                </div>
                <button onClick={() => setActivePanel(null)} className="cursor-pointer"><X className="w-5 h-5 text-[#1a1a1a]/40 hover:text-[#1a1a1a]" /></button>
              </div>

              {/* Bill lines */}
              <div className="bg-white border border-[rgba(26,26,26,0.12)] rounded-2xl p-4 space-y-1.5">
                {orderLines.map((l, i) => (
                  <div key={i} className="flex justify-between text-[12px]">
                    <span className="text-[#1a1a1a]/60">{l.qty}× {l.name}</span>
                    <span className="font-mono text-[#1a1a1a]">{inr(l.qty * l.unitPrice)}</span>
                  </div>
                ))}
                <div className="border-t border-[rgba(26,26,26,0.08)] mt-2 pt-2 flex justify-between text-[12px] text-[#1a1a1a]/50">
                  <span>GST (5%)</span><span className="font-mono">{inr(gst)}</span>
                </div>
              </div>

              {/* Tip */}
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#1a1a1a]/40 mb-2">Add a Tip</p>
                <div className="flex gap-2 flex-wrap">
                  {TIP_OPTIONS.map(pct => (
                    <button key={pct} onClick={() => { setTipPct(pct); setCustomTip(''); }}
                      className={`flex-1 min-w-[60px] py-2.5 rounded-xl border-2 text-[12px] font-semibold transition-all cursor-pointer
                        ${tipPct === pct && tipPct !== -1 ? 'border-[#E8447A] bg-[#E8447A]/20 text-[#1a1a1a]' : 'border-[rgba(26,26,26,0.15)] text-[#1a1a1a]/60 hover:border-[#E8447A]'}`}>
                      {pct === 0 ? 'No tip' : `${pct}%`}
                    </button>
                  ))}
                  <button onClick={() => setTipPct(-1)}
                    className={`flex-1 min-w-[60px] py-2.5 rounded-xl border-2 text-[12px] font-semibold transition-all cursor-pointer
                      ${tipPct === -1 ? 'border-[#E8447A] bg-[#E8447A]/20 text-[#1a1a1a]' : 'border-[rgba(26,26,26,0.15)] text-[#1a1a1a]/60 hover:border-[#E8447A]'}`}>
                    Custom
                  </button>
                </div>
                {tipPct === -1 && (
                  <div className="mt-2 flex items-center gap-2 border border-[rgba(26,26,26,0.18)] rounded-xl px-3 py-2 focus-within:border-[#E8447A] focus-within:ring-2 focus-within:ring-[#E8447A]/20">
                    <span className="text-[12px] text-[#1a1a1a]/40">₹</span>
                    <input type="number" value={customTip} onChange={e => setCustomTip(e.target.value)}
                      placeholder="Enter tip amount" className="flex-1 outline-none text-[13px] text-[#1a1a1a] bg-transparent" />
                  </div>
                )}
              </div>

              {/* Split */}
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#1a1a1a]/40 mb-2">Split Bill</p>
                <div className="flex gap-2 mb-3">
                  {(['equal','custom'] as SplitMode[]).map(m => (
                    <button key={m} onClick={() => setSplitMode(m)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-[12px] font-medium transition-all capitalize cursor-pointer
                        ${splitMode === m ? 'border-[#E8447A] bg-[#E8447A]/20 text-[#1a1a1a]' : 'border-[rgba(26,26,26,0.15)] text-[#1a1a1a]/60 hover:border-[#E8447A]'}`}>
                      {m === 'equal' ? 'Equal Split' : 'Custom Amount'}
                    </button>
                  ))}
                </div>
                {splitMode === 'equal' && (
                  <div className="bg-white border border-[rgba(26,26,26,0.10)] rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#1a1a1a]/60">Split among</span>
                      <div className="flex items-center gap-3 border border-[rgba(26,26,26,0.15)] rounded-xl px-3 py-1.5">
                        <button onClick={() => setSplitCount(c => Math.max(2,c-1))} className="cursor-pointer"><Minus className="w-3.5 h-3.5 text-[#1a1a1a]/50" /></button>
                        <span className="text-[13px] font-mono font-bold w-4 text-center text-[#1a1a1a]">{splitCount}</span>
                        <button onClick={() => setSplitCount(c => Math.min(8,c+1))} className="cursor-pointer"><Plus  className="w-3.5 h-3.5 text-[#1a1a1a]/50" /></button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[12px] text-[#1a1a1a]/50">Per person</span>
                      <span className="text-[14px] font-bold font-mono text-[#1a1a1a]">₹{Math.round(perPerson)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total + pay */}
              <div className="border-t border-[rgba(26,26,26,0.08)] pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">Grand Total</span>
                  <div className="text-right">
                    <span className="text-[18px] font-bold font-mono text-[#1a1a1a]">₹{Math.round(grandTotal)}</span>
                    {tipPct > 0 && <p className="text-[10px] text-[#1a1a1a]/40">incl. ₹{Math.round(tipAmount)} tip</p>}
                  </div>
                </div>
                <button onClick={handlePay}
                  className="w-full py-4 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#FFE8EE] text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer">
                  Confirm &amp; Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback Panel ─────────────────────────────────────────────────── */}
      {activePanel === 'feedback' && !feedbackDone && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <div className="bg-[#FFE8EE] w-full max-w-lg rounded-t-3xl shadow-2xl animate-[fadeIn_0.3s_ease-out]">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-[rgba(26,26,26,0.15)]" /></div>
            <div className="px-5 pb-8 pt-2 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="text-center space-y-1">
                <div className="text-3xl">🍽️</div>
                <h3 className="text-[17px] font-lora italic text-[#1a1a1a]">How was your meal?</h3>
                <p className="text-[12px] text-[#1a1a1a]/50">Your feedback helps us serve you better</p>
              </div>
              <div className="flex justify-center gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)} className="transition-transform hover:scale-125 cursor-pointer">
                    <Star className={`w-9 h-9 transition-colors ${(hoverRating || rating) >= s ? 'text-amber-400 fill-amber-400' : 'text-[#1a1a1a]/15'}`} />
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {FEEDBACK_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer
                      ${selectedTags.includes(tag) ? 'bg-[#1a1a1a] border-[#1a1a1a] text-[#FFE8EE]' : 'border-[rgba(26,26,26,0.18)] text-[#1a1a1a]/60 hover:border-[#E8447A] hover:text-[#1a1a1a]'}`}>
                    {tag}
                  </button>
                ))}
              </div>
              <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                placeholder="Tell us more… (optional)" rows={3}
                className="w-full border border-[rgba(26,26,26,0.18)] rounded-xl px-3.5 py-2.5 text-[12px] text-[#1a1a1a] outline-none focus:border-[#E8447A] focus:ring-2 focus:ring-[#E8447A]/20 resize-none" />
              <div className="flex gap-3">
                <button onClick={() => { setActivePanel(null); setFeedbackDone(true); }}
                  className="flex-1 py-3 rounded-xl border border-[rgba(26,26,26,0.15)] text-[12px] font-medium text-[#1a1a1a]/60 hover:bg-[rgba(26,26,26,0.05)] cursor-pointer">Skip</button>
                <button disabled={rating === 0} onClick={() => { setFeedbackDone(true); setActivePanel(null); }}
                  className="flex-[2] py-3 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 disabled:opacity-40 disabled:cursor-not-allowed text-[#FFE8EE] text-[12px] font-semibold uppercase tracking-wider transition-colors cursor-pointer">
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
