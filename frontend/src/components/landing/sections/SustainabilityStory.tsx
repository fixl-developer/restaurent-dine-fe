import { Leaf, Sprout, Heart } from 'lucide-react';

const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const PURP = '#7C4DCC';
const HEAD = '#2C2C2C';
const TL = '#888888';
const WHITE = '#FFFFFF';
const BG = '#E8F5E9';

const PILLARS = [
  {
    icon: Leaf,
    color: TEAL,
    title: 'LOCAL FARMS',
    body: 'Every leaf, root, and berry is sourced within 80 miles. We know our farmers by name.',
  },
  {
    icon: Sprout,
    color: PURP,
    title: 'ORGANIC PRODUCE',
    body: 'Certified-organic ingredients, no pesticides — the way food was meant to taste.',
  },
  {
    icon: Heart,
    color: PINK,
    title: 'ZERO WASTE',
    body: 'Compost programs, reusable packaging, and a kitchen that gives leftovers a second life.',
  },
];

export default function SustainabilityStory() {
  return (
    <section style={{ background: BG, padding: '72px 48px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p className="font-script" style={{ fontSize: 16, color: PINK, marginBottom: 4 }}>
            from farm to your table ♡
          </p>
          <h2
            className="font-barlow font-black uppercase"
            style={{ fontSize: 48, letterSpacing: '-0.5px', lineHeight: 1, color: HEAD, marginBottom: 12 }}
          >
            ROOTED IN OUR
            <br />
            COMMUNITY
          </h2>
          <p style={{ fontSize: 13, color: TL, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            Good food starts with good sourcing. We partner with neighbourhood farms, compost what we
            can't serve, and keep our kitchen kinder to the planet — without ever compromising on flavour.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                style={{
                  background: WHITE,
                  borderRadius: 22,
                  padding: '32px 28px',
                  border: '1.5px solid rgba(124,77,204,.08)',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: `${p.color}1A`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                  }}
                >
                  <Icon style={{ width: 26, height: 26, color: p.color }} />
                </div>
                <h3
                  className="font-barlow font-black uppercase"
                  style={{
                    fontSize: 18,
                    letterSpacing: '-0.2px',
                    color: HEAD,
                    marginBottom: 10,
                  }}
                >
                  {p.title}
                </h3>
                <p style={{ fontSize: 12, color: TL, lineHeight: 1.7, margin: 0 }}>{p.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
