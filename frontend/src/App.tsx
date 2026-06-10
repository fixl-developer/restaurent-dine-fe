import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import ComboConstructor from './components/ComboConstructor';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import { CartItem, MenuItem, CustomCombo, Order, TableUnit, StockItem, StaffMember, NotificationAlert, CustomerProfile } from './types';
import { DECOR_IMAGES } from './foodData';
import { ShieldCheck, Heart, Coffee, AlertCircle, Sparkles, Check, Smile, Clock } from 'lucide-react';

import SplashScreen from './components/SplashScreen';

// New dynamic pages
import VendorDashboard from './components/VendorDashboard';
import StorytellingHome from './components/StorytellingHome';
import CustomerOrderTracker from './components/CustomerOrderTracker';
import AdminPortal from './components/admin/AdminPortal';

// Restaurant Operations modules
import KitchenDisplaySystem from './components/operations/KitchenDisplaySystem';
import TableOperations from './components/operations/TableOperations';
import BillingPayments from './components/operations/BillingPayments';

// Customer QR Ordering Experience
import QROrderingFlow from './components/customer/QROrderingFlow';

// Import our central mockup databases (Task 5: Make everything dynamic!)
import { 
  INITIAL_ORDERS, INITIAL_TABLES, INITIAL_STOCK, INITIAL_STAFF, 
  INITIAL_ALERTS, INITIAL_CUSTOMERS 
} from './mockData';
import { MENU_ITEMS } from './foodData';

// Dynamic coquette background cake reference
import coquetteCake from './assets/images/cake.jpg';
import smoothieBowl from './assets/images/salad.jpg';

