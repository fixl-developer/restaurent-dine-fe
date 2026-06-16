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
        padding: '52px 48px',
        borderTop: '1px solid rgba(124,77,204,.08)',
        borderBottom: '1px solid rgba(124,77,204,.08)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p
          style={{
            fontSize: 10,
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
            fontSize: 26,
            letterSpacing: '-0.3px',
            color: HEAD,
            marginBottom: 28,
          }}
        >
          People are talking.
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 28,
            flexWrap: 'wrap',
            opacity: 0.7,
          }}
        >
          {PRESS.map((p) => (
            <span
              key={p.name}
              style={{
                fontFamily: p.font === 'Lora' ? '"Lora", serif' : '"Barlow", sans-serif',
                fontSize: 22,
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
