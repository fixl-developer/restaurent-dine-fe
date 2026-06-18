import { useNavigate } from 'react-router-dom';
import { DECOR_IMAGES } from '../foodData';
import type { MenuItem } from '../types';
import type { RestaurantDto } from '../lib/dto/restaurant';
import type { LandingContentDto } from '../lib/dto/landing';
import LandingHeader from './landing/LandingHeader';
import LandingFooter from './landing/LandingFooter';
import StatsStrip from './landing/sections/StatsStrip';
import FeaturedDishes from './landing/sections/FeaturedDishes';
import SustainabilityStory from './landing/sections/SustainabilityStory';
import PressStrip from './landing/sections/PressStrip';
import FaqSection from './landing/sections/FaqSection';
import NewsletterSignup from './landing/sections/NewsletterSignup';
import VisitUs from './landing/sections/VisitUs';
import dogVideo from '../assets/images/video.mp4';

// ── Palette ────────────────────────────────────────────────────────────────────
const PINK = '#E8447A';
const TEAL = '#1BC8C8';
const PURP = '#7C4DCC';
const DARK = '#1a1a1a';
const HEAD = '#2C2C2C';
const TL = '#888888';
const WHITE = '#FFFFFF';

// Section backgrounds — direct from client reference images
const BG_HERO = '#FFE8EE';
const BG_ABOUT = '#E3F2FD';
const BG_GALLERY = '#FFD6DC';
const BG_YELLOW = '#FFFDE7';

// ── Decorative SVGs ───────────────────────────────────────────────────────────

const Starburst = () => (
  <svg viewBox="0 0 44 44" style={{ width: 44, height: 44 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M22 2 L25.5 17 L38 8 L29 20.5 L44 22 L29 23.5 L38 36 L25.5 27 L22 42 L18.5 27 L6 36 L15 23.5 L0 22 L15 20.5 L6 8 L18.5 17 Z"
      fill="#D4B84A"
    />
  </svg>
);

const PinkyPromiseStamp = () => (
  <svg
    width="96"
    height="96"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.22))' }}
  >
    <circle cx="48" cy="48" r="46" fill="rgba(255,255,255,0.95)" stroke={PINK} strokeWidth="3.5" />
    <circle cx="48" cy="48" r="39" fill="none" stroke={TEAL} strokeWidth="1.8" />
    <text x="48" y="35" textAnchor="middle" fontFamily="Dancing Script, cursive" fontSize="20" fontWeight="700" fill={PINK}>
      Pinky
    </text>
    <text x="66" y="27" textAnchor="middle" fontSize="9" fill="#CC0044">
      ♥
    </text>
    <text x="48" y="48" textAnchor="middle" fontFamily="Dancing Script, cursive" fontSize="16" fontWeight="600" fill={TEAL}>
      promise
    </text>
    <text x="48" y="59" textAnchor="middle" fontFamily="sans-serif" fontSize="6" letterSpacing="0.5" fill={TEAL}>
      — cafe &amp; Restaurant —
    </text>
    <text x="48" y="69" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill={PINK}>
      ♡ Venice Beach ♡
    </text>
    <text x="48" y="79" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="rgba(0,0,0,0.25)" letterSpacing="1">
      ™
    </text>
  </svg>
);

// ── Static fallback content ───────────────────────────────────────────────────

const STATIC_TICKER_ITEMS = [
  'Fresh Daily',
  'QR Ordering',
  'Grain Bowls',
  'Seasonal Specials',
  'Table Reservations',
  'Organic Teas',
];

