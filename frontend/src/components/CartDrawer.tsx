import { useState } from 'react';
import { X, ShoppingCart, Trash2, ArrowRight, ArrowLeft, CornerDownRight, Gift, User, Phone, MapPin, FileText, ChevronRight } from 'lucide-react';
import { CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// Brand palette
const PINK  = '#E8447A';
const TEAL  = '#1BC8C8';
const HEAD  = '#2C2C2C';
const TX    = '#4A4A4A';
const TL    = '#888888';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (address: string, notes: string, tipAmount: number) => void;
}

const inputCls = (hasError: boolean) =>
  `w-full text-[11px] font-sans py-2 px-3 rounded-xl outline-none transition-all ${
    hasError
      ? 'border-2 border-red-400 bg-red-50'
      : 'border border-[rgba(44,44,44,.18)] bg-white focus:border-[#E8447A] focus:shadow-[0_0_0_3px_rgba(232,68,122,.12)]'
  }`;

export default function CartDrawer({
  isOpen, onClose, cartItems, onUpdateQty, onRemoveItem, onCheckout,
}: CartDrawerProps) {
  const [step,      setStep]      = useState<'cart' | 'details'>('cart');
  const [fullName,  setFullName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [address,   setAddress]   = useState('');
  const [notes,     setNotes]     = useState('');
  const [tipRate,   setTipRate]   = useState(0.15);
  const [submitted, setSubmitted] = useState(false);

  const itemsSubtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee   = itemsSubtotal >= 25 || itemsSubtotal === 0 ? 0 : 2.50;
  const tipAmount     = parseFloat((itemsSubtotal * tipRate).toFixed(2));
  const finalTotal    = parseFloat((itemsSubtotal + deliveryFee + tipAmount).toFixed(2));

  const errors = {
    fullName: submitted && !fullName.trim(),
    phone:    submitted && !phone.trim(),
    address:  submitted && !address.trim(),
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep('cart'); setSubmitted(false); }, 300);
  };

  const handlePlaceOrder = () => {
    setSubmitted(true);
    if (!fullName.trim() || !phone.trim() || !address.trim()) return;
    onCheckout(`${fullName} · ${phone} · ${address}`, notes, tipAmount);
    setStep('cart');
    setSubmitted(false);
    setFullName(''); setPhone(''); setAddress(''); setNotes('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 cursor-pointer"
            style={{ background: 'rgba(44,44,44,.5)', backdropFilter: 'blur(3px)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-50 flex flex-col"
            style={{ background: '#FFFFFF', borderLeft: `1.5px solid rgba(232,68,122,.12)` }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between p-4" style={{ background: PINK, borderBottom: `1px solid rgba(232,68,122,.2)` }}>
              <div className="flex items-center gap-2">
                {step === 'details' && (
                  <button
                    onClick={() => setStep('cart')}
                    className="flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer border-none transition-opacity hover:opacity-75"
                    style={{ background: 'rgba(255,255,255,.2)', color: '#FFFFFF' }}
                  >
                    <ArrowLeft style={{ width: 14, height: 14 }} />
                  </button>
                )}
                <ShoppingCart style={{ width: 16, height: 16, color: '#FFFFFF' }} />
                <h4 className="font-barlow font-black uppercase" style={{ fontSize: 14, letterSpacing: '1px', color: '#FFFFFF' }}>
                  {step === 'cart' ? 'Your Cart' : 'Checkout Details'}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {['cart','details'].map((s) => (
                    <div key={s} style={{ width: 6, height: 6, borderRadius: '50%', background: step === s ? '#FFFFFF' : 'rgba(255,255,255,.35)' }} />
                  ))}
                </div>
                <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none transition-opacity hover:opacity-75" style={{ background: 'rgba(255,255,255,.2)', color: '#FFFFFF' }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* ── Step 1: Cart Review ── */}
            {step === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(232,68,122,.08)', border: `1.5px solid rgba(232,68,122,.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCart style={{ width: 22, height: 22, color: PINK }} />
                      </div>
                      <div>
                        <p className="font-barlow font-black uppercase" style={{ fontSize: 16, marginBottom: 4, color: HEAD }}>Cart is Empty</p>
                        <p style={{ fontSize: 11, color: TL }}>Add items from the menu to begin.</p>
                      </div>
                      <button onClick={handleClose} className="cursor-pointer border-none transition-opacity hover:opacity-80" style={{ background: PINK, color: '#FFFFFF', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: 100, fontFamily: 'inherit' }}>
                        Browse Menu
                      </button>
                    </div>
                  ) : (
                    cartItems.map(item => (
                      <div key={item.id} className="rounded-2xl p-3 flex gap-3 relative" style={{ background: '#FAFAFA', border: `1.2px solid rgba(232,68,122,.1)` }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#FFE8EE', border: `1px solid rgba(232,68,122,.1)` }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1 mb-1">
                            <h5 style={{ fontSize: 11, fontWeight: 700, color: HEAD, textTransform: 'uppercase', letterSpacing: '.5px' }} className="truncate">{item.name}</h5>
                            <button onClick={() => onRemoveItem(item.id)} className="cursor-pointer bg-transparent border-none transition-colors hover:text-red-500" style={{ color: 'rgba(44,44,44,.3)', flexShrink: 0 }}>
                              <Trash2 style={{ width: 13, height: 13 }} />
                            </button>
                          </div>
                          {item.customization && (
                            <div style={{ background: '#F5F0FF', border: '1px solid rgba(124,77,204,.1)', borderRadius: 8, padding: '6px 8px', marginBottom: 6 }}>
                              {[['SIZE', item.customization.size], ['MAIN', item.customization.main], ['DRINK', item.customization.drink]].map(([k, v]) => v && (
                                <div key={k} className="flex items-center gap-1" style={{ fontSize: 9, color: TX, fontFamily: 'monospace' }}>
                                  <CornerDownRight style={{ width: 9, height: 9, color: TEAL }} />
                                  <span>{k}: {v}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between" style={{ borderTop: `1px solid rgba(232,68,122,.08)`, paddingTop: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>${(item.price * item.quantity).toFixed(2)}</span>
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1" style={{ border: `1px solid rgba(232,68,122,.15)`, background: '#FFE8EE' }}>
                              <button onClick={() => onUpdateQty(item.id, -1)} className="cursor-pointer bg-transparent border-none font-bold" style={{ fontSize: 14, color: PINK, lineHeight: 1 }}>−</button>
                              <span style={{ fontSize: 11, fontWeight: 700, color: HEAD, minWidth: 14, textAlign: 'center' }}>{item.quantity}</span>
                              <button onClick={() => onUpdateQty(item.id, 1)} className="cursor-pointer bg-transparent border-none font-bold" style={{ fontSize: 14, color: PINK, lineHeight: 1 }}>+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="p-4 space-y-3" style={{ borderTop: `1px solid rgba(232,68,122,.08)` }}>
                    {itemsSubtotal < 25 ? (
                      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(232,68,122,.07)', border: `1px solid rgba(232,68,122,.25)` }}>
                        <Gift style={{ width: 14, height: 14, color: PINK, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: PINK }}>Add ${(25 - itemsSubtotal).toFixed(2)} more for free delivery!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(27,200,200,.08)', border: `1px solid ${TEAL}` }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: TEAL }}>✓ Free delivery unlocked on this order!</span>
                      </div>
                    )}
                    <div style={{ background: '#FFFFFF', border: `1.2px solid rgba(232,68,122,.1)`, borderRadius: 14, padding: '12px 14px' }}>
                      {[
                        ['Items', `$${itemsSubtotal.toFixed(2)}`],
                        ['Delivery', deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between" style={{ fontSize: 11, color: TL, marginBottom: 6 }}>
                          <span>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                      <div className="flex justify-between" style={{ fontSize: 13, fontWeight: 700, color: HEAD, borderTop: '1px dashed rgba(44,44,44,.12)', paddingTop: 8, marginTop: 4 }}>
                        <span>Estimated Total</span><span style={{ color: TEAL }}>${(itemsSubtotal + deliveryFee).toFixed(2)}+</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep('details')}
                      className="w-full flex items-center justify-center gap-2 cursor-pointer border-none transition-opacity hover:opacity-80"
                      style={{ background: PINK, color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '14px 16px', borderRadius: 100, fontFamily: 'inherit' }}
                    >
                      <span>Proceed to Checkout</span>
                      <ChevronRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Step 2: Customer Details ── */}
            {step === 'details' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <p style={{ fontSize: 11, color: TL, lineHeight: 1.6 }}>
                    Please fill in your details so we can process and deliver your order correctly.
                  </p>

                  {[
                    { key: 'fullName', label: 'Full Name', icon: User,     placeholder: 'e.g. Maya Rosenstein',                           value: fullName,  set: setFullName,  err: errors.fullName },
                    { key: 'phone',    label: 'Phone Number', icon: Phone,  placeholder: 'e.g. +1 (310) 555-0123',                         value: phone,     set: setPhone,     err: errors.phone    },
                    { key: 'address',  label: 'Delivery Address', icon: MapPin, placeholder: 'e.g. 123 Pastel Ave, Apt 4, Los Angeles',    value: address,   set: setAddress,   err: errors.address  },
                    { key: 'notes',    label: 'Delivery Notes (optional)', icon: FileText, placeholder: 'e.g. Leave at door, ring doorbell', value: notes, set: setNotes, err: false },
                  ].map(({ key, label, icon: Icon, placeholder, value, set, err }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: err ? '#ef4444' : TEAL, marginBottom: 6 }}>
                        {label}
                      </label>
                      <div className="relative">
                        <Icon style={{ position: 'absolute', left: 10, top: 9, width: 14, height: 14, color: PINK, pointerEvents: 'none' }} />
                        <input
                          type={key === 'phone' ? 'tel' : 'text'}
                          value={value} onChange={e => set(e.target.value)}
                          placeholder={placeholder}
                          className={inputCls(err)}
                          style={{ paddingLeft: 32 }}
                        />
                      </div>
                      {err && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{label.split(' ')[0]} is required.</p>}
                    </div>
                  ))}

                  {/* Tip */}
                  <div>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: TEAL, marginBottom: 6 }}>
                      Courier Tip — {(tipRate * 100).toFixed(0)}%
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                      {[0.10, 0.15, 0.20, 0.25].map(rate => (
                        <button
                          key={rate}
                          onClick={() => setTipRate(rate)}
                          className="cursor-pointer border-none transition-all rounded-xl py-2"
                          style={{
                            fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                            background: tipRate === rate ? PINK : '#FFFFFF',
                            border: `1.2px solid ${tipRate === rate ? PINK : 'rgba(44,44,44,.18)'}`,
                            color: tipRate === rate ? '#FFFFFF' : HEAD,
                          }}
                        >
                          {(rate * 100).toFixed(0)}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3" style={{ borderTop: `1px solid rgba(232,68,122,.08)` }}>
                  <div style={{ background: '#FFFFFF', border: `1.2px solid rgba(232,68,122,.1)`, borderRadius: 14, padding: '12px 14px' }}>
                    {[
                      ['Items',    `$${itemsSubtotal.toFixed(2)}`],
                      ['Delivery', deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`],
                      ['Tip',      `$${tipAmount.toFixed(2)}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between" style={{ fontSize: 11, color: TL, marginBottom: 5 }}>
                        <span>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-barlow font-black" style={{ fontSize: 15, color: HEAD, borderTop: '1px dashed rgba(44,44,44,.12)', paddingTop: 8, marginTop: 4 }}>
                      <span>TOTAL</span><span style={{ color: TEAL }}>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {hasErrors && submitted && (
                    <p style={{ fontSize: 11, color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>
                      Please fill in all required fields above.
                    </p>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full flex items-center justify-center gap-2 cursor-pointer border-none transition-opacity hover:opacity-80"
                    style={{ background: PINK, color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '14px 16px', borderRadius: 100, fontFamily: 'inherit' }}
                  >
                    <span>Place Order · ${finalTotal.toFixed(2)}</span>
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </button>
                  <p style={{ fontSize: 9, color: TL, textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Secure order — no payment stored
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
