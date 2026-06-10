import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Store, FileText, Clock, Globe, CreditCard, Printer,
  Palette, Check, AlertCircle, ToggleRight, ToggleLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { useRestaurant, useUpdateRestaurant, useUploadLogo } from '@/hooks/useRestaurant';
import { DAY_NAMES, RestaurantPatch, RestaurantDto } from '@/lib/dto/restaurant';

type SettingsSection =
  | 'profile' | 'branding' | 'gst' | 'hours' | 'languages' | 'payments' | 'receipt';

const NAV: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: 'profile',   label: 'Restaurant Profile', icon: Store      },
  { id: 'branding',  label: 'Branding',           icon: Palette    },
  { id: 'gst',       label: 'Tax / GST',          icon: FileText   },
  { id: 'hours',     label: 'Opening Hours',      icon: Clock      },
  { id: 'languages', label: 'Languages',          icon: Globe      },
  { id: 'payments',  label: 'Payment Methods',    icon: CreditCard },
  { id: 'receipt',   label: 'Receipt Settings',   icon: Printer    },
];

const LANG_OPTIONS = ['en', 'hi', 'kn', 'ta', 'te', 'mr', 'gu', 'bn'];
const LANG_LABELS: Record<string, string> = {
  en: 'English', hi: 'Hindi', kn: 'Kannada', ta: 'Tamil', te: 'Telugu', mr: 'Marathi', gu: 'Gujarati', bn: 'Bengali',
};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-600 mb-1">{children}</label>;
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string | number | undefined; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 text-gray-800"
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}>
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

