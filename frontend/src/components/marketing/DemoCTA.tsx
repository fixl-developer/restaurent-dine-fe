import { useState } from 'react';
import {
  ArrowRight, CheckCircle2, Shield, Zap, Star,
  Phone, Mail, Building2, User, MessageSquare, Sparkles
} from 'lucide-react';

const Doodle4Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 26 26" className={className} fill="currentColor" aria-hidden>
    <path d="M13 0 L14.6 11.4 L26 13 L14.6 14.6 L13 26 L11.4 14.6 L0 13 L11.4 11.4 Z" />
  </svg>
);

const PLAN_FEATURES = [
  'All 8 modules included',
  'QR Ordering + KDS + Billing',
  'Analytics & Loyalty CRM',
  'Unlimited menu items',
  'Multi-outlet support',
  'GST invoice generation',
  'Priority support',
  '14-day free trial',
];

const TRUST_BADGES = [
  { icon: Shield, label: 'PCI-DSS Secure' },
  { icon: Zap,    label: '3-min setup' },
  { icon: Star,   label: 'No credit card' },
];

type SubmitState = 'idle' | 'loading' | 'success';

export default function DemoCTA() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !restaurant) return;
    setSubmitState('loading');
    setTimeout(() => setSubmitState('success'), 1800);
  };

  const canSubmit = name.trim() && email.includes('@') && restaurant.trim();

  return (
    <section id="demo-request" className="bg-neutral-950 py-20 md:py-28 px-4 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #f9a8d4 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-pink-600/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-pink-500/6 blur-3xl pointer-events-none" />
      <Doodle4Star className="absolute top-8 right-8 w-7 h-7 text-pink-500/25 hidden md:block pointer-events-none" />
      <Doodle4Star className="absolute bottom-10 left-10 w-5 h-5 text-pink-500/20 hidden md:block pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* Left: CTA copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-pink-600/15 border border-pink-500/30 text-pink-300 text-[10px] font-mono uppercase tracking-[0.25em] px-4 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Free 14-day trial
            </div>

            <h2 className="text-4xl md:text-5xl font-display text-white leading-tight">
              Ready to Transform<br />
              <span className="text-pink-400">Your Restaurant?</span>
            </h2>

            <p className="text-[15px] text-neutral-400 font-script leading-relaxed">
              Join 500+ restaurants already using SmartDine to serve faster, bill smarter, and grow revenue — without complexity.
            </p>

            {/* Feature checklist */}
            <ul className="space-y-2.5">
              {PLAN_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-[12px] text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-neutral-800">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5 text-emerald-500" />
                  {label}
                </div>
              ))}
            </div>

            {/* Existing restaurant note */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                <span className="text-white font-semibold">Already have a POS?</span> SmartDine works alongside your existing system — no replacement required. Start with QR ordering and expand at your pace.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {submitState === 'success' ? (
              <div className="p-8 text-center space-y-5 py-12">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-neutral-900">You're on the list!</h3>
                  <p className="text-[13px] text-neutral-500 mt-1.5 leading-relaxed">
                    Our team will reach out to <strong>{email}</strong> within 24 hours to schedule your personalised demo.
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-4 text-left space-y-2">
                  <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">What happens next</p>
                  {['Onboarding call in 24h', 'Live demo of all modules', 'Menu setup assistance', '14-day trial activated'].map(s => (
                    <p key={s} className="text-[12px] text-neutral-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <h3 className="text-[16px] font-bold text-neutral-900">Request Your Free Demo</h3>
                  <p className="text-[12px] text-neutral-500 mt-1">We'll reach out within 24 hours.</p>
                </div>

                {/* Form fields */}
                <div className="space-y-3">
                  {([
                    { icon: User,          placeholder: 'Your full name',       value: name,       set: setName,       type: 'text',  required: true },
                    { icon: Mail,          placeholder: 'Work email address',   value: email,      set: setEmail,      type: 'email', required: true },
                    { icon: Building2,     placeholder: 'Restaurant name',      value: restaurant, set: setRestaurant, type: 'text',  required: true },
                    { icon: Phone,         placeholder: 'Phone number',         value: phone,      set: setPhone,      type: 'tel',   required: false },
                  ] as { icon: React.ElementType; placeholder: string; value: string; set: (v: string) => void; type: string; required: boolean }[]).map((field, i) => {
                    const Icon = field.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 border border-neutral-200 rounded-xl px-3.5 py-2.5 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 transition-all"
                      >
                        <Icon className="w-4 h-4 text-neutral-400 shrink-0" />
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={e => field.set(e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                          className="flex-1 outline-none text-[13px] text-neutral-800 placeholder:text-neutral-400 bg-transparent"
                        />
                      </div>
                    );
                  })}

                  {/* Message */}
                  <div className="flex items-start gap-2.5 border border-neutral-200 rounded-xl px-3.5 py-2.5 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
                    <MessageSquare className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Anything specific you'd like to demo? (optional)"
                      rows={2}
                      className="flex-1 outline-none text-[13px] text-neutral-800 placeholder:text-neutral-400 bg-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit || submitState === 'loading'}
                  className="w-full py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-100 group"
                >
                  {submitState === 'loading' ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Get My Free Demo
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
                  By submitting you agree to our Privacy Policy. No spam — ever.<br />
                  14-day free trial · No credit card required · Cancel anytime
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
