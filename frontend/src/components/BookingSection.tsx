import React, { useState } from 'react';
import { Calendar, Users, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { FOOD_IMAGES } from '../foodData';
import { useCreateGuestReservation } from '../hooks/useReservations';

// ── Small decorative food circle ─────────────────────────────────────────────
const FoodCircle = ({ src, size, style }: { src: string; size: number; style?: React.CSSProperties }) => (
  <div
    aria-hidden
    style={{
      position: 'absolute', pointerEvents: 'none', zIndex: 1,
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,.12)',
      border: '3px solid rgba(255,255,255,.8)',
      ...style,
    }}
  >
    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
);

interface BookingSectionProps {
  onSuccess?: (details: any) => void;
}

export default function BookingSection({ onSuccess }: BookingSectionProps) {
  // Default date = today so users don't get a stale prefill.
  const today = new Date().toISOString().slice(0, 10);
  const [date,    setDate]    = useState(today);
  const [time,    setTime]    = useState('18:30');
  const [guests,  setGuests]  = useState('2');
  const [seating, setSeating] = useState('Indoor Lounge');
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [notes,   setNotes]   = useState('');
  const [isBooked,   setIsBooked]   = useState(false);
  const [bookingId,  setBookingId]  = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const createReservation = useCreateGuestReservation();

  const timeSlots = ['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00'];
  const seatingOptions = [
    { id: 'indoor',  name: 'Indoor Lounge',  desc: 'Comfortable indoor seating'          },
    { id: 'window',  name: 'Window Seating', desc: 'Natural light, window-side tables'   },
    { id: 'patio',   name: 'Outdoor Patio',  desc: 'Open-air seating, weather permitting'},
    { id: 'counter', name: "Chef's Counter", desc: 'Counter seating with kitchen view'   },
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) { alert('Please fill in your name and email.'); return; }
    try {
      const reservation = await createReservation.mutateAsync({
        name,
        email,
        date,
        time,
        partySize: Number(guests),
        seatingPreference: seating,
        notes: notes || undefined,
      });
      setBookingId(reservation.reservationNumber);
      setIsBooked(true);
      onSuccess?.({
        id: reservation.reservationNumber,
        name, email, date, time, guests, seating, notes,
      });
    } catch {
      // hook already toasts on error
    }
  };
  const handleReset = () => { setIsBooked(false); setName(''); setEmail(''); setNotes(''); };

  const PINK = '#E8447A';
  const TEAL = '#1BC8C8';
  const HEAD = '#2C2C2C';

  const inputStyle = (key: string): React.CSSProperties => ({
    width: '100%', background: 'white',
    border: `1.5px solid ${focusedInput === key ? PINK : 'rgba(44,44,44,.18)'}`,
    borderRadius: 12, padding: '10px 14px', fontSize: 12,
    fontFamily: 'inherit', outline: 'none', color: HEAD, fontWeight: 600,
    transition: 'border-color .2s ease',
    boxShadow: focusedInput === key ? `0 0 0 3px rgba(232,68,122,.12)` : 'none',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 9, fontWeight: 700,
    letterSpacing: '1.8px', textTransform: 'uppercase',
    color: TEAL, marginBottom: 8,
  };

  return (
    <section
      id="book-a-table"
      style={{
        background: '#F5F0FF', padding: '52px 48px',
        borderTop: '1px solid rgba(124,77,204,.08)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* ── Decorative food circles (fully within section bounds) ─────────── */}
      <FoodCircle src={FOOD_IMAGES.cake}     size={110} style={{ top: 24, right: 24 }} />
      <FoodCircle src={FOOD_IMAGES.oats2}    size={88}  style={{ bottom: 24, left: 24 }} />
      <FoodCircle src={FOOD_IMAGES.eggsalad} size={72}  style={{ top: '50%', left: 14, transform: 'translateY(-50%)' }} />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>

        {/* Heading */}
        <div style={{ marginBottom: 36 }}>
          <h2
            className="font-barlow font-black uppercase"
            style={{ fontSize: 46, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 8, color: '#2C2C2C' }}
          >
            RESERVE A TABLE
          </h2>
          <p style={{ fontSize: 12, color: '#888888' }}>
            Available for lunch and dinner — instant confirmation to your email.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'white', border: '1.5px solid rgba(26,26,26,.18)',
            borderRadius: 22, padding: '32px 32px',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {isBooked ? (
            /* ── Confirmation ── */
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(232,68,122,.1)', border: '1.5px solid #E8447A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle style={{ width: 28, height: 28, color: '#E8447A'}} />
              </div>
              <h4 className="font-barlow font-black uppercase text-[#1a1a1a]" style={{ fontSize: 28, marginBottom: 6 }}>
                Table Confirmed, {name}!
              </h4>
              <p style={{ fontSize: 11, color: 'rgba(26,26,26,.5)', marginBottom: 28 }}>
                Confirmation sent to <strong style={{ color: '#1a1a1a' }}>{email}</strong>
              </p>

              {/* Receipt */}
              <div style={{ maxWidth: 380, margin: '0 auto 28px', border: '1.5px solid rgba(26,26,26,.12)', borderRadius: 18, padding: '20px 24px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(26,26,26,.08)', paddingBottom: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(26,26,26,.4)' }}>Reservation Receipt</span>
                  <span style={{ background: '#E8447A', color: 'white', fontSize: 8, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6 }}>
                    {bookingId}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                  {[
                    { label: 'Date',    value: date    },
                    { label: 'Time',    value: time    },
                    { label: 'Guests',  value: `${guests} Diner${guests !== '1' ? 's' : ''}` },
                    { label: 'Seating', value: seating },
                  ].map(row => (
                    <div key={row.label}>
                      <span style={{ display: 'block', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(26,26,26,.4)', marginBottom: 2 }}>{row.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                {notes && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(26,26,26,.08)' }}>
                    <span style={{ display: 'block', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(26,26,26,.4)', marginBottom: 2 }}>Special Requests</span>
                    <p style={{ fontSize: 11, color: 'rgba(26,26,26,.6)', fontStyle: 'italic' }}>"{notes}"</p>
                  </div>
                )}
              </div>

              <button onClick={handleReset} className="cursor-pointer border-none transition-opacity hover:opacity-75" style={{ background: '#E8447A', color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '12px 24px', borderRadius: 100 }}>
                Book Another Table
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Date */}
                <div>
                  <label style={labelStyle}>1. Select Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar style={{ position: 'absolute', left: 12, top: 11, width: 14, height: 14, color: '#db2777', pointerEvents: 'none' }} />
                    <input
                      type="date" value={date} onChange={e => setDate(e.target.value)} required
                      onFocus={() => setFocusedInput('date')} onBlur={() => setFocusedInput(null)}
                      style={{ ...inputStyle('date'), paddingLeft: 36 }}
                    />
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <label style={labelStyle}>2. Select Time Slot</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {timeSlots.map(slot => {
                      const sel = time === slot;
                      return (
                        <button
                          key={slot} type="button" onClick={() => setTime(slot)}
                          className="cursor-pointer border-none"
                          style={{
                            padding: '9px 4px', fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                            borderRadius: 10, border: `1.5px solid ${sel ? '#E8447A' : 'rgba(44,44,44,.18)'}`,
                            background: sel ? '#E8447A' : 'white',
                            color: sel ? 'white' : 'rgba(44,44,44,.65)',
                            transition: 'all .18s ease',
                            boxShadow: sel ? '0 2px 8px rgba(232,68,122,.4)' : 'none',
                            transform: sel ? 'scale(1.04)' : 'scale(1)',
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label style={labelStyle}>3. Party Size</label>
                  <div style={{ position: 'relative' }}>
                    <Users style={{ position: 'absolute', left: 12, top: 11, width: 14, height: 14, color: '#db2777', pointerEvents: 'none' }} />
                    <select
                      value={guests} onChange={e => setGuests(e.target.value)}
                      onFocus={() => setFocusedInput('guests')} onBlur={() => setFocusedInput(null)}
                      style={{ ...inputStyle('guests'), paddingLeft: 36, appearance: 'none', cursor: 'pointer' }}
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} Diner{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Seating */}
                <div>
                  <label style={labelStyle}>4. Seating Style</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {seatingOptions.map(opt => {
                      const sel = seating === opt.name;
                      return (
                        <div
                          key={opt.id} onClick={() => setSeating(opt.name)}
                          style={{
                            padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                            border: `1.5px solid ${sel ? '#E8447A' : 'rgba(44,44,44,.12)'}`,
                            background: sel ? 'rgba(232,68,122,.08)' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            transition: 'all .18s ease',
                            boxShadow: sel ? '0 2px 10px rgba(244,165,176,.3)' : 'none',
                          }}
                        >
                          <div>
                            <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: sel ? '#E8447A' : '#2C2C2C', transition: 'color .18s' }}>{opt.name}</span>
                            <span style={{ fontSize: 9, color: 'rgba(26,26,26,.45)', letterSpacing: '.5px', textTransform: 'uppercase' }}>{opt.desc}</span>
                          </div>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${sel ? '#E8447A' : 'rgba(44,44,44,.2)'}`, background: sel ? '#E8447A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .18s ease' }}>
                            {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label style={labelStyle}>5. Your Details</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input type="text"  placeholder="Full name"    value={name}  required onChange={e => setName(e.target.value)}  onFocus={() => setFocusedInput('name')}  onBlur={() => setFocusedInput(null)} style={inputStyle('name')} />
                    <input type="email" placeholder="Email address" value={email} required onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} style={inputStyle('email')} />
                    <input type="text"  placeholder="Dietary requirements or special requests (optional)" value={notes} onChange={e => setNotes(e.target.value)} onFocus={() => setFocusedInput('notes')} onBlur={() => setFocusedInput(null)} style={inputStyle('notes')} />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={createReservation.isPending}
                  className="cursor-pointer border-none transition-opacity hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ width: '100%', background: '#E8447A', color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '14px 16px', borderRadius: 100, fontFamily: 'inherit' }}
                >
                  {createReservation.isPending ? (
                    <>
                      <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                      <span>Reserving…</span>
                    </>
                  ) : (
                    <>
                      <span>Reserve Table</span>
                      <ArrowRight style={{ width: 14, height: 14 }} />
                    </>
                  )}
                </button>
                <p style={{ fontSize: 9, color: 'rgba(26,26,26,.4)', textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                  No credit card deposit required
                </p>
              </div>

            </form>
          )}
        </div>
      </div>
    </section>
  );
}
