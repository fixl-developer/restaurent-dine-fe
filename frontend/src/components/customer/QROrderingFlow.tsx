import { useState, useMemo } from 'react';
import {
  QrCode, UtensilsCrossed, ShoppingBag, Search, SlidersHorizontal,
  Plus, Minus, X, ChevronRight, ChevronLeft, CheckCircle2, Clock,
  ArrowLeft, Star, Leaf, Flame, Tag, Smartphone, Banknote, CreditCard,
  MapPin, Phone, User, Package, Bell, ChevronDown, BadgeCheck,
  Home, Bike, Hash
} from 'lucide-react';
import cakeImg from '../../assets/images/cake.jpg';
import eggNoodlesImg from '../../assets/images/eggnoodles.jpg';
import eggSaladImg from '../../assets/images/eggsalad.jpg';
import noodlesImg from '../../assets/images/noodles.jpg';
import oatsImg from '../../assets/images/oats.jpg';
import oats2Img from '../../assets/images/oats2.jpg';
import saladImg from '../../assets/images/salad.jpg';
import sauceImg from '../../assets/images/sauce.jpg';

// ─── Types ─────────────────────────────────────────────────────────────────

type OrderType = 'dine-in' | 'takeaway';
type FlowStep =
  | 'entry'
  | 'menu'
  | 'cart'
  | 'checkout'
  | 'order-placed'
  | 'tracking'
  | 'pickup-time'
  | 'token'
  | 'token-status'
  | 'token-board';

type TrackingStatus = 'placed' | 'accepted' | 'preparing' | 'ready' | 'served';

interface Variant { name: string; price: number; }
interface Addon  { name: string; price: number; }

interface QRMenuItem {
  id: string; name: string; price: number; category: string;
  description: string; image: string; calories: number;
  tags: string[]; rating: number; reviews: number;
  variants?: Variant[]; addons?: Addon[];
  isVeg: boolean; isSpicy?: boolean; isBestseller?: boolean;
}

interface CartEntry {
  item: QRMenuItem;
  qty: number;
  variant?: Variant;
  addons: Addon[];
  notes: string;
  lineTotal: number;
}

// ─── Mock Menu ──────────────────────────────────────────────────────────────

const QR_MENU: QRMenuItem[] = [
  {
    id: 'm1', name: 'Strawberry Icing Velvet Cake', price: 6.80, category: 'Sweets',
    description: 'A beautiful single-slice sponge cake dressed in fluffy pastel strawberry whipped icing & rainbow confetti.',
    image: cakeImg, calories: 420, tags: ['Veg', 'Bestseller'], rating: 4.9, reviews: 312, isVeg: true, isBestseller: true,
    variants: [{ name: 'Single Slice', price: 6.80 }, { name: 'Double Slice', price: 11.50 }],
    addons: [{ name: 'Extra Strawberry Drizzle', price: 0.80 }, { name: 'Whipped Cream', price: 0.60 }],
  },
  {
    id: 'm2', name: 'Double Matcha Crème Mille Crêpe', price: 7.90, category: 'Sweets',
    description: 'Twenty paper-thin crêpe layers layered with organic Uji matcha white chocolate custard cream.',
    image: oats2Img, calories: 380, tags: ['Veg', 'New'], rating: 4.8, reviews: 89, isVeg: true,
    addons: [{ name: 'Matcha Powder Dusting', price: 0.50 }, { name: 'Rose Petal Garnish', price: 0.75 }],
  },
  {
    id: 'm3', name: 'Coquette Berry Whipped Princess Cake', price: 8.20, category: 'Sweets',
    description: 'Double chiffon layers filled with vanilla custard, glazed peaches, and high-purity strawberries.',
    image: cakeImg, calories: 450, tags: ['Veg', 'House Special'], rating: 4.9, reviews: 204, isVeg: true, isBestseller: true,
    variants: [{ name: 'Regular', price: 8.20 }, { name: 'Large Slice', price: 12.40 }],
  },
  {
    id: 'm4', name: 'Golden Peach Morning Oat Bowl', price: 8.50, category: 'Sweets',
    description: 'Nourishing organic oats cooked in almond milk, layered with fresh peach slices & sweet local honey.',
    image: oats2Img, calories: 310, tags: ['Veg', 'Healthy'], rating: 4.7, reviews: 156, isVeg: true,
    addons: [{ name: 'Granola Crunch', price: 0.80 }, { name: 'Extra Honey', price: 0.40 }],
  },
  {
    id: 'm5', name: 'Garden Fresh Tossed Salad', price: 9.50, category: 'Mains',
    description: 'Crisp green leaf base, tender baby herbs, cucumber reels, and a light splash of peach vinaigrette.',
    image: saladImg, calories: 190, tags: ['Veg', 'Raw Organic', 'Light'], rating: 4.6, reviews: 98, isVeg: true,
    addons: [{ name: 'Grilled Chicken', price: 3.50 }, { name: 'Avocado', price: 2.00 }, { name: 'Extra Dressing', price: 0.60 }],
  },
  {
    id: 'm6', name: 'Sesame Glazed Braised Pork Rice', price: 13.90, category: 'Mains',
    description: 'Melt-in-your-mouth slow braised pork shoulder over fluffy white sushi rice with pickled cucumbers.',
    image: sauceImg, calories: 580, tags: ['Non-Veg', 'Chef Recommended'], rating: 4.9, reviews: 267, isVeg: false, isBestseller: true,
    variants: [{ name: 'Regular Bowl', price: 13.90 }, { name: 'Large Bowl', price: 17.50 }],
    addons: [{ name: 'Soft Boiled Egg', price: 1.50 }, { name: 'Extra Sesame Drizzle', price: 0.80 }],
  },
  {
    id: 'm7', name: 'Sichuan Sesame Chili Noodles', price: 11.50, category: 'Mains',
    description: 'Cozy wheat noodles tossed in roasted sesame oil, sweet soy broth, minced scallions & chili paste.',
    image: noodlesImg, calories: 490, tags: ['Veg', 'Spicy'], rating: 4.8, reviews: 183, isVeg: true, isSpicy: true,
    variants: [{ name: 'Regular', price: 11.50 }, { name: 'Extra Noodles', price: 14.00 }],
    addons: [{ name: 'Extra Chili Oil', price: 0.50 }, { name: 'Crispy Tofu', price: 2.00 }],
  },
  {
    id: 'm8', name: 'Wok-fired Handmade Egg Noodles', price: 12.00, category: 'Mains',
    description: 'Broad golden egg noodles tossed in garlic soy, fresh mixed spring greens, and white pepper broth.',
    image: eggNoodlesImg, calories: 520, tags: ['Non-Veg', 'Chef Traditional'], rating: 4.7, reviews: 142, isVeg: false,
    addons: [{ name: 'Extra Egg', price: 1.00 }, { name: 'Garlic Butter', price: 0.80 }],
  },
  {
    id: 's1', name: 'Creamy Potato & Egg Salad Plate', price: 4.80, category: 'Sides',
    description: 'Premium light mustard egg salad mashed with cold diced green potatoes in a double-walled bowl.',
    image: eggSaladImg, calories: 260, tags: ['Veg', 'Savory'], rating: 4.5, reviews: 71, isVeg: true,
  },
  {
    id: 's2', name: 'Diner Golden Egg Potato Croquettes', price: 5.20, category: 'Sides',
    description: 'Crispy fried panko outer layer filled with soft mashed potatoes and fresh sweet herbs.',
    image: eggSaladImg, calories: 240, tags: ['Veg', 'Hot Side', 'Crispy'], rating: 4.6, reviews: 94, isVeg: true,
    addons: [{ name: 'Dipping Sauce', price: 0.80 }],
  },
  {
    id: 'd1', name: 'Peach Garden Strawberry Matcha Latte', price: 5.50, category: 'Drinks',
    description: 'Ceremonial stone-ground green tea over a base of fresh organic strawberry pink milk foam.',
    image: oatsImg, calories: 160, tags: ['Veg', 'Bestseller', 'Iced'], rating: 4.9, reviews: 389, isVeg: true, isBestseller: true,
    variants: [{ name: 'Regular (300ml)', price: 5.50 }, { name: 'Large (500ml)', price: 7.00 }],
    addons: [{ name: 'Extra Matcha Shot', price: 1.00 }, { name: 'Oat Milk Upgrade', price: 0.80 }],
  },
  {
    id: 'd2', name: 'Peach Oatmeal Cream Smoothie', price: 5.00, category: 'Drinks',
    description: 'Rich blended cream shake with organic peach juice base, oatmeal milk froth and a sweet honey drizzle.',
    image: oats2Img, calories: 220, tags: ['Veg', 'Creamy'], rating: 4.7, reviews: 145, isVeg: true,
    variants: [{ name: 'Regular (300ml)', price: 5.00 }, { name: 'Large (500ml)', price: 6.50 }],
  },
  {
    id: 'd3', name: 'Sweet Raspberry Infusion Soda', price: 4.80, category: 'Drinks',
    description: 'Sparkling mineral infusion with crushed forest strawberries and sweet sugarcane nectar.',
    image: oatsImg, calories: 120, tags: ['Veg', 'Iced Cold', 'Sparkling'], rating: 4.6, reviews: 108, isVeg: true,
  },
];

