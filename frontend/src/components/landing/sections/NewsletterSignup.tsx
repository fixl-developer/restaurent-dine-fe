import { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const PURP = '#7C4DCC';
const HEAD = '#2C2C2C';
const TX = '#4A4A4A';
const TL = '#888888';
const WHITE = '#FFFFFF';
const BG = '#FFFDE7';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setStatus('submitting');
    // Placeholder: backend /newsletter/subscribe endpoint not built yet.
    // Simulate a network call so the UI feels responsive; replace with real
    // hook once backend lands.
    await new Promise((r) => setTimeout(r, 600));
    setStatus('done');
    toast.success(`Subscribed — see you in your inbox, ${email.split('@')[0]}!`);
  };

  return (
    <section style={{ background: BG, padding: '72px 48px' }}>
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          background: WHITE,
          borderRadius: 28,
          padding: '44px 40px',
          border: '1.5px solid rgba(124,77,204,.1)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: `${PINK}14`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: `${TEAL}14`,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: `${PURP}1A`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <Mail style={{ width: 26, height: 26, color: PURP }} />
          </div>

          <p className="font-script" style={{ fontSize: 16, color: TEAL, marginBottom: 2 }}>
            stay in the loop ♡
          </p>
          <h2
            className="font-barlow font-black uppercase"
            style={{
              fontSize: 36,
              letterSpacing: '-0.5px',
              lineHeight: 1.05,
              color: HEAD,
              marginBottom: 10,
            }}
          >
            SEASONAL SPECIALS
            <br />
            STRAIGHT TO YOUR INBOX
          </h2>
          <p style={{ fontSize: 12, color: TL, maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.7 }}>
            New dishes, secret events, and the occasional first-look discount. No spam — we cook
            instead.
          </p>

          {status === 'done' ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 26px',
                background: `${TEAL}1A`,
                border: `1.5px solid ${TEAL}`,
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 700,
                color: TEAL,
                letterSpacing: '1px',
              }}
            >
              <Check style={{ width: 16, height: 16 }} />
              You're on the list!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                gap: 8,
                maxWidth: 460,
                margin: '0 auto',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1,
                  minWidth: 200,
                  background: WHITE,
                  border: '1.5px solid rgba(44,44,44,.18)',
                  borderRadius: 100,
                  padding: '12px 20px',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                  color: TX,
                  fontWeight: 500,
                }}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="cursor-pointer border-none transition-opacity hover:opacity-80 disabled:opacity-60"
                style={{
                  background: PINK,
                  color: WHITE,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  padding: '13px 26px',
                  borderRadius: 100,
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                    Subscribing…
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
