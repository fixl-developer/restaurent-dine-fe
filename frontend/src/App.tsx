import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import {
  CartItem,
  MenuItem,
  CustomCombo,
  Order,
  TableUnit,
  StockItem,
  StaffMember,
  NotificationAlert,
  CustomerProfile,
} from './types';
import SplashScreen from './components/SplashScreen';

// Pages
import VendorDashboard from './components/VendorDashboard';
import StorytellingHome from './components/StorytellingHome';
import CustomerOrderTracker from './components/CustomerOrderTracker';
import AdminPortal from './components/admin/AdminPortal';
import KitchenDisplaySystem from './components/operations/KitchenDisplaySystem';
import TableOperations from './components/operations/TableOperations';
import BillingPayments from './components/operations/BillingPayments';
import QROrderingFlow from './components/customer/QROrderingFlow';

// Mock data (gradually replaced phase-by-phase as backend wiring lands)
import {
  INITIAL_ORDERS,
  INITIAL_TABLES,
  INITIAL_STOCK,
  INITIAL_STAFF,
  INITIAL_ALERTS,
  INITIAL_CUSTOMERS,
} from './mockData';
import { MENU_ITEMS } from './foodData';

import coquetteCake from './assets/images/cake.jpg';
import smoothieBowl from './assets/images/salad.jpg';

// Map the legacy `setActivePage(stringName)` calls used by existing components
// to real URL paths. This lets us migrate to react-router without rewriting
// every child.
const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  admin: '/admin',
  kds: '/kds',
  'table-ops': '/table-ops',
  'billing-ops': '/billing-ops',
  'qr-order': '/qr-order',
  vendor: '/vendor',
  'order-tracker': '/order-tracker',
};

