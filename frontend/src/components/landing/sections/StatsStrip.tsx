// ── Stats / numbers strip — anchors the page after the hero/ticker.
// Numbers are mostly cosmetic placeholders, except the rating which uses
// real public-feedback data when available.

const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const PURP = '#7C4DCC';
const HEAD = '#2C2C2C';
const TL = '#888888';
const BG = '#FFFDE7';

interface StatsStripProps {
  publicRating?: { avgRating: number; total: number };
  menuItemCount?: number;
}

export default function StatsStrip({ publicRating, menuItemCount }: StatsStripProps) {
  const hasRating = !!(publicRating && publicRating.total > 0);

  const stats = [
    { value: '10K+', label: 'Happy Diners', color: PINK },
    {
      value: menuItemCount && menuItemCount > 0 ? `${menuItemCount}+` : 'Fresh',
      label: 'Seasonal Dishes',
      color: TEAL,
    },
    {
      value: hasRating ? publicRating!.avgRating.toFixed(1) : '★',
      label: hasRating ? `From ${publicRating!.total.toLocaleString()} reviews` : 'Guest-favourite',
      color: PURP,
    },
    { value: 'Daily', label: '8am – 10pm Service', color: PINK },
  ];

  return (
    <section
      style={{
        background: BG,
        padding: '36px 48px',
        borderBottom: '1px solid rgba(124,77,204,.08)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              padding: '8px 4px',
              borderRight: i < stats.length - 1 ? '1px solid rgba(124,77,204,.12)' : 'none',
            }}
          >
            <div
              className="font-barlow font-black"
              style={{
                fontSize: 44,
                lineHeight: 1,
                letterSpacing: '-1px',
                color: s.color,
                marginBottom: 6,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: HEAD,
                marginBottom: 2,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 10, color: TL }}>—</div>
          </div>
        ))}
      </div>
    </section>
  );
}
