import { useState } from 'react';
import {
  Store, FileText, Clock, Globe, CreditCard, Printer,
  Palette, Check, AlertCircle, ToggleRight, ToggleLeft, ChevronRight
} from 'lucide-react';
import { RESTAURANT_SETTINGS } from './adminMockData';

type SettingsSection =
  | 'profile' | 'branding' | 'gst' | 'hours' | 'languages' | 'payments' | 'receipt';

const NAV: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: 'profile',   label: 'Restaurant Profile', icon: Store      },
  { id: 'branding',  label: 'Branding',           icon: Palette    },
  { id: 'gst',       label: 'GST Configuration',  icon: FileText   },
  { id: 'hours',     label: 'Opening Hours',      icon: Clock      },
  { id: 'languages', label: 'Languages',          icon: Globe      },
  { id: 'payments',  label: 'Payment Methods',    icon: CreditCard },
  { id: 'receipt',   label: 'Receipt Settings',   icon: Printer    },
];

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-600 mb-1">{children}</label>;
}
function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 text-gray-800" />
  );
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}>
      {checked ? <ToggleRight className="w-7 h-7 text-emerald-500" /> : <ToggleLeft className="w-7 h-7 text-gray-300" />}
    </button>
  );
}
function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const [active, setActive] = useState<SettingsSection>('profile');
  const [saved, setSaved] = useState(false);
  const [p, setP] = useState(RESTAURANT_SETTINGS.profile);
  const [g, setG] = useState(RESTAURANT_SETTINGS.gst);
  const [hours, setHours] = useState(RESTAURANT_SETTINGS.hours);
  const [pay, setPay] = useState(RESTAURANT_SETTINGS.payments);
  const [lang, setLang] = useState(RESTAURANT_SETTINGS.languages);
  const [rec, setRec] = useState(RESTAURANT_SETTINGS.receipt);
  const [brand, setBrand] = useState(RESTAURANT_SETTINGS.branding);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function renderSection() {
    switch (active) {
      case 'profile': return (
        <div className="space-y-5">
          <SectionCard title="Basic Information" subtitle="Public-facing restaurant details">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Restaurant Name</Label><Input value={p.name} onChange={v => setP(x => ({ ...x, name: v }))} /></div>
              <div className="col-span-2"><Label>Tagline</Label><Input value={p.tagline} onChange={v => setP(x => ({ ...x, tagline: v }))} /></div>
              <div><Label>Cuisine Type</Label><Input value={p.cuisine} onChange={v => setP(x => ({ ...x, cuisine: v }))} /></div>
              <div><Label>Seating Capacity</Label><Input type="number" value={p.seatingCapacity} onChange={v => setP(x => ({ ...x, seatingCapacity: +v }))} /></div>
              <div><Label>Established Year</Label><Input value={p.establishedYear} onChange={v => setP(x => ({ ...x, establishedYear: v }))} /></div>
            </div>
          </SectionCard>
          <SectionCard title="Contact & Location" subtitle="Address and contact information">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Full Address</Label><Input value={p.address} onChange={v => setP(x => ({ ...x, address: v }))} /></div>
              <div><Label>City</Label><Input value={p.city} onChange={v => setP(x => ({ ...x, city: v }))} /></div>
              <div><Label>State</Label><Input value={p.state} onChange={v => setP(x => ({ ...x, state: v }))} /></div>
              <div><Label>Phone</Label><Input value={p.phone} onChange={v => setP(x => ({ ...x, phone: v }))} /></div>
              <div><Label>Email</Label><Input type="email" value={p.email} onChange={v => setP(x => ({ ...x, email: v }))} /></div>
              <div><Label>Website</Label><Input value={p.website} onChange={v => setP(x => ({ ...x, website: v }))} /></div>
            </div>
          </SectionCard>
          <SectionCard title="About" subtitle="Restaurant description shown to customers">
            <textarea rows={3} value={p.description} onChange={e => setP(x => ({ ...x, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 resize-none" />
          </SectionCard>
        </div>
      );

      case 'branding': return (
        <div className="space-y-5">
          <SectionCard title="Logo" subtitle="Upload your restaurant logo">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300">
                <Store className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <button className="px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">Upload Logo</button>
                <p className="text-xs text-gray-400">PNG or SVG. Recommended 512×512px.</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Brand Colors" subtitle="Primary color used across the platform">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={brand.primaryColor} onChange={e => setBrand(x => ({ ...x, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <Input value={brand.primaryColor} onChange={v => setBrand(x => ({ ...x, primaryColor: v }))} />
                </div>
                <div className="flex gap-2 mt-2">
                  {['#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'].map(c => (
                    <button key={c} onClick={() => setBrand(x => ({ ...x, primaryColor: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${brand.primaryColor === c ? 'border-gray-700 scale-110' : 'border-white'}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <Label>Font Family</Label>
                <select value={brand.fontFamily} onChange={e => setBrand(x => ({ ...x, fontFamily: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400">
                  {['Inter', 'Poppins', 'Roboto', 'Playfair Display', 'Lato', 'Montserrat'].map(f => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </SectionCard>
        </div>
      );

      case 'gst': return (
        <SectionCard title="GST Configuration" subtitle="Tax registration and rate settings">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>GSTIN Number</Label><Input value={g.gstin} onChange={v => setG(x => ({ ...x, gstin: v }))} placeholder="27AAXXX1234Z1Z5" /></div>
            <div className="col-span-2"><Label>Legal Business Name</Label><Input value={g.legalName} onChange={v => setG(x => ({ ...x, legalName: v }))} /></div>
            <div><Label>CGST Rate (%)</Label><Input type="number" value={g.cgstRate} onChange={v => setG(x => ({ ...x, cgstRate: +v }))} /></div>
            <div><Label>SGST Rate (%)</Label><Input type="number" value={g.sgstRate} onChange={v => setG(x => ({ ...x, sgstRate: +v }))} /></div>
            <div><Label>IGST Rate (%) — Interstate</Label><Input type="number" value={g.igstRate} onChange={v => setG(x => ({ ...x, igstRate: +v }))} /></div>
            <div><Label>HSN/SAC Code</Label><Input value={g.hsnCode} onChange={v => setG(x => ({ ...x, hsnCode: v }))} /></div>
            <div className="col-span-2 flex items-center justify-between py-2">
              <div><p className="text-sm font-medium text-gray-700">Composite Scheme</p><p className="text-xs text-gray-400">Lower tax rate for small restaurants</p></div>
              <Toggle checked={g.compositeScheme} onChange={() => setG(x => ({ ...x, compositeScheme: !x.compositeScheme }))} />
            </div>
            <div className="col-span-2 flex items-center justify-between py-2 border-t border-gray-100">
              <div><p className="text-sm font-medium text-gray-700">TDS Applicable</p><p className="text-xs text-gray-400">Auto-deduct TDS on applicable payments</p></div>
              <Toggle checked={g.tdsApplicable} onChange={() => setG(x => ({ ...x, tdsApplicable: !x.tdsApplicable }))} />
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Combined GST rate: {g.cgstRate + g.sgstRate}% on all food items. Verify with your CA before changes.</p>
          </div>
        </SectionCard>
      );

      case 'hours': return (
        <SectionCard title="Opening Hours" subtitle="Set operating hours for each day of the week">
          <div className="space-y-3">
            {hours.map((h, i) => (
              <div key={h.day} className="flex items-center gap-4">
                <p className="text-sm font-medium text-gray-700 w-24 shrink-0">{h.day}</p>
                <Toggle checked={!h.closed} onChange={() => setHours(prev => prev.map((d, j) => j === i ? { ...d, closed: !d.closed } : d))} />
                {h.closed ? (
                  <span className="text-xs text-gray-400 italic">Closed</span>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={h.open}
                      onChange={e => setHours(prev => prev.map((d, j) => j === i ? { ...d, open: e.target.value } : d))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                    <span className="text-gray-400 text-sm">—</span>
                    <input type="time" value={h.close}
                      onChange={e => setHours(prev => prev.map((d, j) => j === i ? { ...d, close: e.target.value } : d))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      );

      case 'languages': return (
        <SectionCard title="Language Settings" subtitle="Configure display language for staff and customer interfaces">
          <div className="space-y-5">
            <div>
              <Label>Primary Language</Label>
              <select value={lang.primary} onChange={e => setLang(x => ({ ...x, primary: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400">
                {['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <Label>Supported Languages (Customer Menu)</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Bengali'].map(l => {
                  const enabled = lang.supported.includes(l);
                  return (
                    <button key={l} onClick={() => setLang(x => ({
                      ...x, supported: enabled ? x.supported.filter(s => s !== l) : [...x.supported, l]
                    }))}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${enabled ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {enabled && <Check className="w-3.5 h-3.5" />}
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>
      );

      case 'payments': return (
        <SectionCard title="Accepted Payment Methods" subtitle="Enable or disable payment options for your restaurant">
          <div className="space-y-3">
            {([
              { key: 'upi',        label: 'UPI / QR Code',    sub: 'Google Pay, PhonePe, Paytm, BHIM'    },
              { key: 'card',       label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay, Amex'    },
              { key: 'cash',       label: 'Cash',              sub: 'Physical currency payments'          },
              { key: 'wallet',     label: 'Digital Wallets',   sub: 'Paytm, Amazon Pay, Freecharge'       },
              { key: 'netBanking', label: 'Net Banking',       sub: 'Direct bank transfer'                },
              { key: 'emi',        label: 'EMI',               sub: 'No-cost EMI via partner banks'       },
            ] as { key: keyof typeof pay; label: string; sub: string }[]).map(m => (
              <div key={m.key} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${pay[m.key] ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                  <p className="text-xs text-gray-400">{m.sub}</p>
                </div>
                <Toggle checked={!!pay[m.key]} onChange={() => setPay(x => ({ ...x, [m.key]: !x[m.key] }))} />
              </div>
            ))}
          </div>
        </SectionCard>
      );

      case 'receipt': return (
        <div className="space-y-5">
          <SectionCard title="Receipt Content" subtitle="Customize what appears on customer receipts and bills">
            <div className="space-y-4">
              <div><Label>Header Text</Label><Input value={rec.headerText} onChange={v => setRec(x => ({ ...x, headerText: v }))} /></div>
              <div><Label>Footer Text</Label><Input value={rec.footerText} onChange={v => setRec(x => ({ ...x, footerText: v }))} /></div>
              <div><Label>Print Copies (per transaction)</Label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => setRec(x => ({ ...x, printCopies: n }))}
                      className={`px-5 py-2 rounded-xl border text-sm font-bold transition-colors ${rec.printCopies === n ? 'bg-pink-400 text-white border-pink-400' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Display Options" subtitle="Choose what information to show on receipts">
            <div className="space-y-3">
              {[
                { key: 'showGST',    label: 'Show GST Breakdown', sub: 'CGST and SGST line items on receipt' },
                { key: 'showLogo',   label: 'Show Restaurant Logo', sub: 'Print logo at top of receipt' },
                { key: 'showQR',     label: 'Show QR Code', sub: 'Feedback or loyalty QR on receipt' },
                { key: 'showTable',  label: 'Show Table Number', sub: 'Include table number on dine-in receipts' },
                { key: 'showWaiter', label: 'Show Waiter Name', sub: 'Print assigned waiter name' },
              ].map(o => (
                <div key={o.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-medium text-gray-700">{o.label}</p><p className="text-xs text-gray-400">{o.sub}</p></div>
                  <Toggle checked={!!(rec as any)[o.key]} onChange={() => setRec(x => ({ ...x, [o.key]: !(x as any)[o.key] }))} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      );

      default: return null;
    }
  }

  return (
    <div className="flex gap-0 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="px-4 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Settings</h2>
          <p className="text-xs text-gray-400 mt-0.5">Restaurant configuration</p>
        </div>
        <nav className="p-2 flex-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${active === n.id ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <n.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{n.label}</span>
              {active === n.id && <ChevronRight className="w-3.5 h-3.5 text-pink-400" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-5">
          <div className="animate-[fadeIn_0.2s_ease-out]">
            {renderSection()}
          </div>

          {/* Save bar */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm sticky bottom-0">
            <p className="text-xs text-gray-400">Changes are saved locally and will apply immediately.</p>
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-pink-400 text-white hover:bg-pink-500'}`}>
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
