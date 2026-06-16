import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { RestaurantDto } from '../../../lib/dto/restaurant';

const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const PURP = '#7C4DCC';
const HEAD = '#2C2C2C';
const TL = '#888888';
const TX = '#4A4A4A';
const WHITE = '#FFFFFF';
const BG = '#FFF9C4';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface VisitUsProps {
  restaurant?: RestaurantDto;
}

export default function VisitUs({ restaurant }: VisitUsProps) {
  const brandAddress = restaurant?.brand.address ?? '';
  const brandCity = restaurant?.brand.location?.city ?? '';
  const brandState = restaurant?.brand.location?.state ?? '';
  const brandPhone = restaurant?.brand.contactPhone;
  const brandEmail = restaurant?.brand.contactEmail;
  const hours = restaurant?.brand.openingHours ?? [];

  // Sort by day (0 = Sunday). Show all 7 days; mark closed days clearly.
  const hoursByDay = DAY_LABELS.map((label, dayIdx) => {
    const entry = hours.find((h) => h.dayOfWeek === dayIdx);
    if (!entry || entry.isClosed) return { label, hours: 'Closed' };
    return { label, hours: `${entry.open} – ${entry.close}` };
  });

  const fullAddress = [brandAddress, brandCity, brandState].filter(Boolean).join(', ');
  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  return (
    <section style={{ background: BG, padding: '72px 48px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="font-script" style={{ fontSize: 16, color: PINK, marginBottom: 4 }}>
            come say hello ♡
          </p>
          <h2
            className="font-barlow font-black uppercase"
            style={{ fontSize: 46, letterSpacing: '-0.5px', lineHeight: 1, color: HEAD }}
          >
            VISIT US
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Address + contact */}
          <div
            style={{
              background: WHITE,
              borderRadius: 22,
              padding: '32px 32px 28px',
              border: '1.5px solid rgba(124,77,204,.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: `${PINK}1A`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MapPin style={{ width: 20, height: 20, color: PINK }} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: TL,
                    marginBottom: 6,
                  }}
                >
                  Address
                </div>
                <div style={{ fontSize: 14, color: HEAD, fontWeight: 600, marginBottom: 4 }}>
                  {brandAddress || 'Address not set'}
                </div>
                <div style={{ fontSize: 12, color: TX }}>
                  {[brandCity, brandState].filter(Boolean).join(', ') || '—'}
                </div>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      color: TEAL,
                      textDecoration: 'none',
                    }}
                  >
                    Open in Maps →
                  </a>
                )}
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(124,77,204,.1)' }} />

            {brandPhone && (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${TEAL}1A`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Phone style={{ width: 18, height: 18, color: TEAL }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: TL,
                      marginBottom: 2,
                    }}
                  >
                    Call
                  </div>
                  <a
                    href={`tel:${brandPhone}`}
                    style={{ fontSize: 14, fontWeight: 600, color: HEAD, textDecoration: 'none' }}
                  >
                    {brandPhone}
                  </a>
                </div>
              </div>
            )}

            {brandEmail && (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${PURP}1A`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mail style={{ width: 18, height: 18, color: PURP }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: TL,
                      marginBottom: 2,
                    }}
                  >
                    Email
                  </div>
                  <a
                    href={`mailto:${brandEmail}`}
                    style={{ fontSize: 14, fontWeight: 600, color: HEAD, textDecoration: 'none' }}
                  >
                    {brandEmail}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Hours */}
          <div
            style={{
              background: WHITE,
              borderRadius: 22,
              padding: '32px 32px 28px',
              border: '1.5px solid rgba(124,77,204,.08)',
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 22 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: `${PINK}1A`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock style={{ width: 20, height: 20, color: PINK }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: TL,
                  }}
                >
                  Opening Hours
                </div>
                <div className="font-barlow font-black" style={{ fontSize: 18, color: HEAD }}>
                  This week
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hoursByDay.map((row, idx) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: idx < hoursByDay.length - 1 ? 10 : 0,
                    borderBottom: idx < hoursByDay.length - 1 ? '1px dashed rgba(124,77,204,.12)' : 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: TX,
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: row.hours === 'Closed' ? TL : HEAD,
                      fontStyle: row.hours === 'Closed' ? 'italic' : 'normal',
                    }}
                  >
                    {row.hours}
                  </span>
                </div>
              ))}
              {hours.length === 0 && (
                <p style={{ fontSize: 11, color: TL, fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                  Opening hours not configured yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
