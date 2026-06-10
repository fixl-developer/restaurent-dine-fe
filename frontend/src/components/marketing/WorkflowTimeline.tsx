import { useState, useEffect, useRef } from 'react';
import {
  QrCode, UtensilsCrossed, ShoppingBag,
  ChefHat, Bell, Sparkles
} from 'lucide-react';
import cakeImg from '../../assets/images/cake.jpg';
import oatsImg from '../../assets/images/oats.jpg';
import saladImg from '../../assets/images/salad.jpg';

// ─── Decorative SVGs ──────────────────────────────────────────────────────────

const DoodleLeaf = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 26 44" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M13 42 Q4 28 7 14 C11 3 21 5 21 16 Q20 29 13 42Z" />
    <line x1="13" y1="42" x2="13" y2="15" />
    <line x1="13" y1="24" x2="18" y2="19" />
    <line x1="13" y1="32" x2="9"  y2="27" />
  </svg>
);
const DoodleSparkle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 26 26" className={className} fill="currentColor" aria-hidden>
    <path d="M13 0 L14.6 11.4 L26 13 L14.6 14.6 L13 26 L11.4 14.6 L0 13 L11.4 11.4 Z" />
  </svg>
);
const DoodleDots = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 38" className={className} fill="currentColor" aria-hidden>
    <circle cx="8"  cy="10" r="4" /><circle cx="26" cy="6"  r="3" />
    <circle cx="44" cy="12" r="4.5" /><circle cx="58" cy="7" r="2.5" />
    <circle cx="16" cy="28" r="3" /><circle cx="36" cy="30" r="4" /><circle cx="52" cy="26" r="2.5" />
  </svg>
);
const FoodCircle = ({ src, className }: { src: string; className?: string }) => (
  <div className={`rounded-full overflow-hidden shadow-md border-2 border-pink-200 pointer-events-none select-none ${className}`} aria-hidden>
    <img src={src} alt="" className="w-full h-full object-cover" />
  </div>
);

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { icon: QrCode,          title: 'Scan QR',          line: 'Opens on any phone' },
  { icon: UtensilsCrossed, title: 'Browse Menu',       line: 'Photos & filters'   },
  { icon: ShoppingBag,     title: 'Place Order',       line: 'Customise & confirm' },
  { icon: Bell,            title: 'Kitchen Notified',  line: 'Live on KDS'         },
  { icon: ChefHat,         title: 'Chef Prepares',     line: 'Status tracked live' },
  { icon: Sparkles,        title: 'Served & Billed',   line: 'One-tap payment'     },
];

export default function WorkflowTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const id = setInterval(() => setActiveStep(s => (s + 1) % STEPS.length), 2000);
    return () => clearInterval(id);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#FFFDF9] border-b border-pink-100 py-10 md:py-14 px-4 overflow-hidden"
    >
      {/* Doodles */}
      <DoodleLeaf    className="absolute top-4  left-5  w-14 h-22 text-pink-400 pointer-events-none hidden sm:block" />
      <DoodleSparkle className="absolute top-6  right-8 w-8  h-8  text-pink-400 pointer-events-none hidden sm:block" />
      <DoodleDots    className="absolute bottom-4 left-6  w-36 h-20 text-pink-300 pointer-events-none hidden md:block" />
      <DoodleDots    className="absolute bottom-3 right-5 w-28 h-16 text-pink-300 pointer-events-none hidden md:block" />
      <DoodleSparkle className="absolute bottom-6 right-4 w-6  h-6  text-pink-400 pointer-events-none hidden sm:block" />

      {/* Food circles */}
      <FoodCircle src={cakeImg}  className="absolute -top-8  -right-10 w-64 h-64 hidden lg:block" />
      <FoodCircle src={saladImg} className="absolute -bottom-8 -left-10 w-56 h-56 hidden lg:block" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Heading only — no label, no subtitle */}
        <h2 className="text-5xl md:text-6xl font-script text-neutral-950 text-center mb-8">
          From Scan to Served
        </h2>

        {/* Desktop: horizontal row */}
        <div className="hidden md:block">
          <div className="relative mb-4">
            <div className="absolute top-6 left-[8%] right-[8%] h-px bg-pink-200" />
            <div
              className="absolute top-6 left-[8%] h-px bg-pink-500 transition-all duration-700"
              style={{ width: `${(activeStep / (STEPS.length - 1)) * 84}%` }}
            />
            <div className="flex justify-between relative">
              {STEPS.map((step, i) => {
                const Icon  = step.icon;
                const done   = i < activeStep;
                const active = i === activeStep;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                    style={{ width: `${100 / STEPS.length}%` }}
                  >
                    <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 z-10 relative shadow-sm
                      ${active
                        ? 'bg-pink-600 border-pink-600 scale-110 shadow-md shadow-pink-200'
                        : done
                          ? 'bg-pink-100 border-pink-300'
                          : 'bg-white/70 border-pink-200 group-hover:border-pink-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : done ? 'text-pink-400' : 'text-neutral-400 group-hover:text-pink-400'}`} />
                    </div>
                    <p className={`text-[10px] font-mono uppercase tracking-wider text-center leading-snug transition-all
                      ${active ? 'text-pink-700 font-bold' : done ? 'text-pink-400' : 'text-neutral-500'}`}
                    >
                      {step.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active step one-liner */}
          <div
            key={activeStep}
            className="bg-white/60 rounded-xl border border-pink-200 px-6 py-3 text-center"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <p className="text-[15px] font-script text-neutral-600">{STEPS[activeStep].line}</p>
          </div>

          {/* Dot nav */}
          <div className="flex justify-center gap-2 mt-4">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeStep ? 'bg-pink-500 w-5' : 'bg-pink-200 w-1.5 hover:bg-pink-400'}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-0">
          {STEPS.map((step, i) => {
            const Icon  = step.icon;
            const active = i === activeStep;
            const done   = i < activeStep;
            return (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className="w-full flex items-center gap-3 py-2.5 text-left"
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all
                    ${active ? 'bg-pink-600 border-pink-600' : done ? 'bg-pink-100 border-pink-300' : 'bg-white/70 border-pink-200'}`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : done ? 'text-pink-400' : 'text-neutral-400'}`} />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-px mt-0.5 min-h-[16px] ${done ? 'bg-pink-300' : 'bg-pink-200'}`} />
                  )}
                </div>
                <div>
                  <p className={`text-[13px] font-semibold ${active ? 'text-pink-700' : done ? 'text-pink-400' : 'text-neutral-500'}`}>{step.title}</p>
                  {active && <p className="text-[12px] font-script text-neutral-600 mt-0.5">{step.line}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
