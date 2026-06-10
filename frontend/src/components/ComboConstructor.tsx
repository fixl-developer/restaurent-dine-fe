import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, ShieldCheck, ChevronDown } from 'lucide-react';
import { CONSTRUCTOR_OPTIONS } from '../foodData';
import coquetteCake from '../assets/images/cake.jpg';
import smoothieBowl from '../assets/images/salad.jpg';
import { CustomCombo } from '../types';

// ── Custom themed dropdown — replaces native <select> ────────────────────────

interface SelectOption { label: string; value: string }

interface CustomSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}

function CustomSelect({ value, onChange, options }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = options.find(o => o.value === value)?.label ?? value;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full cursor-pointer transition-all"
        style={{
          background: 'white', border: `1.5px solid ${open ? '#E8447A' : 'rgba(44,44,44,.18)'}`,
          boxShadow: open ? '0 0 0 3px rgba(232,68,122,.12)' : 'none',
          borderRadius: 10, padding: '9px 36px 9px 12px',
          fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
          color: '#1a1a1a', textAlign: 'left', position: 'relative',
        }}
      >
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <ChevronDown
          style={{
            position: 'absolute', right: 10, top: '50%',
            transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
            transition: 'transform .18s ease',
            width: 14, height: 14, color: 'rgba(26,26,26,.5)',
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: 'white', border: '1.5px solid rgba(26,26,26,.15)',
            borderRadius: 12, overflow: 'hidden', zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,.14)',
          }}
        >
          {options.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left cursor-pointer border-none transition-colors"
              style={{
                display: 'block', padding: '10px 12px',
                fontSize: 11, fontWeight: opt.value === value ? 700 : 500,
                fontFamily: 'inherit', color: '#1a1a1a',
                background: opt.value === value ? 'rgba(232,68,122,.12)' : 'transparent',
                borderBottom: i < options.length - 1 ? '1px solid rgba(26,26,26,.06)' : 'none',
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26,26,26,.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = opt.value === value ? 'rgba(232,68,122,.12)' : 'transparent'; }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ComboConstructor ──────────────────────────────────────────────────────────

interface ComboConstructorProps {
  onAddCustomCombo: (combo: CustomCombo, price: number) => void;
}

export default function ComboConstructor({ onAddCustomCombo }: ComboConstructorProps) {
  const [comboState, setComboState] = useState<CustomCombo>({
    size: 'S(12CM)',
    main:    CONSTRUCTOR_OPTIONS.mains[1].name,
    drink:   CONSTRUCTOR_OPTIONS.drinks[0].name,
    side:    CONSTRUCTOR_OPTIONS.sides[0].name,
    topping: CONSTRUCTOR_OPTIONS.toppings[1].name,
  });
  const [size, setSize] = useState<'XS(10CM)'|'S(12CM)'|'M(15CM)'|'L(18CM)'>('S(12CM)');

  const basePrice       = 11.50;
  const getMainAddon    = () => CONSTRUCTOR_OPTIONS.mains.find(m => m.name === comboState.main)?.addon    ?? 0;
  const getDrinkAddon   = () => CONSTRUCTOR_OPTIONS.drinks.find(d => d.name === comboState.drink)?.addon  ?? 0;
  const getSideAddon    = () => CONSTRUCTOR_OPTIONS.sides.find(s => s.name === comboState.side)?.addon    ?? 0;
  const getToppingAddon = () => CONSTRUCTOR_OPTIONS.toppings.find(t => t.name === comboState.topping)?.addon ?? 0;
  const sizeMultiplier  = size === 'XS(10CM)' ? 0.9 : size === 'S(12CM)' ? 1.0 : size === 'M(15CM)' ? 1.15 : 1.3;
  const totalPrice      = parseFloat(((basePrice + getMainAddon() + getDrinkAddon() + getSideAddon() + getToppingAddon()) * sizeMultiplier).toFixed(2));

  const handleAdd = () => onAddCustomCombo({ ...comboState, size }, totalPrice);

  const rows: { label: string; el: React.ReactNode }[] = [
    {
      label: 'SIZE SPEC',
      el: (
        <CustomSelect
          value={size}
          onChange={v => setSize(v as any)}
          options={CONSTRUCTOR_OPTIONS.sizes.map(s => ({ value: s, label: `${s} (Base Multiplier)` }))}
        />
      ),
    },
    {
      label: 'MAIN DISH',
      el: (
        <CustomSelect
          value={comboState.main}
          onChange={v => setComboState(p => ({ ...p, main: v }))}
          options={CONSTRUCTOR_OPTIONS.mains.map(m => ({ value: m.name, label: `${m.name} ${m.addon > 0 ? `(+$${m.addon.toFixed(2)})` : '(Included)'}` }))}
        />
      ),
    },
    {
      label: 'DRINK',
      el: (
        <CustomSelect
          value={comboState.drink}
          onChange={v => setComboState(p => ({ ...p, drink: v }))}
          options={CONSTRUCTOR_OPTIONS.drinks.map(d => ({ value: d.name, label: `${d.name} ${d.addon > 0 ? `(+$${d.addon.toFixed(2)})` : '(Included)'}` }))}
        />
      ),
    },
    {
      label: 'SIDE',
      el: (
        <CustomSelect
          value={comboState.side}
          onChange={v => setComboState(p => ({ ...p, side: v }))}
          options={CONSTRUCTOR_OPTIONS.sides.map(s => ({ value: s.name, label: `${s.name} ${s.addon > 0 ? `(+$${s.addon.toFixed(2)})` : '(Included)'}` }))}
        />
      ),
    },
    {
      label: 'TOPPING',
      el: (
        <CustomSelect
          value={comboState.topping}
          onChange={v => setComboState(p => ({ ...p, topping: v }))}
          options={CONSTRUCTOR_OPTIONS.toppings.map(t => ({ value: t.name, label: `${t.name} ${t.addon > 0 ? `(+$${t.addon.toFixed(2)})` : '(Included)'}` }))}
        />
      ),
    },
  ];

  const comboImg = comboState.main.toLowerCase().includes('croissant') || comboState.main.toLowerCase().includes('cake')
    ? coquetteCake : smoothieBowl;

  return (
    <section id="constructor" style={{ background: '#FFFDE7', padding: '52px 48px', borderTop: '1px solid rgba(27,200,200,.12)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>

        {/* Left — controls */}
        <div>
          <h2 className="font-barlow font-black uppercase" style={{ fontSize: 46, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 8, color: '#2C2C2C' }}>
            CREATE YOUR<br />SPECIAL TASTE!
          </h2>
          <p style={{ fontSize: 12, color: '#888888', marginBottom: 28 }}>
            Build your perfect combo — pick your main, drink, side & topping.
          </p>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: 18, overflow: 'visible', border: '1.5px solid rgba(26,26,26,.15)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', background: '#1a1a1a', padding: '10px 14px', borderRadius: '16px 16px 0 0' }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>Category</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>Selection</span>
            </div>
            {rows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 2fr',
                  padding: '10px 14px', alignItems: 'center',
                  borderBottom: i < rows.length - 1 ? '1px solid rgba(26,26,26,.08)' : 'none',
                  background: 'white',
                  position: 'relative', zIndex: rows.length - i,
                  borderRadius: i === rows.length - 1 ? '0 0 16px 16px' : 0,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(26,26,26,.5)' }}>
                  {row.label}
                </span>
                <div style={{ paddingLeft: 8 }}>{row.el}</div>
              </div>
            ))}
          </div>

          {/* Info note */}
          <div style={{ marginTop: 16, background: 'rgba(0,0,0,.15)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 14, padding: '12px 16px' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.7)', lineHeight: 1.6, fontWeight: 600 }}>
              ✦ Special pre-orders decorated fresh in advance. All combos rotate through same-day harvest ingredients.
            </p>
          </div>
        </div>

        {/* Right — live preview */}
        <div style={{ background: 'rgba(0,0,0,.2)', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 22, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Preview image */}
          <div style={{ height: 140, borderRadius: 16, overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={comboImg} alt="Combo preview" style={{ height: '100%', objectFit: 'cover', width: '100%' }} />
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(26,26,26,.85)', color: 'white', fontSize: 8, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6 }}>
              {size}
            </div>
          </div>

          {/* Spec sheet */}
          <div style={{ background: 'rgba(0,0,0,.15)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#1BC8C8', borderBottom: '1px solid rgba(27,200,200,.15)', paddingBottom: 8, marginBottom: 10 }}>
              Constructor Spec Sheet
            </div>
            {[
              ['SIZE',  size              ],
              ['MAIN',  comboState.main   ],
              ['DRINK', comboState.drink  ],
              ['SIDE',  comboState.side   ],
              ['GLAZE', comboState.topping],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{k}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'white', textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.15)', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>Total Estimate</span>
              <span className="font-barlow font-black text-white" style={{ fontSize: 32, letterSpacing: '-1px', lineHeight: 1 }}>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleAdd}
              className="cursor-pointer border-none transition-opacity hover:opacity-80 flex items-center gap-2"
              style={{ background: '#E8447A', color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '12px 20px', borderRadius: 100, fontFamily: 'inherit' }}
            >
              <ShoppingCart style={{ width: 14, height: 14 }} />
              Add Combo
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck style={{ width: 12, height: 12, color: '#1BC8C8' }} />
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>Secure custom recipe tracking</span>
          </div>
        </div>

      </div>
    </section>
  );
}
