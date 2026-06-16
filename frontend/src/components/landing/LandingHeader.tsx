import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, ChevronDown } from 'lucide-react';

const PINK = '#E8447A';
const TX = '#4A4A4A';
const DARK = '#1a1a1a';
const WHITE = '#FFFFFF';

const NAV_LINKS = [
  { label: 'Menu', to: '/menu' },
  { label: 'Reserve', to: '/reserve' },
  { label: 'Combos', to: '/combos' },
];

const OPS_PAGES = [
  { label: 'Order Tracker', to: '/order-tracker' },
  { label: 'Vendor Console', to: '/vendor' },
  { label: 'Admin Portal', to: '/admin' },
  { label: 'Kitchen Display', to: '/kds' },
  { label: 'Table Operations', to: '/table-ops' },
  { label: 'Billing & Pay', to: '/billing-ops' },
  { label: 'QR Ordering', to: '/qr-order' },
];

interface LandingHeaderProps {
  brandName: string;
  cartCount: number;
  onOpenCart: () => void;
}

export default function LandingHeader({ brandName, cartCount, onOpenCart }: LandingHeaderProps) {
  const [opsOpen, setOpsOpen] = useState(false);

  return (
    <nav
      className="flex items-center justify-between"
      style={{
        background: WHITE,
        padding: '18px 48px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(124,77,204,.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,.06)',
      }}
    >
      <Link
        to="/"
        className="font-lora italic bg-transparent border-none cursor-pointer"
        style={{ fontSize: 20, color: PINK, letterSpacing: '-0.2px', textDecoration: 'none' }}
      >
        {brandName}
      </Link>

      <ul className="hidden md:flex list-none items-center" style={{ gap: 36 }}>
        {NAV_LINKS.map(({ label, to }) => (
          <li key={to}>
            <NavLink
              to={to}
              style={({ isActive }) => ({
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '1.8px',
                textTransform: 'uppercase',
                color: isActive ? PINK : TX,
                opacity: isActive ? 1 : 0.7,
                textDecoration: 'none',
              })}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex items-center" style={{ gap: 16 }}>
        <div className="relative hidden sm:block">
          <button
            onClick={() => setOpsOpen((v) => !v)}
            className="flex items-center gap-1 bg-transparent border-none cursor-pointer"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
              color: TX,
              opacity: 0.7,
            }}
          >
            Operations
            <ChevronDown
              style={{
                width: 12,
                height: 12,
                transform: opsOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform .15s',
              }}
            />
          </button>
          {opsOpen && (
            <div
              className="absolute top-full right-0 rounded-2xl overflow-hidden"
              style={{
                background: DARK,
                minWidth: 190,
                marginTop: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,.2)',
                zIndex: 50,
              }}
            >
              {OPS_PAGES.map((p) => (
                <Link
                  key={p.to}
                  to={p.to}
                  onClick={() => setOpsOpen(false)}
                  className="w-full text-left bg-transparent border-none cursor-pointer transition-opacity hover:opacity-75"
                  style={{
                    display: 'block',
                    padding: '10px 16px',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.75)',
                    textDecoration: 'none',
                  }}
                >
                  {p.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onOpenCart}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '1.8px',
            textTransform: 'uppercase',
            color: TX,
          }}
        >
          <ShoppingCart style={{ width: 16, height: 16, color: PINK }} />
          <span
            className="flex items-center justify-center font-barlow font-bold"
            style={{
              background: PINK,
              color: WHITE,
              fontSize: 10,
              minWidth: 20,
              height: 20,
              borderRadius: 100,
              padding: '0 6px',
            }}
          >
            {cartCount}
          </span>
        </button>
      </div>
    </nav>
  );
}
