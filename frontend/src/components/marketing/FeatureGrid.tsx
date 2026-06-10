import { useState } from 'react';
import {
  QrCode, UtensilsCrossed, ChefHat, Receipt,
  Package, BarChart3, Gift, LayoutDashboard,
  ArrowRight
} from 'lucide-react';

const Doodle4Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 26 26" className={className} fill="currentColor" aria-hidden>
    <path d="M13 0 L14.6 11.4 L26 13 L14.6 14.6 L13 26 L11.4 14.6 L0 13 L11.4 11.4 Z" />
  </svg>
);
const DoodleDots = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 38" className={className} fill="currentColor" aria-hidden>
    <circle cx="8" cy="10" r="4" /><circle cx="26" cy="6" r="3" /><circle cx="44" cy="12" r="4.5" />
    <circle cx="58" cy="7" r="2.5" /><circle cx="16" cy="28" r="3" /><circle cx="36" cy="30" r="4" /><circle cx="52" cy="26" r="2.5" />
  </svg>
);

interface Feature {
  id: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  accent: string;
  accentBg: string;
  accentBorder: string;
  badgeText: string;
}

const FEATURES: Feature[] = [
  {
    id: 'qr-ordering',
    icon: QrCode,
    title: 'QR Ordering',
    tagline: 'No app. No friction. Instant orders.',
    description: 'Customers scan, browse, customise, and pay — all from their phone at the table or before arrival.',
    bullets: ['Full menu with variants & add-ons', 'Live order tracking', 'Instant kitchen notification', 'Dine-in & takeaway flows'],
    accent: 'text-pink-600', accentBg: 'bg-pink-50', accentBorder: 'border-pink-200', badgeText: 'Most Popular',
  },
  {
    id: 'menu',
    icon: UtensilsCrossed,
    title: 'Menu Management',
    tagline: 'Update your menu in seconds.',
    description: 'Add, edit, categorise, and price items in real-time. Set availability windows and push seasonal specials.',
    bullets: ['Drag-and-drop ordering', 'Category & tag management', 'Instant price updates', 'Multi-language support'],
    accent: 'text-violet-600', accentBg: 'bg-violet-50', accentBorder: 'border-violet-200', badgeText: 'Core Module',
  },
  {
    id: 'kds',
    icon: ChefHat,
    title: 'Kitchen Display',
    tagline: 'Zero paper. Zero confusion.',
    description: 'Replace paper chits with a live kitchen display. Colour-coded urgency, allergy alerts, and status flow.',
    bullets: ['New → Preparing → Ready flow', 'Timer-based urgency alerts', 'Allergy & note display', 'Takeaway token sync'],
    accent: 'text-amber-600', accentBg: 'bg-amber-50', accentBorder: 'border-amber-200', badgeText: 'Kitchen Essential',
  },
  {
    id: 'billing',
    icon: Receipt,
    title: 'Billing & Payments',
    tagline: 'Fast checkout. Every payment method.',
    description: 'UPI, Card, Cash, and split-bill — with auto-calculated GST and one-click GST invoice print.',
    bullets: ['CGST + SGST breakdowns', 'Coupon & discount engine', 'Split bill by person', 'GST invoice generation'],
    accent: 'text-emerald-600', accentBg: 'bg-emerald-50', accentBorder: 'border-emerald-200', badgeText: 'POS Ready',
  },
  {
    id: 'inventory',
    icon: Package,
    title: 'Inventory Management',
    tagline: 'Know what you have. Never run out.',
    description: 'Live stock tracking with low-stock alerts, supplier management, and waste logging.',
    bullets: ['Low-stock threshold alerts', 'Per-unit cost tracking', 'Category breakdown', 'Reorder automation'],
    accent: 'text-blue-600', accentBg: 'bg-blue-50', accentBorder: 'border-blue-200', badgeText: 'Stock Control',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Reports & Analytics',
    tagline: 'Data you can act on. Daily.',
    description: 'Revenue trends, peak hour analysis, dish performance, and customer behaviour — all in one dashboard.',
    bullets: ['Daily/weekly/monthly reports', 'Peak-hour heat maps', 'Menu performance ranking', 'Export to CSV/PDF'],
    accent: 'text-indigo-600', accentBg: 'bg-indigo-50', accentBorder: 'border-indigo-200', badgeText: 'Business Intel',
  },
  {
    id: 'loyalty',
    icon: Gift,
    title: 'Customer Loyalty',
    tagline: 'Reward regulars. Build retention.',
    description: 'Stamp cards, coupon engine, and customer profiles — all synced with QR ordering automatically.',
    bullets: ['Digital stamp cards', 'Custom coupon codes', 'Visit & spend tracking', 'Loyalty tier management'],
    accent: 'text-rose-600', accentBg: 'bg-rose-50', accentBorder: 'border-rose-200', badgeText: 'CRM Built-in',
  },
  {
    id: 'operations',
    icon: LayoutDashboard,
    title: 'Table Operations',
    tagline: 'Your floor, in one view.',
    description: 'Live floor plan with table statuses, server assignments, merge/split, and occupancy at a glance.',
    bullets: ['5 table status states', 'Merge & move orders', 'Server assignment', 'Real-time occupancy'],
    accent: 'text-teal-600', accentBg: 'bg-teal-50', accentBorder: 'border-teal-200', badgeText: 'Floor Manager',
  },
];