function ToggleRow({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ensureFullWeek(hours: RestaurantDto['brand']['openingHours']) {
  const map = new Map(hours.map((h) => [h.dayOfWeek, h]));
  return DAY_NAMES.map((_, dow) =>
    map.get(dow) ?? { dayOfWeek: dow, open: '09:00', close: '23:00', isClosed: false },
  );
}

function extractTaxRates(taxes: RestaurantDto['tax']['taxes']) {
  const find = (type: string) => taxes.find((t) => t.type === type)?.rate ?? 0;
  return { cgst: find('cgst'), sgst: find('sgst'), igst: find('igst') };
}

function rebuildTaxes(cgst: number, sgst: number, igst: number): RestaurantDto['tax']['taxes'] {
  const out: RestaurantDto['tax']['taxes'] = [];
  if (cgst > 0) out.push({ name: 'CGST', rate: cgst, type: 'cgst', applyOn: 'subtotal' });
  if (sgst > 0) out.push({ name: 'SGST', rate: sgst, type: 'sgst', applyOn: 'subtotal' });
  if (igst > 0) out.push({ name: 'IGST', rate: igst, type: 'igst', applyOn: 'subtotal' });
  return out;
}

interface FormState {
  brand: {
    name: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    brandColor: string;
    location: { city: string; state: string; country: string; postalCode: string };
    openingHours: RestaurantDto['brand']['openingHours'];
  };
  tax: {
    gstin: string;
    cgst: number;
    sgst: number;
    igst: number;
    serviceChargePercent: number;
    roundingRule: RestaurantDto['tax']['roundingRule'];
    taxInclusive: boolean;
  };
  languages: { primary: string; supported: string[] };
  paymentMethods: RestaurantDto['paymentMethods'];
  operatingModes: RestaurantDto['operatingModes'];
  receipt: {
    headerLines: string[];
    footerLines: string[];
    fssaiLicense: string;
    returnPolicy: string;
    showLogo: boolean;
    showGstin: boolean;
  };
  currency: string;
  timeZone: string;
}

function buildFormFromDto(r: RestaurantDto): FormState {
  const taxRates = extractTaxRates(r.tax.taxes);
  return {
    brand: {
      name: r.brand.name ?? '',
      contactPhone: r.brand.contactPhone ?? '',
      contactEmail: r.brand.contactEmail ?? '',
      address: r.brand.address ?? '',
      brandColor: r.brand.brandColor ?? '#ec4899',
      location: {
        city: r.brand.location?.city ?? '',
        state: r.brand.location?.state ?? '',
        country: r.brand.location?.country ?? 'India',
        postalCode: r.brand.location?.postalCode ?? '',
      },
      openingHours: ensureFullWeek(r.brand.openingHours ?? []),
    },
    tax: {
      gstin: r.tax.gstin ?? '',
      cgst: taxRates.cgst,
      sgst: taxRates.sgst,
      igst: taxRates.igst,
      serviceChargePercent: r.tax.serviceChargePercent ?? 0,
      roundingRule: r.tax.roundingRule ?? 'nearest_rupee',
      taxInclusive: r.tax.taxInclusive ?? false,
    },
    languages: {
      primary: r.languages.primary ?? 'en',
      supported: r.languages.supported ?? ['en'],
    },
    paymentMethods: r.paymentMethods,
    operatingModes: r.operatingModes,
    receipt: {
      headerLines: r.receipt.headerLines ?? [],
      footerLines: r.receipt.footerLines ?? [],
      fssaiLicense: r.receipt.fssaiLicense ?? '',
      returnPolicy: r.receipt.returnPolicy ?? '',
      showLogo: r.receipt.showLogo ?? true,
      showGstin: r.receipt.showGstin ?? true,
    },
    currency: r.currency,
    timeZone: r.timeZone,
  };
}

function buildPatchFromForm(form: FormState): RestaurantPatch {
  return {
    brand: {
      name: form.brand.name,
      contactPhone: form.brand.contactPhone || undefined,
      contactEmail: form.brand.contactEmail || undefined,
      address: form.brand.address || undefined,
      brandColor: form.brand.brandColor,
      location: form.brand.location,
      openingHours: form.brand.openingHours,
    },
    tax: {
      gstin: form.tax.gstin || undefined,
      taxes: rebuildTaxes(form.tax.cgst, form.tax.sgst, form.tax.igst),
      serviceChargePercent: form.tax.serviceChargePercent,
      roundingRule: form.tax.roundingRule,
      taxInclusive: form.tax.taxInclusive,
    },
    languages: form.languages,
    paymentMethods: form.paymentMethods,
    operatingModes: form.operatingModes,
    receipt: {
      headerLines: form.receipt.headerLines,
      footerLines: form.receipt.footerLines,
      fssaiLicense: form.receipt.fssaiLicense || undefined,
      returnPolicy: form.receipt.returnPolicy || undefined,
      showLogo: form.receipt.showLogo,
      showGstin: form.receipt.showGstin,
    },
    currency: form.currency,
    timeZone: form.timeZone,
  };
}

export default function AdminSettings() {
  const [active, setActive] = useState<SettingsSection>('profile');
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: restaurant, isLoading } = useRestaurant();
  const updateMutation = useUpdateRestaurant();
  const uploadMutation = useUploadLogo();

  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (restaurant) setForm(buildFormFromDto(restaurant));
  }, [restaurant]);

  const combinedGst = useMemo(() => (form ? form.tax.cgst + form.tax.sgst : 0), [form]);

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-96 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading restaurant settings…
      </div>
    );
  }

  const f = form;
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => (s ? { ...s, [key]: value } : s));

  function handleSave() {
    updateMutation.mutate(buildPatchFromForm(f));
  }

  function handleLogoSelect(file: File | null) {
    if (file) uploadMutation.mutate(file);
  }

  function renderSection() {
    switch (active) {
      case 'profile':
        return (
          <div className="space-y-5">
            <SectionCard title="Basic Information" subtitle="Public-facing restaurant details">
              <Label>Restaurant Name</Label>
              <Input value={f.brand.name} onChange={(v) => update('brand', { ...f.brand, name: v })} />
            </SectionCard>
            <SectionCard title="Contact & Location" subtitle="Address and contact information">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Full Address</Label>
                  <Input value={f.brand.address} onChange={(v) => update('brand', { ...f.brand, address: v })} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={f.brand.location.city} onChange={(v) => update('brand', { ...f.brand, location: { ...f.brand.location, city: v } })} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={f.brand.location.state} onChange={(v) => update('brand', { ...f.brand, location: { ...f.brand.location, state: v } })} />
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input value={f.brand.location.postalCode} onChange={(v) => update('brand', { ...f.brand, location: { ...f.brand.location, postalCode: v } })} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={f.brand.location.country} onChange={(v) => update('brand', { ...f.brand, location: { ...f.brand.location, country: v } })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={f.brand.contactPhone} onChange={(v) => update('brand', { ...f.brand, contactPhone: v })} placeholder="+91 9876543210" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={f.brand.contactEmail} onChange={(v) => update('brand', { ...f.brand, contactEmail: v })} />
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Operating Modes" subtitle="Which channels are open right now">
              <div className="grid grid-cols-3 gap-4">
                <ToggleRow label="Dine-in" checked={f.operatingModes.dineIn} onChange={() => update('operatingModes', { ...f.operatingModes, dineIn: !f.operatingModes.dineIn })} />
                <ToggleRow label="Takeaway" checked={f.operatingModes.takeaway} onChange={() => update('operatingModes', { ...f.operatingModes, takeaway: !f.operatingModes.takeaway })} />
                <ToggleRow label="Online Prepay" checked={f.operatingModes.onlinePrepay} onChange={() => update('operatingModes', { ...f.operatingModes, onlinePrepay: !f.operatingModes.onlinePrepay })} />
              </div>
            </SectionCard>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-5">
            <SectionCard title="Logo" subtitle="Upload your restaurant logo (Cloudinary)">
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {restaurant?.brand.logoUrl ? (
                    <img src={restaurant.brand.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleLogoSelect(e.target.files?.[0] ?? null)} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 disabled:bg-pink-200 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                  >
                    {uploadMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {uploadMutation.isPending ? 'Uploading…' : restaurant?.brand.logoUrl ? 'Replace Logo' : 'Upload Logo'}
                  </button>
                  <p className="text-xs text-gray-400">PNG / JPG / SVG / WebP. Recommended 512×512px.</p>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Brand Color" subtitle="Used as accent across the platform and receipts">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={f.brand.brandColor}
                  onChange={(e) => update('brand', { ...f.brand, brandColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <Input value={f.brand.brandColor} onChange={(v) => update('brand', { ...f.brand, brandColor: v })} />
              </div>
              <div className="flex gap-2 mt-2">
                {['#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update('brand', { ...f.brand, brandColor: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${f.brand.brandColor === c ? 'border-gray-700 scale-110' : 'border-white'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </SectionCard>
          </div>
        );

      case 'gst':
        return (
          <SectionCard title="Tax / GST Configuration" subtitle="GSTIN, rates, and rounding">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>GSTIN</Label>
                <Input value={f.tax.gstin} onChange={(v) => update('tax', { ...f.tax, gstin: v.toUpperCase() })} placeholder="29ABCDE1234F1Z5" />
              </div>
              <div>
                <Label>CGST Rate (%)</Label>
                <Input type="number" value={f.tax.cgst} onChange={(v) => update('tax', { ...f.tax, cgst: Number(v) })} />
              </div>
              <div>
                <Label>SGST Rate (%)</Label>
                <Input type="number" value={f.tax.sgst} onChange={(v) => update('tax', { ...f.tax, sgst: Number(v) })} />
              </div>
              <div>
                <Label>IGST Rate (%) — Interstate</Label>
                <Input type="number" value={f.tax.igst} onChange={(v) => update('tax', { ...f.tax, igst: Number(v) })} />
              </div>
              <div>
                <Label>Service Charge (%)</Label>
                <Input type="number" value={f.tax.serviceChargePercent} onChange={(v) => update('tax', { ...f.tax, serviceChargePercent: Number(v) })} />
              </div>
              <div>
                <Label>Rounding Rule</Label>
                <select
                  value={f.tax.roundingRule}
                  onChange={(e) => update('tax', { ...f.tax, roundingRule: e.target.value as FormState['tax']['roundingRule'] })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                >
                  <option value="nearest_rupee">Nearest Rupee</option>
                  <option value="nearest_50_paise">Nearest 50 paise</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">Tax-Inclusive Pricing</p>
                  <p className="text-xs text-gray-400">Menu prices already include tax</p>
                </div>
                <Toggle checked={f.tax.taxInclusive} onChange={() => update('tax', { ...f.tax, taxInclusive: !f.tax.taxInclusive })} />
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Combined CGST + SGST: {combinedGst}% on intra-state sales. Verify with your CA before changes.</p>
            </div>
          </SectionCard>
        );

      case 'hours':
        return (
          <SectionCard title="Opening Hours" subtitle="Set operating hours for each day of the week">
            <div className="space-y-3">
              {f.brand.openingHours.map((h, i) => (
                <div key={h.dayOfWeek} className="flex items-center gap-4">
                  <p className="text-sm font-medium text-gray-700 w-24 shrink-0">{DAY_NAMES[h.dayOfWeek]}</p>
                  <Toggle
                    checked={!h.isClosed}
                    onChange={() => {
                      const next = [...f.brand.openingHours];
                      next[i] = { ...h, isClosed: !h.isClosed };
                      update('brand', { ...f.brand, openingHours: next });
                    }}
                  />
                  {h.isClosed ? (
                    <span className="text-xs text-gray-400 italic">Closed</span>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) => {
                          const next = [...f.brand.openingHours];
                          next[i] = { ...h, open: e.target.value };
                          update('brand', { ...f.brand, openingHours: next });
                        }}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                      />
                      <span className="text-gray-400 text-sm">—</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) => {
                          const next = [...f.brand.openingHours];
                          next[i] = { ...h, close: e.target.value };
                          update('brand', { ...f.brand, openingHours: next });
                        }}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        );

      case 'languages':
        return (
          <SectionCard title="Language Settings" subtitle="Display language across guest and staff interfaces">
            <div className="space-y-5">
              <div>
                <Label>Primary Language</Label>
                <select
                  value={f.languages.primary}
                  onChange={(e) => update('languages', { ...f.languages, primary: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                >
                  {LANG_OPTIONS.map((l) => (
                    <option key={l} value={l}>{LANG_LABELS[l] ?? l}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Supported Languages (Guest Menu)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {LANG_OPTIONS.map((l) => {
                    const enabled = f.languages.supported.includes(l);
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() =>
                          update('languages', {
                            ...f.languages,
                            supported: enabled ? f.languages.supported.filter((s) => s !== l) : [...f.languages.supported, l],
                          })
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${enabled ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        {enabled && <Check className="w-3.5 h-3.5" />}
                        {LANG_LABELS[l] ?? l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>
        );

      case 'payments':
        return (
          <SectionCard title="Accepted Payment Methods" subtitle="Toggles propagate to the cashier billing screen">
            <div className="space-y-3">
              {(
                [
                  { key: 'cash',         label: 'Cash',           sub: 'Physical currency payments' },
                  { key: 'upi',          label: 'UPI / QR',       sub: 'GPay, PhonePe, Paytm, BHIM via Razorpay' },
                  { key: 'card',         label: 'Credit / Debit', sub: 'Visa, Mastercard, RuPay, Amex' },
                  { key: 'wallet',       label: 'Digital Wallets', sub: 'Paytm, Amazon Pay, Freecharge' },
                  { key: 'onlinePrepay', label: 'Online Prepay',   sub: 'Required for window/takeaway flow' },
                ] as { key: keyof FormState['paymentMethods']; label: string; sub: string }[]
              ).map((m) => (
                <div
                  key={m.key}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    f.paymentMethods[m.key] ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.sub}</p>
                  </div>
                  <Toggle
                    checked={f.paymentMethods[m.key]}
                    onChange={() => update('paymentMethods', { ...f.paymentMethods, [m.key]: !f.paymentMethods[m.key] })}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        );

      case 'receipt':
        return (
          <div className="space-y-5">
            <SectionCard title="Receipt Header & Footer" subtitle="Text printed on every customer receipt">
              <div className="space-y-4">
                <div>
                  <Label>Header Lines (one per line)</Label>
                  <textarea
                    rows={3}
                    value={f.receipt.headerLines.join('\n')}
                    onChange={(e) => update('receipt', { ...f.receipt, headerLines: e.target.value.split('\n') })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 resize-none"
                  />
                </div>
                <div>
                  <Label>Footer Lines (one per line)</Label>
                  <textarea
                    rows={3}
                    value={f.receipt.footerLines.join('\n')}
                    onChange={(e) => update('receipt', { ...f.receipt, footerLines: e.target.value.split('\n') })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 resize-none"
                  />
                </div>
                <div>
                  <Label>FSSAI License</Label>
                  <Input value={f.receipt.fssaiLicense} onChange={(v) => update('receipt', { ...f.receipt, fssaiLicense: v })} />
                </div>
                <div>
                  <Label>Return Policy</Label>
                  <textarea
                    rows={2}
                    value={f.receipt.returnPolicy}
                    onChange={(e) => update('receipt', { ...f.receipt, returnPolicy: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 resize-none"
                  />
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Display Options" subtitle="Choose what information to show on receipts">
              <div className="space-y-3">
                <ToggleRow label="Show Restaurant Logo" sub="Print logo at top of receipt" checked={f.receipt.showLogo} onChange={() => update('receipt', { ...f.receipt, showLogo: !f.receipt.showLogo })} />
                <ToggleRow label="Show GSTIN" sub="Display GSTIN line on the receipt" checked={f.receipt.showGstin} onChange={() => update('receipt', { ...f.receipt, showGstin: !f.receipt.showGstin })} />
              </div>
            </SectionCard>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="flex gap-0 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="px-4 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Settings</h2>
          <p className="text-xs text-gray-400 mt-0.5">Restaurant configuration</p>
        </div>
        <nav className="p-2 flex-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${active === n.id ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <n.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{n.label}</span>
              {active === n.id && <ChevronRight className="w-3.5 h-3.5 text-pink-400" />}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-5">
          <div className="animate-[fadeIn_0.2s_ease-out]">{renderSection()}</div>

          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm sticky bottom-0">
            <p className="text-xs text-gray-400">Changes persist to the backend on save.</p>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${updateMutation.isSuccess ? 'bg-emerald-600 text-white' : 'bg-pink-400 text-white hover:bg-pink-500 disabled:bg-pink-200'}`}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {updateMutation.isPending ? 'Saving…' : updateMutation.isSuccess ? <><Check className="w-4 h-4" /> Saved</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
