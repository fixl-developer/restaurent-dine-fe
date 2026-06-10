import React, { useState, useRef } from 'react';
import { ShoppingCart, ChevronDown, X } from 'lucide-react';
import { DECOR_IMAGES, FOOD_IMAGES } from '../foodData';
import { CartItem, MenuItem, CustomCombo } from '../types';
import BookingSection from './BookingSection';
import ComboConstructor from './ComboConstructor';
import dogVideo from '../assets/images/video.mp4';

// ── Palette ────────────────────────────────────────────────────────────────────
//  Pink is used ONLY for CTAs, badges, deco bar, small accents — never headings
const PINK  = '#E8447A';   // rose-pink   – buttons, badges, deco bar
const TEAL  = '#1BC8C8';   // cyan-teal   – price text, taglines, "NEW" tag
const PURP  = '#7C4DCC';   // lavender-purple – How It Works heading
const DARK  = '#1a1a1a';   // near-black  – dark sections, body headings
const HEAD  = '#2C2C2C';   // charcoal    – all large headings on light bgs
const TX    = '#4A4A4A';   // body text
const TL    = '#888888';   // muted / secondary
const WHITE = '#FFFFFF';

// Section backgrounds — direct from client reference images
const BG_HERO    = '#FFE8EE';  // hero — soft pink (Cream Top Lattes poster bg)
const BG_MENU    = '#FFF9C4';  // menu — light mustard yellow (Mango Smoothie panel)
const BG_ABOUT   = '#E3F2FD';  // more than just food — light blue
const BG_GALLERY = '#FFD6DC';  // never miss a moment — soft pink (Strawberry Smoothie panel)
const BG_YELLOW  = '#FFFDE7';  // ticker, combos — pastel yellow
const BG_LAVENDER = '#F5F0FF'; // How It Works — light lavender

// ── Decorative SVGs ───────────────────────────────────────────────────────────


const Starburst = () => (
  <svg viewBox="0 0 44 44" style={{ width: 44, height: 44 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M22 2 L25.5 17 L38 8 L29 20.5 L44 22 L29 23.5 L38 36 L25.5 27 L22 42 L18.5 27 L6 36 L15 23.5 L0 22 L15 20.5 L6 8 L18.5 17 Z" fill="#D4B84A" />
  </svg>
);

const PinkyPromiseStamp = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.22))' }}>
    <circle cx="48" cy="48" r="46" fill="rgba(255,255,255,0.95)" stroke={PINK} strokeWidth="3.5" />
    <circle cx="48" cy="48" r="39" fill="none" stroke={TEAL} strokeWidth="1.8" />
    <text x="48" y="35" textAnchor="middle" fontFamily="Dancing Script, cursive" fontSize="20" fontWeight="700" fill={PINK}>Pinky</text>
    <text x="66" y="27" textAnchor="middle" fontSize="9" fill="#CC0044">♥</text>
    <text x="48" y="48" textAnchor="middle" fontFamily="Dancing Script, cursive" fontSize="16" fontWeight="600" fill={TEAL}>promise</text>
    <text x="48" y="59" textAnchor="middle" fontFamily="sans-serif" fontSize="6" letterSpacing="0.5" fill={TEAL}>— cafe &amp; Restaurant —</text>
    <text x="48" y="69" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill={PINK}>♡ Venice Beach ♡</text>
    <text x="48" y="79" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="rgba(0,0,0,0.25)" letterSpacing="1">™</text>
  </svg>
);

// ── Static content ────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  'Fresh Daily', 'QR Ordering', 'Grain Bowls', 'Seasonal Specials',
  'Table Reservations', 'Organic Teas', 'Open 8am–10pm', 'Los Angeles CA',
  'Fresh Daily', 'QR Ordering', 'Grain Bowls', 'Seasonal Specials',
  'Table Reservations', 'Organic Teas', 'Open 8am–10pm', 'Los Angeles CA',
];

const HOW_STEPS = [
  { num: '01', name: 'PICK YOUR PLATE',  body: 'Browse our seasonal menu built around fresh produce from local farms and artisan bakers.' },
  { num: '02', name: 'SCAN & ORDER',      body: 'Use the QR code at your table to order directly from your phone — no app download needed.' },
  { num: '03', name: 'DINE IN STYLE',    body: 'Your order goes straight to the kitchen. Sit back and enjoy the warm ambience.' },
];

