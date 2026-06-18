import { useNavigate } from 'react-router-dom';
import type { MenuItem } from '../../../types';
import { FOOD_IMAGES } from '../../../foodData';

const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const HEAD = '#2C2C2C';
const TL = '#888888';
const WHITE = '#FFFFFF';
const BG = '#F5F0FF';

const FALLBACK_IMAGES = [FOOD_IMAGES.salad, FOOD_IMAGES.cake, FOOD_IMAGES.noodles];

interface FeaturedDishesProps {
  menuItems: MenuItem[];
}

export default function FeaturedDishes({ menuItems }: FeaturedDishesProps) {
  const navigate = useNavigate();

  if (menuItems.length === 0) return null;

  // Pick 3: prefer items with badges (POPULAR / NEW), then fill with the rest.
  const badged = menuItems.filter((m) => m.badge);
  const others = menuItems.filter((m) => !m.badge);
  const picks = [...badged, ...others].slice(0, 3);

  return (
    <section style={{
      background: BG,
      padding: 0,
      width: '100%'
    }}>
      <div style={{
        width: '100%',
        padding: 'clamp(32px, 64px, 80px) clamp(12px, 5vw, 56px)',
        maxWidth: '1400px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {/* Header with Title & Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 'clamp(20px, 36px, 48px)',
            flexWrap: 'wrap',
            gap: 'clamp(12px, 16px, 24px)',
          }}
        >
          <div>
            <p className="font-script" style={{ fontSize: 'clamp(13px, 16px, 18px)', color: TEAL, marginBottom: 4 }}>
              what guests love most ♡
            </p>
            <h2
              className="font-barlow font-black uppercase"
              style={{ fontSize: 'clamp(32px, 48px, 56px)', letterSpacing: '-0.5px', lineHeight: 1, color: HEAD }}
            >
              FEATURED DISHES
            </h2>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="cursor-pointer border-none transition-opacity hover:opacity-80"
            style={{
              background: PINK,
              color: WHITE,
              fontSize: 'clamp(9px, 10px, 12px)',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: 'clamp(10px, 13px, 16px) clamp(18px, 26px, 32px)',
              borderRadius: 100,
              whiteSpace: 'nowrap',
            }}
          >
            See Full Menu
          </button>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 30vw, 380px), 1fr))',
          gap: 'clamp(12px, 3vw, 24px)',
        }}>
          {picks.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => navigate('/menu')}
              style={{
                background: WHITE,
                borderRadius: 'clamp(16px, 5vw, 24px)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1.5px solid rgba(124,77,204,.1)',
                transition: 'transform .25s ease, box-shadow .25s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 16px 40px rgba(124,77,204,.18)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              {/* Image Container */}
              <div
                style={{
                  position: 'relative',
                  height: 'clamp(160px, 40vw, 240px)',
                  background: '#FFE8EE',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={item.image || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Badge */}
                {item.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 'clamp(10px, 3vw, 14px)',
                      left: 'clamp(10px, 3vw, 14px)',
                      background: PINK,
                      color: WHITE,
                      fontSize: 'clamp(7px, 2vw, 9px)',
                      fontWeight: 800,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      padding: 'clamp(4px, 1.5vw, 5px) clamp(8px, 2vw, 12px)',
                      borderRadius: 100,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: 'clamp(14px, 4vw, 22px)', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 12px)', flex: 1 }}>
                {/* Title */}
                <h3
                  className="font-barlow font-black uppercase"
                  style={{
                    fontSize: 'clamp(16px, 4vw, 22px)',
                    letterSpacing: '-0.3px',
                    lineHeight: 1.1,
                    color: HEAD,
                    margin: 0,
                  }}
                >
                  {item.name}
                </h3>

                {/* Description */}
                {item.description && (
                  <p
                    style={{
                      fontSize: 'clamp(10px, 2.5vw, 12px)',
                      color: TL,
                      lineHeight: 1.6,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description}
                  </p>
                )}

                {/* Price & Calories */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: 'clamp(8px, 2vw, 12px)',
                    borderTop: '1px solid rgba(124,77,204,.08)',
                  }}
                >
                  <span
                    className="font-barlow font-black"
                    style={{
                      fontSize: 'clamp(16px, 4vw, 22px)',
                      color: TEAL,
                      margin: 0,
                    }}
                  >
                    ${item.price.toFixed(2)}
                  </span>
                  {item.calories ? (
                    <span
                      style={{
                        fontSize: 'clamp(8px, 2vw, 10px)',
                        fontWeight: 600,
                        color: TL,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.calories} kcal
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
