/**
 * QROrderingFlow — real backend-connected customer ordering flow.
 * Accessed via /qr-order?qr=<slug>&table=<tableId>&tableNum=<displayNum>
 *
 * Steps:
 *  entry → menu → cart → checkout
 *    dine-in  → (place order) → order-placed → tracking
 *    takeaway → otp-verify → pickup-time → (place order) → token → token-status / token-board
 */
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  QrCode, UtensilsCrossed, ShoppingBag, Search,
  Plus, Minus, X, ChevronRight, CheckCircle2, Clock,
  ArrowLeft, Star, Leaf, Flame, Tag, Hash, Bell,
  Loader2, Phone, User, Smartphone, Banknote, CreditCard,
  AlertCircle,
} from 'lucide-react';
import {
  usePublicMenu,
  usePlaceDineInOrder,
  usePlaceWindowOrder,
  useGuestOrder,
  useRequestGuestOtp,
  useVerifyGuestOtp,
} from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import type {
  PublicCategory,
  PublicMenuItem,
  PublicVariant,
  PublicModifier,
  PublicModifierGroup,
  GuestOrderDto,
} from '@/lib/dto/guest';
import type { OrderStatus } from '@/lib/dto/orders';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderType = 'dine-in' | 'takeaway';
type FlowStep =
  | 'entry'
  | 'menu'
  | 'cart'
  | 'checkout'
  | 'otp-verify'
  | 'pickup-time'
  | 'order-placed'
  | 'tracking'
  | 'token'
  | 'token-status'
  | 'token-board';

interface CartEntry {
  item: PublicMenuItem;
  categoryName: string;
  qty: number;
  variant?: PublicVariant;
  selectedModifiers: Array<{ group: PublicModifierGroup; modifier: PublicModifier }>;
  notes: string;
  lineTotal: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PICKUP_SLOTS = ['ASAP (~20 min)', '30 minutes', '45 minutes', '1 hour', '1.5 hours'] as const;

const DINE_IN_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'placed',    label: 'Order Placed' },
  { status: 'accepted',  label: 'Accepted by Kitchen' },
  { status: 'preparing', label: 'Preparing Your Food' },
  { status: 'ready',     label: 'Ready to Serve!' },
];

