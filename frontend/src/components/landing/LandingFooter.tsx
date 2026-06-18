import { Link } from 'react-router-dom';
import type { RestaurantDto } from '../../lib/dto/restaurant';

const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const TL = '#888888';
const WHITE = '#FFFFFF';

function formatHoursSummary(hours: RestaurantDto['brand']['openingHours'] | undefined): string {
  if (!hours || hours.length === 0) return 'Open 8am – 10pm';
  const openDays = hours.filter((h) => !h.isClosed);
  if (openDays.length === 0) return 'Closed';
  const first = openDays[0];
  return `Open ${first.open} – ${first.close}`;
}

interface LandingFooterProps {
  restaurant?: RestaurantDto;
}

export default function LandingFooter({ restaurant }: LandingFooterProps) {
  const brandName = restaurant?.brand.name ?? 'SmartDine';
  const brandAddress = restaurant?.brand.address ?? '842 Pastel Blvd';
  const brandCity = restaurant?.brand.location?.city ?? 'Los Angeles';
  const brandState = restaurant?.brand.location?.state ?? 'CA';
  const brandPhone = restaurant?.brand.contactPhone;
  const brandEmail = restaurant?.brand.contactEmail;
  const hoursSummary = formatHoursSummary(restaurant?.brand.openingHours);

  return (
    <footer
      style={{
        background: WHITE,
        borderTop: '1px solid rgba(124,77,204,.08)',
        width: '100%'
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'clamp(16px, 28px, 36px)',
        marginBottom: 'clamp(20px, 32px, 40px)',
        width: '100%',
        padding: 'clamp(28px, 44px, 56px) clamp(12px, 5vw, 56px) clamp(16px, 28px, 36px)',
        maxWidth: '1400px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div>
          <div className="font-lora italic" style={{ fontSize: 'clamp(18px, 22px, 26px)', color: PINK, marginBottom: 10 }}>
            {brandName}
          </div>
          <p style={{ fontSize: 'clamp(10px, 11px, 13px)', color: TL, lineHeight: 1.7, maxWidth: 200 }}>
            {brandCity}'s favourite neighbourhood café. Fresh food, specialty drinks, good energy.
          </p>
        </div>
        <div>
          <h4
            style={{
              fontSize: 'clamp(8px, 9px, 11px)',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: TEAL,
              marginBottom: 12,
            }}
          >
            Explore
          </h4>
          {[
            { label: 'Menu', to: '/menu' },
            { label: 'Reserve a Table', to: '/reserve' },
            { label: 'Combos', to: '/combos' },
            { label: 'Home', to: '/' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block cursor-pointer"
              style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginBottom: 8, textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div>
          <h4
            style={{
              fontSize: 'clamp(8px, 9px, 11px)',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: TEAL,
              marginBottom: 12,
            }}
          >
            Contact
          </h4>
          {brandPhone && (
            <a
              href={`tel:${brandPhone}`}
              className="block cursor-pointer"
              style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginBottom: 8, textDecoration: 'none' }}
            >
              {brandPhone}
            </a>
          )}
          {brandEmail && (
            <a
              href={`mailto:${brandEmail}`}
              className="block cursor-pointer"
              style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginBottom: 8, textDecoration: 'none' }}
            >
              {brandEmail}
            </a>
          )}
          {!brandPhone && !brandEmail && (
            <span className="block" style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginBottom: 8 }}>
              Get in touch
            </span>
          )}
        </div>
        <div>
          <h4
            style={{
              fontSize: 'clamp(8px, 9px, 11px)',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: TEAL,
              marginBottom: 12,
            }}
          >
            Visit
          </h4>
          <span className="block" style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginBottom: 8 }}>{brandAddress}</span>
          <span className="block" style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginBottom: 8 }}>
            {brandCity}, {brandState}
          </span>
          <span className="block" style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginBottom: 8 }}>{hoursSummary}</span>
        </div>
      </div>
      <div
        className="flex flex-wrap justify-between items-center gap-4"
        style={{ borderTop: '1px solid rgba(124,77,204,.08)', paddingTop: 'clamp(12px, 20px, 28px)' }}
      >
        <p style={{ fontSize: 'clamp(9px, 10px, 12px)', color: TL }}>
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </p>
        <p style={{ fontSize: 'clamp(9px, 10px, 12px)', color: PINK }}>
          📍 {brandCity}, {brandState}
        </p>
        <p style={{ fontSize: 'clamp(9px, 10px, 12px)', color: TL }}>Made with ♥</p>
      </div>
    </footer>
  );
}