// Generic placeholder steps shown only when the CMS hasn't been configured yet.
// Unlike user-generated content (reviews/gallery), these are descriptive copy
// that's safe to show as default — admins replace via /landing.
const DEFAULT_HOW_STEPS = [
  {
    num: '01',
    name: 'PICK YOUR PLATE',
    body: 'Browse our seasonal menu built around fresh produce from local farms and artisan bakers.',
  },
  {
    num: '02',
    name: 'SCAN & ORDER',
    body: 'Use the QR code at your table to order directly from your phone — no app download needed.',
  },
  {
    num: '03',
    name: 'DINE IN STYLE',
    body: 'Your order goes straight to the kitchen. Sit back and enjoy the warm ambience.',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatHoursSummary(hours: RestaurantDto['brand']['openingHours'] | undefined): string {
  if (!hours || hours.length === 0) return 'Open 8am – 10pm';
  const openDays = hours.filter((h) => !h.isClosed);
  if (openDays.length === 0) return 'Closed';
  const first = openDays[0];
  return `Open ${first.open} – ${first.close}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface StorytellingHomeProps {
  cartCount: number;
  onOpenCart: () => void;
  menuItems: MenuItem[];
  publicReviews?: Array<{
    id: string;
    customerName?: string;
    customerCity?: string;
    rating: number;
    text: string;
    createdAt: string;
  }>;
  publicRating?: { avgRating: number; total: number };
  restaurant?: RestaurantDto;
  landingContent?: LandingContentDto;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StorytellingHome({
  cartCount,
  onOpenCart,
  menuItems,
  publicReviews,
  publicRating,
  restaurant,
  landingContent,
}: StorytellingHomeProps) {
  const navigate = useNavigate();

  // Restaurant info — fall back to hardcoded copy when backend data missing.
  const brandName = restaurant?.brand.name ?? 'SmartDine';
  const brandCity = restaurant?.brand.location?.city ?? 'Los Angeles';
  const brandState = restaurant?.brand.location?.state ?? 'CA';
  const hoursSummary = formatHoursSummary(restaurant?.brand.openingHours);

  // Today's special — first menu item tagged "special", or the first menu item.
  const todaysSpecial = menuItems.find((m) => m.badge === 'POPULAR') ?? menuItems[0];

  // Ticker — mix static USPs with restaurant-driven items.
  const tickerBase = [...STATIC_TICKER_ITEMS, hoursSummary, `${brandCity} ${brandState}`.trim()];
  const tickerItems = [...tickerBase, ...tickerBase];

  // Reviews — only real backend feedback; no fake fallback content.
  const hasReviews = !!(publicReviews && publicReviews.length > 0);
  const reviews = hasReviews
    ? publicReviews!.map((r) => ({
        text: r.text,
        author: r.customerName
          ? `— ${r.customerName}${r.customerCity ? `, ${r.customerCity}` : ''}`
          : '— Anonymous guest',
        createdAt: r.createdAt as string | undefined,
      }))
    : [];
  const hasRating = !!(publicRating && publicRating.total > 0);

  // CMS-driven content. How-it-works is descriptive copy → safe default.
  // Gallery is user-generated content → hide section entirely if empty.
  const howSteps =
    landingContent?.howItWorks && landingContent.howItWorks.length > 0
      ? landingContent.howItWorks
      : DEFAULT_HOW_STEPS;
  const galleryImages: string[] =
    landingContent?.gallery && landingContent.gallery.length > 0
      ? landingContent.gallery.map((g) => g.imageUrl)
      : [];
  const hasGallery = galleryImages.length > 0;
  const galleryHashtag = landingContent?.galleryHashtag;

  return (
    <div className="w-full font-sans" style={{ width: '100%', overflow: 'hidden' }}>
      <LandingHeader brandName={brandName} cartCount={cartCount} onOpenCart={onOpenCart} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="hero-grid grid w-full"
        style={{
          background: BG_HERO,
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          minHeight: 'clamp(350px, 480px, 600px)',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: 'clamp(20px, 5vw, 48px)',
          boxSizing: 'border-box',
          display: 'grid',
          justifyItems: 'stretch',
          alignItems: 'stretch'
        }}
      >
        <div className="flex flex-col justify-between relative z-10" style={{ padding: 'clamp(24px, 5vw, 56px) clamp(16px, 4vw, 48px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="absolute" style={{ top: 'clamp(12px, 3vw, 22px)', right: 'clamp(12px, 3vw, 18px)' }}>
            <Starburst />
          </div>
          <div style={{ marginTop: 'clamp(16px, 36px, 48px)' }}>
            <p className="font-script" style={{ fontSize: 'clamp(13px, 16px, 18px)', color: TEAL, marginBottom: 8 }}>
              freshly crafted, every day ♡
            </p>
            <h1
              className="font-barlow font-black uppercase"
              style={{ fontSize: 'clamp(48px, 8vw, 78px)', lineHeight: 0.9, letterSpacing: '-1px', color: HEAD }}
            >
              DISCOVER
              <br />
              THE
              <br />
              FINEST
              <br />
              DINING.
            </h1>
          </div>
          <p style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, lineHeight: 1.6, marginTop: 14, maxWidth: 210 }}>
            Artisan pastries, fresh grain bowls & specialty teas — served with care in {brandCity}.
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="cursor-pointer border-none transition-opacity hover:opacity-80"
            style={{
              marginTop: 'clamp(12px, 3vw, 20px)',
              background: PINK,
              color: WHITE,
              fontSize: 'clamp(9px, 1.8vw, 11px)',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: 'clamp(10px, 2vw, 13px) clamp(18px, 4vw, 26px)',
              borderRadius: 100,
              width: 'fit-content',
              whiteSpace: 'nowrap'
            }}
          >
            View Full Menu
          </button>
        </div>
        <div className="flex items-stretch" style={{ padding: 'clamp(12px, 3vw, 24px)', paddingRight: 'clamp(12px, 3vw, 24px)', display: 'flex', alignItems: 'stretch' }}>
          <div
            className="flex-1 overflow-hidden relative"
            style={{
              borderRadius: 'clamp(14px, 4vw, 20px)',
              minHeight: 'clamp(300px, 440px, 540px)',
              background: `linear-gradient(135deg,${BG_HERO} 0%,#ffc2d0 100%)`,
            }}
          >
            <img
              src={DECOR_IMAGES.decor1}
              alt={`${brandName} signature dish`}
              className="w-full h-full object-cover absolute inset-0"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
            <div className="absolute" style={{ top: 'clamp(10px, 2vw, 16px)', right: 'clamp(10px, 2vw, 16px)', zIndex: 10 }}>
              <PinkyPromiseStamp />
            </div>
            {todaysSpecial && (
              <div
                className="absolute rounded-xl z-10"
                style={{
                  bottom: 'clamp(12px, 3vw, 18px)',
                  left: 'clamp(12px, 3vw, 18px)',
                  padding: 'clamp(10px, 2vw, 16px) clamp(12px, 3vw, 16px)',
                  background: 'rgba(255,255,255,.92)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  maxWidth: 'clamp(140px, 60%, 200px)'
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(7px, 1.5vw, 9px)',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: TL,
                    marginBottom: 'clamp(2px, 1vw, 3px)',
                  }}
                >
                  Today's Special
                </div>
                <div className="font-barlow font-bold" style={{ fontSize: 'clamp(13px, 3vw, 16px)', color: HEAD, marginBottom: 'clamp(1px, 0.5vw, 2px)' }}>
                  {todaysSpecial.name}
                </div>
                <div style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: TEAL, fontWeight: 600, marginTop: 'clamp(1px, 0.5vw, 2px)' }}>
                  ${todaysSpecial.price.toFixed(2)} · Fresh Daily
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden"
        style={{
          background: BG_YELLOW,
          borderTop: '1px solid rgba(27,200,200,.15)',
          borderBottom: '1px solid rgba(27,200,200,.15)',
          padding: 'clamp(8px, 2vw, 14px) 0',
          width: '100%'
        }}
      >
        <div className="ticker-roll">
          {tickerItems.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center"
              style={{
                fontSize: 'clamp(8px, 2vw, 11px)',
                fontWeight: 700,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: i % 2 === 0 ? TEAL : PURP,
                padding: '0 clamp(12px, 3vw, 24px)',
                gap: 'clamp(12px, 3vw, 24px)',
              }}
            >
              {item}
              <span style={{ fontSize: 'clamp(10px, 2vw, 13px)', color: PINK }}>♡</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────────────────────── */}
      <StatsStrip publicRating={publicRating} menuItemCount={menuItems.length} />

      {/* ── About / Video ─────────────────────────────────────────────────── */}
      <section id="about" className="about-grid w-full" style={{
        background: BG_ABOUT,
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0',
        minHeight: 'clamp(300px, 50vh, 500px)'
      }}>
        <div
          className="flex flex-col justify-center"
          style={{
            padding: 'clamp(28px, 5vw, 64px) clamp(16px, 4vw, 56px)',
            borderRight: 'none',
            minHeight: 'clamp(300px, 50vh, 450px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              fontSize: 'clamp(8px, 9px, 11px)',
              fontWeight: 700,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: TEAL,
              marginBottom: 6,
            }}
          >
            {brandCity}, {brandState} · Est. 2026
          </div>
          <p className="font-script" style={{ fontSize: 'clamp(13px, 16px, 18px)', color: PINK, marginBottom: 8 }}>
            more than just a meal ♡
          </p>
          <h2
            className="font-barlow font-black uppercase"
            style={{ fontSize: 'clamp(32px, 48px, 56px)', lineHeight: 0.9, letterSpacing: '-0.5px', marginBottom: 16, color: HEAD }}
          >
            MORE THAN
            <br />
            JUST FOOD.
          </h2>
          <p style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, lineHeight: 1.7, maxWidth: 280, marginBottom: 24 }}>
            We're a spot where every detail matters. Locally sourced, made fresh each morning, served with genuine warmth.
          </p>
          <button
            onClick={() => navigate('/reserve')}
            className="cursor-pointer border-none transition-opacity hover:opacity-80 w-fit"
            style={{
              background: PINK,
              color: WHITE,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '13px 26px',
              borderRadius: 100,
            }}
          >
            Reserve a Table
          </button>
        </div>
        <div style={{ overflow: 'hidden', display: 'flex', alignItems: 'stretch', minHeight: 'clamp(300px, 50vh, 450px)' }}>
          <video
            src={dogVideo}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </section>

      {/* ── Featured Dishes ──────────────────────────────────────────────── */}
      <FeaturedDishes menuItems={menuItems} />

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: WHITE,
          padding: 'clamp(24px, 44px, 56px) 0',
          borderTop: '1px solid rgba(124,77,204,.08)',
          width: '100%'
        }}
      >
        <div style={{ width: '100%', padding: '0 clamp(20px, 5vw, 56px)', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
          <p className="font-script" style={{ fontSize: 'clamp(13px, 16px, 18px)', color: TEAL, marginBottom: 4 }}>
            simple & delightful ♡
          </p>
          <h2
            className="font-barlow font-black uppercase"
            style={{ fontSize: 'clamp(32px, 46px, 52px)', letterSpacing: '-0.5px', marginBottom: 6, color: DARK }}
          >
            HOW IT WORKS
          </h2>
          <p style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginBottom: 28 }}>Hover each card to discover the step.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
          {howSteps.map((step) => (
            <div key={step.num} className="how-flip-wrapper">
              <div className="how-flip-inner">
                <div className="how-flip-face" style={{ background: '#EBEBEB' }}>
                  <img
                    src={DECOR_IMAGES.decor3}
                    alt=""
                    aria-hidden
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                </div>
                <div
                  className="how-flip-face how-flip-back"
                  style={{ background: '#FFE8EE', display: 'flex', flexDirection: 'column', padding: '28px 22px' }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: PINK,
                      marginBottom: 14,
                    }}
                  >
                    {step.num}
                  </div>
                  <div
                    className="font-barlow font-black uppercase"
                    style={{ fontSize: 22, letterSpacing: '-0.3px', marginBottom: 14, lineHeight: 1.1, color: HEAD }}
                  >
                    {step.name}
                  </div>
                  <div style={{ fontSize: 12, color: TL, lineHeight: 1.7 }}>{step.body}</div>
                  <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                    <div style={{ width: 32, height: 3, background: PINK, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* ── Sustainability / Sourcing ────────────────────────────────────── */}
      <SustainabilityStory />

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#E8F5E9', overflow: 'hidden', width: '100%' }}>
        <div style={{
          marginBottom: 36,
          width: '100%',
          padding: 'clamp(32px, 52px, 64px) clamp(12px, 5vw, 56px)',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          {hasRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: WHITE,
                  border: `1px solid rgba(232,68,122,.2)`,
                  borderRadius: 100,
                  padding: '5px 14px 5px 10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                }}
              >
                <span style={{ fontSize: 13 }}>⭐</span>
                <span
                  style={{
                    fontSize: 'clamp(8px, 9px, 11px)',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: PINK,
                  }}
                >
                  Google Reviews
                </span>
              </div>
              <span style={{ fontSize: 'clamp(9px, 10px, 12px)', color: TL, fontWeight: 600, letterSpacing: '1px' }}>
                {publicRating!.avgRating.toFixed(1)} · {publicRating!.total.toLocaleString()} reviews
              </span>
            </div>
          )}
          <h2
            className="font-barlow font-black uppercase"
            style={{ fontSize: 'clamp(32px, 46px, 52px)', letterSpacing: '-0.5px', color: HEAD, lineHeight: 1 }}
          >
            WHAT THEY SAY
          </h2>
          <p style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginTop: 8 }}>
            {hasReviews
              ? 'Hover any card to pause. Read at your own pace.'
              : 'Be the first to leave a review — your feedback shows up here after dining with us.'}
          </p>
        </div>
        {hasReviews && (
        <div style={{ overflow: 'hidden', paddingBottom: 4 }}>
          <div className="marquee-reviews">
            {[...reviews, ...reviews].map((review, i) => {
              const raw = review.author.replace(/^— /, '');
              const commaIdx = raw.indexOf(', ');
              const name = commaIdx !== -1 ? raw.slice(0, commaIdx) : raw;
              const location = commaIdx !== -1 ? raw.slice(commaIdx + 2) : '';
              const initials = name
                .split(' ')
                .map((w: string) => w[0])
                .join('')
                .replace(/[^A-Za-z]/g, '')
                .slice(0, 2)
                .toUpperCase();
              const AVATAR_PALETTE = [PINK, TEAL, PURP, '#F48FB1', '#4DD0E1', '#CE93D8', '#F06292', '#26C5DA', '#80DEEA'];
              const avatarBg = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
              const FALLBACK_DATES = [
                '2 days ago',
                '1 week ago',
                '3 weeks ago',
                '1 month ago',
                '6 weeks ago',
                '2 months ago',
                '10 weeks ago',
                '3 months ago',
                '4 months ago',
              ];
              const date = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : FALLBACK_DATES[i % FALLBACK_DATES.length];
              return (
                <div
                  key={i}
                  style={{
                    flexShrink: 0,
                    width: 310,
                    background: WHITE,
                    borderRadius: 20,
                    padding: '20px 22px 22px',
                    boxShadow: '0 6px 28px rgba(0,0,0,.28)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: avatarBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 15,
                        fontWeight: 800,
                        color: WHITE,
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: HEAD,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {name}
                      </div>
                      {location && <div style={{ fontSize: 10, color: TL, marginTop: 1 }}>{location}</div>}
                    </div>
                    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                      <path
                        fill="#4285F4"
                        d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                      />
                      <path
                        fill="#34A853"
                        d="M6.3 14.7l7 5.1C15.1 15.8 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M24 46c5.9 0 10.9-2 14.5-5.4l-6.7-5.5C29.8 36.9 27 38 24 38c-6.1 0-10.7-3.9-11.8-9.3l-7 5.4C8.2 41.3 15.5 46 24 46z"
                      />
                      <path
                        fill="#EA4335"
                        d="M44.5 20H24v8.5h11.8c-.9 3.1-3 5.7-5.8 7.4l6.7 5.5C41.1 37.9 45 31.4 45 24c0-1.3-.2-2.7-.5-4z"
                      />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: PINK, fontSize: 13, letterSpacing: 1 }}>★★★★★</span>
                    <span style={{ fontSize: 10, color: TL }}>{date}</span>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#4A4A4A',
                      lineHeight: 1.65,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {review.text.replace(/^"|"$/g, '')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </section>

      {/* ── Press / As Featured In ───────────────────────────────────────── */}
      <PressStrip />

      {/* ── Never Miss a Moment ───────────────────────────────────────────── */}
      {hasGallery && (
      <section style={{ background: BG_GALLERY, overflow: 'hidden', width: '100%' }}>
        <div style={{
          marginBottom: 28,
          width: '100%',
          padding: 'clamp(32px, 52px, 64px) clamp(12px, 5vw, 56px)',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          <h2
            className="font-barlow font-black uppercase"
            style={{ fontSize: 'clamp(32px, 46px, 52px)', letterSpacing: '-0.5px', color: HEAD }}
          >
            NEVER MISS A MOMENT
          </h2>
          <p style={{ fontSize: 'clamp(11px, 12px, 14px)', color: TL, marginTop: 6 }}>
            Captured by our guests &amp; team — every dish, every smile, every day.
          </p>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: 10 }}>
          <div className="marquee-gallery">
            {[...galleryImages, ...galleryImages].map((img, i) => (
              <div key={i} style={{ flexShrink: 0, width: 220, height: 170, borderRadius: 14, overflow: 'hidden' }}>
                <img
                  src={img}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div className="marquee-gallery-reverse">
            {[...galleryImages.slice().reverse(), ...galleryImages.slice().reverse()].map((img, i) => (
              <div key={i} style={{ flexShrink: 0, width: 220, height: 170, borderRadius: 14, overflow: 'hidden' }}>
                <img
                  src={img}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
        {galleryHashtag && (
          <div style={{ padding: 'clamp(16px, 28px, 32px) clamp(20px, 48px, 56px) 0', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ width: 32, height: 2, background: PINK, borderRadius: 2 }} />
            <span
              style={{
                fontSize: 'clamp(9px, 10px, 12px)',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: TL,
              }}
            >
              Tag us {galleryHashtag} to be featured
            </span>
          </div>
        )}
      </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <FaqSection />

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <NewsletterSignup />

      {/* ── Visit Us (address + hours) ───────────────────────────────────── */}
      <VisitUs restaurant={restaurant} />

      <LandingFooter restaurant={restaurant} />
    </div>
  );
}
