// ── "As Featured In" press logo strip — credibility builder after reviews.
// Logos are styled text placeholders for now; swap to real wordmark SVGs
// once partnerships ship.

const PINK = '#E8447A';
const HEAD = '#2C2C2C';
const TL = '#888888';
const WHITE = '#FFFFFF';

const PRESS = [
  { name: 'VOGUE', font: 'Lora' },
  { name: 'Eater LA', font: 'Lora' },
  { name: 'LA TIMES', font: 'Barlow' },
  { name: 'Time Out', font: 'Lora' },
  { name: 'CONDÉ NAST', font: 'Barlow' },
  { name: 'Bon Appétit', font: 'Lora' },
];

export default function PressStrip() {
  return (
    <section
      style={{
        background: WHITE,
        borderTop: '1px solid rgba(124,77,204,.08)',
        borderBottom: '1px solid rgba(124,77,204,.08)',
        width: '100%'
      }}
    >
      <div style={{
        textAlign: 'center',
        width: '100%',
        padding: 'clamp(32px, 52px, 64px) clamp(12px, 5vw, 56px)',
        maxWidth: '1400px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <p
          style={{
            fontSize: 'clamp(9px, 10px, 12px)',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: PINK,
            marginBottom: 8,
          }}
        >
          As Featured In
        </p>
        <h3
          className="font-barlow font-black uppercase"
          style={{
            fontSize: 'clamp(20px, 26px, 32px)',
            letterSpacing: '-0.3px',
            color: HEAD,
            marginBottom: 'clamp(16px, 28px, 36px)',
          }}
        >
          People are talking.
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(16px, 28px, 40px)',
            flexWrap: 'wrap',
            opacity: 0.7,
          }}
        >
          {PRESS.map((p) => (
            <span
              key={p.name}
              style={{
                fontFamily: p.font === 'Lora' ? '"Lora", serif' : '"Barlow", sans-serif',
                fontSize: 'clamp(16px, 22px, 28px)',
                fontWeight: 900,
                letterSpacing: p.font === 'Barlow' ? '2px' : '0',
                textTransform: p.font === 'Barlow' ? 'uppercase' : 'none',
                color: TL,
                fontStyle: p.font === 'Lora' ? 'italic' : 'normal',
              }}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