const CATEGORIES = ['All', 'Sweets', 'Mains', 'Sides', 'Drinks'];
const COUPON_MAP: Record<string, number> = { 'FIRST10': 10, 'SMART5': 5, 'QR15': 15 };
const PICKUP_SLOTS = ['ASAP (~20 min)', '30 minutes', '45 minutes', '1 hour', '1.5 hours'];
const TRACKING_STEPS: { id: TrackingStatus; label: string; desc: string }[] = [
  { id: 'placed',    label: 'Order Placed',     desc: 'Your order has been received' },
  { id: 'accepted',  label: 'Accepted',          desc: 'Restaurant confirmed your order' },
  { id: 'preparing', label: 'Preparing',         desc: 'Chef is preparing your meal' },
  { id: 'ready',     label: 'Ready',             desc: 'Your order is ready to serve' },
  { id: 'served',    label: 'Served',            desc: 'Enjoy your meal!' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function MenuCard({ item, onView, onQuickAdd }: {
  item: QRMenuItem;
  onView: (item: QRMenuItem) => void;
  onQuickAdd: (item: QRMenuItem) => void;
}) {
  return (
    <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <button onClick={() => onView(item)} className="relative overflow-hidden aspect-[4/3] shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        {item.isBestseller && (
          <span className="absolute top-2 left-2 bg-[#1a1a1a] text-[#E8447A] text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full">
            ★ Bestseller
          </span>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {item.isVeg && <span className="w-5 h-5 rounded bg-white border-2 border-emerald-500 flex items-center justify-center"><Leaf className="w-2.5 h-2.5 text-emerald-600" /></span>}
          {item.isSpicy && <span className="w-5 h-5 rounded bg-white border-2 border-red-400 flex items-center justify-center"><Flame className="w-2.5 h-2.5 text-red-500" /></span>}
        </div>
      </button>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="text-[13px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2">{item.name}</h3>
          <p className="text-[11px] text-[#1a1a1a]/50 mt-0.5 line-clamp-2 leading-snug">{item.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {item.tags.slice(0, 2).map(t => (
            <span key={t} className="text-[9px] font-mono bg-[#FFFFFF] text-[#1a1a1a]/50 px-1.5 py-0.5 rounded-full uppercase">{t}</span>
          ))}
          <div className="flex items-center gap-0.5 ml-auto">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-mono text-[#1a1a1a]/60">{item.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-1 border-t border-[rgba(26,26,26,0.06)]">
          <span className="text-[14px] font-bold text-[#1a1a1a]">₹{(item.price * 83).toFixed(0)}</span>
          <button
            onClick={() => onQuickAdd(item)}
            className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4 text-[#FFFFFF]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemDetailModal({ item, onClose, onAddToCart }: {
  item: QRMenuItem;
  onClose: () => void;
  onAddToCart: (item: QRMenuItem, qty: number, variant?: Variant, addons?: Addon[], notes?: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(item.variants?.[0]);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [notes, setNotes] = useState('');

  const basePrice = selectedVariant?.price ?? item.price;
  const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const lineTotal = (basePrice + addonTotal) * qty;

  const toggleAddon = (a: Addon) => {
    setSelectedAddons(prev =>
      prev.find(x => x.name === a.name) ? prev.filter(x => x.name !== a.name) : [...prev, a]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-[#FFFFFF] w-full sm:max-w-md sm:rounded-[22px] rounded-t-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="relative h-52 shrink-0">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFFFFF]/90 flex items-center justify-center shadow-md"
          >
            <X className="w-4 h-4 text-[#1a1a1a]" />
          </button>
          <div className="absolute top-3 left-3 flex gap-1.5">
            {item.isVeg && <span className="w-6 h-6 rounded bg-white border-2 border-emerald-500 flex items-center justify-center"><Leaf className="w-3 h-3 text-emerald-600" /></span>}
            {item.isBestseller && <span className="bg-[#1a1a1a] text-[#E8447A] text-[9px] font-mono px-2 py-0.5 rounded-full uppercase">★ Bestseller</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h2 className="text-[16px] font-barlow font-black uppercase text-[#1a1a1a]">{item.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-[12px] font-mono text-[#1a1a1a]/60">{item.rating} ({item.reviews} reviews)</span>
              </div>
              <span className="text-[10px] font-mono text-[#1a1a1a]/40">{item.calories} cal</span>
            </div>
            <p className="text-[12px] text-[#1a1a1a]/50 mt-2 leading-relaxed">{item.description}</p>
          </div>

          {item.variants && (
            <div>
              <p className="text-[11px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest mb-2">Size / Variant</p>
              <div className="flex flex-wrap gap-2">
                {item.variants.map(v => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 rounded-xl border-2 text-[12px] font-medium transition-all
                      ${selectedVariant?.name === v.name
                        ? 'border-[#E8447A] bg-[#E8447A]/15 text-[#1a1a1a]'
                        : 'border-[rgba(26,26,26,0.18)] text-[#1a1a1a]/60 hover:border-[rgba(26,26,26,0.30)]'}`}
                  >
                    {v.name} · <span className="font-mono">₹{(v.price * 83).toFixed(0)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.addons && item.addons.length > 0 && (
            <div>
              <p className="text-[11px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest mb-2">Add-ons (Optional)</p>
              <div className="space-y-2">
                {item.addons.map(a => {
                  const checked = selectedAddons.find(x => x.name === a.name);
                  return (
                    <button
                      key={a.name}
                      onClick={() => toggleAddon(a)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left
                        ${checked ? 'border-[#E8447A]/60 bg-[#E8447A]/10' : 'border-[rgba(26,26,26,0.15)] hover:border-[rgba(26,26,26,0.25)]'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                          ${checked ? 'bg-[#1a1a1a] border-[#1a1a1a]' : 'border-[rgba(26,26,26,0.25)]'}`}
                        >
                          {checked && <CheckCircle2 className="w-3 h-3 text-[#FFFFFF]" />}
                        </div>
                        <span className="text-[12px] text-[#1a1a1a]">{a.name}</span>
                      </div>
                      <span className="text-[12px] font-mono text-[#1a1a1a]/50">+ ₹{(a.price * 83).toFixed(0)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-[11px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest mb-2">Special Instructions</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any allergies, preferences, or special requests..."
              rows={2}
              className="w-full border border-[rgba(26,26,26,0.18)] rounded-xl px-3 py-2 text-[12px] text-[#1a1a1a] outline-none focus:border-[#E8447A] focus:ring-2 focus:ring-[#E8447A]/20 resize-none bg-white"
            />
          </div>
        </div>

        {/* Bottom Action */}
        <div className="border-t border-[rgba(26,26,26,0.08)] p-4 flex items-center gap-3">
          <div className="flex items-center gap-3 border border-[rgba(26,26,26,0.18)] rounded-xl px-3 py-2">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-[#1a1a1a]/50 hover:text-[#1a1a1a]"><Minus className="w-4 h-4" /></button>
            <span className="text-[14px] font-mono font-bold w-5 text-center text-[#1a1a1a]">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="text-[#1a1a1a]/50 hover:text-[#1a1a1a]"><Plus className="w-4 h-4" /></button>
          </div>
          <button
            onClick={() => { onAddToCart(item, qty, selectedVariant, selectedAddons, notes); onClose(); }}
            className="flex-1 py-3 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#FFFFFF] text-[13px] font-semibold flex items-center justify-between px-4 transition-colors uppercase tracking-wider"
          >
            <span>Add to Cart</span>
            <span className="font-mono">₹{(lineTotal * 83).toFixed(0)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Flow Component ─────────────────────────────────────────────────────

export default function QROrderingFlow({ onExit, tableNumber = 4 }: { onExit: () => void; tableNumber?: number }) {
  const [step, setStep] = useState<FlowStep>('entry');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [viewItem, setViewItem] = useState<QRMenuItem | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; pct: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [payMethod, setPayMethod] = useState<'upi' | 'cash' | 'card'>('upi');
  const [pickupSlot, setPickupSlot] = useState(PICKUP_SLOTS[0]);
  const [trackingStep, setTrackingStep] = useState<TrackingStatus>('placed');
  const [tokenNumber] = useState(Math.floor(Math.random() * 20) + 100);
  const [showSearch, setShowSearch] = useState(false);

  const tableLabel = `Table ${tableNumber}`;

  const filteredMenu = useMemo(() => {
    let items = QR_MENU;
    if (category !== 'All') items = items.filter(i => i.category === category);
    if (filterVeg) items = items.filter(i => i.isVeg);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    return items;
  }, [category, filterVeg, search]);

  const cartTotal = cart.reduce((s, e) => s + e.lineTotal, 0);
  const cartCount = cart.reduce((s, e) => s + e.qty, 0);
  const discountAmt = appliedCoupon ? cartTotal * (appliedCoupon.pct / 100) : 0;
  const taxAmt = (cartTotal - discountAmt) * 0.05;
  const grandTotal = cartTotal - discountAmt + taxAmt;

  const addToCart = (item: QRMenuItem, qty: number, variant?: Variant, addons: Addon[] = [], notes = '') => {
    const basePrice = variant?.price ?? item.price;
    const addonTotal = addons.reduce((s, a) => s + a.price, 0);
    const lineTotal = (basePrice + addonTotal) * qty;
    setCart(prev => {
      const key = `${item.id}-${variant?.name ?? ''}-${addons.map(a => a.name).join(',')}`;
      const existing = prev.find(e => `${e.item.id}-${e.variant?.name ?? ''}-${e.addons.map(a => a.name).join(',')}` === key);
      if (existing && notes === existing.notes) {
        return prev.map(e => {
          const eKey = `${e.item.id}-${e.variant?.name ?? ''}-${e.addons.map(a => a.name).join(',')}`;
          if (eKey !== key) return e;
          return { ...e, qty: e.qty + qty, lineTotal: e.lineTotal + lineTotal };
        });
      }
      return [...prev, { item, qty, variant, addons, notes, lineTotal }];
    });
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart(prev => {
      const entry = prev[idx];
      if (!entry) return prev;
      const newQty = entry.qty + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== idx);
      const perUnit = entry.lineTotal / entry.qty;
      return prev.map((e, i) => i === idx ? { ...e, qty: newQty, lineTotal: perUnit * newQty } : e);
    });
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPON_MAP[code]) {
      setAppliedCoupon({ code, pct: COUPON_MAP[code] });
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const placeOrder = () => {
    if (orderType === 'takeaway') {
      setStep('pickup-time');
    } else {
      setStep('order-placed');
      setTrackingStep('placed');
      // Auto-advance tracking for demo
      const steps: TrackingStatus[] = ['accepted', 'preparing', 'ready'];
      steps.forEach((s, i) => {
        setTimeout(() => setTrackingStep(s), (i + 1) * 4000);
      });
    }
  };

  const confirmPickup = () => {
    setStep('token');
    setTrackingStep('preparing');
    setTimeout(() => setTrackingStep('ready'), 6000);
  };

  // ─── Entry Screen ──────────────────────────────────────────────────────────
  if (step === 'entry') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 font-sans">
        <button onClick={onExit} className="fixed top-4 left-4 flex items-center gap-1.5 text-[10px] font-mono text-[#1a1a1a]/40 hover:text-[#1a1a1a] uppercase tracking-widest">
          <ArrowLeft className="w-3 h-3" />
          Exit
        </button>
        <div className="max-w-sm w-full space-y-8 text-center">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <QrCode className="w-8 h-8 text-[#E8447A]" />
            </div>
            <h1 className="text-[28px] font-barlow font-black uppercase text-[#1a1a1a] tracking-wide">SMARTDINE</h1>
            <p className="text-[13px] text-[#1a1a1a]/50 mt-1.5">Welcome to your digital menu experience</p>
          </div>

          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-5 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-[#E8447A]" />
              <span className="text-[14px] font-semibold text-[#1a1a1a]">{tableLabel} · Rose Alcove</span>
            </div>
            <p className="text-[11px] text-[#1a1a1a]/40 font-mono uppercase tracking-widest">Scan verified · Zone: Main Floor</p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest">How would you like to order?</p>
            <button
              onClick={() => { setOrderType('dine-in'); setStep('menu'); }}
              className="w-full py-4 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#FFFFFF] uppercase tracking-wider transition-all flex items-center justify-between px-5 group"
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-[14px] font-semibold">Dine In</p>
                  <p className="text-[11px] opacity-60">Order at your table</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => { setOrderType('takeaway'); setStep('menu'); }}
              className="w-full py-4 rounded-[100px] border-2 border-[rgba(26,26,26,0.18)] bg-white hover:bg-[#E8447A]/10 hover:border-[#E8447A] text-[#1a1a1a] transition-all flex items-center justify-between px-5 group"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-[14px] font-semibold">Takeaway</p>
                  <p className="text-[11px] text-[#1a1a1a]/50">Pick up from counter</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#1a1a1a]/40 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <p className="text-[10px] text-[#1a1a1a]/25 font-mono">842 Pastel Blvd, Los Angeles · smartdine.com</p>
        </div>
      </div>
    );
  }

  // ─── Menu Screen ───────────────────────────────────────────────────────────
  if (step === 'menu') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#1a1a1a] border-b border-[rgba(240,234,210,0.10)]">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('entry')} className="text-[#FFFFFF]/50 hover:text-[#FFFFFF]">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-[13px] font-barlow font-black uppercase text-[#FFFFFF]">Menu</p>
                <p className="text-[10px] text-[#FFFFFF]/40 font-mono uppercase">
                  {orderType === 'dine-in' ? `${tableLabel} · Dine In` : 'Takeaway Order'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 rounded-full border border-[rgba(240,234,210,0.15)] flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-[#FFFFFF]/50" />
              </button>
              <button
                onClick={() => setFilterVeg(!filterVeg)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${filterVeg ? 'border-[#1BC8C8] bg-[#1BC8C8]/20' : 'border-[rgba(240,234,210,0.15)]'}`}
              >
                <Leaf className={`w-3.5 h-3.5 ${filterVeg ? 'text-[#1BC8C8]' : 'text-[#FFFFFF]/40'}`} />
              </button>
              {cartCount > 0 && (
                <button
                  onClick={() => setStep('cart')}
                  className="relative flex items-center gap-1.5 bg-[#E8447A] text-[#1a1a1a] px-3 py-1.5 rounded-full text-[12px] font-medium"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{cartCount}</span>
                  <span className="hidden sm:inline font-mono">₹{(cartTotal * 83).toFixed(0)}</span>
                </button>
              )}
            </div>
          </div>
          {showSearch && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 bg-[rgba(240,234,210,0.08)] border border-[rgba(240,234,210,0.15)] rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-[#FFFFFF]/40 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search dishes..."
                  className="flex-1 bg-transparent outline-none text-[13px] text-[#FFFFFF] placeholder:text-[#FFFFFF]/30"
                />
                {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-[#FFFFFF]/40" /></button>}
              </div>
            </div>
          )}
          {/* Category Tabs */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all
                  ${category === cat ? 'bg-[#E8447A] text-[#1a1a1a]' : 'bg-[rgba(240,234,210,0.10)] text-[#FFFFFF]/60 hover:bg-[rgba(240,234,210,0.15)]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 p-4">
          {filteredMenu.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UtensilsCrossed className="w-10 h-10 text-[#1a1a1a]/20 mb-3" />
              <p className="text-[13px] font-medium text-[#1a1a1a]/50">No items found</p>
              <button onClick={() => { setCategory('All'); setSearch(''); setFilterVeg(false); }} className="text-[12px] text-[#1a1a1a] underline mt-2">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredMenu.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onView={setViewItem}
                  onQuickAdd={item => addToCart(item, 1)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Cart Bar */}
        {cartCount > 0 && (
          <div className="sticky bottom-0 bg-[#FFFFFF] border-t border-[rgba(26,26,26,0.10)] p-4">
            <button
              onClick={() => setStep('cart')}
              className="w-full py-3.5 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#FFFFFF] flex items-center justify-between px-5 transition-colors uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/15 text-[12px] font-bold flex items-center justify-center">{cartCount}</span>
                <span className="text-[14px] font-semibold">View Cart</span>
              </div>
              <span className="text-[14px] font-mono font-bold">₹{(cartTotal * 83).toFixed(0)}</span>
            </button>
          </div>
        )}

        {viewItem && (
          <ItemDetailModal
            item={viewItem}
            onClose={() => setViewItem(null)}
            onAddToCart={addToCart}
          />
        )}
      </div>
    );
  }

  // ─── Cart Screen ───────────────────────────────────────────────────────────
  if (step === 'cart') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col">
        <div className="sticky top-0 z-20 bg-[#1a1a1a] border-b border-[rgba(240,234,210,0.10)] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setStep('menu')} className="text-[#FFFFFF]/50 hover:text-[#FFFFFF]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[14px] font-barlow font-black uppercase text-[#FFFFFF]">Your Cart</p>
            <p className="text-[10px] text-[#FFFFFF]/40 font-mono uppercase">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="w-12 h-12 text-[#1a1a1a]/15 mb-4" />
              <p className="text-[14px] font-medium text-[#1a1a1a]/50">Your cart is empty</p>
              <button onClick={() => setStep('menu')} className="mt-3 text-[12px] text-[#1a1a1a] underline font-medium">Browse Menu</button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] divide-y divide-[rgba(26,26,26,0.05)] overflow-hidden">
                {cart.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3">
                    <img src={entry.item.image} alt={entry.item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug">{entry.item.name}</p>
                      {entry.variant && <p className="text-[11px] text-[#1a1a1a]/40 mt-0.5">{entry.variant.name}</p>}
                      {entry.addons.length > 0 && (
                        <p className="text-[10px] text-[#1a1a1a]/40 mt-0.5">{entry.addons.map(a => a.name).join(', ')}</p>
                      )}
                      {entry.notes && <p className="text-[10px] text-amber-600 italic mt-0.5">↳ {entry.notes}</p>}
                      <p className="text-[12px] font-mono font-bold text-[#1a1a1a] mt-1">₹{(entry.lineTotal * 83).toFixed(0)}</p>
                    </div>
                    <div className="flex items-center gap-2 border border-[rgba(26,26,26,0.15)] rounded-xl px-2 py-1 shrink-0">
                      <button onClick={() => updateCartQty(idx, -1)} className="text-[#1a1a1a]/40 hover:text-[#1a1a1a]"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="text-[12px] font-mono font-bold w-4 text-center text-[#1a1a1a]">{entry.qty}</span>
                      <button onClick={() => updateCartQty(idx, +1)} className="text-[#1a1a1a]/40 hover:text-[#1a1a1a]"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-[#1a1a1a]/40" />
                  <p className="text-[13px] font-medium text-[#1a1a1a]">Coupon Code</p>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#1BC8C8]/10 border border-[#1BC8C8]/30 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-[#1BC8C8]" />
                      <span className="text-[12px] font-mono font-bold text-[#1BC8C8]">{appliedCoupon.code}</span>
                      <span className="text-[11px] text-[#1BC8C8]">−{appliedCoupon.pct}%</span>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)}><X className="w-3.5 h-3.5 text-[#1BC8C8]" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      placeholder="Enter code"
                      className="flex-1 border border-[rgba(26,26,26,0.18)] rounded-xl px-3 py-2 text-[12px] font-mono uppercase outline-none focus:border-[#E8447A] focus:ring-2 focus:ring-[#E8447A]/20"
                    />
                    <button onClick={applyCoupon} className="px-4 py-2 bg-[#1a1a1a] text-[#FFFFFF] rounded-xl text-[12px] font-medium hover:bg-[#1a1a1a]/80">Apply</button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-500 mt-1.5">{couponError}</p>}
                <p className="text-[10px] text-[#1a1a1a]/40 mt-2 font-mono">Try: FIRST10 · SMART5 · QR15</p>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4 space-y-2">
                <p className="text-[12px] font-barlow font-black uppercase text-[#1a1a1a] mb-3">Order Summary</p>
                <SummaryRow label="Subtotal" value={`₹${(cartTotal * 83).toFixed(0)}`} />
                {appliedCoupon && (
                  <SummaryRow label={`Coupon (${appliedCoupon.code} −${appliedCoupon.pct}%)`} value={`− ₹${(discountAmt * 83).toFixed(0)}`} accent="text-[#1BC8C8]" />
                )}
                <SummaryRow label="GST (5%)" value={`₹${(taxAmt * 83).toFixed(0)}`} accent="text-[#1a1a1a]/40" />
                <div className="flex justify-between items-center border-t border-[rgba(26,26,26,0.08)] pt-2 mt-1">
                  <span className="text-[14px] font-bold text-[#1a1a1a]">Grand Total</span>
                  <span className="text-[16px] font-bold font-mono text-[#1a1a1a]">₹{(grandTotal * 83).toFixed(0)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[rgba(26,26,26,0.10)] p-4">
            <button
              onClick={() => setStep('checkout')}
              className="w-full py-3.5 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#FFFFFF] flex items-center justify-between px-5 transition-colors uppercase tracking-wider"
            >
              <span className="text-[14px] font-semibold">Proceed to Checkout</span>
              <span className="text-[14px] font-mono font-bold">₹{(grandTotal * 83).toFixed(0)}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Checkout Screen ───────────────────────────────────────────────────────
  if (step === 'checkout') {
    const canPlace = customerName.trim().length >= 2 && customerPhone.trim().length >= 10;
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col">
        <div className="sticky top-0 z-20 bg-[#1a1a1a] border-b border-[rgba(240,234,210,0.10)] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setStep('cart')} className="text-[#FFFFFF]/50 hover:text-[#FFFFFF]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className="text-[14px] font-barlow font-black uppercase text-[#FFFFFF]">Checkout</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">
          {/* Customer Details */}
          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4 space-y-3">
            <p className="text-[12px] font-barlow font-black uppercase text-[#1a1a1a]">Your Details</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 border border-[rgba(26,26,26,0.18)] rounded-xl px-3 py-2.5 focus-within:border-[#E8447A] focus-within:ring-2 focus-within:ring-[#E8447A]/20 transition-all">
                <User className="w-4 h-4 text-[#1a1a1a]/40 shrink-0" />
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 outline-none text-[13px] text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 border border-[rgba(26,26,26,0.18)] rounded-xl px-3 py-2.5 focus-within:border-[#E8447A] focus-within:ring-2 focus-within:ring-[#E8447A]/20 transition-all">
                <Phone className="w-4 h-4 text-[#1a1a1a]/40 shrink-0" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Mobile number"
                  className="flex-1 outline-none text-[13px] text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-barlow font-black uppercase text-[#1a1a1a]">Order Info</p>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${orderType === 'dine-in' ? 'bg-[#1BC8C8]/10 text-[#1BC8C8] border-[#1BC8C8]/30' : 'bg-[#E8447A]/15 text-[#1a1a1a] border-[#E8447A]/30'}`}>
                {orderType === 'dine-in' ? `Dine In · ${tableLabel}` : 'Takeaway'}
              </span>
            </div>
            {cart.map((entry, i) => (
              <div key={i} className="flex justify-between text-[12px] py-1">
                <span className="text-[#1a1a1a]/60">{entry.qty}× {entry.item.name}{entry.variant ? ` (${entry.variant.name})` : ''}</span>
                <span className="font-mono text-[#1a1a1a]">₹{(entry.lineTotal * 83).toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-[rgba(26,26,26,0.08)] pt-2 mt-2 flex justify-between items-center">
              <span className="text-[13px] font-bold text-[#1a1a1a]">Total</span>
              <span className="text-[14px] font-bold font-mono text-[#1a1a1a]">₹{(grandTotal * 83).toFixed(0)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4">
            <p className="text-[12px] font-barlow font-black uppercase text-[#1a1a1a] mb-3">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'upi',  icon: Smartphone, label: 'UPI' },
                { id: 'cash', icon: Banknote,   label: 'Cash' },
                { id: 'card', icon: CreditCard, label: 'Card' },
              ] as { id: 'upi' | 'cash' | 'card'; icon: React.ElementType; label: string }[]).map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all
                      ${payMethod === m.id ? 'border-[#E8447A] bg-[#E8447A]/10 text-[#1a1a1a]' : 'border-[rgba(26,26,26,0.15)] text-[#1a1a1a]/50'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-mono uppercase">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[rgba(26,26,26,0.10)] p-4">
          <button
            disabled={!canPlace}
            onClick={placeOrder}
            className="w-full py-3.5 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 disabled:opacity-40 disabled:cursor-not-allowed text-[#FFFFFF] text-[14px] font-semibold uppercase tracking-wider transition-colors"
          >
            {orderType === 'dine-in' ? 'Place Order' : 'Confirm & Select Pickup Time'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Pickup Time (Takeaway) ────────────────────────────────────────────────
  if (step === 'pickup-time') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col">
        <div className="sticky top-0 z-20 bg-[#1a1a1a] border-b border-[rgba(240,234,210,0.10)] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setStep('checkout')} className="text-[#FFFFFF]/50 hover:text-[#FFFFFF]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className="text-[14px] font-barlow font-black uppercase text-[#FFFFFF]">Pickup Time</p>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-5 text-center">
            <Package className="w-10 h-10 text-[#E8447A] mx-auto mb-3" />
            <h2 className="text-[16px] font-barlow font-black uppercase text-[#1a1a1a]">When to pick up?</h2>
            <p className="text-[12px] text-[#1a1a1a]/50 mt-1">Select your preferred pickup time from the counter</p>
          </div>

          <div className="space-y-2">
            {PICKUP_SLOTS.map(slot => (
              <button
                key={slot}
                onClick={() => setPickupSlot(slot)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left
                  ${pickupSlot === slot ? 'border-[#E8447A] bg-[#E8447A]/10' : 'border-[rgba(26,26,26,0.15)] bg-white hover:border-[rgba(26,26,26,0.25)]'}`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-4 h-4 ${pickupSlot === slot ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/40'}`} />
                  <span className={`text-[13px] font-medium ${pickupSlot === slot ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/60'}`}>{slot}</span>
                </div>
                {pickupSlot === slot && <CheckCircle2 className="w-5 h-5 text-[#1BC8C8]" />}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4 space-y-2">
            <SummaryRow label="Items" value={`${cartCount} items`} />
            <SummaryRow label="Total" value={`₹${(grandTotal * 83).toFixed(0)}`} highlight />
            <SummaryRow label="Payment" value={payMethod.toUpperCase()} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#FFFFFF] border-t border-[rgba(26,26,26,0.10)] p-4">
          <button
            onClick={confirmPickup}
            className="w-full py-3.5 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#FFFFFF] text-[14px] font-semibold uppercase tracking-wider transition-colors"
          >
            Confirm Order
          </button>
        </div>
      </div>
    );
  }

  // ─── Token Screen (Takeaway) ───────────────────────────────────────────────
  if (step === 'token') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#1BC8C8]/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-[#1BC8C8]" />
          </div>
          <div>
            <h2 className="text-[20px] font-barlow font-black uppercase text-[#1a1a1a]">Order Confirmed!</h2>
            <p className="text-[13px] text-[#1a1a1a]/50 mt-1">Your order has been received</p>
          </div>

          {/* Token Number */}
          <div className="bg-[#1a1a1a] rounded-3xl p-8 text-center shadow-xl">
            <p className="text-[11px] font-mono text-[#FFFFFF]/40 uppercase tracking-widest mb-2">Your Token Number</p>
            <div className="text-[72px] font-black text-[#E8447A] font-mono leading-none">{tokenNumber}</div>
            <p className="text-[10px] font-mono text-[#FFFFFF]/30 mt-3 uppercase tracking-widest">SmartDine Takeaway</p>
          </div>

          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4 space-y-2 text-left">
            <SummaryRow label="Pickup Time" value={pickupSlot} />
            <SummaryRow label="Payment" value={payMethod.toUpperCase()} />
            <SummaryRow label="Total" value={`₹${(grandTotal * 83).toFixed(0)}`} highlight />
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setStep('token-status')}
              className="w-full py-3 rounded-[100px] bg-[#1a1a1a] text-[#FFFFFF] text-[13px] font-semibold uppercase tracking-wider hover:bg-[#1a1a1a]/80 transition-colors"
            >
              Track My Order
            </button>
            <button
              onClick={() => setStep('token-board')}
              className="w-full py-3 rounded-xl border border-[rgba(26,26,26,0.18)] text-[13px] text-[#1a1a1a]/60 font-medium hover:bg-[rgba(26,26,26,0.05)]"
            >
              View Token Board
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Token Status (Takeaway Tracking) ─────────────────────────────────────
  if (step === 'token-status') {
    const takeawaySteps: { id: TrackingStatus; label: string; desc: string }[] = [
      { id: 'placed',    label: 'Order Placed',    desc: 'Your order has been received' },
      { id: 'preparing', label: 'Preparing',        desc: 'Kitchen is preparing your food' },
      { id: 'ready',     label: 'Ready',            desc: 'Your order is ready for pickup!' },
    ];
    const currentIdx = takeawaySteps.findIndex(s => s.id === trackingStep);

    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col items-center p-6">
        <div className="max-w-sm w-full space-y-6">
          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => setStep('token')} className="text-[#1a1a1a]/40 hover:text-[#1a1a1a]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="text-[15px] font-barlow font-black uppercase text-[#1a1a1a]">Order Status</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl px-6 py-5 text-center">
            <p className="text-[10px] font-mono text-[#FFFFFF]/40 uppercase tracking-widest">Token</p>
            <div className="text-[48px] font-black text-[#E8447A] font-mono leading-none mt-1">{tokenNumber}</div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-5 space-y-4">
            {takeawaySteps.map((s, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div key={s.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all
                    ${done ? 'bg-[#1BC8C8]/15 border-2 border-[#1BC8C8]' : active ? 'bg-[#E8447A]/20 border-2 border-[#E8447A]' : 'bg-[rgba(26,26,26,0.06)] border-2 border-[rgba(26,26,26,0.15)]'}`}
                  >
                    {done
                      ? <CheckCircle2 className="w-4 h-4 text-[#1BC8C8]" />
                      : active
                        ? <div className="w-2.5 h-2.5 rounded-full bg-[#E8447A] animate-pulse" />
                        : <div className="w-2 h-2 rounded-full bg-[rgba(26,26,26,0.20)]" />
                    }
                  </div>
                  <div>
                    <p className={`text-[13px] font-semibold ${done ? 'text-[#1BC8C8]' : active ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/30'}`}>{s.label}</p>
                    <p className={`text-[11px] ${active ? 'text-[#1a1a1a]/60' : 'text-[#1a1a1a]/30'}`}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {trackingStep === 'ready' && (
            <div className="bg-[#1BC8C8]/10 border border-[#1BC8C8]/30 rounded-2xl p-4 text-center space-y-2">
              <Bell className="w-8 h-8 text-[#1BC8C8] mx-auto" />
              <p className="text-[15px] font-bold text-[#1BC8C8]">Your order is ready!</p>
              <p className="text-[12px] text-[#1BC8C8]/70">Please collect from the counter with token #{tokenNumber}</p>
            </div>
          )}

          <button
            onClick={() => setStep('token-board')}
            className="w-full py-3 rounded-xl border border-[rgba(26,26,26,0.18)] text-[13px] text-[#1a1a1a]/60 font-medium hover:bg-[rgba(26,26,26,0.05)]"
          >
            View Token Board
          </button>
        </div>
      </div>
    );
  }

  // ─── Token Board (Public Display) ─────────────────────────────────────────
  if (step === 'token-board') {
    const servedTokens = [tokenNumber - 3, tokenNumber - 2, tokenNumber - 1].filter(n => n >= 100);
    const upcomingTokens = [tokenNumber, tokenNumber + 1, tokenNumber + 2];
    const nowServing = trackingStep === 'ready' ? tokenNumber : tokenNumber - 1;

    return (
      <div className="min-h-screen bg-neutral-950 font-sans text-white flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center">
              <Hash className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-[14px] font-bold uppercase tracking-widest">Token Board</h1>
              <p className="text-[9px] text-neutral-500 uppercase tracking-widest">SMARTDINE · LIVE COUNTER</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 border border-emerald-900/40 px-2 py-1 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
            <button
              onClick={() => setStep('token-status')}
              className="text-[10px] font-mono text-neutral-400 border border-neutral-800 px-2.5 py-1.5 rounded hover:border-neutral-600 uppercase tracking-widest"
            >
              My Token
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
          {/* Now Serving */}
          <div className="text-center">
            <p className="text-[12px] font-mono text-neutral-400 uppercase tracking-[0.3em] mb-4">Now Serving</p>
            <div className="relative">
              <div className="w-48 h-48 rounded-3xl bg-pink-600 flex items-center justify-center shadow-2xl shadow-pink-900/40">
                <span className="text-[80px] font-black font-mono text-white leading-none">{nowServing}</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center animate-bounce">
                <Bell className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Queue */}
          <div className="w-full max-w-sm space-y-3">
            <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest text-center">Up Next</p>
            {upcomingTokens.map((t, i) => (
              <div
                key={t}
                className={`flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all
                  ${t === tokenNumber && trackingStep !== 'ready'
                    ? 'border-amber-700/60 bg-amber-950/30'
                    : 'border-neutral-800 bg-neutral-900/50'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[28px] font-black font-mono leading-none ${t === tokenNumber ? 'text-amber-300' : 'text-neutral-500'}`}>{t}</span>
                  {t === tokenNumber && (
                    <span className="text-[9px] font-mono bg-amber-900/60 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">Your Order</span>
                  )}
                </div>
                <div className={`text-[10px] font-mono ${t === tokenNumber ? 'text-amber-400' : 'text-neutral-600'}`}>
                  {i === 0 ? 'Preparing' : i === 1 ? 'In Queue' : 'Waiting'}
                </div>
              </div>
            ))}
          </div>

          {/* Recently Served */}
          {servedTokens.length > 0 && (
            <div className="w-full max-w-sm">
              <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest text-center mb-2">Recently Served</p>
              <div className="flex items-center justify-center gap-3">
                {servedTokens.map(t => (
                  <div key={t} className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <span className="text-[16px] font-bold font-mono text-neutral-600">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-600">
          <span>Counter 1 · SmartDine</span>
          <span>Thank you for your patience!</span>
        </div>
      </div>
    );
  }

  // ─── Order Placed (Dine-In Confirmation) ──────────────────────────────────
  if (step === 'order-placed') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E8447A]/20 flex items-center justify-center mx-auto animate-bounce">
            <UtensilsCrossed className="w-8 h-8 text-[#1a1a1a]" />
          </div>
          <div>
            <h2 className="text-[22px] font-barlow font-black uppercase text-[#1a1a1a]">Order Placed!</h2>
            <p className="text-[13px] text-[#1a1a1a]/50 mt-1.5">{tableLabel} · {customerName}</p>
          </div>

          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-5 space-y-3">
            <p className="text-[12px] font-barlow font-black uppercase text-[#1a1a1a] text-left">Your order</p>
            {cart.map((e, i) => (
              <div key={i} className="flex justify-between text-[12px]">
                <span className="text-[#1a1a1a]/60 text-left">{e.qty}× {e.item.name}</span>
                <span className="font-mono text-[#1a1a1a]">₹{(e.lineTotal * 83).toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-[rgba(26,26,26,0.08)] pt-2 flex justify-between">
              <span className="text-[13px] font-bold text-[#1a1a1a]">Total</span>
              <span className="text-[13px] font-bold font-mono text-[#1a1a1a]">₹{(grandTotal * 83).toFixed(0)}</span>
            </div>
          </div>

          <button
            onClick={() => setStep('tracking')}
            className="w-full py-3.5 rounded-[100px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#FFFFFF] text-[14px] font-semibold uppercase tracking-wider transition-colors"
          >
            Track Order Live
          </button>
        </div>
      </div>
    );
  }

  // ─── Order Tracking (Dine-In) ──────────────────────────────────────────────
  if (step === 'tracking') {
    const currentIdx = TRACKING_STEPS.findIndex(s => s.id === trackingStep);
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col">
        <div className="sticky top-0 z-20 bg-[#1a1a1a] border-b border-[rgba(240,234,210,0.10)] px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#E8447A] flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-[#1a1a1a]" />
          </div>
          <div>
            <p className="text-[14px] font-barlow font-black uppercase text-[#FFFFFF]">Order Tracking</p>
            <p className="text-[10px] text-[#FFFFFF]/40 font-mono uppercase">{tableLabel} · {customerName}</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 max-w-sm mx-auto w-full">
          {/* Estimated time */}
          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#E8447A]" />
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">Estimated Time</p>
                <p className="text-[11px] text-[#1a1a1a]/40">Based on current kitchen load</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[20px] font-bold font-mono text-[#1a1a1a]">
                {trackingStep === 'placed' ? '~18' : trackingStep === 'accepted' ? '~15' : trackingStep === 'preparing' ? '~8' : '~0'}
              </p>
              <p className="text-[10px] text-[#1a1a1a]/40">min</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-5">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3.5 top-4 bottom-4 w-px bg-[rgba(26,26,26,0.08)]" />
              <div className="space-y-5">
                {TRACKING_STEPS.map((s, i) => {
                  const done = i < currentIdx;
                  const active = i === currentIdx;
                  return (
                    <div key={s.id} className="flex items-start gap-4 relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all
                        ${done ? 'bg-[#1BC8C8] border-[#1BC8C8]' : active ? 'bg-[#E8447A] border-[#E8447A]' : 'bg-white border-[rgba(26,26,26,0.15)]'}`}
                      >
                        {done
                          ? <CheckCircle2 className="w-4 h-4 text-white" />
                          : active
                            ? <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                            : <div className="w-2 h-2 rounded-full bg-[rgba(26,26,26,0.15)]" />
                        }
                      </div>
                      <div className="pt-0.5">
                        <p className={`text-[13px] font-semibold ${done ? 'text-[#1BC8C8]' : active ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/30'}`}>
                          {s.label}
                          {active && <span className="text-[10px] font-mono ml-1.5 bg-[#E8447A]/20 text-[#1a1a1a] px-1.5 py-0.5 rounded-full">Now</span>}
                        </p>
                        <p className={`text-[11px] mt-0.5 ${active ? 'text-[#1a1a1a]/60' : 'text-[#1a1a1a]/30'}`}>{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-4 space-y-2">
            <p className="text-[11px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest mb-2">Order Items</p>
            {cart.map((e, i) => (
              <div key={i} className="flex justify-between text-[12px]">
                <span className="text-[#1a1a1a]/60">{e.qty}× {e.item.name}</span>
                <span className="font-mono text-[#1a1a1a]">₹{(e.lineTotal * 83).toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-[rgba(26,26,26,0.08)] pt-2 flex justify-between">
              <span className="text-[12px] font-semibold text-[#1a1a1a]">Total Paid</span>
              <span className="text-[12px] font-bold font-mono text-[#1a1a1a]">₹{(grandTotal * 83).toFixed(0)}</span>
            </div>
          </div>

          {trackingStep === 'served' && (
            <div className="bg-[#E8447A]/15 border border-[#E8447A]/40 rounded-2xl p-5 text-center space-y-3">
              <div className="text-4xl">🎉</div>
              <p className="text-[16px] font-bold text-[#1a1a1a]">Enjoy your meal!</p>
              <p className="text-[12px] text-[#1a1a1a]/60">Thank you for dining at SmartDine</p>
              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-[100px] bg-[#1a1a1a] text-[#FFFFFF] text-[13px] font-medium hover:bg-[#1a1a1a]/80"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function SummaryRow({ label, value, highlight, accent }: { label: string; value: string; highlight?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-[#1a1a1a]/50">{label}</span>
      <span className={`text-[12px] font-mono font-medium ${highlight ? 'text-[#1a1a1a] font-bold' : accent ?? 'text-[#1a1a1a]'}`}>{value}</span>
    </div>
  );
}
