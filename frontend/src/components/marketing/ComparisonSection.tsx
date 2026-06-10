import { Check, X, Minus, Star, Quote } from 'lucide-react';

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

// ─── Comparison Table ─────────────────────────────────────────────────────────

type CellValue = true | false | 'partial' | string;

interface CompRow {
  feature: string;
  category?: string;
  traditional: CellValue;
  smartdine: CellValue;
  enterprise: CellValue;
}

const COMP_ROWS: CompRow[] = [
  { feature: 'Customer-facing QR Ordering',        category: 'Ordering',   traditional: false,   smartdine: true,           enterprise: true },
  { feature: 'No app download required',            traditional: false,   smartdine: true,           enterprise: false },
  { feature: 'Dine-in & Takeaway in one flow',      traditional: 'partial', smartdine: true,         enterprise: 'partial' },
  { feature: 'Real-time order tracking for guests', traditional: false,   smartdine: true,           enterprise: true },
  { feature: 'Kitchen Display System (KDS)',         category: 'Kitchen',  traditional: 'partial', smartdine: true,           enterprise: true },
  { feature: 'Urgency timer & allergy alerts',      traditional: false,   smartdine: true,           enterprise: 'partial' },
  { feature: 'Digital GST invoices',                category: 'Billing',  traditional: false,   smartdine: true,           enterprise: true },
  { feature: 'UPI / Cash / Card / Split bill',      traditional: 'partial', smartdine: true,         enterprise: true },
  { feature: 'Built-in inventory management',       category: 'Operations', traditional: 'partial', smartdine: true,         enterprise: true },
  { feature: 'Live floor plan & table operations',  traditional: false,   smartdine: true,           enterprise: 'partial' },
  { feature: 'Customer loyalty & stamp cards',      category: 'CRM',      traditional: false,   smartdine: true,           enterprise: 'partial' },
  { feature: 'Built-in coupon & discount engine',   traditional: false,   smartdine: true,           enterprise: true },
  { feature: 'Revenue & analytics dashboard',       category: 'Analytics',traditional: false,   smartdine: true,           enterprise: true },
  { feature: 'Per-dish profitability reports',      traditional: false,   smartdine: true,           enterprise: true },
  { feature: 'Setup in under 3 minutes',            category: 'Platform', traditional: false,   smartdine: true,           enterprise: false },
  { feature: 'No per-transaction fees',             traditional: false,   smartdine: true,           enterprise: false },
  { feature: 'Flat monthly pricing',                traditional: false,   smartdine: true,           enterprise: false },
];

function Cell({ value, isSmartDine }: { value: CellValue; isSmartDine?: boolean }) {
  if (value === true)      return <div className="flex justify-center"><Check className={`w-4.5 h-4.5 ${isSmartDine ? 'text-pink-600' : 'text-emerald-500'}`} style={{ width: 18, height: 18 }} /></div>;
  if (value === false)     return <div className="flex justify-center"><X className="w-4 h-4 text-neutral-300" /></div>;
  if (value === 'partial') return <div className="flex justify-center"><Minus className="w-4 h-4 text-neutral-400" /></div>;
  return <span className="text-[11px] text-neutral-600 text-center block">{value}</span>;
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "We launched QR ordering in a single afternoon. Within a week, our average order value jumped 62% — customers kept adding items they might have skipped when ordering through a waiter.",
    author: 'Kavitha R.',
    role: 'Owner',
    restaurant: 'The Chai Room, Bengaluru',
    metric: '+62% avg order value',
    metricColor: 'text-emerald-600',
    metricBg: 'bg-emerald-50',
    metricBorder: 'border-emerald-200',
    stars: 5,
  },
  {
    quote: "Before SmartDine, our kitchen was chaos — paper chits everywhere and confused orders. The KDS solved it overnight. Our chefs say it's the single best change we've ever made.",
    author: 'Arjun M.',
    role: 'Head Chef & Co-founder',
    restaurant: 'Spice Garden, Pune',
    metric: '40% fewer order errors',
    metricColor: 'text-blue-600',
    metricBg: 'bg-blue-50',
    metricBorder: 'border-blue-200',
    stars: 5,
  },
  {
    quote: "The analytics alone are worth it. I finally know which dishes to promote, when to staff more people, and which items I should drop. Our profits are up 28% in three months.",
    author: 'Priya S.',
    role: 'Founder',
    restaurant: 'Bake & Brew, Mumbai',
    metric: '+28% net profit',
    metricColor: 'text-violet-600',
    metricBg: 'bg-violet-50',
    metricBorder: 'border-violet-200',
    stars: 5,
  },
];

// ─── Exports ──────────────────────────────────────────────────────────────────

