import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import cakeImg  from '../../assets/images/cake.jpg';
import oatsImg  from '../../assets/images/oats.jpg';
import saladImg from '../../assets/images/salad.jpg';

const Doodle4Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 26 26" className={className} fill="currentColor" aria-hidden>
    <path d="M13 0 L14.6 11.4 L26 13 L14.6 14.6 L13 26 L11.4 14.6 L0 13 L11.4 11.4 Z" />
  </svg>
);
const DoodleLeaf = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 26 44" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M13 42 Q4 28 7 14 C11 3 21 5 21 16 Q20 29 13 42Z" />
    <line x1="13" y1="42" x2="13" y2="15" /><line x1="13" y1="24" x2="18" y2="19" /><line x1="13" y1="32" x2="9" y2="27" />
  </svg>
);
const DoodleDots = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 38" className={className} fill="currentColor" aria-hidden>
    <circle cx="8" cy="10" r="4" /><circle cx="26" cy="6" r="3" /><circle cx="44" cy="12" r="4.5" />
    <circle cx="58" cy="7" r="2.5" /><circle cx="16" cy="28" r="3" /><circle cx="36" cy="30" r="4" /><circle cx="52" cy="26" r="2.5" />
  </svg>
);
const FoodCircle = ({ src, className }: { src: string; className?: string }) => (
  <div className={`rounded-full overflow-hidden shadow-md border-2 border-pink-100 pointer-events-none select-none ${className}`} aria-hidden>
    <img src={src} alt="" className="w-full h-full object-cover" />
  </div>
);

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How long does it take to set up SmartDine?',
    answer: 'Most restaurants are live in under 3 minutes. You sign up, enter your restaurant name, upload your menu, and start receiving QR-based orders. No hardware, no installation, no IT team needed. If you need help, our onboarding team is available via chat.',
  },
  {
    category: 'Getting Started',
    question: 'Do customers need to download an app to order?',
    answer: "No. SmartDine's QR ordering experience is a mobile web app — customers scan the QR code and the ordering interface opens directly in their phone's browser. There is no app to install, no account to create. It just works.",
  },
  {
    category: 'Features',
    question: 'How does the Kitchen Display System (KDS) work?',
    answer: 'When a customer places an order via QR or when staff manually enters it, the order appears instantly on the kitchen display screen. Each order card shows items, quantities, special instructions, allergy flags, and an elapsed time counter. Kitchen staff click to advance orders: New → Preparing → Ready → Served. No paper, no shouting.',
  },
  {
    category: 'Features',
    question: 'What payment methods are supported?',
    answer: 'SmartDine supports UPI (with live QR code generation), Cash (with change calculator), and Card payments. Bills can be split between multiple people, with each portion marked paid individually. Every transaction generates a GST-compliant invoice automatically.',
  },
  {
    category: 'Features',
    question: 'Can I customise the menu and pricing in real time?',
    answer: "Yes. The menu management module lets you add, edit, reorder, and delete items at any time. Changes reflect immediately on the customer's QR ordering screen — no cache to clear, no delays. You can also set availability windows, mark items out-of-stock, and manage categories and tags.",
  },
  {
    category: 'Pricing',
    question: 'Are there any per-order or per-transaction fees?',
    answer: 'No. SmartDine charges a single flat monthly subscription — there are no per-order fees, no payment processing markups, and no hidden charges per module. All eight modules (QR Ordering, KDS, Billing, Menu, Inventory, Analytics, Loyalty, Table Ops) are included in every plan.',
  },
  {
    category: 'Pricing',
    question: 'Is there a free trial?',
    answer: 'Yes. We offer a 14-day free trial with full access to all features — no credit card required. You can explore every module, invite your team, and start taking real QR orders before committing to a paid plan.',
  },
  {
    category: 'Technical',
    question: 'What devices does SmartDine work on?',
    answer: 'SmartDine is entirely browser-based. The restaurant dashboard and KDS work on any modern browser — desktop, tablet, or phone. The customer QR ordering experience is optimised for mobile browsers. A dedicated tablet mounted in the kitchen is the most popular setup for KDS.',
  },
  {
    category: 'Technical',
    question: 'How is payment data and customer information secured?',
    answer: 'SmartDine is PCI-DSS compliant and follows ISO 27001 security standards. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never store raw payment card data. Customer data is stored in India-region servers compliant with DPDP 2023 guidelines.',
  },
  {
    category: 'Technical',
    question: 'Can SmartDine handle multiple outlets?',
    answer: 'Yes. Each outlet gets its own menu, KDS, floor plan, and reporting dashboard while sharing a single admin account. You can view combined analytics across all outlets or drill down into a specific location from the central Admin Portal.',
  },
];