export default function App() {
  // Splash — show on every page open
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashDone = () => setShowSplash(false);

  // ── Routing with browser history ─────────────────────────────────────────
  const [activePage, setActivePage] = useState<string>('home');

  // Scroll to top on every page change
  useEffect(() => { window.scrollTo(0, 0); }, [activePage]);

  // Seed the initial history entry so the very first back-press lands on 'home'
  useEffect(() => {
    window.history.replaceState({ page: 'home' }, '');
    const onPop = (e: PopStateEvent) => {
      const page: string = (e.state as any)?.page ?? 'home';
      setActivePage(page);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Every in-app navigation pushes a history entry so back works properly
  const navigate = useCallback((page: string) => {
    window.history.pushState({ page }, '');
    setActivePage(page);
  }, []);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout Radar Modal details
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    address: string;
    notes: string;
    totalCost: number;
    itemsList?: CartItem[];
  }>({
    address: '',
    notes: '',
    totalCost: 0
  });

  // ==========================================
  // CENTRALIZED STATE ENGINE (Task 5 Dynamic Mock Data Sync!)
  // ==========================================
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [tables, setTables] = useState<TableUnit[]>(INITIAL_TABLES);
  const [stock, setStock] = useState<StockItem[]>(INITIAL_STOCK);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [alerts, setAlerts] = useState<NotificationAlert[]>(INITIAL_ALERTS);
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);

  const [dinerConfig, setDinerConfig] = useState({
    dinerName: 'SMART DINE',
    shippingBarrier: 25.00,
    activeTax: 12.5,
    promoActive: true,
    openingHour: '08:00 AM',
    closingHour: '10:00 PM',
    placardSlogan: 'PREMIUM DOUBLE MATCH CREAM COFFEE & FRESH BAKED WAFFLES',
    placardColor: 'pink'
  });

  // Scroll smoothly to any specific DOM id
  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add Item to cart
  const handleAddToCart = (item: MenuItem | CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === item.id);
      if (existing) {
        return prev.map((it) =>
          it.id === item.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
          customization: 'customization' in item ? item.customization : undefined
        }
      ];
    });
  };

  // Reduce Item quantity
  const handleRemoveFromCart = (itemId: string, force: boolean = false) => {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === itemId);
      if (!existing) return prev;

      if (existing.quantity === 1 || force) {
        return prev.filter((it) => it.id !== itemId);
      }
      return prev.map((it) =>
        it.id === itemId ? { ...it, quantity: it.quantity - 1 } : it
      );
    });
  };

  // Item Delete trigger
  const handleDeleteItem = (itemId: string) => {
    handleRemoveFromCart(itemId, true);
  };

  // Update item quantity directly
  const handleUpdateQty = (itemId: string, delta: number) => {
    if (delta > 0) {
      setCartItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, quantity: it.quantity + 1 } : it
        )
      );
    } else {
      handleRemoveFromCart(itemId);
    }
  };

  // Add Custom configured combo builder product
  const handleAddCustomCombo = (combo: CustomCombo, price: number) => {
    const customId = `combo-${Date.now()}`;
    const newComboItem: CartItem = {
      id: customId,
      name: `Special Combo (${combo.size})`,
      price: price,
      image: coquetteCake, 
      quantity: 1,
      customization: {
        main: combo.main,
        drink: combo.drink,
        side: combo.side,
        topping: combo.topping,
        size: combo.size
      }
    };

    // Grab correct custom combo picture
    const isWaffleCombo = combo.main.toLowerCase().includes('croissant') || combo.main.toLowerCase().includes('cake');
    newComboItem.image = isWaffleCombo ? coquetteCake : smoothieBowl;

    setCartItems((prev) => [...prev, newComboItem]);
    setIsCartOpen(true);
  };

  // Handle final checkout dispatch process
  const handleCheckoutDispatch = (address: string, notes: string, tipAmount: number) => {
    const itemsSubtotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const deliveryFee = itemsSubtotal >= dinerConfig.shippingBarrier ? 0.00 : 2.50;
    const finalBill = itemsSubtotal + deliveryFee + tipAmount;

    setCheckoutData({
      address: address,
      notes: notes,
      totalCost: finalBill,
      itemsList: cartItems
    });

    // 1. Create matching Order in our central dispatches (Task 5)
    const newId = `${Math.floor(Math.random() * 8000) + 1000}`;
    const itemsDescription = cartItems.map(it => `${it.quantity}x ${it.name}`).join(', ');
    
    const dispatched: Order = {
      id: newId,
      table: 'Takeaway Delivery',
      items: itemsDescription,
      cost: finalBill,
      state: 'Pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: 'Just now',
      notes: notes,
      address: address,
      itemsList: cartItems
    };

    setOrders(prev => [dispatched, ...prev]);

    // 2. Queue Alert for managers
    const textAlert: NotificationAlert = {
      id: `alert-${Date.now()}`,
      title: 'Diner Checkout Ordered',
      message: `Delivery dispatched for "${dispatched.address}". Active total cost was $${dispatched.cost.toFixed(2)}.`,
      timestamp: dispatched.timestamp,
      isRead: false,
      type: 'order'
    };
    setAlerts(prev => [textAlert, ...prev]);

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Reset local state to place simple new order
  const handleNewOrderReset = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  // Full-screen takeovers (no header/footer)
  if (activePage === 'admin') {
    return <AdminPortal onExit={() => navigate('home')} />;
  }
  if (activePage === 'kds') {
    return <KitchenDisplaySystem onExit={() => navigate('home')} />;
  }
  if (activePage === 'table-ops') {
    return <TableOperations onExit={() => navigate('home')} />;
  }
  if (activePage === 'billing-ops') {
    return <BillingPayments onExit={() => navigate('home')} />;
  }
  if (activePage === 'qr-order') {
    return <QROrderingFlow onExit={() => navigate('home')} tableNumber={4} />;
  }
  if (activePage === 'vendor') {
    return (
      <VendorDashboard
        orders={orders} setOrders={setOrders}
        menuItems={menuItems} setMenuItems={setMenuItems}
        tables={tables} setTables={setTables}
        stock={stock} setStock={setStock}
        staff={staff} setStaff={setStaff}
        alerts={alerts} setAlerts={setAlerts}
        customers={customers} setCustomers={setCustomers}
        dinerConfig={dinerConfig} setDinerConfig={setDinerConfig}
        onExit={() => navigate('home')}
      />
    );
  }
  if (activePage === 'order-tracker') {
    return (
      <CustomerOrderTracker
        cartItems={cartItems}
        checkoutData={checkoutData}
        onResetOrder={handleNewOrderReset}
        setActivePage={navigate}
      />
    );
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div id="root-container" className="min-h-screen font-sans text-neutral-800 antialiased flex flex-col justify-between selection:bg-pink-100 selection:text-pink-600" style={{ background: '#FFFFFF' }}>

      {/* Old Header — shown only on non-home pages */}
      {activePage !== 'home' && (
        <Header
          activePage={activePage}
          onChangePage={navigate}
          onScrollTo={handleScrollTo}
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Dynamic Main view switcher layout */}
      <main className="flex-grow">

        {activePage === 'home' && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <StorytellingHome
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onAddCustomCombo={handleAddCustomCombo}
              setActivePage={navigate}
              menuItems={menuItems}
              cartCount={cartCount}
              onOpenCart={() => setIsCartOpen(true)}
            />
          </div>
        )}



      </main>

      {/* Footer — shown only on non-home pages */}
      {activePage !== 'home' && (
        <footer style={{ background: '#F0EAD2', borderTop: '1px solid rgba(26,26,26,.08)', padding: '24px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginBottom: 10 }}>
            {['📍 842 PASTEL BLVD, LOS ANGELES, CA', '✉ CONTACT@SMARTDINE.COM', '⏰ OPEN 8AM – 10PM DAILY'].map(item => (
              <span key={item} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(26,26,26,.4)' }}>{item}</span>
            ))}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(26,26,26,.25)' }}>
            © 2026 SMARTDINE RESTRON CO. ALL RIGHTS RESERVED.
          </div>
        </footer>
      )}

      {/* Slide-out Cart drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleDeleteItem}
        onCheckout={handleCheckoutDispatch}
      />

      {/* Interactive courier progression checkout tracker */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        address={checkoutData.address || 'Sweet Pastel Ave, Apt 4'}
        notes={checkoutData.notes}
        totalCost={checkoutData.totalCost}
        onClose={() => setIsCheckoutOpen(false)}
        onResetOrder={handleNewOrderReset}
      />

      {/* ── Splash screen — sits above everything, plays once per session ── */}
      {showSplash && <SplashScreen onDone={handleSplashDone} />}

    </div>
  );
}