const WINDOW_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'placed',    label: 'Order Placed' },
  { status: 'accepted',  label: 'Accepted by Kitchen' },
  { status: 'preparing', label: 'Preparing Your Order' },
  { status: 'ready',     label: 'Ready for Pickup!' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(n: number): string {
  return `₹${Math.round(n)}`;
}

function effectivePrice(item: PublicMenuItem, variant?: PublicVariant): number {
  if (!variant) return item.basePrice;
  return variant.absolutePrice ?? (item.basePrice + variant.priceDelta);
}

function isVeg(item: PublicMenuItem): boolean {
  return item.foodType === 'veg' || item.foodType === 'vegan';
}

function isSpicy(item: PublicMenuItem): boolean {
  return (item.spiceLevel ?? 0) >= 3;
}

function isBestseller(item: PublicMenuItem): boolean {
  return item.tags.some(t =>
    ['bestseller', 'popular', 'must try', 'chef special'].includes(t.toLowerCase()),
  );
}

function slotToISO(slot: string): string {
  const offsets: Record<string, number> = {
    'ASAP (~20 min)': 20,
    '30 minutes': 30,
    '45 minutes': 45,
    '1 hour': 60,
    '1.5 hours': 90,
  };
  return new Date(Date.now() + (offsets[slot] ?? 30) * 60_000).toISOString();
}

const SD_ORDER_KEY = 'sd_last_order';

function saveLastOrder(order: GuestOrderDto) {
  localStorage.setItem(
    SD_ORDER_KEY,
    JSON.stringify({ id: order.id, orderNumber: order.orderNumber, channel: order.channel, ts: Date.now() }),
  );
}

function cartKey(entry: Pick<CartEntry, 'item' | 'variant' | 'selectedModifiers' | 'notes'>): string {
  return [
    entry.item.id,
    entry.variant?.id ?? '',
    entry.selectedModifiers.map(m => m.modifier.id).sort().join(','),
    entry.notes,
  ].join('|');
}

// ─── ItemDetailModal ──────────────────────────────────────────────────────────

function ItemDetailModal({
  item,
  categoryName,
  onClose,
  onAdd,
}: {
  item: PublicMenuItem;
  categoryName: string;
  onClose: () => void;
  onAdd: (entry: CartEntry) => void;
}) {
  const [selectedVariant, setSelectedVariant] = useState<PublicVariant | undefined>(
    item.variants[0],
  );
  const [selectedMods, setSelectedMods] = useState<Array<{ group: PublicModifierGroup; modifier: PublicModifier }>>(() => {
    const defaults: Array<{ group: PublicModifierGroup; modifier: PublicModifier }> = [];
    for (const g of item.modifierGroups) {
      for (const m of g.modifiers) {
        if (m.isDefault) defaults.push({ group: g, modifier: m });
      }
    }
    return defaults;
  });
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  const basePrice = effectivePrice(item, selectedVariant);
  const modTotal = selectedMods.reduce((s, { modifier }) => s + modifier.priceDelta, 0);
  const lineTotal = (basePrice + modTotal) * qty;

  function toggleModifier(group: PublicModifierGroup, modifier: PublicModifier) {
    setSelectedMods(prev => {
      const exists = prev.some(m => m.modifier.id === modifier.id);
      if (exists) return prev.filter(m => m.modifier.id !== modifier.id);
      if (group.maxSelections === 1) {
        return [...prev.filter(m => m.group.id !== group.id), { group, modifier }];
      }
      const groupCount = prev.filter(m => m.group.id === group.id).length;
      if (groupCount >= group.maxSelections) return prev;
      return [...prev, { group, modifier }];
    });
  }

  function handleAdd() {
    for (const group of item.modifierGroups) {
      if (!group.isRequired) continue;
      const selected = selectedMods.filter(m => m.group.id === group.id).length;
      if (selected < group.minSelections) {
        toast.error(`Please select at least ${group.minSelections} from "${group.name}"`);
        return;
      }
    }
    onAdd({ item, categoryName, qty, variant: selectedVariant, selectedModifiers: selectedMods, notes, lineTotal });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden">
        {/* Image or colour header */}
        {item.imageUrl ? (
          <div className="h-48 relative shrink-0">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="h-28 bg-[#E8447A]/10 flex items-center justify-between px-5 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-[#E8447A]/20 flex items-center justify-center">
              <span className="text-2xl font-black text-[#E8447A]">{item.name[0]}</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#1a1a1a]/50">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[18px] font-barlow font-black uppercase text-[#1a1a1a]">{item.name}</h2>
              <div className="flex items-center gap-1 shrink-0">
                {isVeg(item) && <Leaf className="w-4 h-4 text-green-600" />}
                {isSpicy(item) && <Flame className="w-4 h-4 text-orange-500" />}
              </div>
            </div>
            {item.description && (
              <p className="text-[12px] text-[#1a1a1a]/50 mt-1">{item.description}</p>
            )}
            <p className="text-[20px] font-black font-mono text-[#1a1a1a] mt-2">
              {fmtINR(basePrice + modTotal)}
            </p>
          </div>

          {/* Variants */}
          {item.variants.length > 0 && (
            <div>
              <p className="text-[12px] font-barlow font-black uppercase text-[#1a1a1a] mb-2">Size / Variant</p>
              <div className="space-y-2">
                {item.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                      ${selectedVariant?.id === v.id
                        ? 'border-[#E8447A] bg-[#E8447A]/5'
                        : 'border-[rgba(26,26,26,0.18)] hover:border-[#E8447A]/50'}`}
                  >
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{v.name}</span>
                    <span className="text-[13px] font-mono text-[#1a1a1a]">{fmtINR(effectivePrice(item, v))}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modifier groups */}
          {item.modifierGroups.map(group => (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-barlow font-black uppercase text-[#1a1a1a]">{group.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                  ${group.isRequired ? 'bg-[#E8447A]/10 text-[#E8447A]' : 'bg-neutral-100 text-neutral-500'}`}>
                  {group.isRequired ? 'Required' : 'Optional'}
                </span>
              </div>
              <div className="space-y-2">
                {group.modifiers.map(mod => {
                  const isSelected = selectedMods.some(m => m.modifier.id === mod.id);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModifier(group, mod)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                        ${isSelected
                          ? 'border-[#E8447A] bg-[#E8447A]/5'
                          : 'border-[rgba(26,26,26,0.18)] hover:border-[#E8447A]/50'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                          ${isSelected ? 'border-[#E8447A] bg-[#E8447A]' : 'border-[rgba(26,26,26,0.3)]'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-[13px] text-[#1a1a1a]">{mod.name}</span>
                      </div>
                      {mod.priceDelta > 0 && (
                        <span className="text-[12px] font-mono text-[#1a1a1a]/60">+{fmtINR(mod.priceDelta)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div>
            <p className="text-[12px] font-barlow font-black uppercase text-[#1a1a1a] mb-2">Special Instructions</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special requests? (optional)"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-[rgba(26,26,26,0.18)] text-[13px] text-[#1a1a1a] placeholder-[#1a1a1a]/30 resize-none focus:outline-none focus:border-[#E8447A]/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[rgba(26,26,26,0.10)] shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-[#1a1a1a]/5 flex items-center justify-center"
              >
                <Minus className="w-4 h-4 text-[#1a1a1a]" />
              </button>
              <span className="text-[18px] font-black font-mono text-[#1a1a1a] w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 bg-[#1a1a1a] text-white text-[14px] font-barlow font-black uppercase py-3 rounded-xl"
            >
              Add · {fmtINR(lineTotal)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MenuCard ─────────────────────────────────────────────────────────────────

function MenuCard({
  item,
  cartQty,
  onView,
  onQuickAdd,
}: {
  item: PublicMenuItem;
  cartQty: number;
  onView: () => void;
  onQuickAdd: () => void;
}) {
  const hasOptions = item.variants.length > 0 || item.modifierGroups.length > 0;
  const veg = isVeg(item);

  return (
    <div className="bg-white rounded-[18px] border border-[rgba(26,26,26,0.10)] overflow-hidden">
      {item.imageUrl ? (
        <div className="relative h-36">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          {isBestseller(item) && (
            <span className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-mono bg-amber-500 text-white px-2 py-0.5 rounded-full">
              <Star className="w-2.5 h-2.5 fill-white" /> BESTSELLER
            </span>
          )}
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-br from-[#E8447A]/10 to-[#E8447A]/5 flex items-center justify-center relative">
          <span className="text-4xl font-black text-[#E8447A]/20">{item.name[0]}</span>
          {isBestseller(item) && (
            <span className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-mono bg-amber-500 text-white px-2 py-0.5 rounded-full">
              <Star className="w-2.5 h-2.5 fill-white" /> BESTSELLER
            </span>
          )}
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-start gap-2 mb-1">
          <div className={`mt-0.5 w-3.5 h-3.5 rounded-sm border-2 shrink-0 flex items-center justify-center
            ${veg ? 'border-green-600' : 'border-red-600'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${veg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-barlow font-black uppercase text-[#1a1a1a] leading-tight truncate">{item.name}</p>
            {item.description && (
              <p className="text-[10px] text-[#1a1a1a]/40 mt-0.5 line-clamp-2">{item.description}</p>
            )}
          </div>
          {isSpicy(item) && <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />}
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <div>
            <p className="text-[15px] font-black font-mono text-[#1a1a1a]">{fmtINR(item.basePrice)}</p>
            {item.prepTimeMinutes > 0 && (
              <p className="text-[9px] text-[#1a1a1a]/40 flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" /> {item.prepTimeMinutes} min
              </p>
            )}
          </div>
          {cartQty > 0 ? (
            <button
              onClick={hasOptions ? onView : onQuickAdd}
              className="flex items-center gap-1 bg-[#E8447A] text-white text-[11px] font-mono px-3 py-1.5 rounded-full"
            >
              <Plus className="w-3 h-3" /> {cartQty} more
            </button>
          ) : (
            <button
              onClick={hasOptions ? onView : onQuickAdd}
              className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── StatusSteps ─────────────────────────────────────────────────────────────

function StatusSteps({
  steps,
  currentStatus,
  accentClass = 'bg-[#E8447A]',
}: {
  steps: { status: OrderStatus; label: string }[];
  currentStatus: OrderStatus;
  accentClass?: string;
}) {
  const idx = steps.findIndex(s => s.status === currentStatus);
  return (
    <div className="space-y-5">
      {steps.map((s, i) => {
        const done = idx > i;
        const active = idx === i;
        return (
          <div key={s.status} className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
              ${done ? 'bg-green-500' : active ? `${accentClass} animate-pulse` : 'bg-[#1a1a1a]/5'}`}>
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : active ? (
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#1a1a1a]/20" />
              )}
            </div>
            <p className={`text-[13px] font-medium transition-colors
              ${done ? 'text-green-700' : active ? 'text-[#1a1a1a] font-bold' : 'text-[#1a1a1a]/30'}`}>
              {s.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QROrderingFlow({ onExit }: { onExit: () => void }) {
  const [params] = useSearchParams();
  const qrSlug = params.get('qr') ?? undefined;
  const tableId = params.get('table') ?? undefined;
  const tableNum = params.get('tableNum') ?? params.get('t') ?? undefined;
  const tableLabel = tableNum ? `Table #${tableNum}` : tableId ? 'Your Table' : 'Dine In';

  // ── Flow state ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<FlowStep>('entry');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [viewItem, setViewItem] = useState<{ item: PublicMenuItem; categoryName: string } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [payMethod, setPayMethod] = useState<'upi' | 'cash' | 'card'>('upi');
  const [pickupSlot, setPickupSlot] = useState<string>(PICKUP_SLOTS[0]);
  const [placedOrder, setPlacedOrder] = useState<GuestOrderDto | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('placed');
  const [manualTableNum, setManualTableNum] = useState('');

  const qc = useQueryClient();

  // ── Backend hooks ─────────────────────────────────────────────────────────────
  const channel = orderType === 'dine-in' ? 'dine_in' : 'window';
  const menuQuery = usePublicMenu({ channel });
  const placeDineIn = usePlaceDineInOrder();
  const placeWindow = usePlaceWindowOrder(guestToken);
  const requestOtp = useRequestGuestOtp();
  const verifyOtp = useVerifyGuestOtp();
  const orderQuery = useGuestOrder(placedOrder?.id ?? null);

  // Sync polling → local status
  useEffect(() => {
    if (orderQuery.data?.status) setCurrentStatus(orderQuery.data.status);
  }, [orderQuery.data?.status]);

  // Real-time socket status updates
  useSocket(
    '/guest',
    {
      'order:status_changed': (data: unknown) => {
        const d = data as { orderId: string; status: OrderStatus };
        if (d.orderId === placedOrder?.id) {
          setCurrentStatus(d.status);
          qc.invalidateQueries({ queryKey: ['guest-order', placedOrder?.id] });
        }
      },
    },
    { query: placedOrder ? { orderId: placedOrder.id } : {}, enabled: Boolean(placedOrder) },
  );

  // ── Derived menu data ──────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    if (!menuQuery.data) return ['All'];
    return ['All', ...menuQuery.data.categories.map((c: PublicCategory) => c.name)];
  }, [menuQuery.data]);

  const allItems = useMemo(() => {
    if (!menuQuery.data) return [];
    return menuQuery.data.categories.flatMap((c: PublicCategory) =>
      c.items.map(item => ({ item, categoryName: c.name })),
    );
  }, [menuQuery.data]);

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (category !== 'All') items = items.filter(({ categoryName }) => categoryName === category);
    if (filterVeg) items = items.filter(({ item }) => isVeg(item));
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(({ item }) =>
        item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q),
      );
    }
    return items;
  }, [allItems, category, filterVeg, search]);

  // ── Cart ───────────────────────────────────────────────────────────────────────
  const cartSubtotal = cart.reduce((s, e) => s + e.lineTotal, 0);
  const cartCount = cart.reduce((s, e) => s + e.qty, 0);
  const estimatedTax = Math.round(cartSubtotal * 0.05);
  const estimatedTotal = cartSubtotal + estimatedTax;

  function addToCart(entry: CartEntry) {
    const key = cartKey(entry);
    setCart(prev => {
      const idx = prev.findIndex(e => cartKey(e) === key);
      if (idx >= 0) {
        return prev.map((e, i) =>
          i !== idx ? e : { ...e, qty: e.qty + entry.qty, lineTotal: e.lineTotal + entry.lineTotal },
        );
      }
      return [...prev, entry];
    });
    toast.success(`${entry.item.name} added`);
  }

  function quickAdd(item: PublicMenuItem, categoryName: string) {
    addToCart({ item, categoryName, qty: 1, selectedModifiers: [], notes: '', lineTotal: item.basePrice });
  }

  function adjustQty(index: number, delta: number) {
    setCart(prev => {
      const e = prev[index];
      if (!e) return prev;
      const newQty = e.qty + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      const perUnit = e.lineTotal / e.qty;
      return prev.map((en, i) => i !== index ? en : { ...en, qty: newQty, lineTotal: perUnit * newQty });
    });
  }

  // ── Order placement ────────────────────────────────────────────────────────────
  function buildItems() {
    return cart.map(e => ({
      itemId: e.item.id,
      qty: e.qty,
      variantId: e.variant?.id,
      notes: e.notes || undefined,
      modifiers: e.selectedModifiers.map(({ group, modifier }) => ({
        groupId: group.id,
        modifierId: modifier.id,
      })),
    }));
  }

  async function handleCheckoutSubmit() {
    if (!customerName.trim()) { toast.error('Please enter your name'); return; }

    if (orderType === 'dine-in') {
      try {
        const notesParts = [
          manualTableNum.trim() ? `Table: ${manualTableNum.trim()}` : '',
          payMethod !== 'upi' ? `Preferred payment: ${payMethod}` : '',
        ].filter(Boolean);
        const order = await placeDineIn.mutateAsync({
          qrSlug, tableId,
          guestName: customerName.trim(),
          guestPhone: customerPhone.trim() || undefined,
          guestNotes: notesParts.length ? notesParts.join(' · ') : undefined,
          items: buildItems(),
          couponCode: couponCode || undefined,
        });
        saveLastOrder(order);
        setPlacedOrder(order);
        setCurrentStatus(order.status);
        setStep('order-placed');
      } catch { /* handled by hook */ }
    } else {
      if (!customerPhone.trim() || customerPhone.length < 10) {
        toast.error('Valid 10-digit phone number required for takeaway');
        return;
      }
      try {
        await requestOtp.mutateAsync(customerPhone.trim());
        setStep('otp-verify');
      } catch { /* handled by hook */ }
    }
  }

  async function handleVerifyOtp() {
    if (otpCode.length < 4) { toast.error('Enter the complete OTP'); return; }
    try {
      const result = await verifyOtp.mutateAsync({ phone: customerPhone.trim(), code: otpCode });
      setGuestToken(result.guestToken);
      setStep('pickup-time');
    } catch { /* handled by hook */ }
  }

  async function handleConfirmPickup() {
    try {
      const order = await placeWindow.mutateAsync({
        qrSlug,
        guestName: customerName.trim(),
        guestNotes: payMethod !== 'upi' ? `Preferred payment: ${payMethod}` : undefined,
        pickupAt: slotToISO(pickupSlot),
        items: buildItems(),
        couponCode: couponCode || undefined,
      });
      saveLastOrder(order);
      setPlacedOrder(order);
      setCurrentStatus(order.status);
      setStep('token');
    } catch { /* handled by hook */ }
  }

  // Post-order totals from backend response
  const realDiscount = placedOrder?.totals.discount ?? 0;
  const realTax = placedOrder?.totals.tax ?? estimatedTax;
  const realGrand = placedOrder?.totals.grand ?? estimatedTotal;

  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP RENDERS
  // ═══════════════════════════════════════════════════════════════════════════════

  // ── entry ─────────────────────────────────────────────────────────────────────
  if (step === 'entry') {
    return (
      <div className="min-h-screen bg-[#0F0F10] font-sans flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E8447A]/8 blur-3xl" />
        </div>
        <div className="relative max-w-sm w-full space-y-10">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#E8447A]/20 flex items-center justify-center mx-auto border border-[#E8447A]/30">
              <QrCode className="w-8 h-8 text-[#E8447A]" />
            </div>
            <div>
              <h1 className="text-[28px] font-barlow font-black uppercase text-white tracking-tight">SmartDine</h1>
              <p className="text-[13px] text-white/40 mt-1">Quick &amp; Easy Ordering</p>
            </div>
          </div>

          {(tableId || tableNum) && (
            <div className="inline-flex items-center gap-2 border border-[#E8447A]/30 text-[#E8447A] text-[13px] font-mono px-4 py-2 rounded-full mx-auto">
              <Hash className="w-3.5 h-3.5" />
              {tableLabel}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest">
              How would you like to order?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setOrderType('dine-in'); setStep('menu'); }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-neutral-800 hover:border-[#E8447A]/50 bg-neutral-900/50 hover:bg-[#E8447A]/5 transition-all group"
              >
                <UtensilsCrossed className="w-6 h-6 text-white/40 group-hover:text-[#E8447A] transition-colors" />
                <div>
                  <p className="text-[13px] font-barlow font-black uppercase text-white">Dine In</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Served at your table</p>
                </div>
              </button>
              <button
                onClick={() => { setOrderType('takeaway'); setStep('menu'); }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-neutral-800 hover:border-[#E8447A]/50 bg-neutral-900/50 hover:bg-[#E8447A]/5 transition-all group"
              >
                <ShoppingBag className="w-6 h-6 text-white/40 group-hover:text-[#E8447A] transition-colors" />
                <div>
                  <p className="text-[13px] font-barlow font-black uppercase text-white">Takeaway</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Pick up at counter</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── menu ──────────────────────────────────────────────────────────────────────
  if (step === 'menu') {
    if (menuQuery.isLoading) {
      return (
        <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#E8447A] mx-auto" />
            <p className="text-[13px] text-[#1a1a1a]/50">Loading menu…</p>
          </div>
        </div>
      );
    }
    if (menuQuery.isError || !menuQuery.data) {
      return (
        <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-xs">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-[14px] text-[#1a1a1a]/70">Failed to load menu. Please try again.</p>
            <button
              onClick={() => menuQuery.refetch()}
              className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-barlow font-black uppercase rounded-xl"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-[rgba(26,26,26,0.08)] px-4 pt-3 pb-2">
          <div className="flex items-center justify-between gap-3 mb-2">
            <button onClick={() => setStep('entry')} className="text-[#1a1a1a]/50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <p className="text-[11px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest">
                {orderType === 'dine-in' ? `Dine In · ${tableLabel}` : 'Takeaway'}
              </p>
              <p className="text-[14px] font-barlow font-black uppercase text-[#1a1a1a]">Menu</p>
            </div>
            <button
              onClick={() => setFilterVeg(v => !v)}
              className={`p-2 rounded-lg border transition-all ${filterVeg ? 'border-green-600 bg-green-50' : 'border-[rgba(26,26,26,0.18)]'}`}
            >
              <Leaf className={`w-4 h-4 ${filterVeg ? 'text-green-600' : 'text-[#1a1a1a]/40'}`} />
            </button>
          </div>
          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1a1a1a]/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F7F7F7] border border-[rgba(26,26,26,0.10)] text-[13px] text-[#1a1a1a] placeholder-[#1a1a1a]/30 focus:outline-none"
            />
          </div>
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all
                  ${category === cat
                    ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                    : 'border-[rgba(26,26,26,0.18)] text-[#1a1a1a]/60 hover:border-[#1a1a1a]/50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48">
              <p className="text-[13px] text-[#1a1a1a]/40">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map(({ item, categoryName }) => {
                const qty = cart.filter(e => e.item.id === item.id).reduce((s, e) => s + e.qty, 0);
                return (
                  <MenuCard
                    key={item.id}
                    item={item}
                    cartQty={qty}
                    onView={() => setViewItem({ item, categoryName })}
                    onQuickAdd={() => quickAdd(item, categoryName)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Cart FAB */}
        {cartCount > 0 && (
          <div className="sticky bottom-0 p-4 bg-gradient-to-t from-[#F7F7F7] pt-8">
            <button
              onClick={() => setStep('cart')}
              className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl flex items-center justify-between px-5"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#E8447A] text-white text-[11px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
                <span className="text-[13px] font-barlow font-black uppercase">View Cart</span>
              </div>
              <span className="text-[13px] font-mono font-black">{fmtINR(cartSubtotal)}</span>
            </button>
          </div>
        )}

        {/* Item detail modal */}
        {viewItem && (
          <ItemDetailModal
            item={viewItem.item}
            categoryName={viewItem.categoryName}
            onClose={() => setViewItem(null)}
            onAdd={entry => { addToCart(entry); setViewItem(null); }}
          />
        )}
      </div>
    );
  }

  // ── cart ──────────────────────────────────────────────────────────────────────
  if (step === 'cart') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-[rgba(26,26,26,0.08)] px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('menu')} className="text-[#1a1a1a]/50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[11px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest">Your order</p>
              <p className="text-[16px] font-barlow font-black uppercase text-[#1a1a1a]">Cart</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-3">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-[rgba(26,26,26,0.10)] divide-y divide-[rgba(26,26,26,0.06)]">
            {cart.map((entry, i) => (
              <div key={i} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-barlow font-black uppercase text-[#1a1a1a] truncate">
                    {entry.item.name}
                  </p>
                  {entry.variant && (
                    <p className="text-[11px] text-[#1a1a1a]/40">{entry.variant.name}</p>
                  )}
                  {entry.selectedModifiers.length > 0 && (
                    <p className="text-[10px] text-[#1a1a1a]/30">
                      {entry.selectedModifiers.map(m => m.modifier.name).join(', ')}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-[10px] text-[#1a1a1a]/30 italic">{entry.notes}</p>
                  )}
                  <p className="text-[12px] font-mono font-black text-[#1a1a1a] mt-1">
                    {fmtINR(entry.lineTotal)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustQty(i, -1)}
                    className="w-7 h-7 rounded-full bg-[#1a1a1a]/5 flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5 text-[#1a1a1a]" />
                  </button>
                  <span className="text-[14px] font-black font-mono text-[#1a1a1a] w-5 text-center">
                    {entry.qty}
                  </span>
                  <button
                    onClick={() => adjustQty(i, 1)}
                    className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-[rgba(26,26,26,0.10)] p-4">
            <p className="text-[11px] font-barlow font-black uppercase text-[#1a1a1a] mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Coupon Code
            </p>
            {couponCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-[13px] font-mono font-black text-green-700">{couponCode}</span>
                  <span className="text-[11px] text-green-600">applied at checkout</span>
                </div>
                <button onClick={() => { setCouponCode(''); setCouponInput(''); }} className="text-green-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(26,26,26,0.18)] text-[13px] font-mono text-[#1a1a1a] placeholder-[#1a1a1a]/30 focus:outline-none uppercase"
                />
                <button
                  onClick={() => {
                    if (couponInput.trim()) {
                      setCouponCode(couponInput.trim());
                      setCouponInput('');
                      toast.success('Coupon will be applied at checkout');
                    }
                  }}
                  className="px-4 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-barlow font-black uppercase rounded-xl"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-[rgba(26,26,26,0.10)] p-4 space-y-2.5">
            <p className="text-[11px] font-barlow font-black uppercase text-[#1a1a1a]">Order Summary</p>
            <div className="flex justify-between text-[12px]">
              <span className="text-[#1a1a1a]/50">Subtotal</span>
              <span className="font-mono text-[#1a1a1a]">{fmtINR(cartSubtotal)}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between text-[12px]">
                <span className="text-green-600">Coupon ({couponCode})</span>
                <span className="font-mono text-green-600">Applied ✓</span>
              </div>
            )}
            <div className="flex justify-between text-[12px]">
              <span className="text-[#1a1a1a]/50">GST (~5%)</span>
              <span className="font-mono text-[#1a1a1a]">~{fmtINR(estimatedTax)}</span>
            </div>
            <div className="border-t border-[rgba(26,26,26,0.08)] pt-2 flex justify-between">
              <span className="text-[14px] font-barlow font-black uppercase text-[#1a1a1a]">Estimated Total</span>
              <span className="text-[16px] font-black font-mono text-[#1a1a1a]">{fmtINR(estimatedTotal)}</span>
            </div>
            <p className="text-[9px] text-[#1a1a1a]/30">Final amount may vary based on coupon &amp; taxes</p>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => setStep('checkout')}
            className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl text-[14px] font-barlow font-black uppercase flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── checkout ──────────────────────────────────────────────────────────────────
  if (step === 'checkout') {
    const isLoading = placeDineIn.isPending || requestOtp.isPending;
    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-[rgba(26,26,26,0.08)] px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('cart')} className="text-[#1a1a1a]/50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="text-[16px] font-barlow font-black uppercase text-[#1a1a1a]">Checkout</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-[rgba(26,26,26,0.10)] p-4 space-y-3">
            <p className="text-[11px] font-barlow font-black uppercase text-[#1a1a1a]">Your Details</p>
            <div className="flex items-center gap-3 border border-[rgba(26,26,26,0.18)] rounded-xl px-4 py-3">
              <User className="w-4 h-4 text-[#1a1a1a]/30 shrink-0" />
              <input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Your name *"
                className="flex-1 text-[13px] text-[#1a1a1a] placeholder-[#1a1a1a]/30 focus:outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3 border border-[rgba(26,26,26,0.18)] rounded-xl px-4 py-3">
              <Phone className="w-4 h-4 text-[#1a1a1a]/30 shrink-0" />
              <input
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder={orderType === 'takeaway' ? 'Phone number * (for OTP)' : 'Phone number (optional)'}
                type="tel"
                inputMode="numeric"
                className="flex-1 text-[13px] text-[#1a1a1a] placeholder-[#1a1a1a]/30 focus:outline-none bg-transparent"
              />
            </div>
            {orderType === 'dine-in' && !qrSlug && !tableId && (
              <div className="flex items-center gap-3 border border-[rgba(26,26,26,0.18)] rounded-xl px-4 py-3">
                <Hash className="w-4 h-4 text-[#1a1a1a]/30 shrink-0" />
                <input
                  value={manualTableNum}
                  onChange={e => setManualTableNum(e.target.value)}
                  placeholder="Table number (optional)"
                  className="flex-1 text-[13px] text-[#1a1a1a] placeholder-[#1a1a1a]/30 focus:outline-none bg-transparent"
                />
              </div>
            )}
          </div>

          {/* Payment preference */}
          <div className="bg-white rounded-2xl border border-[rgba(26,26,26,0.10)] p-4 space-y-3">
            <div>
              <p className="text-[11px] font-barlow font-black uppercase text-[#1a1a1a]">Payment Preference</p>
              <p className="text-[10px] text-[#1a1a1a]/40 mt-0.5">Actual payment collected at billing counter</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['upi', <Smartphone key="upi" className="w-4 h-4" />, 'UPI'],
                  ['cash', <Banknote key="cash" className="w-4 h-4" />, 'Cash'],
                  ['card', <CreditCard key="card" className="w-4 h-4" />, 'Card'],
                ] as const
              ).map(([id, icon, label]) => (
                <button
                  key={id}
                  onClick={() => setPayMethod(id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-[11px] font-mono
                    ${payMethod === id ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[rgba(26,26,26,0.18)] text-[#1a1a1a]/60'}`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-[rgba(26,26,26,0.10)] p-4 space-y-2">
            <p className="text-[11px] font-barlow font-black uppercase text-[#1a1a1a]">Order Summary</p>
            {cart.map((e, i) => (
              <div key={i} className="flex justify-between text-[12px]">
                <span className="text-[#1a1a1a]/60">
                  {e.qty}× {e.item.name}{e.variant ? ` (${e.variant.name})` : ''}
                </span>
                <span className="font-mono text-[#1a1a1a]">{fmtINR(e.lineTotal)}</span>
              </div>
            ))}
            {couponCode && (
              <p className="text-[11px] text-green-600 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Coupon: {couponCode}
              </p>
            )}
            <div className="border-t border-[rgba(26,26,26,0.08)] pt-2 flex justify-between">
              <span className="text-[13px] font-barlow font-black uppercase text-[#1a1a1a]">Est. Total</span>
              <span className="text-[15px] font-black font-mono text-[#1a1a1a]">{fmtINR(estimatedTotal)}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={handleCheckoutSubmit}
            disabled={isLoading}
            className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl text-[14px] font-barlow font-black uppercase flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {orderType === 'takeaway' ? 'Verify Phone & Continue' : 'Place Order'}
          </button>
        </div>
      </div>
    );
  }

  // ── otp-verify ────────────────────────────────────────────────────────────────
  if (step === 'otp-verify') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-8">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#E8447A]/10 flex items-center justify-center mx-auto">
              <Smartphone className="w-7 h-7 text-[#E8447A]" />
            </div>
            <h2 className="text-[20px] font-barlow font-black uppercase text-[#1a1a1a]">Verify Phone</h2>
            <p className="text-[13px] text-[#1a1a1a]/50">
              OTP sent to <strong>+91 {customerPhone}</strong>
            </p>
          </div>

          <div className="space-y-3">
            <input
              value={otpCode}
              onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter OTP"
              type="tel"
              inputMode="numeric"
              autoFocus
              className="w-full text-center text-[28px] font-black font-mono text-[#1a1a1a] tracking-[0.4em] border border-[rgba(26,26,26,0.18)] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#E8447A]/50"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={verifyOtp.isPending}
              className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl text-[14px] font-barlow font-black uppercase flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {verifyOtp.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify &amp; Continue
            </button>
          </div>

          <div className="text-center space-y-3">
            <button
              onClick={async () => {
                try {
                  await requestOtp.mutateAsync(customerPhone);
                  toast.success('New OTP sent');
                  setOtpCode('');
                } catch { /* handled */ }
              }}
              disabled={requestOtp.isPending}
              className="text-[12px] text-[#E8447A] underline underline-offset-2 disabled:opacity-50"
            >
              Resend OTP
            </button>
            <br />
            <button onClick={() => setStep('checkout')} className="text-[12px] text-[#1a1a1a]/40">
              ← Back to checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── pickup-time ───────────────────────────────────────────────────────────────
  if (step === 'pickup-time') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-[rgba(26,26,26,0.08)] px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('otp-verify')} className="text-[#1a1a1a]/50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="text-[16px] font-barlow font-black uppercase text-[#1a1a1a]">Pickup Time</p>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white rounded-2xl border border-[rgba(26,26,26,0.10)] p-4 space-y-3">
            <p className="text-[11px] font-barlow font-black uppercase text-[#1a1a1a]">
              When do you want to pick up?
            </p>
            <div className="space-y-2">
              {PICKUP_SLOTS.map(slot => (
                <button
                  key={slot}
                  onClick={() => setPickupSlot(slot)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all
                    ${pickupSlot === slot
                      ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                      : 'border-[rgba(26,26,26,0.18)] text-[#1a1a1a]'}`}
                >
                  <span className="text-[13px] font-medium">{slot}</span>
                  {pickupSlot === slot && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={handleConfirmPickup}
            disabled={placeWindow.isPending}
            className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl text-[14px] font-barlow font-black uppercase flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {placeWindow.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Order
          </button>
        </div>
      </div>
    );
  }

  // ── order-placed ──────────────────────────────────────────────────────────────
  if (step === 'order-placed') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E8447A]/20 flex items-center justify-center mx-auto animate-bounce">
            <UtensilsCrossed className="w-8 h-8 text-[#1a1a1a]" />
          </div>
          <div>
            <h2 className="text-[22px] font-barlow font-black uppercase text-[#1a1a1a]">Order Placed!</h2>
            <p className="text-[13px] text-[#1a1a1a]/50 mt-1.5">
              {tableLabel} · {customerName}
              {placedOrder?.orderNumber && ` · #${placedOrder.orderNumber}`}
            </p>
          </div>

          <div className="bg-white rounded-[22px] border border-[rgba(26,26,26,0.18)] p-5 space-y-3 text-left">
            <p className="text-[12px] font-barlow font-black uppercase text-[#1a1a1a]">Your order</p>
            {cart.map((e, i) => (
              <div key={i} className="flex justify-between text-[12px]">
                <span className="text-[#1a1a1a]/60">{e.qty}× {e.item.name}</span>
                <span className="font-mono text-[#1a1a1a]">{fmtINR(e.lineTotal)}</span>
              </div>
            ))}
            <div className="border-t border-[rgba(26,26,26,0.08)] pt-3 space-y-1.5">
              {realDiscount > 0 && (
                <div className="flex justify-between text-[12px]">
                  <span className="text-green-600">Discount</span>
                  <span className="font-mono text-green-600">-{fmtINR(realDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[12px]">
                <span className="text-[#1a1a1a]/50">Tax</span>
                <span className="font-mono text-[#1a1a1a]">{fmtINR(realTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] font-barlow font-black uppercase text-[#1a1a1a]">Total</span>
                <span className="text-[16px] font-black font-mono text-[#1a1a1a]">{fmtINR(realGrand)}</span>
              </div>
            </div>
          </div>

          {placedOrder?.estimatedPrepMinutes != null && (
            <p className="text-[12px] text-[#1a1a1a]/40">
              Est. prep time: <strong>{placedOrder.estimatedPrepMinutes} min</strong>
            </p>
          )}

          <button
            onClick={() => setStep('tracking')}
            className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl text-[13px] font-barlow font-black uppercase flex items-center justify-center gap-2"
          >
            Track Order <ChevronRight className="w-4 h-4" />
          </button>

          {placedOrder && (
            <Link
              to={`/track/${placedOrder.id}`}
              className="block text-center text-[11px] text-[#1a1a1a]/40 underline underline-offset-2 mt-1"
            >
              Bookmark tracking page
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── tracking ──────────────────────────────────────────────────────────────────
  if (step === 'tracking') {
    const isCancelled = currentStatus === 'cancelled';
    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans flex flex-col">
        <div className="bg-white border-b border-[rgba(26,26,26,0.08)] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest">{tableLabel}</p>
              <p className="text-[16px] font-barlow font-black uppercase text-[#1a1a1a]">
                Order #{placedOrder?.orderNumber ?? '—'}
              </p>
            </div>
            <p className="text-[11px] text-[#1a1a1a]/40">{customerName}</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {isCancelled ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-[14px] font-barlow font-black uppercase text-red-700">Order Cancelled</p>
              <p className="text-[12px] text-red-500/70 mt-1">Please speak to a staff member.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[rgba(26,26,26,0.10)] p-5">
              <StatusSteps steps={DINE_IN_STEPS} currentStatus={currentStatus} />
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#1a1a1a]/40">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live updates enabled
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={onExit}
            className="w-full border border-[rgba(26,26,26,0.18)] text-[#1a1a1a]/60 py-3.5 rounded-2xl text-[13px] font-barlow font-black uppercase"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── token ─────────────────────────────────────────────────────────────────────
  if (step === 'token') {
    const tokenNumber = placedOrder?.windowToken ?? '—';
    return (
      <div className="min-h-screen bg-[#0F0F10] font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xs w-full space-y-8">
          <div>
            <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Order Confirmed</p>
            <h1 className="text-[24px] font-barlow font-black uppercase text-white mt-2">{customerName}</h1>
            {placedOrder?.orderNumber && (
              <p className="text-[12px] text-white/40 mt-1">#{placedOrder.orderNumber}</p>
            )}
          </div>

          <div>
            <div className="w-44 h-44 rounded-3xl bg-pink-600 flex items-center justify-center mx-auto shadow-2xl shadow-pink-900/40">
              <span className="text-[72px] font-black font-mono text-white leading-none">{tokenNumber}</span>
            </div>
            <p className="text-[10px] font-mono text-white/30 mt-3 uppercase tracking-[0.3em]">Your Token</p>
          </div>

          {placedOrder?.estimatedPrepMinutes != null && (
            <p className="text-[12px] text-white/40">
              Ready in approx <span className="text-white font-bold">{placedOrder.estimatedPrepMinutes} min</span>
            </p>
          )}

          <div className="space-y-2.5">
            <button
              onClick={() => setStep('token-status')}
              className="w-full bg-white/10 border border-white/10 text-white py-3.5 rounded-2xl text-[13px] font-barlow font-black uppercase"
            >
              Track Order
            </button>
            <button
              onClick={() => setStep('token-board')}
              className="w-full border border-white/10 text-white/40 py-3 rounded-2xl text-[12px] font-mono uppercase tracking-wider"
            >
              Token Board
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── token-status ──────────────────────────────────────────────────────────────
  if (step === 'token-status') {
    const tokenNumber = placedOrder?.windowToken ?? '—';
    const isCancelled = currentStatus === 'cancelled';
    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans flex flex-col">
        <div className="bg-white border-b border-[rgba(26,26,26,0.08)] px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('token')} className="text-[#1a1a1a]/50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[11px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest">
                Token #{tokenNumber}
              </p>
              <p className="text-[16px] font-barlow font-black uppercase text-[#1a1a1a]">
                Order #{placedOrder?.orderNumber ?? '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div className="bg-pink-600 rounded-2xl p-6 text-center">
            <p className="text-[10px] font-mono text-pink-200/70 uppercase tracking-widest mb-2">Your Token</p>
            <span className="text-[56px] font-black font-mono text-white leading-none">{tokenNumber}</span>
          </div>

          {isCancelled ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-[14px] font-barlow font-black uppercase text-red-700">Order Cancelled</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[rgba(26,26,26,0.10)] p-5">
              <StatusSteps steps={WINDOW_STEPS} currentStatus={currentStatus} accentClass="bg-pink-600" />
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#1a1a1a]/40">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live updates enabled
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => setStep('token-board')}
            className="w-full border border-[rgba(26,26,26,0.18)] text-[#1a1a1a]/60 py-3.5 rounded-2xl text-[12px] font-mono uppercase"
          >
            Token Board
          </button>
          <button onClick={onExit} className="w-full text-[#1a1a1a]/30 py-2 text-[12px] font-mono">
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── token-board ───────────────────────────────────────────────────────────────
  if (step === 'token-board') {
    const myToken = placedOrder?.windowToken ?? '—';
    const isReady = currentStatus === 'ready';
    return (
      <div className="min-h-screen bg-[#0d0d0f] font-sans flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pink-600/20 flex items-center justify-center">
              <Hash className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h1 className="text-[14px] font-bold uppercase tracking-widest text-white">Token Board</h1>
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

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          <p className="text-[12px] font-mono text-neutral-400 uppercase tracking-[0.3em]">Your Token</p>
          <div className="relative">
            <div className="w-48 h-48 rounded-3xl bg-pink-600 flex items-center justify-center shadow-2xl shadow-pink-900/40">
              <span className="text-[80px] font-black font-mono text-white leading-none">{myToken}</span>
            </div>
            {isReady && (
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center animate-bounce">
                <Bell className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <p className={`text-[14px] font-mono font-bold uppercase tracking-widest
            ${isReady ? 'text-emerald-400' : currentStatus === 'preparing' ? 'text-amber-400' : 'text-neutral-500'}`}>
            {isReady
              ? 'Ready for Pickup!'
              : currentStatus === 'preparing'
                ? 'Preparing…'
                : currentStatus === 'accepted'
                  ? 'Accepted'
                  : 'Order Received'}
          </p>
        </div>

        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-600">
          <span>Counter 1 · SmartDine</span>
          <span>Thank you for your patience!</span>
        </div>
      </div>
    );
  }

  return null;
}
