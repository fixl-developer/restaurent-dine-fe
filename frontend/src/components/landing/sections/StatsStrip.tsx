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
        borderBottom: '1px solid rgba(124,77,204,.08)',
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'clamp(16px, 24px, 32px)',
          width: '100%',
          padding: 'clamp(24px, 36px, 48px) clamp(12px, 5vw, 56px)',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              padding: 'clamp(6px, 8px, 12px) clamp(2px, 4px, 8px)',
              borderRight: i < stats.length - 1 ? '1px solid rgba(124,77,204,.12)' : 'none',
            }}
          >
            <div
              className="font-barlow font-black"
              style={{
                fontSize: 'clamp(32px, 44px, 56px)',
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
                fontSize: 'clamp(9px, 10px, 12px)',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: HEAD,
                marginBottom: 2,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 'clamp(9px, 10px, 12px)', color: TL }}>—</div>
          </div>
        ))}
      </div>
    </section>
  );
}
