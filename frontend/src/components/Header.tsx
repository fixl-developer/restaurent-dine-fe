import { useState } from 'react';
import { Menu, Search, ShoppingCart } from 'lucide-react';

interface HeaderProps {
  activePage: string;
  onChangePage: (page: string) => void;
  onScrollTo: (elementId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export default function Header({ activePage, onChangePage, onScrollTo, cartCount, onOpenCart }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home',         label: 'Home'              },
    { id: 'order-tracker',label: 'Order Tracker'     },
    { id: 'vendor',       label: 'Vendor Console'    },
    { id: 'admin',        label: 'Admin Portal'      },
    { id: 'kds',          label: 'Kitchen Display'   },
    { id: 'table-ops',    label: 'Table Operations'  },
    { id: 'billing-ops',  label: 'Billing & Payments'},
    { id: 'qr-order',     label: 'QR Ordering'       },
  ];

  return (
    <div className="sticky top-0 z-40 flex flex-col select-none" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(26,26,26,.1)' }}>

      {/* ── Top bar ── */}
      <header
        className="flex items-center justify-between relative"
        style={{ padding: '14px 32px', borderBottom: '1px solid rgba(26,26,26,.08)', background: '#FFFFFF' }}
      >
        {/* Left — hamburger + search */}
        <div className="flex items-center gap-6" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(26,26,26,.65)' }}>
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="flex items-center gap-1.5 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(26,26,26,.65)', fontFamily: 'inherit' }}
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <div className="relative hidden sm:block">
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="flex items-center gap-1.5 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(26,26,26,.65)', fontFamily: 'inherit' }}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            {searchOpen && (
              <input
                type="text"
                placeholder="Lookup dishes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                  background: 'white', border: '1.5px solid #E8447A',
                  borderRadius: 10, padding: '7px 12px',
                  fontSize: 11, fontFamily: 'inherit', outline: 'none',
                  width: 180, color: '#1a1a1a', fontWeight: 500,
                  boxShadow: '0 4px 16px rgba(0,0,0,.08)',
                }}
              />
            )}
          </div>
        </div>

        {/* Centre — logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => { onChangePage('home'); setTimeout(() => onScrollTo('hero'), 50); }}
            className="font-lora italic bg-transparent border-none cursor-pointer focus:outline-none"
            style={{ fontSize: 22, color: '#1a1a1a', letterSpacing: '-0.3px', lineHeight: 1 }}
          >
            SmartDine
          </button>
        </div>

        {/* Right — contact + cart */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => onChangePage('qr-order')}
            className="hidden md:flex items-center gap-1.5 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(26,26,26,.65)', fontFamily: 'inherit' }}
          >
            <span>Scan & Order</span>
          </button>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-none"
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#1a1a1a', fontFamily: 'inherit' }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <span
              className="flex items-center justify-center font-barlow font-bold"
              style={{ background: '#1a1a1a', color: '#FFFFFF', fontSize: 10, minWidth: 20, height: 20, borderRadius: 100, padding: '0 6px' }}
            >
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      {/* ── Nav ribbon ── */}
      <div
        className="flex gap-0 overflow-x-auto no-scrollbar"
        style={{ background: '#1a1a1a', padding: '0 32px' }}
      >
        {navItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onChangePage(item.id); setMobileMenuOpen(false); }}
              className="relative cursor-pointer bg-transparent border-none whitespace-nowrap transition-all"
              style={{
                padding: '12px 16px',
                fontSize: 10, fontWeight: 600, letterSpacing: '1.5px',
                textTransform: 'uppercase', fontFamily: 'inherit',
                color: isActive ? '#E8447A' : 'rgba(240,234,210,.45)',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,234,210,.8)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,234,210,.45)'; }}
            >
              {item.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: 2, background: '#E8447A', borderRadius: '2px 2px 0 0' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileMenuOpen && (
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(26,26,26,.08)', padding: '12px 24px' }}>
          <span style={{ display: 'block', fontSize: 8, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(26,26,26,.3)', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(26,26,26,.06)' }}>
            Navigation
          </span>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onChangePage(item.id); setMobileMenuOpen(false); }}
              className="w-full text-left cursor-pointer bg-transparent border-none"
              style={{
                display: 'block', padding: '8px 0',
                fontSize: 11, fontWeight: activePage === item.id ? 700 : 500,
                letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'inherit',
                color: activePage === item.id ? '#E8447A' : 'rgba(26,26,26,.6)',
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenCart(); }}
            className="w-full text-left cursor-pointer bg-transparent border-none"
            style={{ display: 'block', padding: '8px 0', fontSize: 11, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'inherit', color: 'rgba(26,26,26,.6)' }}
          >
            View Cart ({cartCount})
          </button>
        </div>
      )}

    </div>
  );
}