export default function FeatureGrid() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="platform-features" className="relative bg-[#FFFDF9] py-20 md:py-28 px-4 overflow-hidden border-b border-neutral-100">
      <Doodle4Star className="absolute top-8 left-8 w-6 h-6 text-pink-300 pointer-events-none hidden md:block" />
      <Doodle4Star className="absolute bottom-8 right-10 w-8 h-8 text-pink-200 pointer-events-none hidden md:block" />
      <DoodleDots  className="absolute top-1/2 left-3 -translate-y-1/2 w-24 h-14 text-pink-200 pointer-events-none hidden lg:block" />
      <DoodleDots  className="absolute bottom-12 right-4 w-32 h-20 text-pink-200 pointer-events-none hidden lg:block" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-pink-500">Everything you need</p>
          <h2 className="text-4xl md:text-5xl font-display text-neutral-950">
            Eight Modules. One Platform.
          </h2>
          <p className="text-[16px] text-neutral-600 font-script max-w-xl mx-auto leading-relaxed">
            SmartDine bundles every tool a modern restaurant needs into a single, cohesive experience — from the customer's phone to your kitchen wall.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => {
            const Icon = f.icon;
            const isHovered = hoveredId === f.id;
            return (
              <div
                key={f.id}
                onMouseEnter={() => setHoveredId(f.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative bg-white rounded-2xl border transition-all duration-300 cursor-default overflow-hidden
                  ${isHovered ? `border-2 ${f.accentBorder} shadow-lg -translate-y-1` : 'border border-neutral-100 shadow-sm hover:shadow-md'}
                `}
              >
                {/* Top accent bar */}
                <div className={`h-0.5 w-0 group-hover:w-full transition-all duration-500 ${f.accentBg.replace('bg-', 'bg-').replace('-50', '-400')} rounded-t-2xl`} />

                <div className="p-5 space-y-3">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl ${f.accentBg} border ${f.accentBorder} flex items-center justify-center transition-transform group-hover:scale-110 duration-200`}>
                      <Icon className={`w-5 h-5 ${f.accent}`} />
                    </div>
                    <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${f.accentBg} ${f.accentBorder} ${f.accent}`}>
                      {f.badgeText}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-[14px] font-bold text-neutral-950">{f.title}</h3>
                    <p className="text-[11px] font-mono text-neutral-400 mt-0.5 uppercase tracking-wider">{f.tagline}</p>
                  </div>

                  {/* Description */}
                  <p className="text-[12px] text-neutral-600 leading-relaxed">{f.description}</p>

                  {/* Bullets — visible on hover */}
                  <ul className={`space-y-1 overflow-hidden transition-all duration-300 ${isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {f.bullets.map(b => (
                      <li key={b} className="flex items-start gap-1.5 text-[11px] text-neutral-600">
                        <span className={`mt-0.5 shrink-0 text-[10px] ${f.accent}`}>✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>

                  {/* Learn more */}
                  <div className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider ${f.accent} transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <span>Explore module</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-4">All modules included in every plan</p>
          <button
            onClick={() => document.getElementById('demo-request')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] font-mono uppercase tracking-[0.2em] rounded-xl transition-all shadow-sm hover:shadow-md group cursor-pointer"
          >
            See All Features in Action
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
