import { useEffect, useState } from 'react';

type Phase = 'entering' | 'visible' | 'exiting';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('entering');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 120);
    // Curtain lifts just after the 7 s progress bar completes
    const t2 = setTimeout(() => setPhase('exiting'), 7200);
    // Unmount after curtain clears (~0.95 s)
    const t3 = setTimeout(onDone, 8250);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const logoIn    = phase !== 'entering';
  const curtainUp = phase === 'exiting';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        /* Radial gradient gives a slightly brighter centre — natural focal point */
        background: 'radial-gradient(ellipse at center, #ffd6e7 0%, #FFF0F6 55%, #ffe0ee 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        /* Curtain lifts straight up */
        transform: curtainUp ? 'translateY(-100%)' : 'translateY(0)',
        transition: curtainUp
          ? 'transform 0.95s cubic-bezier(0.76, 0, 0.24, 1)'
          : 'none',
        overflow: 'hidden',
      }}
    >

      {/* ── Decorative corner dashes ───────────────────────────────────────── */}
      {[
        { top: 32, left: 32 },
        { top: 32, right: 32 },
        { bottom: 32, left: 32 },
        { bottom: 32, right: 32 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', ...pos,
            width: 40, height: 40,
            opacity: logoIn ? 0.35 : 0,
            transition: `opacity 0.6s ease ${0.3 + i * 0.08}s`,
          }}
        >
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 36 L4 4 L36 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      ))}

      {/* ── Soft outer ring that pulses ────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          width: 340, height: 340,
          borderRadius: '50%',
          border: '1px solid rgba(27,200,200,0.4)',
          opacity: logoIn ? 1 : 0,
          transform: logoIn ? 'scale(1)' : 'scale(0.7)',
          transition: 'opacity 1s ease 0.5s, transform 1s ease 0.5s',
          animation: logoIn ? 'splash-pulse 2.5s ease-in-out infinite 1s' : 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 280, height: 280,
          borderRadius: '50%',
          border: '1px solid rgba(232,68,122,0.25)',
          opacity: logoIn ? 1 : 0,
          transition: 'opacity 0.9s ease 0.4s',
        }}
      />

      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 20,
          opacity: logoIn ? 1 : 0,
          transform: logoIn
            ? 'translateY(0) scale(1)'
            : 'translateY(28px) scale(0.82)',
          transition: logoIn
            ? 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.34, 1.38, 0.64, 1)'
            : 'none',
        }}
      >
        {/* Pinky Promise brand stamp — inline SVG, no external file needed */}
        <div style={{
          borderRadius: '50%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 8px rgba(255,255,255,0.5)',
          lineHeight: 0,
        }}>
          <svg
            width="220" height="220"
            viewBox="0 0 96 96"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White fill + pink outer ring */}
            <circle cx="48" cy="48" r="47" fill="white" />
            <circle cx="48" cy="48" r="45.5" fill="none" stroke="#FF1B8D" strokeWidth="3" />
            {/* Teal inner ring */}
            <circle cx="48" cy="48" r="39" fill="none" stroke="#1BC8C8" strokeWidth="1.5" />
            {/* "Pinky" */}
            <text x="48" y="33" textAnchor="middle" fontFamily="Dancing Script, cursive" fontSize="21" fontWeight="700" fill="#FF1B8D">Pinky</text>
            {/* Heart */}
            <text x="67" y="25" textAnchor="middle" fontSize="8" fill="#CC0044">♥</text>
            {/* "promise" */}
            <text x="48" y="46" textAnchor="middle" fontFamily="Dancing Script, cursive" fontSize="17" fontWeight="600" fill="#1BC8C8">promise</text>
            {/* Divider dashes */}
            <text x="48" y="56" textAnchor="middle" fontFamily="sans-serif" fontSize="5.5" fill="#1BC8C8" letterSpacing="0.3">— cafe &amp; Restaurant —</text>
            {/* Venice Beach */}
            <text x="48" y="65" textAnchor="middle" fontFamily="sans-serif" fontSize="5.5" fontWeight="700" fill="#FF1B8D">♡ Venice Beach ♡</text>
            {/* TM */}
            <text x="48" y="76" textAnchor="middle" fontFamily="sans-serif" fontSize="4.5" fill="rgba(0,0,0,0.25)" letterSpacing="1">™</text>
          </svg>
        </div>

        {/* Expanding line */}
        <div style={{
          height: 1.5,
          width: logoIn ? 110 : 0,
          background: 'rgba(26,26,26,0.25)',
          borderRadius: 2,
          transition: 'width 0.55s ease 0.45s',
        }} />

        {/* Tagline — dark for contrast on pink */}
        <div
          style={{
            opacity: logoIn ? 1 : 0,
            transition: 'opacity 0.5s ease 0.65s',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '3.5px',
            textTransform: 'uppercase',
            color: 'rgba(26,26,26,0.6)',
            fontFamily: '"Barlow Condensed", sans-serif',
          }}
        >
          Venice Beach · Est. 2026
        </div>
      </div>

      {/* ── Progress bar — bottom edge, fills over exactly 7 s ────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 4,
        background: 'rgba(232,68,122,0.15)',
      }}>
        <div style={{
          height: '100%',
          width: '0%',
          background: '#E8447A',
          borderRadius: '0 2px 2px 0',
          animation: 'splash-progress 7s linear forwards',
        }} />
      </div>

    </div>
  );
}
