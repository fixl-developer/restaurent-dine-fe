import { Heart, Shield, Sparkles, Smile, Coffee, Leaf, Compass } from 'lucide-react';
import { DECOR_IMAGES } from '../foodData';

const VALUES = [
  { icon: Leaf,    title: '100% Eco-Responsive',      body: 'Paper menus are wasteful and hard to update. Our QR menus eliminate printing entirely — guests browse on their phone instantly, and the menu updates in real time.' },
  { icon: Compass, title: 'Tactile Meal Customizer',   body: 'Guests can build their own meal with exact preferences — size, ingredients, sides, and sauces — with a live preview that updates as they choose.' },
  { icon: Shield,  title: 'Failsafe Kitchen Relay',    body: 'SmartDine synchronises orders instantly to kitchen KDS terminals. No missing tickets, no confusion. Safe delivery tracking keeps drivers and customers happy.' },
];

const WHY = [
  { icon: Sparkles, label: 'Clean, Approachable Design',    body: 'Our interface feels welcoming for both first-time guests and regulars — intuitive to navigate from the very first tap.' },
  { icon: Smile,    label: 'Delightfully Simple Pricing',   body: 'No transactional royalties. One small monthly flat subscription — you keep 100 % of your order profits.' },
  { icon: Coffee,   label: 'Loyalty Rewards Built-In',      body: 'Guests earn rewards with every purchase and redeem for free items at a milestone — no complicated points system.' },
];

export default function AboutProduct() {
  return (
    <div style={{ background: '#F4A5B0', minHeight: '100vh', padding: '28px 20px 60px' }}>

      {/* ── Page card ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', background: '#F0EAD2', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,.15)' }}>

        {/* ── Hero banner ── */}
        <div style={{ background: '#7D8F62', padding: '52px 48px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, opacity: 0.12, pointerEvents: 'none' }}>
            <img src={DECOR_IMAGES.decor3} style={{ width: '100%', height: '100%', objectFit: 'contain', animation: 'spin 24s linear infinite' }} alt="" />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 12 }}>
              Los Angeles · Est. 2026
            </p>
            <h1 className="font-barlow font-black uppercase text-white" style={{ fontSize: 52, lineHeight: 0.92, letterSpacing: '-1px', marginBottom: 18 }}>
              BUILT FOR<br />MODERN<br />RESTAURANTS.
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, maxWidth: 420 }}>
              SmartDine makes restaurant operations simpler and dining better — intuitive, fast, and beautiful for staff and guests alike.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '28px 24px', textAlign: 'center', minWidth: 180, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(244,165,176,.6)', margin: '0 auto 12px' }}>
              <img src={DECOR_IMAGES.foodPfp} alt="Founder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <p className="font-barlow font-black uppercase text-white" style={{ fontSize: 14, letterSpacing: '.5px', marginBottom: 2 }}>Anika Pannu</p>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#F4A5B0' }}>Founder · LA</span>
          </div>
        </div>

        {/* ── Values grid ── */}
        <div style={{ padding: '48px 48px 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} style={{ background: 'white', border: '1.5px solid rgba(26,26,26,.12)', borderRadius: 18, padding: '24px 20px', transition: 'border-color .2s, box-shadow .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#F4A5B0'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 18px rgba(244,165,176,.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(26,26,26,.12)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(244,165,176,.15)', border: '1.5px solid rgba(244,165,176,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon style={{ width: 18, height: 18, color: '#db2777' }} />
              </div>
              <h4 className="font-barlow font-black uppercase text-[#1a1a1a]" style={{ fontSize: 16, letterSpacing: '-.2px', marginBottom: 8 }}>{title}</h4>
              <p style={{ fontSize: 11, color: 'rgba(26,26,26,.55)', lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>

        {/* ── Why SmartDine ── */}
        <div style={{ padding: '36px 48px 52px' }}>
          <div style={{ background: '#1a1a1a', borderRadius: 20, padding: '40px 44px', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 12 }}>Our Mission</p>
              <h2 className="font-barlow font-black uppercase text-white" style={{ fontSize: 38, lineHeight: 0.95, letterSpacing: '-.5px', marginBottom: 18 }}>
                WHY<br />SMARTDINE?
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, fontStyle: 'italic' }}>
                "We wanted to build something that actually solves problems — fast ordering, clear kitchen communication, and easy reservations for any size restaurant."
              </p>
              <div style={{ marginTop: 20, width: 36, height: 3, background: '#F4A5B0', borderRadius: 2 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {WHY.map(({ icon: Icon, label, body }) => (
                <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(244,165,176,.15)', border: '1px solid rgba(244,165,176,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 16, height: 16, color: '#F4A5B0' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#F0EAD2', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(240,234,210,.5)', lineHeight: 1.65 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
