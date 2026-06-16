import { useState } from 'react';
import type { RestaurantDto } from '../../lib/dto/restaurant';
import LandingHeader from '../../components/landing/LandingHeader';
import LandingFooter from '../../components/landing/LandingFooter';
import BookingSection from '../../components/BookingSection';

const TEAL = '#1BC8C8';
const TX = '#4A4A4A';
const WHITE = '#FFFFFF';

interface ReservePageProps {
  cartCount: number;
  onOpenCart: () => void;
  restaurant?: RestaurantDto;
}

export default function ReservePage({ cartCount, onOpenCart, restaurant }: ReservePageProps) {
  const brandName = restaurant?.brand.name ?? 'SmartDine';
  const [confirmation, setConfirmation] = useState<{
    guests: string;
    date: string;
    time: string;
    seating: string;
  } | null>(null);

  return (
    <div className="w-full font-sans">
      <LandingHeader brandName={brandName} cartCount={cartCount} onOpenCart={onOpenCart} />

      <BookingSection onSuccess={(details) => setConfirmation(details)} />

      {confirmation && (
        <div style={{ background: WHITE, padding: '0 48px 36px' }}>
          <div
            className="flex items-center justify-between gap-4 rounded-2xl p-4 shadow-sm"
            style={{ background: 'rgba(27,200,200,.06)', border: `1px solid ${TEAL}`, maxWidth: 900, margin: '0 auto' }}
          >
            <p style={{ fontSize: 11.5, color: TX, fontWeight: 700 }}>
              Table confirmed for <strong>{confirmation.guests} guests</strong> on{' '}
              <strong>{confirmation.date}</strong> at <strong>{confirmation.time}</strong> —{' '}
              {confirmation.seating}.
            </p>
            <button
              onClick={() => setConfirmation(null)}
              className="bg-transparent border-none cursor-pointer hover:underline whitespace-nowrap"
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: TEAL,
                fontFamily: 'inherit',
              }}
            >
              [Dismiss]
            </button>
          </div>
        </div>
      )}

      <LandingFooter restaurant={restaurant} />
    </div>
  );
}
