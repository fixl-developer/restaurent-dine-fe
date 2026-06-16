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
    <section style={{ background: BG, padding: '64px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 36,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <p className="font-script" style={{ fontSize: 16, color: TEAL, marginBottom: 4 }}>
              what guests love most ♡
            </p>
            <h2
              className="font-barlow font-black uppercase"
              style={{ fontSize: 48, letterSpacing: '-0.5px', lineHeight: 1, color: HEAD }}
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
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '13px 26px',
              borderRadius: 100,
            }}
          >
            See Full Menu
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {picks.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => navigate('/menu')}
              style={{
                background: WHITE,
                borderRadius: 24,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1.5px solid rgba(124,77,204,.1)',
                transition: 'transform .25s ease, box-shadow .25s ease',
                display: 'flex',
                flexDirection: 'column',
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
              <div
                style={{
                  position: 'relative',
                  height: 220,
                  background: '#FFE8EE',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={item.image || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {item.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 14,
                      left: 14,
                      background: PINK,
                      color: WHITE,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      padding: '5px 12px',
                      borderRadius: 100,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <div style={{ padding: '20px 22px 22px' }}>
                <h3
                  className="font-barlow font-black uppercase"
                  style={{
                    fontSize: 22,
                    letterSpacing: '-0.3px',
                    lineHeight: 1.05,
                    color: HEAD,
                    marginBottom: 6,
                  }}
                >
                  {item.name}
                </h3>
                {item.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: TL,
                      lineHeight: 1.6,
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description}
                  </p>
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span className="font-barlow font-black" style={{ fontSize: 22, color: TEAL }}>
                    ${item.price.toFixed(2)}
                  </span>
                  {item.calories ? (
                    <span
                      style={{
                        fontSize: 10,
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