const REVIEWS = [
  { text: '"The grain bowl is genuinely the best I\'ve had in LA. The vibe, the service, the flavours — nothing else comes close."', author: '— Maya R., Los Angeles Local' },
  { text: '"Started every morning here on my LA trip. Cold brew + avo toast + beautiful interiors. That\'s the review."',             author: '— Jake T., Visitor'          },
  { text: '"Ordered via QR at the table and it arrived in minutes. Fresh, fast, beautifully presented."',                             author: '— Priya S., Santa Monica'    },
  { text: '"The matcha latte alone is worth the trip. Sipped it watching the sunset — pure magic."',                                   author: '— Zoe K., Silver Lake'       },
  { text: '"Ambience is unmatched. Felt like stepping into a lifestyle editorial but the food was the real star."',                   author: '— Carlos M., Downtown LA'    },
  { text: '"Best brunch spot in Venice. The staff remembered our order the next visit — that\'s rare."',                              author: '— Emily T., Venice Beach'    },
  { text: '"Every dish looks magazine-cover ready. And it tastes even better than it looks."',                                         author: '— Aisha N., Culver City'     },
  { text: '"Came for the coffee, stayed for the entire afternoon. Will be back every week without question."',                         author: '— Ryan B., Playa Vista'      },
  { text: '"The seasonal specials change weekly and each one is more beautiful than the last."',                                       author: '— Sofia L., West Hollywood'  },
];

const CARD_FALLBACKS = [
  FOOD_IMAGES.oats, FOOD_IMAGES.cake, FOOD_IMAGES.salad,
  FOOD_IMAGES.noodles, FOOD_IMAGES.eggsalad, FOOD_IMAGES.eggnoodles,
  FOOD_IMAGES.oats2, FOOD_IMAGES.sauce,
];

const GALLERY_ITEMS = [
  FOOD_IMAGES.cake, FOOD_IMAGES.oats, FOOD_IMAGES.salad, FOOD_IMAGES.noodles,
  DECOR_IMAGES.decor1, DECOR_IMAGES.decor2, DECOR_IMAGES.decor3, DECOR_IMAGES.decor4,
  FOOD_IMAGES.eggnoodles, FOOD_IMAGES.eggsalad, FOOD_IMAGES.oats2, FOOD_IMAGES.sauce,
  DECOR_IMAGES.decor5,
];

const CATEGORIES = [
  { id: 'all',    label: 'All Items'  },
  { id: 'drinks', label: 'Beverages'  },
  { id: 'mains',  label: 'Mains'      },
  { id: 'sweets', label: 'Sweets'     },
  { id: 'sides',  label: 'Sides'      },
];