export default function App() {
  const reactRouterNav = useNavigate();
  const location = useLocation();

  // Splash — show on every page open
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashDone = () => setShowSplash(false);

  // Adapter so existing components keep calling `setActivePage('home')` etc.
  const navigate = useCallback(
    (page: string) => {
      reactRouterNav(PAGE_TO_PATH[page] ?? '/');
    },
    [reactRouterNav],
  );

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    address: string;
    notes: string;
    totalCost: number;
    itemsList?: CartItem[];
  }>({ address: '', notes: '', totalCost: 0 });

  // ==========================================
  // Centralized mock state (phased out as backend wiring lands)
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
    shippingBarrier: 25.0,
    activeTax: 12.5,
    promoActive: true,
    openingHour: '08:00 AM',
    closingHour: '10:00 PM',
    placardSlogan: 'PREMIUM DOUBLE MATCH CREAM COFFEE & FRESH BAKED WAFFLES',
    placardColor: 'pink',
  });

  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = (item: MenuItem | CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === item.id);
      if (existing) {
        return prev.map((it) =>
          it.id === item.id ? { ...it, quantity: it.quantity + 1 } : it,
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
          customization: 'customization' in item ? item.customization : undefined,
        },
      ];
    });
  };

  const handleRemoveFromCart = (itemId: string, force: boolean = false) => {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1 || force) {
        return prev.filter((it) => it.id !== itemId);
      }
      return prev.map((it) =>
        it.id === itemId ? { ...it, quantity: it.quantity - 1 } : it,
      );
    });
  };

  const handleDeleteItem = (itemId: string) => handleRemoveFromCart(itemId, true);

  const handleUpdateQty = (itemId: string, delta: number) => {
    if (delta > 0) {
      setCartItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, quantity: it.quantity + 1 } : it,
        ),
      );
    } else {
      handleRemoveFromCart(itemId);
    }
  };

  const handleAddCustomCombo = (combo: CustomCombo, price: number) => {
    const customId = `combo-${Date.now()}`;
    const isWaffleCombo =
      combo.main.toLowerCase().includes('croissant') || combo.main.toLowerCase().includes('cake');
    const newComboItem: CartItem = {
      id: customId,
      name: `Special Combo (${combo.size})`,
      price,
      image: isWaffleCombo ? coquetteCake : smoothieBowl,
      quantity: 1,
      customization: {
        main: combo.main,
        drink: combo.drink,
        side: combo.side,
        topping: combo.topping,
        size: combo.size,
      },
    };
    setCartItems((prev) => [...prev, newComboItem]);
    setIsCartOpen(true);
  };

  const handleCheckoutDispatch = (address: string, notes: string, tipAmount: number) => {
    const itemsSubtotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const deliveryFee = itemsSubtotal >= dinerConfig.shippingBarrier ? 0.0 : 2.5;
    const finalBill = itemsSubtotal + deliveryFee + tipAmount;

    setCheckoutData({ address, notes, totalCost: finalBill, itemsList: cartItems });

    const newId = `${Math.floor(Math.random() * 8000) + 1000}`;
    const itemsDescription = cartItems.map((it) => `${it.quantity}x ${it.name}`).join(', ');
    const dispatched: Order = {
      id: newId,
      table: 'Takeaway Delivery',
      items: itemsDescription,
      cost: finalBill,
      state: 'Pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: 'Just now',
      notes,
      address,
      itemsList: cartItems,
    };
    setOrders((prev) => [dispatched, ...prev]);

    const textAlert: NotificationAlert = {
      id: `alert-${Date.now()}`,
      title: 'Diner Checkout Ordered',
      message: `Delivery dispatched for "${dispatched.address}". Active total cost was $${dispatched.cost.toFixed(2)}.`,
      timestamp: dispatched.timestamp,
      isRead: false,
      type: 'order',
    };
    setAlerts((prev) => [textAlert, ...prev]);

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleNewOrderReset = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isOrderTrackerRoute = location.pathname === '/order-tracker';

  return (
    <div
      id="root-container"
      className="min-h-screen font-sans text-neutral-800 antialiased flex flex-col justify-between selection:bg-pink-100 selection:text-pink-600"
      style={{ background: '#FFFFFF' }}
    >
      {/* Legacy Header — only the order-tracker page needs it; other pages have their own */}
      {isOrderTrackerRoute && (
        <Header
          activePage="order-tracker"
          onChangePage={navigate}
          onScrollTo={handleScrollTo}
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
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
            }
          />
          <Route
            path="/admin/*"
            element={<AdminPortal onExit={() => navigate('home')} />}
          />
          <Route
            path="/kds"
            element={<KitchenDisplaySystem onExit={() => navigate('home')} />}
          />
          <Route
            path="/table-ops"
            element={<TableOperations onExit={() => navigate('home')} />}
          />
          <Route
            path="/billing-ops"
            element={<BillingPayments onExit={() => navigate('home')} />}
          />
          <Route
            path="/qr-order"
            element={<QROrderingFlow onExit={() => navigate('home')} tableNumber={4} />}
          />
          <Route
            path="/vendor"
            element={
              <VendorDashboard
                orders={orders}
                setOrders={setOrders}
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                tables={tables}
                setTables={setTables}
                stock={stock}
                setStock={setStock}
                staff={staff}
                setStaff={setStaff}
                alerts={alerts}
                setAlerts={setAlerts}
                customers={customers}
                setCustomers={setCustomers}
                dinerConfig={dinerConfig}
                setDinerConfig={setDinerConfig}
                onExit={() => navigate('home')}
              />
            }
          />
          <Route
            path="/order-tracker"
            element={
              <CustomerOrderTracker
                cartItems={cartItems}
                checkoutData={checkoutData}
                onResetOrder={handleNewOrderReset}
                setActivePage={navigate}
              />
            }
          />
        </Routes>
      </main>

      {/* Slide-out Cart drawer (global) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleDeleteItem}
        onCheckout={handleCheckoutDispatch}
      />

      {/* Interactive courier progression checkout tracker (global) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        address={checkoutData.address || 'Sweet Pastel Ave, Apt 4'}
        notes={checkoutData.notes}
        totalCost={checkoutData.totalCost}
        onClose={() => setIsCheckoutOpen(false)}
        onResetOrder={handleNewOrderReset}
      />

      {/* Splash screen — sits above everything */}
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
    </div>
  );
}
