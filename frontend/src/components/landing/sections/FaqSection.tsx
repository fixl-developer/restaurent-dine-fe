import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const HEAD = '#2C2C2C';
const TL = '#888888';
const TX = '#4A4A4A';
const WHITE = '#FFFFFF';
const BG = '#FFE8EE';

const FAQS = [
  {
    q: 'Do I need a reservation?',
    a: 'Walk-ins are welcome for groups of 1–3, but we recommend booking ahead for groups of 4 or more — especially on weekends. Book a table from the Reserve page.',
  },
  {
    q: 'Are vegan and gluten-free options available?',
    a: 'Yes — every section of our menu has vegan and gluten-free dishes, clearly marked. Tell your server about any allergies and our kitchen will adapt where possible.',
  },
  {
    q: 'Can I order online for pickup or delivery?',
    a: 'Pickup orders are available through the Menu page — just add items to your cart and check out. For delivery, we partner with major apps; check Google Maps for live options.',
  },
  {
    q: 'Do you host private events?',
    a: 'Absolutely. We host birthdays, brand launches, and small weddings on our patio and indoor lounge. Email events@ for a custom quote.',
  },
  {
    q: 'Is the café dog-friendly?',
    a: 'Our patio is fully dog-friendly — water bowls and treats on the house. Indoor seating is reserved for service animals only.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Card, UPI, Apple Pay, and cash. Split bills welcomed up to 4 ways per table.',
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section style={{
      background: BG,
      width: '100%'
    }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(32px, 56px, 72px)',
          alignItems: 'flex-start',
          width: '100%',
          padding: 'clamp(32px, 72px, 88px) clamp(12px, 5vw, 56px)',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ position: 'sticky', top: 96 }}>
          <p className="font-script" style={{ fontSize: 'clamp(13px, 16px, 18px)', color: TEAL, marginBottom: 4 }}>
            curious? ♡
          </p>
          <h2
            className="font-barlow font-black uppercase"
            style={{
              fontSize: 'clamp(32px, 44px, 52px)',
              letterSpacing: '-0.5px',
              lineHeight: 1,
              color: HEAD,
              marginBottom: 14,
            }}
          >
            FREQUENTLY
            <br />
            ASKED
          </h2>
          <p style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, lineHeight: 1.7 }}>
            Everything you wanted to know about visiting, ordering, and dining with us — in one place.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  background: WHITE,
                  borderRadius: 16,
                  border: `1.5px solid ${isOpen ? PINK : 'rgba(124,77,204,.08)'}`,
                  overflow: 'hidden',
                  transition: 'border-color .2s ease',
                }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left bg-transparent border-none cursor-pointer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: 'clamp(14px, 18px, 24px) clamp(16px, 22px, 28px)',
                    fontFamily: 'inherit',
                  }}
                >
                  <span
                    className="font-barlow"
                    style={{
                      fontSize: 'clamp(13px, 14px, 16px)',
                      fontWeight: 700,
                      color: HEAD,
                      letterSpacing: '-0.1px',
                    }}
                  >
                    {faq.q}
                  </span>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isOpen ? PINK : 'rgba(124,77,204,.08)',
                      color: isOpen ? WHITE : PINK,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all .2s ease',
                    }}
                  >
                    {isOpen ? <Minus style={{ width: 14, height: 14 }} /> : <Plus style={{ width: 14, height: 14 }} />}
                  </div>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 clamp(16px, 22px, 28px) clamp(14px, 20px, 24px)',
                      fontSize: 'clamp(11px, 12px, 14px)',
                      color: TX,
                      lineHeight: 1.75,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
