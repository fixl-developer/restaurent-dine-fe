import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { FOOD_IMAGES } from '../../foodData';
import type { CartItem, MenuItem } from '../../types';
import type { RestaurantDto } from '../../lib/dto/restaurant';
import LandingHeader from '../../components/landing/LandingHeader';
import LandingFooter from '../../components/landing/LandingFooter';

// ── Palette (mirrors StorytellingHome) ─────────────────────────────────────
const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const PURP = '#7C4DCC';
const HEAD = '#2C2C2C';
const TX = '#4A4A4A';
const TL = '#888888';
const WHITE = '#FFFFFF';
const BG_MENU = '#FFF9C4';
const BG_LAVENDER = '#F5F0FF';

const FALLBACK_CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'drinks', label: 'Beverages' },
  { id: 'mains', label: 'Mains' },
  { id: 'sweets', label: 'Sweets' },
  { id: 'sides', label: 'Sides' },
];

const CARD_FALLBACKS = [
  FOOD_IMAGES.oats,
  FOOD_IMAGES.cake,
  FOOD_IMAGES.salad,
  FOOD_IMAGES.noodles,
  FOOD_IMAGES.eggsalad,
  FOOD_IMAGES.eggnoodles,
  FOOD_IMAGES.oats2,
  FOOD_IMAGES.sauce,
];

interface MenuPageProps {
  cartCount: number;
  onOpenCart: () => void;
  onAddToCart: (item: MenuItem | CartItem) => void;
  menuItems: MenuItem[];
  menuCategories?: Array<{ id: string; label: string }> | null;
  menuLoading?: boolean;
  restaurant?: RestaurantDto;
}

