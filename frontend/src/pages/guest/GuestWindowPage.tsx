import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  X,
  Store,
  Loader2,
  Phone,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  usePublicMenu,
  usePlaceWindowOrder,
  useRequestGuestOtp,
  useVerifyGuestOtp,
} from '@/hooks/useGuest';
import type { GuestCartLine, PublicMenuItem } from '@/lib/dto/guest';

const TOKEN_STORAGE_KEY = 'sd_guest_token';
const TOKEN_PHONE_KEY = 'sd_guest_phone';
const TOKEN_EXPIRES_KEY = 'sd_guest_token_expires';

function fmtINR(n: number): string {
  return `₹${n.toFixed(2)}`;
}

function loadStoredToken(): { token: string; phone: string } | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const phone = localStorage.getItem(TOKEN_PHONE_KEY);
  const expires = localStorage.getItem(TOKEN_EXPIRES_KEY);
  if (!token || !phone || !expires) return null;
  if (Date.now() > Number(expires)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_PHONE_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    return null;
  }
  return { token, phone };
}

export default function GuestWindowPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qrSlug = params.get('qr') ?? undefined;

  const [guestToken, setGuestToken] = useState<string | null>(
    () => loadStoredToken()?.token ?? null,
  );
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(
    () => loadStoredToken()?.phone ?? null,
  );

  const menuQuery = usePublicMenu({ channel: 'window' });
  const placeOrder = usePlaceWindowOrder(guestToken);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<GuestCartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [pickupAt, setPickupAt] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

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
          (i.description ?? '').toLowerCase().includes(q),
      );
    }
    return all.filter((i) => i.categoryId === activeCategory);
  }, [menu, search, activeCategory]);

  function addItem(item: PublicMenuItem) {
    if (item.variants.length > 0 || item.modifierGroups.some((g) => g.isRequired)) {
      toast.info('Item with options — please go to the window for custom orders');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === item.id && l.modifiers.length === 0);
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

  function handleVerified(token: string, phone: string, expiresInMin: number) {
    setGuestToken(token);
    setVerifiedPhone(phone);
    const expiresAt = Date.now() + expiresInMin * 60_000;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_PHONE_KEY, phone);
    localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt));
    setShowOtpModal(false);
  }

  function handleSignOut() {
    setGuestToken(null);
    setVerifiedPhone(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_PHONE_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
  }

  async function handlePlace() {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!guestToken) {
      setShowOtpModal(true);
      return;
    }
    try {
      const order = await placeOrder.mutateAsync({
        qrSlug,
        guestName: guestName || undefined,
        guestNotes: guestNotes || undefined,
        pickupAt: pickupAt || undefined,
        items: cart.map((l) => ({
          itemId: l.itemId,
          qty: l.qty,
          notes: l.notes,
          modifiers: l.modifiers.map((m) => ({ groupId: m.groupId, modifierId: m.modifierId })),
        })),
      });
      toast.success(`Order ${order.orderNumber} placed!`);
      setCart([]);
      navigate(`/track/${order.id}`);
    } catch {
      // hook toasts
    }
  }

  if (menuQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-violet-50/30 pb-24">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900">Takeaway / Window</h1>
            <p className="text-[11px] text-gray-500">
              {verifiedPhone ? `Signed in as ${verifiedPhone}` : 'Phone verification needed at checkout'}
            </p>
          </div>
          {verifiedPhone && (
            <button
              onClick={handleSignOut}
              className="text-[10px] text-gray-400 hover:text-gray-600"
            >
              Sign out
            </button>
          )}
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 bg-gray-50"
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
                      ? 'bg-violet-500 text-white'
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

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-2">
        {filteredItems.map((item) => {
          const inCart = cart
            .filter((l) => l.itemId === item.id)
            .reduce((s, l) => s + l.qty, 0);
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 p-3.5 flex items-center gap-3 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                )}
                <p className="text-sm font-bold text-gray-900 mt-2">{fmtINR(item.basePrice)}</p>
              </div>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-violet-300" />
                </div>
              )}
              {inCart > 0 ? (
                <button
                  onClick={() => addItem(item)}
                  className="px-3 py-1.5 bg-violet-500 text-white rounded-lg text-xs font-bold"
                >
                  {inCart} ADDED
                </button>
              ) : (
                <button
                  onClick={() => addItem(item)}
                  className="px-3 py-1.5 border border-violet-500 text-violet-600 rounded-lg text-xs font-bold hover:bg-violet-50 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> ADD
                </button>
              )}
            </div>
          );
        })}
      </main>

      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-violet-500 text-white rounded-full pl-4 pr-5 py-3 shadow-2xl shadow-violet-500/40 flex items-center gap-3 hover:bg-violet-600 transition-colors"
        >
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
            {cartCount}
          </div>
          <span className="text-sm font-bold">View cart · {fmtINR(cartTotal)}</span>
          <ShoppingBag className="w-4 h-4" />
        </button>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto z-10 flex flex-col">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <h3 className="font-bold text-gray-900">Your order</h3>
              <button onClick={() => setCartOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3 flex-1">
              {cart.map((line) => (
                <div key={line.key} className="bg-gray-50 rounded-2xl p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{line.name}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{fmtINR(line.lineTotal)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => removeLine(line.key)}>
                      <X className="w-4 h-4 text-gray-300 hover:text-red-500" />
                    </button>
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-1">
                      <button onClick={() => adjustQty(line.key, -1)} className="p-1">
                        <Minus className="w-3 h-3 text-gray-500" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{line.qty}</span>
                      <button onClick={() => adjustQty(line.key, 1)} className="p-1">
                        <Plus className="w-3 h-3 text-violet-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-3 space-y-2.5">
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                />
                <div>
                  <label className="text-[10px] uppercase font-semibold text-gray-500 flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" /> Pick-up time (optional)
                  </label>
                  <input
                    type="time"
                    value={pickupAt}
                    onChange={(e) => {
                      if (e.target.value) {
                        const today = new Date();
                        const [h, m] = e.target.value.split(':').map(Number);
                        today.setHours(h, m, 0, 0);
                        setPickupAt(today.toISOString());
                      } else {
                        setPickupAt('');
                      }
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
                <textarea
                  value={guestNotes}
                  onChange={(e) => setGuestNotes(e.target.value)}
                  placeholder="Allergies, special requests..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
              <div className="border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{fmtINR(cartTotal)}</span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3">
              <button
                onClick={handlePlace}
                disabled={placeOrder.isPending}
                className="w-full py-3 bg-violet-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {placeOrder.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : !guestToken ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : null}
                {!guestToken ? 'Verify phone & place order' : `Place order · ${fmtINR(cartTotal)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <OtpModal onClose={() => setShowOtpModal(false)} onVerified={handleVerified} />
      )}
    </div>
  );
}

function OtpModal({
  onClose,
  onVerified,
}: {
  onClose: () => void;
  onVerified: (token: string, phone: string, expiresInMin: number) => void;
}) {
  const requestOtp = useRequestGuestOtp();
  const verifyOtp = useVerifyGuestOtp();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function send() {
    if (!phone.match(/^\+?[1-9]\d{7,14}$/)) {
      toast.error('Enter a valid phone (e.g. +919876543210)');
      return;
    }
    const r = await requestOtp.mutateAsync(phone);
    setSentTo(r.sentTo);
    toast.success(`OTP sent to ${r.sentTo}`);
  }

  async function verify() {
    if (!code) {
      toast.error('Enter the OTP code');
      return;
    }
    const r = await verifyOtp.mutateAsync({ phone, code });
    if (r.verified) {
      onVerified(r.guestToken, r.phone, r.expiresInMin);
      toast.success('Phone verified');
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-gray-900">Verify your phone</h3>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={Boolean(sentTo)}
                placeholder="+919876543210"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {sentTo && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                OTP code (sent to {sentTo})
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                inputMode="numeric"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 text-center text-lg font-mono tracking-widest"
              />
              <p className="text-[10px] text-gray-400 mt-1.5">
                If SMS isn't configured, the OTP is logged to the backend console — ask staff.
              </p>
            </div>
          )}

          {!sentTo ? (
            <button
              onClick={send}
              disabled={requestOtp.isPending}
              className="w-full py-3 bg-violet-500 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {requestOtp.isPending ? 'Sending...' : 'Send OTP'}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={verify}
                disabled={verifyOtp.isPending}
                className="w-full py-3 bg-violet-500 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {verifyOtp.isPending ? 'Verifying...' : 'Verify & continue'}
              </button>
              <button
                onClick={() => setSentTo(null)}
                className="w-full text-xs text-gray-500 py-2"
              >
                Wrong number? Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
