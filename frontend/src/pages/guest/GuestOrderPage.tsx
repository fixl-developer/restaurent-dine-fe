import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Leaf,
  Flame,
  X,
  Check,
  Store,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePublicMenu, usePlaceDineInOrder } from '@/hooks/useGuest';
import type {
  GuestCartLine,
  PublicMenuItem,
  PublicModifierGroup,
} from '@/lib/dto/guest';

function fmtINR(n: number): string {
  return `₹${n.toFixed(2)}`;
}

const FOOD_TYPE_BADGE: Record<string, { color: string; label: string }> = {
  veg: { color: 'bg-emerald-100 text-emerald-700', label: '● Veg' },
  vegan: { color: 'bg-emerald-100 text-emerald-700', label: '● Vegan' },
  non_veg: { color: 'bg-red-100 text-red-700', label: '● Non-Veg' },
  egg: { color: 'bg-amber-100 text-amber-700', label: '● Egg' },
};

export default function GuestOrderPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qrSlug = params.get('qr') ?? undefined;
  const tableId = params.get('table') ?? undefined;

  const menuQuery = usePublicMenu({ channel: 'dine_in' });
  const placeOrder = usePlaceDineInOrder();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<GuestCartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<PublicMenuItem | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestNotes, setGuestNotes] = useState('');

  const menu = menuQuery.data;

  useEffect(() => {
    if (menu && !activeCategory && menu.categories.length > 0) {
      setActiveCategory(menu.categories[0].id);
    }
  }, [menu, activeCategory]);

  const filteredItems = useMemo(() => {
    if (!menu) return [];
    const all = menu.categories.flatMap((c) => c.items);
    const q = search.toLowerCase().trim();
    if (q) {
      return all.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          (i.description ?? '').toLowerCase().includes(q),
      );
    }
    return all.filter((i) => i.categoryId === activeCategory);
  }, [menu, search, activeCategory]);

  function addSimpleItem(item: PublicMenuItem) {
    if (item.modifierGroups.some((g) => g.isRequired) || item.variants.length > 0) {
      setCustomizingItem(item);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === item.id && !l.variantId && l.modifiers.length === 0);
      if (existing) {
        return prev.map((l) =>
          l.key === existing.key
            ? { ...l, qty: l.qty + 1, lineTotal: l.basePrice * (l.qty + 1) }
            : l,
        );
      }
      return [
        ...prev,
        {
          key: `${item.id}-${Date.now()}`,
          itemId: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          qty: 1,
          basePrice: item.basePrice,
          modifiers: [],
          lineTotal: item.basePrice,
        },
      ];
    });
  }

  function adjustQty(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.key !== key) return l;
          const newQty = l.qty + delta;
          if (newQty <= 0) return null;
          const unitPrice = l.lineTotal / l.qty;
          return { ...l, qty: newQty, lineTotal: unitPrice * newQty };
        })
        .filter(Boolean) as GuestCartLine[],
    );
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cart.reduce((s, l) => s + l.lineTotal, 0);

  async function handlePlaceOrder() {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    try {
      const order = await placeOrder.mutateAsync({
        qrSlug,
        tableId,
        guestPhone: guestPhone || undefined,
        guestName: guestName || undefined,
        guestNotes: guestNotes || undefined,
        items: cart.map((l) => ({
          itemId: l.itemId,
          variantId: l.variantId,
          qty: l.qty,
          notes: l.notes,
          modifiers: l.modifiers.map((m) => ({ groupId: m.groupId, modifierId: m.modifierId })),
        })),
      });
      toast.success(`Order ${order.orderNumber} placed!`);
      setCart([]);
      navigate(`/track/${order.id}`);
    } catch {
      // toast handled by hook
    }
  }

  if (menuQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (menuQuery.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 p-6">
        <div className="text-center max-w-sm">
          <p className="text-base font-semibold text-gray-800 mb-1">Menu unavailable</p>
          <p className="text-sm text-gray-500 mb-4">
            We can't load the menu right now. Please ask staff for help.
          </p>
          <button
            onClick={() => menuQuery.refetch()}
            className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50/30 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900">Order</h1>
            <p className="text-[11px] text-gray-500">
              {tableId ? `Table service` : 'Dine-In'}
              {qrSlug && ` · QR ${qrSlug}`}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50"
            />
          </div>
        </div>

        {!search && (
          <div className="max-w-3xl mx-auto px-4 pb-3 overflow-x-auto">
            <div className="flex gap-1.5">
              {menu?.categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === c.id
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Items */}
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-2">
        {filteredItems.length === 0 && (
          <div className="text-center py-16 text-sm text-gray-400">No items match your search.</div>
        )}
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            cartQty={cart
              .filter((l) => l.itemId === item.id)
              .reduce((s, l) => s + l.qty, 0)}
            onAdd={() => addSimpleItem(item)}
          />
        ))}
      </main>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-pink-500 text-white rounded-full pl-4 pr-5 py-3 shadow-2xl shadow-pink-500/40 flex items-center gap-3 hover:bg-pink-600 transition-colors"
        >
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
            {cartCount}
          </div>
          <span className="text-sm font-bold">View cart · {fmtINR(cartTotal)}</span>
          <ShoppingBag className="w-4 h-4" />
        </button>
      )}

      {/* Item customization modal */}
      {customizingItem && (
        <CustomizeModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAdd={(line) => {
            setCart((prev) => [...prev, line]);
            setCustomizingItem(null);
          }}
        />
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          guestName={guestName}
          guestPhone={guestPhone}
          guestNotes={guestNotes}
          onUpdateName={setGuestName}
          onUpdatePhone={setGuestPhone}
          onUpdateNotes={setGuestNotes}
          onClose={() => setCartOpen(false)}
          onAdjustQty={adjustQty}
          onRemove={removeLine}
          onPlace={handlePlaceOrder}
          placing={placeOrder.isPending}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function MenuItemCard({
  item,
  cartQty,
  onAdd,
}: {
  item: PublicMenuItem;
  cartQty: number;
  onAdd: () => void;
}) {
  const badge = FOOD_TYPE_BADGE[item.foodType];
  const hasOptions = item.modifierGroups.length > 0 || item.variants.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-3.5 flex items-start gap-3 shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
              {badge.label}
            </span>
          )}
          {item.spiceLevel > 0 && (
            <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
              {Array(item.spiceLevel)
                .fill(0)
                .map((_, i) => (
                  <Flame key={i} className="w-2.5 h-2.5 fill-current" />
                ))}
            </span>
          )}
          {item.tags.includes('vegan') && <Leaf className="w-3 h-3 text-emerald-600" />}
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-gray-900">{fmtINR(item.basePrice)}</span>
          {item.prepTimeMinutes > 0 && (
            <span className="text-[10px] text-gray-400">· {item.prepTimeMinutes} min</span>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-20 h-20 rounded-xl object-cover mb-2"
          />
        ) : (
          <div className="w-20 h-20 bg-pink-50 rounded-xl flex items-center justify-center mb-2">
            <Store className="w-6 h-6 text-pink-300" />
          </div>
        )}
        {cartQty > 0 ? (
          <button
            onClick={onAdd}
            className="w-20 py-1.5 bg-pink-500 text-white rounded-lg text-xs font-bold"
          >
            {cartQty} ADDED
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="w-20 py-1.5 border border-pink-500 text-pink-600 rounded-lg text-xs font-bold hover:bg-pink-50 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" /> ADD
            {hasOptions && <span className="text-[8px] ml-0.5">+</span>}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function CustomizeModal({
  item,
  onClose,
  onAdd,
}: {
  item: PublicMenuItem;
  onClose: () => void;
  onAdd: (line: GuestCartLine) => void;
}) {
  const [variantId, setVariantId] = useState(item.variants[0]?.id);
  const [selectedMods, setSelectedMods] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState('');

  function toggleMod(group: PublicModifierGroup, modifierId: string) {
    setSelectedMods((prev) => {
      const cur = prev[group.id] ?? [];
      const isOn = cur.includes(modifierId);
      let next: string[];
      if (isOn) {
        next = cur.filter((m) => m !== modifierId);
      } else if (group.maxSelections === 1) {
        next = [modifierId];
      } else if (group.maxSelections > 0 && cur.length >= group.maxSelections) {
        toast.error(`Max ${group.maxSelections} selections for ${group.name}`);
        return prev;
      } else {
        next = [...cur, modifierId];
      }
      return { ...prev, [group.id]: next };
    });
  }

  const variant = item.variants.find((v) => v.id === variantId);
  const variantPrice = variant
    ? variant.absolutePrice ?? item.basePrice + variant.priceDelta
    : item.basePrice;

  const modifierTotal = item.modifierGroups.reduce((sum, group) => {
    const ids = selectedMods[group.id] ?? [];
    return (
      sum +
      group.modifiers.filter((m) => ids.includes(m.id)).reduce((s, m) => s + m.priceDelta, 0)
    );
  }, 0);

  const lineTotal = variantPrice + modifierTotal;

  const missingRequired = item.modifierGroups
    .filter((g) => g.isRequired)
    .find((g) => (selectedMods[g.id]?.length ?? 0) < g.minSelections);

  function submit() {
    if (missingRequired) {
      toast.error(`Please choose ${missingRequired.name}`);
      return;
    }
    const modifiers = item.modifierGroups.flatMap((g) =>
      (selectedMods[g.id] ?? []).map((modId) => {
        const m = g.modifiers.find((mm) => mm.id === modId)!;
        return { groupId: g.id, modifierId: modId, name: m.name, priceDelta: m.priceDelta };
      }),
    );
    onAdd({
      key: `${item.id}-${Date.now()}`,
      itemId: item.id,
      variantId: variant?.id,
      variantName: variant?.name,
      name: item.name,
      imageUrl: item.imageUrl,
      qty: 1,
      basePrice: lineTotal,
      modifiers,
      notes: notes || undefined,
      lineTotal,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto z-10">
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{item.name}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {item.variants.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Choose size</p>
              <div className="space-y-1.5">
                {item.variants.map((v) => {
                  const price = v.absolutePrice ?? item.basePrice + v.priceDelta;
                  return (
                    <label
                      key={v.id}
                      className={`flex items-center justify-between border rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                        variantId === v.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={variantId === v.id}
                          onChange={() => setVariantId(v.id)}
                          className="accent-pink-500"
                        />
                        <span className="text-sm">{v.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{fmtINR(price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {item.modifierGroups.map((g) => (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">
                  {g.name}
                  {g.isRequired && <span className="text-red-500 ml-1">*</span>}
                </p>
                <span className="text-[10px] text-gray-400">
                  {g.maxSelections > 0
                    ? `Choose up to ${g.maxSelections}`
                    : 'Choose any'}
                </span>
              </div>
              <div className="space-y-1.5">
                {g.modifiers.map((m) => {
                  const isOn = selectedMods[g.id]?.includes(m.id) ?? false;
                  return (
                    <label
                      key={m.id}
                      onClick={() => toggleMod(g, m.id)}
                      className={`flex items-center justify-between border rounded-xl px-3 py-2 cursor-pointer transition-colors ${
                        isOn ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded ${g.maxSelections === 1 ? 'rounded-full' : ''} border-2 flex items-center justify-center ${
                            isOn ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                          }`}
                        >
                          {isOn && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-sm">{m.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {m.priceDelta > 0 ? `+${fmtINR(m.priceDelta)}` : 'free'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Special instructions</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Less spicy, no onion..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3">
          <button
            onClick={submit}
            disabled={Boolean(missingRequired)}
            className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold disabled:bg-gray-300 transition-colors"
          >
            Add to cart · {fmtINR(lineTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function CartDrawer({
  cart,
  guestName,
  guestPhone,
  guestNotes,
  onUpdateName,
  onUpdatePhone,
  onUpdateNotes,
  onClose,
  onAdjustQty,
  onRemove,
  onPlace,
  placing,
}: {
  cart: GuestCartLine[];
  guestName: string;
  guestPhone: string;
  guestNotes: string;
  onUpdateName: (v: string) => void;
  onUpdatePhone: (v: string) => void;
  onUpdateNotes: (v: string) => void;
  onClose: () => void;
  onAdjustQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onPlace: () => void;
  placing: boolean;
}) {
  const total = cart.reduce((s, l) => s + l.lineTotal, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto z-10 flex flex-col">
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-900">Your order</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 flex-1">
          {cart.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-12">Your cart is empty.</p>
          )}
          {cart.map((line) => (
            <div key={line.key} className="bg-gray-50 rounded-2xl p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {line.name}
                    {line.variantName && (
                      <span className="text-gray-500 font-normal"> · {line.variantName}</span>
                    )}
                  </p>
                  {line.modifiers.length > 0 && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {line.modifiers.map((m) => m.name).join(', ')}
                    </p>
                  )}
                  {line.notes && (
                    <p className="text-[11px] text-gray-400 italic mt-0.5">{line.notes}</p>
                  )}
                  <p className="text-sm font-bold text-gray-900 mt-1.5">{fmtINR(line.lineTotal)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => onRemove(line.key)}>
                    <X className="w-4 h-4 text-gray-300 hover:text-red-500" />
                  </button>
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-1">
                    <button onClick={() => onAdjustQty(line.key, -1)} className="p-1">
                      <Minus className="w-3 h-3 text-gray-500" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{line.qty}</span>
                    <button onClick={() => onAdjustQty(line.key, 1)} className="p-1">
                      <Plus className="w-3 h-3 text-pink-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {cart.length > 0 && (
            <>
              <div className="border-t border-gray-100 pt-3 space-y-2.5">
                <p className="text-xs font-semibold text-gray-700">Your details (optional)</p>
                <input
                  value={guestName}
                  onChange={(e) => onUpdateName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                />
                <input
                  value={guestPhone}
                  onChange={(e) => onUpdatePhone(e.target.value)}
                  placeholder="Phone (+91...)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                />
                <textarea
                  value={guestNotes}
                  onChange={(e) => onUpdateNotes(e.target.value)}
                  placeholder="Allergies or special requests..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{fmtINR(total)}</span>
                </div>
                <p className="text-[10px] text-gray-400">Tax & service charge added on the final bill.</p>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3">
            <button
              onClick={onPlace}
              disabled={placing}
              className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Place order · {fmtINR(total)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
