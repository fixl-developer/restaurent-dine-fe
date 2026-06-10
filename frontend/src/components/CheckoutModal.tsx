import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Bike, Heart, Coffee, ShieldCheck, RefreshCw } from 'lucide-react';

const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const HEAD = '#2C2C2C';

interface CheckoutModalProps {
  isOpen: boolean;
  address: string;
  notes: string;
  totalCost: number;
  onClose: () => void;
  onResetOrder: () => void;
}

export default function CheckoutModal({ isOpen, address, notes, totalCost, onClose, onResetOrder }: CheckoutModalProps) {
  const [step,     setStep]     = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const stepsData = [
    { label: 'ORDER RECEIVED',    desc: 'Your order has been sent to the kitchen.', icon: Coffee   },
    { label: 'PREPARING',         desc: 'The kitchen is preparing your items.',      icon: Heart    },
    { label: 'PACKED & READY',    desc: 'Your order is packed and ready.',           icon: Sparkles },
    { label: 'OUT FOR DELIVERY',  desc: 'Your order is on its way.',                 icon: Bike     },
  ];

  useEffect(() => {
    if (!isOpen) { setStep(0); setProgress(0); return; }
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        const next = prev + 1;
        if (next === 25) setStep(1);
        if (next === 50) setStep(2);
        if (next === 75) setStep(3);
        return next;
      });
    }, 140);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm cursor-default"
            style={{ background: 'rgba(44,44,44,.45)' }}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-6 text-left"
            style={{ background: '#FFFFFF', border: `1.5px solid rgba(232,68,122,.12)` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: `1px solid rgba(232,68,122,.1)` }}>
              <h4 className="font-barlow font-black uppercase" style={{ fontSize: 14, letterSpacing: '1.5px', color: HEAD }}>
                Order Status
              </h4>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: PINK, background: '#FFE8EE', padding: '3px 10px', borderRadius: 100, border: `1px solid rgba(232,68,122,.2)` }}>
                {progress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(232,68,122,.1)' }}>
                <motion.div style={{ width: `${progress}%`, background: PINK }} className="h-full rounded-full" />
              </div>
              <div className="flex justify-between text-[8px] font-mono" style={{ color: '#888' }}>
                <span>0% DISPATCH</span><span>50% CRAFTED</span><span>100% ARRIVED</span>
              </div>
            </div>

            {/* Step card */}
            <div className="rounded-2xl p-4 flex gap-4 items-start" style={{ background: '#FFF9C4', border: `1.2px solid rgba(232,68,122,.12)` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(232,68,122,.1)', border: `1.5px solid rgba(232,68,122,.25)`, color: PINK }}>
                {(() => { const Icon = stepsData[step]?.icon || Coffee; return <Icon className="w-5 h-5 animate-pulse" />; })()}
              </div>
              <div className="space-y-1 min-w-0">
                <h5 className="text-[10px] font-mono font-bold tracking-widest uppercase leading-none" style={{ color: TEAL }}>
                  {stepsData[step]?.label}
                </h5>
                <p className="text-[10px] font-sans tracking-wide leading-relaxed" style={{ color: '#666' }}>
                  {stepsData[step]?.desc}
                </p>
              </div>
            </div>

            {/* Order summary */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: '#F5F0FF', border: `1px solid rgba(124,77,204,.1)` }}>
              <div className="text-[9px] font-mono uppercase tracking-widest font-bold pb-1.5" style={{ color: '#7C4DCC', borderBottom: '1px solid rgba(124,77,204,.1)' }}>
                ORDER SUMMARY
              </div>
              <div className="space-y-2 text-[10px] font-sans" style={{ color: '#555' }}>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider block" style={{ color: '#888' }}>DELIVERY ADDRESS:</span>
                  <span className="font-medium" style={{ color: HEAD }}>{address}</span>
                </div>
                {notes && (
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider block" style={{ color: '#888' }}>DELIVERY NOTES:</span>
                    <span className="font-medium italic" style={{ color: HEAD }}>"{notes}"</span>
                  </div>
                )}
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider block" style={{ color: '#888' }}>PAID AMOUNT:</span>
                  <span className="font-mono font-bold" style={{ color: PINK }}>${totalCost.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {progress < 100 ? (
                <div className="text-center">
                  <span className="text-[9px] font-mono uppercase tracking-widest block animate-pulse" style={{ color: '#888' }}>
                    Your order is being processed...
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="rounded-2xl p-4 flex gap-3 text-left" style={{ background: 'rgba(27,200,200,.07)', border: `1.5px solid ${TEAL}` }}>
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: TEAL }} />
                    <div className="space-y-0.5">
                      <h5 className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: TEAL }}>ORDER DELIVERED</h5>
                      <p className="text-[10px] leading-relaxed font-sans" style={{ color: '#555' }}>
                        Your order has arrived at {address}. Thank you for ordering!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onResetOrder}
                    className="w-full py-3 rounded-full text-[10px] font-mono tracking-widest uppercase transition-opacity hover:opacity-80 flex items-center justify-center gap-1.5 cursor-pointer border-none font-bold"
                    style={{ background: PINK, color: '#FFFFFF' }}
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin duration-1000" />
                    Place New Order
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
