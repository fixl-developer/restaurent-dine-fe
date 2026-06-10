import { useState, useEffect, useRef } from 'react';
import {
  Zap, TrendingUp, Users, ShoppingBag, Star,
  ArrowRight, ChevronRight, Sparkles, Shield, Clock
} from 'lucide-react';

// ─── Decorative SVGs (same language as existing site) ──────────────────────

const Doodle4Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 26 26" className={className} fill="currentColor" aria-hidden>
    <path d="M13 0 L14.6 11.4 L26 13 L14.6 14.6 L13 26 L11.4 14.6 L0 13 L11.4 11.4 Z" />
  </svg>
);

const DoodleDots = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 38" className={className} fill="currentColor" aria-hidden>
    <circle cx="8" cy="10" r="4" /><circle cx="26" cy="6" r="3" />
    <circle cx="44" cy="12" r="4.5" /><circle cx="58" cy="7" r="2.5" />
    <circle cx="16" cy="28" r="3" /><circle cx="36" cy="30" r="4" /><circle cx="52" cy="26" r="2.5" />
  </svg>
);

// ─── Animated Counter ──────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', prefix = '', duration = 1800 }: {
  target: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
          else setCount(target);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

// ─── Stat cards ──────────────────────────────────────────────────────────────

const STATS = [
  { icon: Users,       label: 'Restaurants Onboarded',  value: 500,    suffix: '+',   prefix: '',   color: 'text-pink-600',    bg: 'bg-pink-50',    border: 'border-pink-100' },
  { icon: ShoppingBag, label: 'Orders Processed / mo',   value: 120000, suffix: '+',   prefix: '',   color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100' },
  { icon: TrendingUp,  label: 'Avg Revenue Increase',    value: 40,     suffix: '%',   prefix: '+',  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { icon: Star,        label: 'Customer Satisfaction',   value: 98,     suffix: '%',   prefix: '',   color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  { icon: Zap,         label: 'Platform Uptime',         value: 99.9,   suffix: '%',   prefix: '',   color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  { icon: Clock,       label: 'Avg Order Setup Time',    value: 3,      suffix: ' min',prefix: '<',  color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-100' },
];

// ─── Main component ──────────────────────────────────────────────────────────

export default function PlatformBanner() {
  return (
    <>
      {/* ── Divider: Powered by SmartDine ───────────────────────────────── */}
      <section className="relative bg-neutral-950 overflow-hidden py-24 md:py-32 px-4">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #f9a8d4 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        {/* Pink glow blobs */}
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-pink-500/8 blur-3xl pointer-events-none" />

        <Doodle4Star className="absolute top-8 left-8 w-6 h-6 text-pink-500/30 pointer-events-none hidden md:block" />
        <Doodle4Star className="absolute bottom-8 right-12 w-8 h-8 text-pink-500/20 pointer-events-none hidden md:block" />
        <DoodleDots  className="absolute top-1/2 right-6 -translate-y-1/2 w-32 h-20 text-pink-900/40 pointer-events-none hidden lg:block" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-pink-600/15 border border-pink-500/30 text-pink-300 text-[10px] font-mono uppercase tracking-[0.25em] px-4 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            Complete Restaurant Management Platform
          </div>

          {/* Headline */}
          <h2 className="text-5xl md:text-7xl font-display text-white leading-none">
            Run Your Restaurant<br />
            <span className="text-pink-400">Smarter</span>
          </h2>

          {/* Subtext */}
          <p className="text-[16px] text-neutral-400 max-w-2xl mx-auto leading-relaxed font-script">
            SmartDine gives every restaurant — from solo cafés to multi-outlet chains — the tools to delight customers, empower kitchen teams, and grow revenue without complexity.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#demo"
              onClick={e => {
                e.preventDefault();
                document.getElementById('demo-request')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-mono uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-pink-900/40 group cursor-pointer"
            >
              Request Free Demo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#features"
              onClick={e => {
                e.preventDefault();
                document.getElementById('platform-features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-[11px] font-mono uppercase tracking-[0.2em] rounded-xl transition-all cursor-pointer"
            >
              Explore Features
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-500" /> PCI-DSS Compliant</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500" /> 3-minute setup</span>
            <span className="flex items-center gap-1.5"><Star className="w-3 h-3 text-pink-400" /> No credit card required</span>
          </div>
        </div>
      </section>

      {/* ── Stats ribbon ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-neutral-100 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 mb-10">
            Trusted by restaurants across India &amp; South-East Asia
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATS.map(({ icon: Icon, label, value, suffix, prefix, color, bg, border }) => (
              <div
                key={label}
                className={`group rounded-2xl border ${border} ${bg} p-5 text-center hover:shadow-md transition-all hover:-translate-y-0.5 cursor-default`}
              >
                <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: '18px', height: '18px' }} />
                </div>
                <p className={`text-[22px] font-black font-mono ${color} leading-none`}>
                  <AnimatedCounter target={value} suffix={suffix} prefix={prefix} />
                </p>
                <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 mt-1.5 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