export function TestimonialsSection() {
  return (
    <section className="bg-[#FFF5F7] border-b border-pink-100 py-20 md:py-28 px-4 relative overflow-hidden">
      <Doodle4Star className="absolute top-8 left-8 w-6 h-6 text-pink-300 hidden md:block pointer-events-none" />
      <Doodle4Star className="absolute bottom-8 right-10 w-8 h-8 text-pink-200 hidden md:block pointer-events-none" />
      <DoodleDots  className="absolute top-1/2 right-4 -translate-y-1/2 w-28 h-16 text-pink-200 hidden lg:block pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-pink-500">Success Stories</p>
          <h2 className="text-4xl md:text-5xl font-display text-neutral-950">
            Restaurants Love SmartDine
          </h2>
          <p className="text-[16px] text-neutral-600 font-script max-w-xl mx-auto leading-relaxed">
            See what happens when restaurants switch from pen-and-paper to SmartDine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.stars }, (_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <div className="relative">
                <Quote className="absolute -top-1 -left-1 w-5 h-5 text-pink-200 fill-pink-100" />
                <p className="text-[13px] text-neutral-700 leading-relaxed pl-4 font-script italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Metric badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold ${t.metricColor} ${t.metricBg} ${t.metricBorder} self-start`}>
                <span>📈</span>
                {t.metric}
              </div>

              {/* Author */}
              <div className="border-t border-neutral-100 pt-4 flex items-center gap-3 mt-auto">
                <div className="w-9 h-9 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-[13px] font-bold text-pink-600">
                  {t.author[0]}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-neutral-900">{t.author}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{t.role} · {t.restaurant}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof strip */}
        <div className="mt-12 pt-8 border-t border-pink-100 flex flex-wrap items-center justify-center gap-8 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
          {['4.9★ on G2', '4.8★ on Capterra', 'Top Rated — Restaurant Software 2026', 'ISO 27001 Certified', '99.9% Uptime SLA'].map(badge => (
            <span key={badge} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-pink-300" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ComparisonTable() {
  let lastCategory = '';
  return (
    <section className="bg-white border-b border-neutral-100 py-20 md:py-28 px-4 relative overflow-hidden">
      <DoodleDots className="absolute top-8 left-4 w-28 h-16 text-pink-200 hidden md:block pointer-events-none" />
      <Doodle4Star className="absolute bottom-8 right-8 w-6 h-6 text-pink-200 hidden md:block pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-pink-500">Why SmartDine</p>
          <h2 className="text-4xl md:text-5xl font-display text-neutral-950">
            Everything Others Charge Extra For.
          </h2>
          <p className="text-[16px] text-neutral-600 font-script max-w-xl mx-auto leading-relaxed">
            One flat price. No per-transaction fees. No hidden modules. Every feature included from day one.
          </p>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-4 bg-neutral-950 border-b border-neutral-800">
            <div className="px-4 py-4 col-span-1">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">Feature</span>
            </div>
            {[
              { label: 'Traditional POS', sub: 'Legacy systems', highlight: false },
              { label: 'SmartDine',        sub: 'All-in-one platform', highlight: true },
              { label: 'Enterprise SaaS',  sub: 'Large-scale tools', highlight: false },
            ].map(col => (
              <div key={col.label} className={`px-4 py-4 text-center ${col.highlight ? 'bg-pink-600/20 border-x border-pink-500/30' : ''}`}>
                {col.highlight && (
                  <span className="inline-block text-[8px] font-mono bg-pink-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">Recommended</span>
                )}
                <p className={`text-[12px] font-bold ${col.highlight ? 'text-pink-300' : 'text-white'}`}>{col.label}</p>
                <p className="text-[9px] text-neutral-500 font-mono mt-0.5">{col.sub}</p>
              </div>
            ))}
          </div>

          {/* Rows */}
          <div>
            {COMP_ROWS.map((row, i) => {
              const showCategoryLabel = row.category && row.category !== lastCategory;
              if (row.category) lastCategory = row.category;
              return (
                <div key={i}>
                  {showCategoryLabel && (
                    <div className="bg-neutral-50 border-y border-neutral-100 px-4 py-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">{row.category}</span>
                    </div>
                  )}
                  <div className={`grid grid-cols-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-neutral-50/30'}`}>
                    <div className="px-4 py-3 flex items-center">
                      <span className="text-[12px] text-neutral-700">{row.feature}</span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-center">
                      <Cell value={row.traditional} />
                    </div>
                    <div className="px-4 py-3 flex items-center justify-center bg-pink-50/50 border-x border-pink-100">
                      <Cell value={row.smartdine} isSmartDine />
                    </div>
                    <div className="px-4 py-3 flex items-center justify-center">
                      <Cell value={row.enterprise} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 text-[10px] font-mono text-neutral-400">
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Included</span>
          <span className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-neutral-400" /> Partial</span>
          <span className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-neutral-300" /> Not available</span>
        </div>
      </div>
    </section>
  );
}
