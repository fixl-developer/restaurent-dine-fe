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
    <section style={{
      background: BG,
      width: '100%'
    }}>
      <div style={{
        width: '100%',
        padding: 'clamp(32px, 72px, 88px) clamp(12px, 5vw, 56px)',
        maxWidth: '1400px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 40px, 56px)' }}>
          <p className="font-script" style={{ fontSize: 'clamp(13px, 16px, 18px)', color: PINK, marginBottom: 4 }}>
            come say hello ♡
          </p>
          <h2
            className="font-barlow font-black uppercase"
            style={{ fontSize: 'clamp(32px, 46px, 52px)', letterSpacing: '-0.5px', lineHeight: 1, color: HEAD }}
          >
            VISIT US
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Address + contact */}
          <div
            style={{
              background: WHITE,
              borderRadius: 22,
              padding: 'clamp(20px, 32px, 40px) clamp(20px, 32px, 40px) clamp(18px, 28px, 36px)',
              border: '1.5px solid rgba(124,77,204,.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(14px, 22px, 28px)',
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
                    fontSize: 'clamp(8px, 9px, 11px)',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: TL,
                    marginBottom: 6,
                  }}
                >
                  Address
                </div>
                <div style={{ fontSize: 'clamp(13px, 14px, 16px)', color: HEAD, fontWeight: 600, marginBottom: 4 }}>
                  {brandAddress || 'Address not set'}
                </div>
                <div style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TX }}>
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
                      fontSize: 'clamp(10px, 11px, 13px)',
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
                      fontSize: 'clamp(8px, 9px, 11px)',
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
                    style={{ fontSize: 'clamp(13px, 14px, 16px)', fontWeight: 600, color: HEAD, textDecoration: 'none' }}
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
                      fontSize: 'clamp(8px, 9px, 11px)',
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
                    style={{ fontSize: 'clamp(13px, 14px, 16px)', fontWeight: 600, color: HEAD, textDecoration: 'none' }}
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
              padding: 'clamp(20px, 32px, 40px) clamp(20px, 32px, 40px) clamp(18px, 28px, 36px)',
              border: '1.5px solid rgba(124,77,204,.08)',
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 'clamp(14px, 22px, 28px)' }}>
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
                    fontSize: 'clamp(8px, 9px, 11px)',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: TL,
                  }}
                >
                  Opening Hours
                </div>
                <div className="font-barlow font-black" style={{ fontSize: 'clamp(16px, 18px, 20px)', color: HEAD }}>
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
                      fontSize: 'clamp(10px, 11px, 13px)',
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
                      fontSize: 'clamp(12px, 13px, 15px)',
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
                <p style={{ fontSize: 'clamp(10px, 11px, 13px)', color: TL, fontStyle: 'italic', textAlign: 'center', padding: 'clamp(8px, 12px, 16px) 0' }}>
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