export default function MenuPage({
  cartCount,
  onOpenCart,
  onAddToCart,
  menuItems,
  menuCategories,
  menuLoading,
  restaurant,
}: MenuPageProps) {
  const brandName = restaurant?.brand.name ?? 'SmartDine';
  const categories =
    menuCategories && menuCategories.length > 0
      ? [{ id: 'all', label: 'All Items' }, ...menuCategories]
      : FALLBACK_CATEGORIES;

  const [activeCategory, setActiveCategory] = useState('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [showAllMenu, setShowAllMenu] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const getQty = (id: string) => quantities[id] ?? 1;
  const adjustQty = (id: string, dir: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + dir) }));

  const handleAddFeatured = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const qty = getQty(item.id);
    for (let i = 0; i < qty; i++) onAddToCart(item);
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
    setJustAdded((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => setJustAdded((prev) => ({ ...prev, [item.id]: false })), 1500);
  };

  const openModal = (item: MenuItem) => {
    setSelectedItem(item);
    setModalQty(1);
  };
  const closeModal = () => setSelectedItem(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleModalAdd = () => {
    if (!selectedItem) return;
    for (let i = 0; i < modalQty; i++) onAddToCart(selectedItem);
    closeModal();
  };

  const drag = useRef({ down: false, startX: 0, scrollLeft: 0 });
  const onSliderMouseDown = (e: React.MouseEvent) => {
    drag.current = {
      down: true,
      startX: e.pageX - (sliderRef.current?.offsetLeft ?? 0),
      scrollLeft: sliderRef.current?.scrollLeft ?? 0,
    };
    if (sliderRef.current) sliderRef.current.style.cursor = 'grabbing';
  };
  const onSliderMouseUp = () => {
    drag.current.down = false;
    if (sliderRef.current) sliderRef.current.style.cursor = 'grab';
  };
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
        display: 'flex',
        flexDirection: 'column',
        background: WHITE,
        border: '1.5px solid rgba(124,77,204,.1)',
        borderRadius: 22,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform .2s ease, box-shadow .2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(124,77,204,.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {idx === 0 && activeCategory === 'all' && (
        <div className="absolute" style={{ top: 10, right: 10, zIndex: 3 }}>
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{
              background: PINK,
              width: 40,
              height: 40,
              borderRadius: '50%',
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: '.5px',
              textTransform: 'uppercase',
              color: WHITE,
              lineHeight: 1.1,
            }}
          >
            TOP
            <br />
            PICK
          </div>
        </div>
      )}

      <div
        className="font-barlow font-black uppercase"
        style={{
          fontSize: 24,
          letterSpacing: '-0.3px',
          lineHeight: 1,
          padding: '14px 14px 0',
          color: HEAD,
        }}
        title={item.name}
      >
        {item.name.length > 12 ? item.name.slice(0, 12).toUpperCase() + '…' : item.name.toUpperCase()}
      </div>

      <div
        className="flex items-center justify-center"
        style={{ flex: 1, padding: '10px 14px', minHeight: 148 }}
      >
        <img
          src={item.image || CARD_FALLBACKS[idx % CARD_FALLBACKS.length]}
          alt={item.name}
          className="object-cover rounded-full shadow-md pointer-events-none"
          style={{ width: 110, height: 110, border: '2px solid rgba(27,200,200,.2)' }}
          draggable={false}
        />
      </div>

      <div style={{ borderTop: '1px solid rgba(124,77,204,.08)', padding: '10px 12px 12px' }}>
        <div className="flex items-center justify-center" style={{ gap: 20, marginBottom: 10 }}>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              adjustQty(item.id, -1);
            }}
            className="flex items-center justify-center bg-transparent cursor-pointer"
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: '1.2px solid rgba(124,77,204,.3)',
              fontSize: 16,
              lineHeight: 1,
              color: PURP,
            }}
          >
            −
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 14, textAlign: 'center', color: TX }}>
            {getQty(item.id)}
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              adjustQty(item.id, 1);
            }}
            className="flex items-center justify-center bg-transparent cursor-pointer"
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: '1.2px solid rgba(124,77,204,.3)',
              fontSize: 16,
              lineHeight: 1,
              color: PURP,
            }}
          >
            +
          </button>
        </div>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => handleAddFeatured(item, e)}
          className="w-full cursor-pointer border-none transition-all"
          style={{
            background: justAdded[item.id] ? TEAL : PINK,
            color: WHITE,
            borderRadius: 100,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '1.8px',
            textTransform: 'uppercase',
            padding: '11px 8px',
            fontFamily: 'inherit',
            transition: 'background .3s ease',
          }}
        >
          {justAdded[item.id]
            ? '✓ Added!'
            : `Add → $${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}`}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full font-sans">
      <LandingHeader brandName={brandName} cartCount={cartCount} onOpenCart={onOpenCart} />

      {selectedItem && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(44,44,44,.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: WHITE,
              borderRadius: 24,
              overflow: 'hidden',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 32px 80px rgba(0,0,0,.2)',
            }}
          >
            <div style={{ height: 270, position: 'relative', background: BG_LAVENDER }}>
              <img
                src={selectedItem.image || CARD_FALLBACKS[0]}
                alt={selectedItem.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={closeModal}
                className="flex items-center justify-center cursor-pointer border-none"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: PINK,
                  color: WHITE,
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
              {selectedItem.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: PINK,
                    color: WHITE,
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    padding: '4px 12px',
                    borderRadius: 100,
                  }}
                >
                  {selectedItem.badge}
                </div>
              )}
            </div>
            <div style={{ padding: '24px 28px 28px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <h3
                  className="font-barlow font-black uppercase"
                  style={{ fontSize: 26, letterSpacing: '-0.5px', lineHeight: 1.05, color: HEAD }}
                >
                  {selectedItem.name}
                </h3>
                <div className="font-barlow font-black" style={{ fontSize: 26, whiteSpace: 'nowrap', color: TEAL }}>
                  ${selectedItem.price.toFixed(2)}
                </div>
              </div>
              <p style={{ fontSize: 12, color: TL, lineHeight: 1.7, marginBottom: 6 }}>
                {selectedItem.description}
              </p>
              {selectedItem.calories && (
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: TEAL,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: 20,
                  }}
                >
                  {selectedItem.calories} kcal
                </p>
              )}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    border: '1.5px solid rgba(124,77,204,.2)',
                    borderRadius: 100,
                    padding: '9px 18px',
                  }}
                >
                  <button
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    className="bg-transparent border-none cursor-pointer"
                    style={{
                      fontSize: 20,
                      color: PURP,
                      lineHeight: 1,
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, minWidth: 22, textAlign: 'center', color: TX }}
                  >
                    {modalQty}
                  </span>
                  <button
                    onClick={() => setModalQty((q) => q + 1)}
                    className="bg-transparent border-none cursor-pointer"
                    style={{
                      fontSize: 20,
                      color: PURP,
                      lineHeight: 1,
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleModalAdd}
                  className="cursor-pointer border-none transition-opacity hover:opacity-80"
                  style={{
                    flex: 1,
                    background: PINK,
                    color: WHITE,
                    borderRadius: 100,
                    padding: '14px 20px',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontFamily: 'inherit',
                  }}
                >
                  Add to Cart · ${(selectedItem.price * modalQty).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section
        id="menu-slider"
        style={{
          background: BG_MENU,
          padding: 'clamp(40px, 6vw, 96px) clamp(16px, 4vw, 80px) clamp(56px, 7vw, 120px)',
          minHeight: '70vh',
        }}
      >
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <p className="font-script" style={{ fontSize: 15, color: TEAL, marginBottom: 2 }}>
            handpicked & freshly prepared ♡
          </p>
          <h2
            className="font-barlow font-black uppercase"
            style={{ fontSize: 56, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 6, color: HEAD }}
          >
            OUR MENU
          </h2>
          <p style={{ fontSize: 13, color: TL }}>
            Freshly prepared each morning. Click any item to view details and order.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="cursor-pointer border-none transition-all"
              style={{
                padding: '8px 18px',
                borderRadius: 100,
                border: `1.5px solid ${activeCategory === cat.id ? PURP : 'rgba(124,77,204,.2)'}`,
                background: activeCategory === cat.id ? PURP : 'transparent',
                color: activeCategory === cat.id ? WHITE : TX,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
              }}
            >
              {cat.label}
            </button>
          ))}
          <button
            onClick={() => setShowAllMenu((v) => !v)}
            style={{
              marginLeft: 'auto',
              padding: '8px 22px',
              borderRadius: 100,
              border: `1.5px solid ${PURP}`,
              background: showAllMenu ? PURP : 'transparent',
              color: showAllMenu ? WHITE : PURP,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {showAllMenu ? '← Scroll View' : 'Grid View →'}
          </button>
        </div>

        {menuLoading && filteredItems.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(220px, 18vw, 280px), 1fr))', gap: 'clamp(10px, 1vw, 20px)' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 280,
                  borderRadius: 22,
                  background: 'rgba(255,255,255,.6)',
                  border: '1.5px solid rgba(124,77,204,.1)',
                }}
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{
              padding: '80px 0',
              textAlign: 'center',
              color: TL,
              fontSize: 13,
            }}
          >
            No items in this category yet.
          </div>
        ) : showAllMenu ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(220px, 18vw, 280px), 1fr))', gap: 'clamp(10px, 1vw, 20px)' }}>
            {filteredItems.map((item, idx) => renderMenuCard(item, idx, true))}
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="no-scrollbar"
            style={{ overflowX: 'auto', cursor: 'grab', userSelect: 'none', paddingBottom: 4 }}
            onMouseDown={onSliderMouseDown}
            onMouseUp={onSliderMouseUp}
            onMouseLeave={onSliderMouseUp}
            onMouseMove={onSliderMouseMove}
          >
            <div style={{ display: 'flex', gap: 12, width: 'max-content' }}>
              {filteredItems.map((item, idx) => renderMenuCard(item, idx, false))}
            </div>
          </div>
        )}
        </div>
      </section>

      <LandingFooter restaurant={restaurant} />
    </div>
  );
}