const CATEGORIES = [...new Set(FAQS.map(f => f.category))];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered = activeCategory === 'All' ? FAQS : FAQS.filter(f => f.category === activeCategory);

  return (
    <section className="bg-[#FFFDF9] border-b border-neutral-100 py-20 md:py-28 px-4 relative overflow-hidden">
      {/* Doodles */}
      <DoodleLeaf    className="absolute top-8  left-6  w-14 h-22 text-pink-400 pointer-events-none hidden md:block" />
      <Doodle4Star   className="absolute top-10 right-8 w-8  h-8  text-pink-300 pointer-events-none hidden sm:block" />
      <Doodle4Star   className="absolute top-1/2 left-4 -translate-y-1/2 w-6 h-6 text-pink-200 pointer-events-none hidden lg:block" />
      <DoodleDots    className="absolute bottom-6 left-8  w-36 h-20 text-pink-200 pointer-events-none hidden md:block" />
      <DoodleDots    className="absolute bottom-4 right-6 w-28 h-16 text-pink-200 pointer-events-none hidden md:block" />
      <Doodle4Star   className="absolute bottom-10 right-10 w-5 h-5 text-pink-300 pointer-events-none hidden sm:block" />
      {/* Food circles */}
      <FoodCircle src={cakeImg}  className="absolute top-6  right-6  w-28 h-28 hidden lg:block" />
      <FoodCircle src={oatsImg}  className="absolute bottom-6 left-6 w-24 h-24 hidden lg:block" />
      <FoodCircle src={saladImg} className="absolute top-1/2 right-4 -translate-y-1/2 w-20 h-20 hidden xl:block" />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center mx-auto">
            <HelpCircle className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-script text-neutral-950">
            Frequently Asked
          </h2>
          <p className="text-[16px] text-neutral-600 font-script max-w-md mx-auto leading-relaxed">
            Everything you need to know before switching to SmartDine.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider transition-all
                ${activeCategory === cat
                  ? 'bg-pink-600 text-white shadow-sm shadow-pink-200'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-pink-300 hover:text-pink-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border overflow-hidden transition-all duration-200 ${isOpen ? 'border-pink-200 shadow-sm shadow-pink-50' : 'border-neutral-200'}`}
              >
                <button
                  className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left cursor-pointer group"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`text-[9px] font-mono uppercase tracking-wider shrink-0 mt-0.5 px-2 py-0.5 rounded-full border
                      ${isOpen ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-neutral-50 border-neutral-200 text-neutral-400'}`}>
                      {item.category}
                    </span>
                    <span className={`text-[13px] font-medium leading-snug transition-colors ${isOpen ? 'text-pink-700' : 'text-neutral-800 group-hover:text-neutral-950'}`}>
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 shrink-0 mt-0.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-pink-500' : 'text-neutral-400'}`} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48' : 'max-h-0'}`}>
                  <div className="px-5 pb-5">
                    <div className="border-t border-neutral-100 pt-4">
                      <p className="text-[13px] text-neutral-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer prompt */}
        <div className="mt-10 text-center">
          <p className="text-[13px] text-neutral-500">
            Still have questions?{' '}
            <button
              onClick={() => document.getElementById('demo-request')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-pink-600 font-semibold hover:underline cursor-pointer"
            >
              Talk to our team →
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