const OPS_PAGES = [
  { label: 'Order Tracker',    id: 'order-tracker' },
  { label: 'Vendor Console',   id: 'vendor'        },
  { label: 'Admin Portal',     id: 'admin'         },
  { label: 'Kitchen Display',  id: 'kds'           },
  { label: 'Table Operations', id: 'table-ops'     },
  { label: 'Billing & Pay',    id: 'billing-ops'   },
  { label: 'QR Ordering',      id: 'qr-order'      },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface StorytellingHomeProps {
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem | CartItem) => void;
  onRemoveFromCart: (itemId: string, force?: boolean) => void;
  onAddCustomCombo: (combo: CustomCombo, price: number) => void;
  setActivePage: (page: string) => void;
  menuItems: MenuItem[];
  cartCount: number;
  onOpenCart: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StorytellingHome({
  onAddToCart,
  onAddCustomCombo,
  setActivePage,
  menuItems,
  cartCount,
  onOpenCart,
}: StorytellingHomeProps) {
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [quantities, setQuantities]                 = useState<Record<string, number>>({});
  const [justAdded, setJustAdded]                   = useState<Record<string, boolean>>({});
  const [opsOpen, setOpsOpen]                       = useState(false);
  const [activeCategory, setActiveCategory]         = useState('all');
  const [selectedItem, setSelectedItem]             = useState<MenuItem | null>(null);
  const [modalQty, setModalQty]                     = useState(1);
  const [showAllMenu, setShowAllMenu]               = useState(false);
  const sliderRef                                   = useRef<HTMLDivElement>(null);

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const getQty    = (id: string) => quantities[id] ?? 1;
  const adjustQty = (id: string, dir: number) =>
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + dir) }));

  const handleAddFeatured = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const qty = getQty(item.id);
    for (let i = 0; i < qty; i++) onAddToCart(item);
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
    setJustAdded(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setJustAdded(prev => ({ ...prev, [item.id]: false })), 1500);
  };

  const openModal  = (item: MenuItem) => { setSelectedItem(item); setModalQty(1); };
  const closeModal = () => setSelectedItem(null);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleModalAdd = () => {
    if (!selectedItem) return;
    for (let i = 0; i < modalQty; i++) onAddToCart(selectedItem);
    closeModal();
  };

  const handleBookingSuccess = (details: any) => {
    setActiveNotification(details);
    setTimeout(() => document.getElementById('reservation-alert')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const drag = useRef({ down: false, startX: 0, scrollLeft: 0 });
  const onSliderMouseDown = (e: React.MouseEvent) => {
    drag.current = { down: true, startX: e.pageX - (sliderRef.current?.offsetLeft ?? 0), scrollLeft: sliderRef.current?.scrollLeft ?? 0 };
    if (sliderRef.current) sliderRef.current.style.cursor = 'grabbing';
  };
  const onSliderMouseUp   = () => { drag.current.down = false; if (sliderRef.current) sliderRef.current.style.cursor = 'grab'; };
  const onSliderMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.down || !sliderRef.current) return;
    const x = e.pageX - (sliderRef.current.offsetLeft ?? 0);
    if (Math.abs(x - drag.current.startX) < 6) return;
    e.preventDefault();
    sliderRef.current.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX) * 1.5;
  };

  const renderMenuCard = (item: MenuItem, idx: number, gridMode: boolean) => (
    <div
      key={item.id}
      onClick={() => openModal(item)}
      style={{
        ...(gridMode ? {} : { width: 220, flexShrink: 0 }),
        display: 'flex', flexDirection: 'column',
        background: WHITE,
        border: '1.5px solid rgba(124,77,204,.1)',
        borderRadius: 22, overflow: 'hidden', position: 'relative',
        cursor: 'pointer', transition: 'transform .2s ease, box-shadow .2s ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(124,77,204,.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
    >
      {idx === 0 && activeCategory === 'all' && (
        <div className="absolute" style={{ top: 10, right: 10, zIndex: 3 }}>
          <div className="flex flex-col items-center justify-center text-center" style={{ background: PINK, width: 40, height: 40, borderRadius: '50%', fontSize: 7, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: WHITE, lineHeight: 1.1 }}>
            TOP<br />PICK
          </div>
        </div>
      )}

      <div className="font-barlow font-black uppercase" style={{ fontSize: 24, letterSpacing: '-0.3px', lineHeight: 1, padding: '14px 14px 0', color: HEAD }} title={item.name}>
        {item.name.length > 12 ? item.name.slice(0, 12).toUpperCase() + '…' : item.name.toUpperCase()}
      </div>

      <div className="flex items-center justify-center" style={{ flex: 1, padding: '10px 14px', minHeight: 148 }}>
        <img
          src={item.image ?? CARD_FALLBACKS[idx % CARD_FALLBACKS.length]}
          alt={item.name}
          className="object-cover rounded-full shadow-md pointer-events-none"
          style={{ width: 110, height: 110, border: '2px solid rgba(27,200,200,.2)' }}
          draggable={false}
        />
      </div>

      <div style={{ borderTop: '1px solid rgba(124,77,204,.08)', padding: '10px 12px 12px' }}>
        <div className="flex items-center justify-center" style={{ gap: 20, marginBottom: 10 }}>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); adjustQty(item.id, -1); }}
            className="flex items-center justify-center bg-transparent cursor-pointer"
            style={{ width: 26, height: 26, borderRadius: '50%', border: '1.2px solid rgba(124,77,204,.3)', fontSize: 16, lineHeight: 1, color: PURP }}
          >−</button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 14, textAlign: 'center', color: TX }}>{getQty(item.id)}</span>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); adjustQty(item.id, 1); }}
            className="flex items-center justify-center bg-transparent cursor-pointer"
            style={{ width: 26, height: 26, borderRadius: '50%', border: '1.2px solid rgba(124,77,204,.3)', fontSize: 16, lineHeight: 1, color: PURP }}
          >+</button>
        </div>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => handleAddFeatured(item, e)}
          className="w-full cursor-pointer border-none transition-all"
          style={{
            background: justAdded[item.id] ? TEAL : PINK,
            color: WHITE, borderRadius: 100,
            fontSize: 9, fontWeight: 700, letterSpacing: '1.8px',
            textTransform: 'uppercase', padding: '11px 8px', fontFamily: 'inherit',
            transition: 'background .3s ease',
          }}
        >
          {justAdded[item.id] ? '✓ Added!' : `Add → $${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}`}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full font-sans">

      {/* ── Item Detail Modal ─────────────────────────────────────────────── */}
      {selectedItem && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(44,44,44,.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: WHITE, borderRadius: 24, overflow: 'hidden',
              maxWidth: 480, width: '100%',
              boxShadow: '0 32px 80px rgba(0,0,0,.2)',
            }}
          >
            <div style={{ height: 270, position: 'relative', background: BG_LAVENDER }}>
              <img src={selectedItem.image ?? CARD_FALLBACKS[0]} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={closeModal} className="flex items-center justify-center cursor-pointer border-none" style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', background: PINK, color: WHITE }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
              {selectedItem.badge && (
                <div style={{ position: 'absolute', top: 12, left: 12, background: PINK, color: WHITE, fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100 }}>
                  {selectedItem.badge}
                </div>
              )}
            </div>
            <div style={{ padding: '24px 28px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <h3 className="font-barlow font-black uppercase" style={{ fontSize: 26, letterSpacing: '-0.5px', lineHeight: 1.05, color: HEAD }}>{selectedItem.name}</h3>
                <div className="font-barlow font-black" style={{ fontSize: 26, whiteSpace: 'nowrap', color: TEAL }}>${selectedItem.price.toFixed(2)}</div>
              </div>
              <p style={{ fontSize: 12, color: TL, lineHeight: 1.7, marginBottom: 6 }}>{selectedItem.description}</p>
              {selectedItem.calories && (
                <p style={{ fontSize: 10, fontWeight: 600, color: TEAL, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>{selectedItem.calories} kcal</p>
              )}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, border: '1.5px solid rgba(124,77,204,.2)', borderRadius: 100, padding: '9px 18px' }}>
                  <button onClick={() => setModalQty(q => Math.max(1, q - 1))} className="bg-transparent border-none cursor-pointer" style={{ fontSize: 20, color: PURP, lineHeight: 1, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 14, fontWeight: 600, minWidth: 22, textAlign: 'center', color: TX }}>{modalQty}</span>
                  <button onClick={() => setModalQty(q => q + 1)} className="bg-transparent border-none cursor-pointer" style={{ fontSize: 20, color: PURP, lineHeight: 1, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <button onClick={handleModalAdd} className="cursor-pointer border-none transition-opacity hover:opacity-80" style={{ flex: 1, background: PINK, color: WHITE, borderRadius: 100, padding: '14px 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'inherit' }}>
                  Add to Cart · ${(selectedItem.price * modalQty).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between" style={{ background: WHITE, padding: '18px 48px', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(124,77,204,.08)', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-lora italic bg-transparent border-none cursor-pointer" style={{ fontSize: 20, color: PINK, letterSpacing: '-0.2px' }}>
          SmartDine
        </button>
        <ul className="hidden md:flex list-none items-center" style={{ gap: 36 }}>
          {[
            { label: 'Menu',    action: () => scrollTo('menu-slider')  },
            { label: 'Reserve', action: () => scrollTo('book-a-table') },
            { label: 'Combos',  action: () => scrollTo('constructor')  },
          ].map(({ label, action }) => (
            <li key={label}>
              <button onClick={action} className="bg-transparent border-none cursor-pointer" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: TX, opacity: 0.7 }}>
                {label}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center" style={{ gap: 16 }}>
          <div className="relative hidden sm:block">
            <button onClick={() => setOpsOpen(v => !v)} className="flex items-center gap-1 bg-transparent border-none cursor-pointer" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: TX, opacity: 0.7 }}>
              Operations
              <ChevronDown style={{ width: 12, height: 12, transform: opsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
            </button>
            {opsOpen && (
              <div className="absolute top-full right-0 rounded-2xl overflow-hidden" style={{ background: DARK, minWidth: 190, marginTop: 8, boxShadow: '0 8px 24px rgba(0,0,0,.2)', zIndex: 50 }}>
                {OPS_PAGES.map(p => (
                  <button key={p.id} onClick={() => { setActivePage(p.id); setOpsOpen(false); }} className="w-full text-left bg-transparent border-none cursor-pointer transition-opacity hover:opacity-75" style={{ display: 'block', padding: '10px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,.75)' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={onOpenCart} className="flex items-center gap-2 bg-transparent border-none cursor-pointer" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: TX }}>
            <ShoppingCart style={{ width: 16, height: 16, color: PINK }} />
            <span className="flex items-center justify-center font-barlow font-bold" style={{ background: PINK, color: WHITE, fontSize: 10, minWidth: 20, height: 20, borderRadius: 100, padding: '0 6px' }}>{cartCount}</span>
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="grid" style={{ background: BG_HERO, gridTemplateColumns: '38% 62%', minHeight: 480 }}>
        <div className="flex flex-col justify-between relative z-10" style={{ padding: '40px 32px 44px 48px' }}>
          <div className="absolute" style={{ top: 22, right: 18 }}><Starburst /></div>
          <div style={{ marginTop: 36 }}>
            <p className="font-script" style={{ fontSize: 16, color: TEAL, marginBottom: 8 }}>freshly crafted, every day ♡</p>
            <h1 className="font-barlow font-black uppercase" style={{ fontSize: 78, lineHeight: 0.9, letterSpacing: '-1px', color: HEAD }}>
              DISCOVER<br />THE<br />FINEST<br />DINING.
            </h1>
          </div>
          <p style={{ fontSize: 12, color: TL, lineHeight: 1.6, marginTop: 14, maxWidth: 210 }}>
            Artisan pastries, fresh grain bowls & specialty teas — served with care in Los Angeles.
          </p>
          <button onClick={() => scrollTo('menu-slider')} className="cursor-pointer border-none transition-opacity hover:opacity-80" style={{ marginTop: 20, background: PINK, color: WHITE, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '13px 26px', borderRadius: 100, width: 'fit-content' }}>
            View Full Menu
          </button>
        </div>
        <div className="flex items-stretch" style={{ padding: '20px 20px 20px 0' }}>
          <div className="flex-1 overflow-hidden relative" style={{ borderRadius: 20, minHeight: 440, background: `linear-gradient(135deg,${BG_HERO} 0%,#ffc2d0 100%)` }}>
            <img src={DECOR_IMAGES.decor1} alt="SmartDine signature dish" className="w-full h-full object-cover absolute inset-0" loading="eager" fetchPriority="high" decoding="sync" />
            <div className="absolute" style={{ top: 16, right: 16, zIndex: 10 }}><PinkyPromiseStamp /></div>
            <div className="absolute rounded-xl z-10" style={{ bottom: 18, left: 18, padding: '12px 16px', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(6px)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: TL, marginBottom: 3 }}>Today's Special</div>
              <div className="font-barlow font-bold" style={{ fontSize: 16, color: HEAD }}>Grain Bowl + Cold Brew</div>
              <div style={{ fontSize: 11, color: TEAL, fontWeight: 600, marginTop: 2 }}>Seasonal · Fresh Daily</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden" style={{ background: BG_YELLOW, borderTop: '1px solid rgba(27,200,200,.15)', borderBottom: '1px solid rgba(27,200,200,.15)', padding: '11px 0' }}>
        <div className="ticker-roll">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="inline-flex items-center" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: i % 2 === 0 ? TEAL : PURP, padding: '0 24px', gap: 24 }}>
              {item}<span style={{ fontSize: 12, color: PINK }}>♡</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Menu Slider ──────────────────────────────────────────────────── */}
      {menuItems.length > 0 && (
        <section id="menu-slider" style={{ background: BG_MENU, padding: '44px 48px 52px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p className="font-script" style={{ fontSize: 15, color: TEAL, marginBottom: 2 }}>handpicked & freshly prepared ♡</p>
              <h2 className="font-barlow font-black uppercase" style={{ fontSize: 46, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 6, color: HEAD }}>OUR MENU</h2>
              <p style={{ fontSize: 12, color: TL }}>
                {showAllMenu ? 'All dishes at a glance — click any item to order.' : 'Freshly prepared each morning. Click any item to order.'}
              </p>
            </div>
            <button
              onClick={() => setShowAllMenu(v => !v)}
              style={{ padding: '9px 22px', borderRadius: 100, border: `1.5px solid ${PURP}`, background: showAllMenu ? PURP : 'transparent', color: showAllMenu ? WHITE : PURP, fontSize: 10, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              {showAllMenu ? '← Scroll View' : 'See All →'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="cursor-pointer border-none transition-all"
                style={{
                  padding: '8px 18px', borderRadius: 100,
                  border: `1.5px solid ${activeCategory === cat.id ? PURP : 'rgba(124,77,204,.2)'}`,
                  background: activeCategory === cat.id ? PURP : 'transparent',
                  color: activeCategory === cat.id ? WHITE : TX,
                  fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'inherit',
                }}
              >
                {cat.label}
                {cat.id === 'drinks' && (
                  <span style={{ marginLeft: 6, background: PINK, color: WHITE, fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 100, verticalAlign: 'middle' }}>NEW</span>
                )}
              </button>
            ))}
          </div>

          {showAllMenu ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {filteredItems.map((item, idx) => renderMenuCard(item, idx, true))}
            </div>
          ) : (
            <div ref={sliderRef} className="no-scrollbar" style={{ overflowX: 'auto', cursor: 'grab', userSelect: 'none', paddingBottom: 4 }} onMouseDown={onSliderMouseDown} onMouseUp={onSliderMouseUp} onMouseLeave={onSliderMouseUp} onMouseMove={onSliderMouseMove}>
              <div style={{ display: 'flex', gap: 12, width: 'max-content' }}>
                {filteredItems.map((item, idx) => renderMenuCard(item, idx, false))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── About / Video ─────────────────────────────────────────────────── */}
      <section id="about" className="grid grid-cols-2" style={{ background: BG_ABOUT, minHeight: 320 }}>
        <div className="flex flex-col justify-center" style={{ padding: '54px 48px', borderRight: '1px solid rgba(27,200,200,.18)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: TEAL, marginBottom: 6 }}>Los Angeles, CA · Est. 2026</div>
          <p className="font-script" style={{ fontSize: 16, color: PINK, marginBottom: 8 }}>more than just a meal ♡</p>
          <h2 className="font-barlow font-black uppercase" style={{ fontSize: 48, lineHeight: 0.9, letterSpacing: '-0.5px', marginBottom: 16, color: HEAD }}>MORE THAN<br />JUST FOOD.</h2>
          <p style={{ fontSize: 12, color: TL, lineHeight: 1.7, maxWidth: 280, marginBottom: 24 }}>
            We're a spot where every detail matters. Locally sourced, made fresh each morning, served with genuine warmth.
          </p>
          <button onClick={() => scrollTo('book-a-table')} className="cursor-pointer border-none transition-opacity hover:opacity-80 w-fit" style={{ background: PINK, color: WHITE, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '13px 26px', borderRadius: 100 }}>
            Reserve a Table
          </button>
        </div>
        <div style={{ overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
          <video src={dogVideo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 320 }} autoPlay muted loop playsInline />
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section style={{ background: WHITE, padding: '44px 48px', borderTop: '1px solid rgba(124,77,204,.08)' }}>
        <p className="font-script" style={{ fontSize: 16, color: TEAL, marginBottom: 4 }}>simple & delightful ♡</p>
        <h2 className="font-barlow font-black uppercase" style={{ fontSize: 46, letterSpacing: '-0.5px', marginBottom: 6, color: DARK }}>HOW IT WORKS</h2>
        <p style={{ fontSize: 12, color: TL, marginBottom: 28 }}>Hover each card to discover the step.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {HOW_STEPS.map(step => (
            <div key={step.num} className="how-flip-wrapper">
              <div className="how-flip-inner">
                <div className="how-flip-face" style={{ background: '#EBEBEB' }}>
                  <img src={DECOR_IMAGES.decor3} alt="" aria-hidden style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }} />
                </div>
                <div className="how-flip-face how-flip-back" style={{ background: '#FFE8EE', display: 'flex', flexDirection: 'column', padding: '28px 22px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: PINK, marginBottom: 14 }}>{step.num}</div>
                  <div className="font-barlow font-black uppercase" style={{ fontSize: 22, letterSpacing: '-0.3px', marginBottom: 14, lineHeight: 1.1, color: HEAD }}>{step.name}</div>
                  <div style={{ fontSize: 12, color: TL, lineHeight: 1.7 }}>{step.body}</div>
                  <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                    <div style={{ width: 32, height: 3, background: PINK, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#E8F5E9', padding: '52px 0', overflow: 'hidden' }}>
        <div style={{ padding: '0 48px', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: WHITE, border: `1px solid rgba(232,68,122,.2)`, borderRadius: 100, padding: '5px 14px 5px 10px', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
              <span style={{ fontSize: 13 }}>⭐</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: PINK }}>Google Reviews</span>
            </div>
            <span style={{ fontSize: 10, color: TL, fontWeight: 600, letterSpacing: '1px' }}>4.9 · 2,400+ reviews</span>
          </div>
          <h2 className="font-barlow font-black uppercase" style={{ fontSize: 46, letterSpacing: '-0.5px', color: HEAD, lineHeight: 1 }}>WHAT THEY SAY</h2>
          <p style={{ fontSize: 12, color: TL, marginTop: 8 }}>Hover any card to pause. Read at your own pace.</p>
        </div>
        <div style={{ overflow: 'hidden', paddingBottom: 4 }}>
          <div className="marquee-reviews">
            {[...REVIEWS, ...REVIEWS].map((review, i) => {
              const raw      = review.author.replace(/^— /, '');
              const commaIdx = raw.indexOf(', ');
              const name     = commaIdx !== -1 ? raw.slice(0, commaIdx) : raw;
              const location = commaIdx !== -1 ? raw.slice(commaIdx + 2) : '';
              const initials = name.split(' ').map((w: string) => w[0]).join('').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
              const AVATAR_PALETTE = [PINK, TEAL, PURP, '#F48FB1', '#4DD0E1', '#CE93D8', '#F06292', '#26C5DA', '#80DEEA'];
              const avatarBg = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
              const DATES    = ['2 days ago','1 week ago','3 weeks ago','1 month ago','6 weeks ago','2 months ago','10 weeks ago','3 months ago','4 months ago'];
              const date     = DATES[i % DATES.length];
              return (
                <div key={i} style={{ flexShrink: 0, width: 310, background: WHITE, borderRadius: 20, padding: '20px 22px 22px', boxShadow: '0 6px 28px rgba(0,0,0,.28)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: WHITE, letterSpacing: '-0.5px' }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: HEAD, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      {location && <div style={{ fontSize: 10, color: TL, marginTop: 1 }}>{location}</div>}
                    </div>
                    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                      <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                      <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 15.8 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
                      <path fill="#FBBC05" d="M24 46c5.9 0 10.9-2 14.5-5.4l-6.7-5.5C29.8 36.9 27 38 24 38c-6.1 0-10.7-3.9-11.8-9.3l-7 5.4C8.2 41.3 15.5 46 24 46z"/>
                      <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 3.1-3 5.7-5.8 7.4l6.7 5.5C41.1 37.9 45 31.4 45 24c0-1.3-.2-2.7-.5-4z"/>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: PINK, fontSize: 13, letterSpacing: 1 }}>★★★★★</span>
                    <span style={{ fontSize: 10, color: TL }}>{date}</span>
                  </div>
                  <p style={{ fontSize: 12, color: TX, lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {review.text.replace(/^"|"$/g, '')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Reserve a Table ───────────────────────────────────────────────── */}
      <BookingSection onSuccess={handleBookingSuccess} />

      {activeNotification && (
        <div id="reservation-alert" style={{ background: WHITE, padding: '0 48px 16px' }}>
          <div className="flex items-center justify-between gap-4 rounded-2xl p-4 shadow-sm" style={{ background: 'rgba(27,200,200,.06)', border: `1px solid ${TEAL}` }}>
            <p style={{ fontSize: 11.5, color: TX, fontWeight: 700 }}>
              Table confirmed for <strong>{activeNotification.guests} guests</strong> on <strong>{activeNotification.date}</strong> at <strong>{activeNotification.time}</strong> — {activeNotification.seating}.
            </p>
            <button onClick={() => setActiveNotification(null)} className="bg-transparent border-none cursor-pointer hover:underline whitespace-nowrap" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: TEAL, fontFamily: 'inherit' }}>
              [Dismiss]
            </button>
          </div>
        </div>
      )}

      {/* ── Create Your Special Taste ─────────────────────────────────────── */}
      <ComboConstructor onAddCustomCombo={onAddCustomCombo} />

      {/* ── Never Miss a Moment ───────────────────────────────────────────── */}
      <section style={{ background: BG_GALLERY, padding: '52px 0', overflow: 'hidden' }}>
        <div style={{ padding: '0 48px', marginBottom: 28 }}>
          <h2 className="font-barlow font-black uppercase" style={{ fontSize: 46, letterSpacing: '-0.5px', color: HEAD }}>NEVER MISS A MOMENT</h2>
          <p style={{ fontSize: 12, color: TL, marginTop: 6 }}>Captured by our guests &amp; team — every dish, every smile, every day.</p>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: 10 }}>
          <div className="marquee-gallery">
            {[...GALLERY_ITEMS, ...GALLERY_ITEMS].map((img, i) => (
              <div key={i} style={{ flexShrink: 0, width: 220, height: 170, borderRadius: 14, overflow: 'hidden' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div className="marquee-gallery-reverse">
            {[...GALLERY_ITEMS.slice().reverse(), ...GALLERY_ITEMS.slice().reverse()].map((img, i) => (
              <div key={i} style={{ flexShrink: 0, width: 220, height: 170, borderRadius: 14, overflow: 'hidden' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '28px 48px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 2, background: PINK, borderRadius: 2 }} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: TL }}>Tag us @pinkypromiselax to be featured</span>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ background: WHITE, padding: '44px 48px 28px', borderTop: '1px solid rgba(124,77,204,.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 28, marginBottom: 32 }}>
          <div>
            <div className="font-lora italic" style={{ fontSize: 22, color: PINK, marginBottom: 10 }}>SmartDine</div>
            <p style={{ fontSize: 11, color: TL, lineHeight: 1.7, maxWidth: 200 }}>Los Angeles' favourite neighbourhood café. Fresh food, specialty drinks, good energy.</p>
          </div>
          {[
            { heading: 'Explore', links: ['Menu', 'Our Story', 'Reviews', 'Reserve a Table'] },
            { heading: 'Connect', links: ['Instagram', 'TikTok', 'Google Maps']              },
            { heading: 'Visit',   links: ['842 Pastel Blvd', 'Los Angeles, CA', 'Open 8am – 10pm'] },
          ].map(col => (
            <div key={col.heading}>
              <h4 style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 12 }}>{col.heading}</h4>
              {col.links.map(link => (
                <span key={link} className="block cursor-pointer" style={{ fontSize: 12, color: TL, marginBottom: 8 }}>{link}</span>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center" style={{ borderTop: '1px solid rgba(124,77,204,.08)', paddingTop: 20 }}>
          <p style={{ fontSize: 10, color: TL }}>© 2026 SmartDine Restron Co. All rights reserved.</p>
          <p style={{ fontSize: 10, color: PINK }}>📍 Los Angeles, California</p>
          <p style={{ fontSize: 10, color: TL }}>Made with ♥ in LA</p>
        </div>
      </footer>

    </div>
  );
}
