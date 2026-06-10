import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, Clock, ShoppingCart, DollarSign, CheckCircle,
  RefreshCw, X, ShieldCheck, Cog, FileText, QrCode, Tv, CreditCard,
  Percent, ArrowRight, ArrowLeft, Table, AlertCircle, Sparkles, UserPlus, Trash2,
  Sliders, Plus, Check, MapPin, Printer, HelpCircle, Package, Send, Bell
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar 
} from 'recharts';
import { Order, MenuItem, TableUnit, StockItem, StaffMember, CustomerProfile, NotificationAlert } from '../types';
import { REVENUE_SAMPLE_DAYS, CATEGORY_BREAKDOWN_DATA, HOURLY_DEMAND_TREND } from '../mockData';
import { DECOR_IMAGES } from '../foodData';

interface VendorDashboardProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  tables: TableUnit[];
  setTables: React.Dispatch<React.SetStateAction<TableUnit[]>>;
  stock: StockItem[];
  setStock: React.Dispatch<React.SetStateAction<StockItem[]>>;
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  alerts: NotificationAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<NotificationAlert[]>>;
  customers: CustomerProfile[];
  setCustomers: React.Dispatch<React.SetStateAction<CustomerProfile[]>>;
  dinerConfig: {
    dinerName: string;
    shippingBarrier: number;
    activeTax: number;
    promoActive: boolean;
    openingHour: string;
    closingHour: string;
    placardSlogan: string;
    placardColor: string;
  };
  setDinerConfig: React.Dispatch<React.SetStateAction<{
    dinerName: string;
    shippingBarrier: number;
    activeTax: number;
    promoActive: boolean;
    openingHour: string;
    closingHour: string;
    placardSlogan: string;
    placardColor: string;
  }>>;
  onExit?: () => void;
}

export default function VendorDashboard({
  orders,
  setOrders,
  menuItems,
  setMenuItems,
  tables,
  setTables,
  stock,
  setStock,
  staff,
  setStaff,
  alerts,
  setAlerts,
  customers,
  setCustomers,
  dinerConfig,
  setDinerConfig,
  onExit,
}: VendorDashboardProps) {
  
  // Current admin panel viewing routing
  const [adminTab, setAdminTab] = useState<string>('dashboard'); // 'dashboard', 'reports', 'orders', 'kds', 'tables', 'inventory', 'qr-code', 'staff', 'billing', 'settings'

  // Notification Filter state
  const [notiFilter, setNotiFilter] = useState<'all' | 'unread' | 'critical'>('all');

  // Input states for Staff formulation
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Waiter' as any,
    shift: 'Morning shift 07:00-15:00',
    phone: ''
  });

  // Split-bill calculation states, simulated here inside POS card
  const [posSelectedTable, setPosSelectedTable] = useState<string>('t4');
  const [posFriendCount, setPosFriendCount] = useState<number>(3);
  const [posPaymentMethod, setPosPaymentMethod] = useState<'applepay' | 'card' | 'gpay' | 'cash'>('applepay');
  const [posIsProcessing, setPosIsProcessing] = useState<boolean>(false);
  const [posIsApproved, setPosIsApproved] = useState<boolean>(false);

  // QR Placard customization state
  const [customQrSlogan, setCustomQrSlogan] = useState<string>(dinerConfig.placardSlogan);
  const [customQrColor, setCustomQrColor] = useState<string>(dinerConfig.placardColor);

  // New Alert system messaging broadcast input
  const [alertBroadcast, setAlertBroadcast] = useState('');

  // ----------------- DERIVED VALUES (DYNAMICS) -----------------
  
  // Real-time calculated Sales KPI totals (updates dynamically based on completed orders!)
  const liveStats = useMemo(() => {
    const completedVal = orders
      .filter(o => o.state === 'Completed' || o.state === 'Served')
      .reduce((sum, o) => sum + o.cost, 0);
    
    // Total baseline revenue + fresh checkout revenue
    const netRevenue = 1480.50 + completedVal;
    const pendingOrdersCount = orders.filter(o => o.state === 'Pending' || o.state === 'In Kitchen').length;
    const lowStockCount = stock.filter(s => s.quantity <= s.minLimit).length;
    const activeWaiters = staff.filter(st => st.status === 'active' && st.role === 'Waiter').length;

    return {
      netRevenue,
      pendingOrdersCount,
      lowStockCount,
      activeWaiters
    };
  }, [orders, stock, staff]);

  // Selected table in floor plan details
  const [selectedFloorTableId, setSelectedFloorTableId] = useState<string>('t4');
  const activeFloorTable = useMemo(() => {
    return tables.find(t => t.id === selectedFloorTableId) || tables[0];
  }, [tables, selectedFloorTableId]);

  // Handle table seating allocation / checkout reset
  const handleToggleSeating = (tableId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        const nextStatus = t.status === 'vacant' ? 'occupied' : t.status === 'occupied' ? 'reserved' : 'vacant';
        return {
          ...t,
          status: nextStatus,
          customerName: nextStatus === 'occupied' ? 'WALK-IN GUEST' : nextStatus === 'reserved' ? 'BOOKED GUEST' : undefined,
          spend: nextStatus === 'occupied' ? 12.50 : 0
        };
      }
      return t;
    }));
  };

  const handleUpdateTableSpend = (tableId: string, amount: number) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, spend: Math.max(0, t.spend + amount) };
      }
      return t;
    }));
  };

  // Dispatch Action controllers for Orders and KDS status queue
  const handleAdvanceOrderStatus = (id: string, nextState: 'In Kitchen' | 'Ready to Serve' | 'Completed' | 'Served') => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        // Increment visitor spend if fully complete
        if (nextState === 'Completed') {
          // Add dynamic notification
          const newAlert: NotificationAlert = {
            id: `alert-${Date.now()}`,
            title: 'Order Dispatch Complete',
            message: `Order #${order.id} for ${order.table} marked finished & cleared from active queues.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'payment'
          };
          setAlerts(curr => [newAlert, ...curr]);
          
          // Increment random customer total spend if matching
          setCustomers(cust => cust.map(c => {
            if (c.name.toUpperCase() === order.table.toUpperCase()) {
              return { ...c, visits: c.visits + 1, totalSpend: c.totalSpend + order.cost };
            }
            return c;
          }));
        }

        return { ...order, state: nextState, duration: nextState === 'Completed' ? 'Completed' : order.duration };
      }
      return order;
    }));
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // Add customized staff member
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name) return;

    const added: StaffMember = {
      id: `emp-${Date.now()}`,
      name: newStaff.name.toUpperCase(),
      role: newStaff.role,
      status: 'active',
      shift: newStaff.shift,
      rating: 4.8,
      phone: newStaff.phone || '(213) 555-9014'
    };

    setStaff(prev => [...prev, added]);
    setNewStaff({
      name: '',
      role: 'Waiter',
      shift: 'Morning shift 07:00-15:00',
      phone: ''
    });

    // Add alert log
    setAlerts(prev => [
      {
        id: `alert-${Date.now()}`,
        title: 'New Staff Registered',
        message: `${added.name} joined as active ${added.role} on the floor.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        type: 'system'
      },
      ...prev
    ]);
  };

  const handleFireStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  // Handle stock adjustments (Task 2: Inventory)
  const handleAdjustStock = (itemId: string, delta: number) => {
    setStock(prev => prev.map(s => {
      if (s.id === itemId) {
        const nextQty = Math.max(0, s.quantity + delta);
        const nextStatus = nextQty === 0 ? 'out' : nextQty <= s.minLimit ? 'low' : 'healthy';

        // Trigger stock out-of-stock trigger to hide/highlight food menu item immediately!
        if (nextQty === 0) {
          // If sugar out, link items
          const matchingName = s.name.toLowerCase();
          setMenuItems(items => items.map(dish => {
            if (dish.name.toLowerCase().includes('oat') || dish.name.toLowerCase().includes('latte')) {
              return { ...dish, inStock: false };
            }
            return dish;
          }));
        }

        return { ...s, quantity: nextQty, status: nextStatus };
      }
      return s;
    }));
  };

  const handleRestockAll = () => {
    setStock(prev => prev.map(s => ({
      ...s,
      quantity: s.minLimit + 20,
      status: 'healthy'
    })));
    // Restock all foods on customer menu:
    setMenuItems(items => items.map(dish => ({ ...dish, inStock: true })));
  };

  // Simulated Broadcast Alert
  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertBroadcast) return;

    const custom: NotificationAlert = {
      id: `alert-${Date.now()}`,
      title: 'Diner Bell Broadcast',
      message: `${alertBroadcast}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'system'
    };

    setAlerts(prev => [custom, ...prev]);
    setAlertBroadcast('');
  };

  // Simulate POS Desk pay process
  const triggerPOSPaymentSimulation = () => {
    setPosIsProcessing(true);
    setPosIsApproved(false);
    setTimeout(() => {
      setPosIsProcessing(false);
      setPosIsApproved(true);
      
      // Free POS table
      setTables(prev => prev.map(t => {
        if (t.id === posSelectedTable) {
          return { ...t, status: 'vacant', spend: 0 };
        }
        return t;
      }));

      // Add a payment alert
      const matchingTable = tables.find(t => t.id === posSelectedTable);
      setAlerts(prev => [
        {
          id: `alert-${Date.now()}`,
          title: 'Floor Invoice Cleared',
          message: `${matchingTable?.label || 'Diner Seat'} completed payment of $${(matchingTable?.spend || 30.0).toFixed(2)} via POS checkout.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'payment'
        },
        ...prev
      ]);

    }, 1500);
  };

  // POS split-share
  const selectedTableSpendVal = useMemo(() => {
    const tableObj = tables.find(t => t.id === posSelectedTable);
    return tableObj ? tableObj.spend : 15.00;
  }, [tables, posSelectedTable]);

  const posSplitShareAmt = selectedTableSpendVal / Math.max(1, posFriendCount);
  const posCalculatedGSTVal = selectedTableSpendVal * (dinerConfig.activeTax / 100);
  const posCalculatedGrandTotal = selectedTableSpendVal + posCalculatedGSTVal;

  return (
    <div className="bg-[#FFFFFF] py-8 px-4 md:px-8 max-w-7xl mx-auto my-2 text-left animate-[fadeIn_0.4s_ease-out]">
      
      {/* Top Banner & Cafe State Panel - Compact and minimal layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[rgba(26,26,26,.15)] pb-6 mb-8 text-left bg-[#FFFFFF]">
        <div className="flex items-center gap-4">
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 cursor-pointer border-none transition-opacity hover:opacity-75"
              style={{ background: 'rgba(26,26,26,.08)', color: '#1a1a1a', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '8px 14px', borderRadius: 100, fontFamily: 'inherit' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </button>
          )}
          <div className="space-y-1">
            <h2 className="text-2xl font-barlow font-black text-[#1a1a1a] tracking-tight uppercase">
              {dinerConfig.dinerName}
            </h2>
          </div>
        </div>

        {/* Action button trigger a simulated quick customer checkout to watch stats increment! */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => {
              // Create dynamic checkout order
              const randomN = Math.floor(Math.random() * 8000) + 1000;
              const names = ['Strawberry Velvet Cake slice', 'Matching Matcha Latte', 'Egg Salad Croquette', 'Chili Noodles bowl'];
              const chosenFoods = [names[Math.floor(Math.random() * names.length)], names[Math.floor(Math.random() * names.length)]];
              const isCombo = Math.random() > 0.5;
              const amount = isCombo ? 18.50 : 12.80;

              const simulated: Order = {
                id: `${randomN}`,
                table: `Table No. ${Math.floor(Math.random() * 8) + 1}`,
                items: chosenFoods.join(', '),
                cost: amount,
                state: 'Pending',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                duration: 'Just now'
              };

              setOrders(prev => [simulated, ...prev]);

              // Trigger bell alert!
              setAlerts(prev => [
                {
                  id: `alert-${Date.now()}`,
                  title: 'Diner Order Placed',
                  message: `${simulated.table} ordered ${simulated.items} via seat-side QR code.`,
                  timestamp: simulated.timestamp,
                  isRead: false,
                  type: 'order'
                },
                ...prev
              ]);
            }}
            className="px-4 py-2.5 bg-[rgba(232,68,122,.15)] hover:bg-[rgba(232,68,122,.3)] text-[#1a1a1a] font-semibold border-2 border-dashed border-[#E8447A] rounded-xl text-[10.5px] font-sans uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer shadow-xs animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5" /> Simulate Customer QR Order
          </button>
        </div>
      </div>

      {/* Grid Dashboard KPI Scorecards - Quick scannables */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Sales KPI (Task 5 Reports) */}
        <div className="bg-white border-2 border-[rgba(26,26,26,.12)] rounded-3xl p-5 flex gap-4 items-center relative shadow-xs hover:border-[#E8447A] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <DollarSign className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[rgba(26,26,26,.4)] block pb-0.5">NET TOTAL SALES</span>
            <span className="text-xl font-barlow font-black text-[#1a1a1a] uppercase">${liveStats.netRevenue.toFixed(2)}</span>
            <span className="text-[8.5px] font-sans text-emerald-600 block font-bold leading-none mt-1">▲ Updates in Real-time</span>
          </div>
        </div>

        {/* Dispatches Count */}
        <div className="bg-white border-2 border-[rgba(26,26,26,.12)] rounded-3xl p-5 flex gap-4 items-center relative shadow-xs hover:border-[#E8447A] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <ShoppingCart className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[rgba(26,26,26,.4)] block pb-0.5">PENDING ORDERS</span>
            <span className="text-xl font-barlow font-black text-[#1a1a1a] uppercase">{liveStats.pendingOrdersCount} DISPATCHES</span>
            <span className="text-[8.5px] font-sans text-[#E8447A] block font-bold leading-none mt-1">Includes KDS slips</span>
          </div>
        </div>

        {/* Low items Warning */}
        <div className="bg-white border-2 border-[rgba(26,26,26,.12)] rounded-3xl p-5 flex gap-4 items-center relative shadow-xs hover:border-[#E8447A] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Package className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[rgba(26,26,26,.4)] block pb-0.5">LOW STOCK ITEMS</span>
            <span className={`text-xl font-barlow font-black uppercase block ${liveStats.lowStockCount > 0 ? 'text-amber-600' : 'text-[#1a1a1a]'}`}>
              {liveStats.lowStockCount} INGREDIENTS
            </span>
            <span className="text-[8.5px] font-sans text-rose-500 block font-bold leading-none mt-1">
              {liveStats.lowStockCount > 0 ? 'Needs chef replenishment!' : 'Ingredients are healthy'}
            </span>
          </div>
        </div>

        {/* Active Staff */}
        <div className="bg-white border-2 border-[rgba(26,26,26,.12)] rounded-3xl p-5 flex gap-4 items-center relative shadow-xs hover:border-[#E8447A] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[rgba(26,26,26,.4)] block pb-0.5">ACTIVE WORKSTAFF</span>
            <span className="text-xl font-barlow font-black text-[#1a1a1a] uppercase">{liveStats.activeWaiters} SERVICE</span>
            <span className="text-[8.5px] font-sans text-[rgba(26,26,26,.4)] block leading-none mt-1">Waiters on duty</span>
          </div>
        </div>

      </div>

      {/* Main Console Grid Body - Left Side Sidebar, Right Side Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR NAVIGATION PANEL */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[rgba(26,26,26,.15)] rounded-[20px] p-5 space-y-4 shadow-sm">

            <div className="border-b border-[rgba(26,26,26,.12)] pb-3">
              <h4 className="text-[12px] font-barlow font-extrabold text-[#1a1a1a] uppercase tracking-widest">VENDOR CONSOLE</h4>
            </div>

            <div className="space-y-1.5 flex flex-col font-sans">
              
              <span className="text-[8px] font-sans text-[rgba(26,26,26,.4)] font-bold uppercase tracking-widest block pl-2 pt-2 pb-0.5">OPERATIONS CENTER</span>
              
              <button 
                onClick={() => setAdminTab('dashboard')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'dashboard' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                DASHBOARD HUB
              </button>

              <button 
                onClick={() => setAdminTab('reports')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'reports' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                SALES REPORTS
              </button>

              <button 
                onClick={() => setAdminTab('orders')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'orders' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                ACTIVE ORDERS ({orders.length})
              </button>

              <span className="text-[8px] font-sans text-[rgba(26,26,26,.4)] font-bold uppercase tracking-widest block pl-2 pt-3 pb-0.5">RESTO MANAGER</span>

              <button 
                onClick={() => setAdminTab('kds')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'kds' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <Tv className="w-4 h-4 shrink-0" />
                KITCHEN KDS
              </button>

              <button 
                onClick={() => setAdminTab('tables')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'tables' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <Table className="w-4 h-4 shrink-0" />
                FLOOR SEATING
              </button>

              <button 
                onClick={() => setAdminTab('inventory')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'inventory' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                STOCK ROOM
              </button>

              <button 
                onClick={() => setAdminTab('qr-code')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'qr-code' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <QrCode className="w-4 h-4 shrink-0" />
                QR TEMPLATES
              </button>

              <span className="text-[8px] font-sans text-[rgba(26,26,26,.4)] font-bold uppercase tracking-widest block pl-2 pt-3 pb-0.5">DESK PLANNERS</span>

              <button 
                onClick={() => setAdminTab('staff')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'staff' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                STAFF DIRECTORY
              </button>

              <button 
                onClick={() => setAdminTab('billing')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'billing' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                BILLING DESK
              </button>

              <button 
                onClick={() => setAdminTab('settings')}
                className={`w-full py-2 px-3 text-[10.5px] font-sans uppercase tracking-widest rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer font-bold ${
                  adminTab === 'settings' ? 'bg-[#1a1a1a] text-[#FFFFFF] shadow-sm' : 'hover:bg-[rgba(240,234,210,.5)] text-[rgba(26,26,26,.6)]'
                }`}
              >
                <Cog className="w-4 h-4 shrink-0" />
                GENERAL SETTINGS
              </button>

            </div>

            {/* Quick alert indicator inside sidebar */}
            {alerts.filter(a => !a.isRead).length > 0 && (
              <div className="bg-[rgba(232,68,122,.1)] border border-[rgba(26,26,26,.12)] rounded-xl p-3 text-[10px] space-y-2">
                <div className="flex justify-between items-center text-[#E8447A] font-bold">
                  <span className="flex items-center gap-1"><Bell className="w-3.5 h-3.5" /> UNREAD BELLS</span>
                  <span>{alerts.filter(a => !a.isRead).length}</span>
                </div>
                <p className="text-[9px] text-[rgba(26,26,26,.6)] font-sans leading-relaxed">
                  Guests are request ring chimes. Tap matching Floor plan or Alerts center.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT SIDE MAIN PAGE CONTENT */}
        <div className="lg:col-span-9 bg-white border border-[rgba(26,26,26,.12)] rounded-[32px] p-6 lg:p-8 shadow-sm text-left">
          
          {/* ========================================================
              TAB 1: DASHBOARD PERFORMANCE (TASK 1: Dashboard / Task 5)
              ======================================================== */}
          {adminTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Heading */}
              <div className="border-b border-[rgba(26,26,26,.12)] pb-4">
                <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">Performance Analytics overview</h3>
                <p className="text-xs text-neutral-500">Live operational stats, real-time incoming visitor checks, and direct sales trajectory.</p>
              </div>

              {/* Area Sales Trend Chart using Recharts */}
              <div className="space-y-3 bg-white border border-[rgba(26,26,26,.12)] rounded-3xl p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-[#E8447A] block">WEEKLY NET RECORDINGS</span>
                    <h4 className="text-sm font-barlow font-black text-[#1a1a1a] uppercase">Cafe Gross Sales Trajectory</h4>
                  </div>
                  <span className="text-[10px] font-sans font-bold text-emerald-600 bg-emerald-50 py-1 px-2 border border-emerald-100 rounded-lg">▲ {((liveStats.netRevenue / 1480.50) * 100 - 100).toFixed(1)}% Session Booster</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={REVENUE_SAMPLE_DAYS}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f472b6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f472b6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" opacity={0.5} />
                      <XAxis dataKey="day" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                      <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#fbcfe8', fontSize: '11px', fontFamily: 'monospace' }} />
                      <Area type="monotone" dataKey="sales" name="Gross Sales ($)" stroke="#ec4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Splits - Dailies traffic hourly + Alert list snippet */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Traffic hourly linechart */}
                <div className="border border-[rgba(26,26,26,.12)] rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-sans font-bold uppercase text-[#1a1a1a]">Peak Dining Hours Traffic Forecast</h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={HOURLY_DEMAND_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="2 2" stroke="#e4e4e7" opacity={0.6} />
                        <XAxis dataKey="hour" stroke="#a1a1aa" fontSize={8.5} />
                        <YAxis stroke="#a1a1aa" fontSize={8} />
                        <Tooltip />
                        <Line type="monotone" dataKey="sweets" name="Sweets Served" stroke="#f472b6" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="drinks" name="Drinks & Shakes" stroke="#ec4899" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Live notifications inside Dashboard */}
                <div className="border border-[rgba(26,26,26,.12)] rounded-3xl p-5 space-y-3.5 bg-white">
                  <div className="flex justify-between items-center border-b border-[rgba(26,26,26,.12)] pb-2">
                    <h4 className="text-xs font-sans font-bold uppercase text-[#1a1a1a] flex items-center gap-1.5"><Bell className="w-4 h-4 text-[#E8447A]" /> Waiter alert stream</h4>
                    <button onClick={() => setAdminTab('tables')} className="text-[9.5px] font-sans text-[#E8447A] font-black uppercase hover:underline">Check seat logs →</button>
                  </div>

                  <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                    {alerts.slice(0, 4).map((alt) => (
                      <div key={alt.id} className="bg-white border border-[rgba(26,26,26,.12)] p-2.5 rounded-xl hover:border-[#E8447A] flex justify-between gap-3 items-start">
                        <div className="space-y-0.5">
                          <span className={`text-[8px] font-sans font-black uppercase px-2 py-0.2 rounded border ${
                            alt.type === 'waiter-call' ? 'bg-[rgba(232,68,122,.1)] text-[#E8447A] border-[#E8447A]' :
                            alt.type === 'stock' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            'bg-[rgba(232,68,122,.1)] text-[#E8447A] border-[rgba(232,68,122,.4)]'
                          }`}>
                            {alt.type}
                          </span>
                          <span className="text-[10px] block font-bold text-neutral-850 truncate max-w-[190px]">{alt.title}</span>
                          <p className="text-[9px] text-neutral-500 font-sans tracking-tight leading-relaxed">{alt.message}</p>
                        </div>
                        <span className="text-[8.5px] font-sans text-neutral-400 font-bold shrink-0">{alt.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: REPORTS & BREAKDOWNS (TASK 1: Reports / Task 5)
              ======================================================== */}
          {adminTab === 'reports' && (
            <div className="space-y-6">
              
              <div className="border-b border-[rgba(26,26,26,.12)] pb-4">
                <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">Financial Gross Reports & Demands</h3>
                <p className="text-xs text-neutral-500 font-sans">Detailed categorical reviews, tax ledger outputs and top-selling dishes.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                
                {/* Donut sales categories breakdown */}
                <div className="bg-white border border-[rgba(26,26,26,.12)] rounded-3xl p-5 space-y-4">
                  <div className="text-left">
                    <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-[#E8447A] block font-bold">REVENUE SOURCE</span>
                    <h4 className="text-xs font-sans font-black text-[#1a1a1a] uppercase">Interactive Sales Category Breakdown</h4>
                  </div>

                  <div className="h-56 w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={CATEGORY_BREAKDOWN_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {CATEGORY_BREAKDOWN_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-xs text-neutral-400 font-sans block">REVENUE</span>
                      <strong className="text-sm font-barlow font-black text-[#1a1a1a] uppercase">${liveStats.netRevenue.toFixed(0)}</strong>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                    {CATEGORY_BREAKDOWN_DATA.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 justify-start text-neutral-700">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-bold truncate">{item.name} ({item.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table Top-selling and margins */}
                <div className="bg-white border border-[rgba(26,26,26,.12)] rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-sans font-bold uppercase text-[#1a1a1a] border-b border-[rgba(26,26,26,.12)] pb-1.5">Top-Selling Dishes & Margin Logs</h4>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'Strawberry Icing Velvet Cake', category: 'Sweets', sold: 48, revenue: 326.40, profit: '$218.00', color: 'bg-rose-50 border-rose-200 text-rose-600' },
                      { name: 'Sichuan Sesame Chili Noodles', category: 'Mains', sold: 42, revenue: 483.00, profit: '$340.00', color: 'bg-amber-50 border-amber-200 text-amber-600' },
                      { name: 'Fiore Garlic Soft Pasta Noodles', category: 'Mains', sold: 31, revenue: 368.90, profit: '$242.00', color: 'bg-amber-50 border-amber-200 text-amber-600' },
                      { name: 'Peach Garden Strawberry Matcha', category: 'Drinks', sold: 28, revenue: 154.00, profit: '$110.00', color: 'bg-pink-50 border-pink-100 text-pink-600' }
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-sans border-b pb-2 last:border-0 last:pb-0">
                        <div className="space-y-0.5 text-left max-w-[190px]">
                          <span className="font-extrabold text-neutral-800 uppercase block truncate leading-none mb-0.5">{row.name}</span>
                          <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded border inline-block ${row.color}`}>{row.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-neutral-900 block">{row.sold} units</span>
                          <span className="text-neutral-400 block tracking-wider">${row.revenue.toFixed(2)} / Net: {row.profit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              TAB 3: ORDERS PROCESS QUEUE (TASK 1: Orders / Task 5)
              ======================================================== */}
          {adminTab === 'orders' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-[rgba(26,26,26,.12)] pb-4">
                <div>
                  <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">Active Dispatch Trays</h3>
                  <p className="text-xs text-neutral-500 font-sans">Approve table orders immediately and route them directly to active cooking stations.</p>
                </div>
                
                <span className="text-[8.5px] font-sans text-[#E8447A] bg-[rgba(232,68,122,.1)] border border-[#E8447A] rounded py-0.5 px-2 active:animate-bounce uppercase tracking-widest font-bold">
                  ● REAL-TIME DISPATCH CORE
                </span>
              </div>

              {/* Incoming Active list */}
              <div className="space-y-3.5">
                {orders.map(order => (
                  <div 
                    key={order.id} 
                    className="bg-white border border-[rgba(26,26,26,.15)] rounded-3xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-[#E8447A] shadow-xs transition-all animate-[fadeIn_0.3s_ease-out]"
                  >
                    <div className="space-y-1.5 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-sans font-black text-neutral-400 tracking-wider">ORDER PREFIX #{order.id}</span>
                        <span className={`text-[8.5px] font-sans uppercase tracking-widest py-0.5 px-2.5 rounded-full border font-black ${
                          order.state === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          order.state === 'In Kitchen' ? 'bg-[rgba(232,68,122,.1)] text-[#E8447A] border-[rgba(232,68,122,.4)]' :
                          order.state === 'Completed' || order.state === 'Served' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {order.state}
                        </span>
                        
                        <span className="text-[8.5px] font-sans text-neutral-400">{order.timestamp} stamp</span>
                      </div>
                      
                      <h5 className="text-[11.5px] font-sans font-black text-neutral-950 uppercase tracking-wide">{order.table}</h5>
                      <div className="text-[10.5px] text-[rgba(26,26,26,.6)] font-sans tracking-wide leading-relaxed pl-2 border-l-2 border-[#E8447A]">{order.items}</div>
                      
                      {order.notes && (
                        <p className="text-[9.5px] text-neutral-400 font-sans italic">Note: "{order.notes}"</p>
                      )}

                      <span className="text-[11px] font-sans font-extrabold text-[#E8447A] block pt-1">Total billing invoice: ${order.cost.toFixed(2)}</span>
                    </div>

                    {/* Operational Triggers */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      
                      {order.state === 'Pending' && (
                        <button
                          onClick={() => handleAdvanceOrderStatus(order.id, 'In Kitchen')}
                          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10px] font-sans uppercase tracking-widest transition-all cursor-pointer font-bold shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve to Kitchen
                        </button>
                      )}

                      {order.state === 'In Kitchen' && (
                        <button
                          onClick={() => handleAdvanceOrderStatus(order.id, 'Ready to Serve')}
                          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10px] font-sans uppercase tracking-widest transition-all cursor-pointer font-bold shadow-xs flex items-center gap-1"
                        >
                          <Tv className="w-3.5 h-3.5" /> Mark Ready Plated
                        </button>
                      )}

                      {order.state === 'Ready to Serve' && (
                        <button
                          onClick={() => handleAdvanceOrderStatus(order.id, 'Served')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-sans uppercase tracking-widest transition-all cursor-pointer font-bold shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Deliver to Seat
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-500 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                        title="Cancel order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-12 bg-[#FFFFFF] rounded-[32px] space-y-3 border-2 border-dashed border-[rgba(26,26,26,.18)]">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                    <div>
                      <h4 className="font-barlow font-black text-[#1a1a1a] text-sm uppercase">Active queue is empty!</h4>
                      <p className="text-xs text-neutral-400 font-sans">No customer orders incoming. Click "Simulate Customer QR Order" at the top right to watch slips load dynamically.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 4: KITCHEN DISPLAY KDS (TASK 4: KDS)
              ======================================================== */}
          {adminTab === 'kds' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(26,26,26,.12)] pb-4">
                <div>
                  <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">KDS Screen Dispatcher</h3>
                  <p className="text-xs text-neutral-500">A digital display for kitchen staff to manage and track incoming orders without paperwork.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500 animate-ping" />
                  <span className="text-[9.5px] font-sans text-neutral-500 font-bold uppercase tracking-wider">KITCHEN MONITOR FEED ACTIVE</span>
                </div>
              </div>

              {/* Kitchen Tickets GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.filter(o => o.state === 'Pending' || o.state === 'In Kitchen' || o.state === 'Ready to Serve').map(order => {
                  const isPending = order.state === 'Pending';
                  const isKitchen = order.state === 'In Kitchen';
                  const isReady = order.state === 'Ready to Serve';

                  return (
                    <div 
                      key={order.id}
                      className={`rounded-3xl border-2 p-5 flex flex-col justify-between shadow-xs transition-all ${
                        isPending ? 'bg-amber-50/50 border-amber-300' :
                        isKitchen ? 'bg-[#FFFFFF] border-[#E8447A] shadow-md animate-[pulse_2.5s_infinite]' :
                        'bg-green-50/50 border-green-300'
                      }`}
                    >
                      <div className="space-y-4 text-left">
                        
                        <div className="flex justify-between items-center border-b border-dashed border-neutral-200 pb-2">
                          <span className="text-[11.5px] font-sans font-black text-neutral-900">#KDS-{order.id}</span>
                          <span className="text-[9px] font-sans text-neutral-400 font-bold uppercase">{order.timestamp}</span>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[8px] font-sans font-bold text-[#E8447A] uppercase tracking-widest block leading-none">ORDER DESTINATION:</span>
                          <h4 className="text-sm font-barlow font-black text-[#1a1a1a] uppercase leading-none">{order.table}</h4>
                          
                          <div className="text-[11.5px] font-sans text-[#1a1a1a] bg-white border border-[rgba(26,26,26,.12)] p-2.5 rounded-xl leading-relaxed whitespace-pre-wrap">
                            {order.items}
                          </div>
                        </div>

                        <div>
                          <span className={`text-[8.5px] font-sans font-bold uppercase border px-2.5 py-0.5 rounded-full inline-block leading-none ${
                            isPending ? 'bg-amber-100 border-amber-300 text-amber-800' :
                            isKitchen ? 'bg-pink-100 border-pink-300 text-pink-700' :
                            'bg-green-100 border-green-300 text-green-700'
                          }`}>
                            {order.state === 'Pending' ? 'Incoming New Slip' : order.state === 'In Kitchen' ? 'Chefs Preparing now' : 'Dressed & Plated'}
                          </span>
                        </div>

                      </div>

                      {/* Operational action togglers within KDS ticket */}
                      <div className="mt-5 pt-3 border-t border-neutral-100 flex flex-col gap-1.5">
                        {isPending && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order.id, 'In Kitchen')}
                            className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10.5px] font-sans uppercase tracking-wider font-extrabold cursor-pointer"
                          >
                            Execute Recipe 🍳
                          </button>
                        )}

                        {isKitchen && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order.id, 'Ready to Serve')}
                            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-[10.5px] font-sans uppercase tracking-wider font-extrabold cursor-pointer"
                          >
                            Mark Complete & Plate 🍰
                          </button>
                        )}

                        {isReady ? (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order.id, 'Served')}
                            className="w-full py-2 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-[10.5px] font-sans uppercase tracking-wider font-extrabold cursor-pointer"
                          >
                            Diner Dispatched ✓
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="w-full py-1 bg-neutral-50 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Reject ticket
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}

                {orders.filter(o => o.state === 'Pending' || o.state === 'In Kitchen' || o.state === 'Ready to Serve').length === 0 && (
                  <div className="col-span-3 text-center py-12 bg-[#FFFFFF] border-2 border-dashed border-[rgba(26,26,26,.18)] rounded-[32px] space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                    <div>
                      <h4 className="font-barlow font-black text-[#1a1a1a] text-sm uppercase">Kitchen station clear</h4>
                      <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto">No active KDS cook slips. Customers ordered pastries are cooked perfectly & dispatched!</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 5: TABLES SEATING REGISTRY (TASK 1: Tables / Task 4: Floor Management)
              ======================================================== */}
          {adminTab === 'tables' && (
            <div className="space-y-8">
              
              <div className="border-b border-[rgba(26,26,26,.12)] pb-4">
                <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">Table Seating Registry & Floor Layout</h3>
                <p className="text-xs text-neutral-500 font-sans">Manage physical seating grids. Click tables directly to reservation states, Server allocation and live spending records.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Interactive 2D Floor Plan Grid (Task 4 Floor Management) */}
                <div className="lg:col-span-7 bg-[#FFFFFF] border border-[rgba(26,26,26,.15)] rounded-[32px] p-6 text-center space-y-4">
                  <div className="flex justify-between items-center bg-white border border-[rgba(26,26,26,.12)] py-1.5 px-3 rounded-xl text-[10px] font-sans uppercase tracking-widest font-bold">
                    <span>Cafe Floor Map Seating Grid</span>
                    <span className="text-[#E8447A]">● 8 Physical Outlets</span>
                  </div>

                  {/* Aesthetic seating grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tables.map(table => {
                      const isVacant = table.status === 'vacant';
                      const isOccupied = table.status === 'occupied';
                      const isReserved = table.status === 'reserved';
                      const isCurrentlySelected = table.id === selectedFloorTableId;

                      return (
                        <div
                          key={table.id}
                          onClick={() => {
                            setSelectedFloorTableId(table.id);
                            setPosSelectedTable(table.id); // synchronize POS table selection dynamically too!
                          }}
                          className={`rounded-2xl p-4 cursor-pointer text-left relative transition-all border-2 select-none h-32 flex flex-col justify-between ${
                            isCurrentlySelected ? 'ring-2 ring-pink-500 ring-offset-2 scale-102 border-pink-500' : 'border-neutral-100'
                          } ${
                            isVacant ? 'bg-white hover:border-pink-300' :
                            isOccupied ? 'bg-pink-50/50 border-pink-300 hover:border-pink-400' :
                            'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10.5px] font-sans font-black text-neutral-900 leading-none">NO. {table.number}</span>
                              <span className={`w-2.5 h-2.5 rounded-full ${isVacant ? 'bg-neutral-300' : isOccupied ? 'bg-pink-500' : 'bg-amber-400'}`} />
                            </div>
                            <h4 className="text-[11px] font-sans font-black text-neutral-850 uppercase leading-none tracking-tight">{table.label}</h4>
                            <span className="text-[9px] text-neutral-400 font-sans block">Max: {table.capacity} Seaters</span>
                          </div>

                          <div className="space-y-1 border-t border-dashed border-neutral-200/60 pt-2.5">
                            {isOccupied && (
                              <div className="flex justify-between items-center text-[9px] font-sans">
                                <span className="text-pink-600 font-bold">SPEND:</span>
                                <strong className="text-neutral-950 font-black">${table.spend.toFixed(2)}</strong>
                              </div>
                            )}
                            {isReserved && (
                              <span className="text-[9px] text-amber-600 font-sans tracking-tight font-bold">RESERVED BOOK</span>
                            )}
                            {isVacant && (
                              <span className="text-[9px] text-neutral-400 font-sans italic">Vacant Seat</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-white p-3 rounded-2xl text-[9px] font-sans uppercase tracking-widest text-[rgba(26,26,26,.4)] text-center leading-relaxed">
                    ● PINK: OCCUPIED SEAT ● AMBER: RESERVED BOOK ● WHITE: VACANT SEAT
                  </div>
                </div>

                {/* Selected Table properties editor panel */}
                <div className="lg:col-span-5 bg-white border border-[rgba(26,26,26,.15)] rounded-3xl p-5 space-y-5">

                  <div className="border-b border-[rgba(26,26,26,.12)] pb-3">
                    <span className="text-[8px] font-sans font-bold text-[#E8447A] uppercase tracking-widest block leading-none">Active Outlet Details</span>
                    <h4 className="text-sm font-barlow font-black text-[#1a1a1a] uppercase">{activeFloorTable.label}</h4>
                  </div>

                  <div className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-2 gap-3 font-sans text-[10.5px]">
                      <div>
                        <span className="text-[8px] font-sans text-neutral-400 font-bold uppercase tracking-widest block pb-1">Occupancy stage:</span>
                        <span className="font-extrabold uppercase text-neutral-800">{activeFloorTable.status}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-sans text-neutral-400 font-bold uppercase tracking-widest block pb-1">Capacity range:</span>
                        <span className="font-extrabold uppercase text-neutral-800">{activeFloorTable.capacity} guests limit</span>
                      </div>
                    </div>

                    {activeFloorTable.customerName && (
                      <div className="font-sans text-[10.50px]">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest block pb-1">Assigned Guest Profile:</span>
                        <strong className="text-[#E8447A] uppercase font-black block">{activeFloorTable.customerName}</strong>
                      </div>
                    )}

                    {activeFloorTable.serverName && (
                      <div className="font-sans text-[10.50px]">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest block pb-1">Assigned waitstaff server:</span>
                        <strong className="text-neutral-850 uppercase font-black block">{activeFloorTable.serverName}</strong>
                      </div>
                    )}

                    <div className="bg-white border border-[rgba(26,26,26,.12)] rounded-2xl p-3.5 space-y-2 font-sans text-[10.5px]">
                      <div className="flex justify-between items-center">
                        <span>Active Spending:</span>
                        <strong className="text-[#E8447A] font-black">${activeFloorTable.spend.toFixed(2)}</strong>
                      </div>
                      
                      {activeFloorTable.status === 'occupied' && (
                        <div className="flex gap-1.5 pt-1 border-t border-dashed">
                          <button 
                            onClick={() => handleUpdateTableSpend(activeFloorTable.id, 5.00)}
                            className="bg-neutral-50 hover:bg-pink-50 text-[10px] text-neutral-700 border font-bold px-2 py-1 rounded"
                          >
                            + $5 mock spend
                          </button>
                          <button 
                            onClick={() => handleUpdateTableSpend(activeFloorTable.id, -5.00)}
                            className="bg-neutral-50 hover:bg-neutral-100 text-[10px] text-neutral-700 border px-2 py-1 rounded"
                          >
                            - $5
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Table quick Actions status toggling key */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleToggleSeating(activeFloorTable.id)}
                        className="w-full py-2.5 bg-neutral-900 border border-neutral-950 hover:bg-[#be123c] hover:border-[#be123c] text-white rounded-xl text-[10px] font-sans uppercase tracking-widest cursor-pointer font-bold transition-all text-center"
                      >
                        Click Toggle Seating (status check)
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              TAB 6: INVENTORY STOCK ROOM (TASK 2: Inventory / Task 5)
              ======================================================== */}
          {adminTab === 'inventory' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(26,26,26,.12)] pb-4">
                <div>
                  <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">Boutique Inventory stockroom</h3>
                  <p className="text-xs text-[#1BC8C8] font-sans uppercase font-black tracking-widest">REAL-TIME STOCK WATCH ACTIVE</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleRestockAll}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1 shadow-xs border border-pink-600 transition-all text-center"
                  >
                    <Plus className="w-4 h-4" /> Restock All Materials
                  </button>
                </div>
              </div>

              {/* Grid database of Stock Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stock.map(item => {
                  const isOut = item.status === 'out';
                  const isLow = item.status === 'low';

                  return (
                    <div 
                      key={item.id}
                      className="border border-[rgba(26,26,26,.12)] bg-white rounded-3xl p-4.5 flex gap-4 hover:border-[#E8447A] relative tracking-wide transition-all justify-between items-center"
                    >
                      <div className="space-y-1.5 text-left flex-grow max-w-[210px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[7.5px] font-sans text-neutral-400 border px-1.5 py-0.2 rounded uppercase">
                            {item.category}
                          </span>
                          <span className={`text-[7.5px] font-sans font-bold uppercase border px-2 py-0.2 rounded-full ${
                            isOut ? 'bg-rose-100 border-rose-300 text-rose-700' :
                            isLow ? 'bg-amber-105 border-amber-300 text-amber-700' :
                            'bg-green-105 border-green-300 text-green-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <h4 className="text-[11.5px] font-sans font-black text-neutral-900 uppercase leading-snug">{item.name}</h4>
                        <span className="text-[9.5px] font-sans text-neutral-400 block pb-1">Cost metric: ${item.costPerUnit.toFixed(2)} / {item.unit}</span>
                        
                        <div className="flex items-center gap-1 text-[11px] font-sans font-bold text-neutral-800">
                          <span>STOCK BALANCE:</span>
                          <strong className={`px-2 py-0.2 rounded ${isOut ? 'bg-rose-100 text-rose-700': 'bg-neutral-50'}`}>
                            {item.quantity} {item.unit}
                          </strong>
                        </div>
                      </div>

                      {/* Stock Adjustment Controls Plus/Minus */}
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        <span className="text-[8px] font-sans text-neutral-400 uppercase tracking-widest font-bold block">Quick Shift</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleAdjustStock(item.id, -1)}
                            className="w-8 h-8 rounded-xl bg-neutral-50 hover:bg-rose-50 text-neutral-600 border flex items-center justify-center font-sans font-black"
                          >
                            -
                          </button>
                          <button 
                            onClick={() => handleAdjustStock(item.id, 5)}
                            className="w-8 h-8 rounded-xl bg-neutral-50 hover:bg-pink-50 text-neutral-600 border flex items-center justify-center font-sans font-black"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 7: PRINTABLE QR CODE PLACARDS (TASK 2: QR)
              ======================================================== */}
          {adminTab === 'qr-code' && (
            <div className="space-y-6">
              
              <div className="border-b border-[rgba(26,26,26,.12)] pb-4">
                <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">Printable Restaurant QR Code Placards</h3>
                <p className="text-xs text-neutral-500 font-sans">Design table QR codes for dine-in guests. Adjust colors and menu links, then print and laminate.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Modifiers panel */}
                <div className="lg:col-span-5 bg-[rgba(240,234,210,.3)] border border-[rgba(26,26,26,.12)] rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-sans font-bold uppercase text-[#1a1a1a]">Custom Slogan Tagging</h4>
                  
                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <label className="block text-[9px] font-sans text-neutral-400 uppercase mb-1 font-bold">Placard Headline:</label>
                      <input 
                        type="text" 
                        value={customQrSlogan} 
                        onChange={(e) => setCustomQrSlogan(e.target.value.toUpperCase())}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans text-neutral-400 uppercase mb-1 font-bold">Border Hue Accent:</label>
                      <select 
                        value={customQrColor} 
                        onChange={(e) => setCustomQrColor(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-2 py-1.5 font-sans"
                      >
                        <option value="pink">Coquette Pastel Rose (Pink)</option>
                        <option value="emerald">Botanical Sage Forest (Emerald)</option>
                        <option value="amber">Warm Apricot Honey (Amber)</option>
                        <option value="neutral">Classic Waldorf Slate (Neutral)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setDinerConfig(prev => ({
                          ...prev,
                          placardSlogan: customQrSlogan,
                          placardColor: customQrColor
                        }));
                        setAlerts(prev => [
                          {
                            id: `alert-${Date.now()}`,
                            title: 'QR Placards Customized',
                            message: `Dine-in menu placards successfully re-stylized in ${customQrColor} hue schemas.`,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isRead: false,
                            type: 'system'
                          },
                          ...prev
                        ]);
                      }}
                      className="w-full text-center py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10px] font-sans uppercase tracking-widest cursor-pointer font-bold"
                    >
                      Bake Changes onto QR Live Placard
                    </button>
                  </div>
                </div>

                {/* Simulated physical placard preview */}
                <div className="lg:col-span-7 flex justify-center">
                  
                  {/* Outer Gingham Placard card */}
                  <div className={`w-80 border-4 rounded-[42px] bg-white p-6 shadow-lg text-center space-y-5 flex flex-col items-center border-${customQrColor === 'emerald' ? 'emerald' : customQrColor === 'amber' ? 'amber' : customQrColor === 'neutral' ? 'neutral' : 'pink'}-300 relative overflow-hidden`}>
                    
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[#FFFFFF] border-b border-[rgba(26,26,26,.12)]" />

                    <div className="space-y-1">
                      <span className={`text-[8.5px] font-sans font-black uppercase tracking-[0.2em] text-${customQrColor === 'emerald' ? 'emerald' : customQrColor === 'amber' ? 'amber' : customQrColor === 'neutral' ? 'neutral' : 'pink'}-600 block`}>
                        WELCOME TO {dinerConfig.dinerName}
                      </span>
                      <h4 className="text-lg font-barlow font-black tracking-tight text-[#1a1a1a] leading-none uppercase">ORDER FROM SEAT</h4>
                    </div>

                    {/* QR Code Graphic element mockup inside floral border */}
                    <div className={`w-36 h-36 rounded-3xl border-2 border-dashed flex items-center justify-center p-3 border-${customQrColor === 'emerald' ? 'emerald' : customQrColor === 'amber' ? 'amber' : customQrColor === 'neutral' ? 'neutral' : 'pink'}-300`}>
                      <div className="bg-[#FFFFFF] p-2 rounded-2xl">
                        <QrCode className="w-24 h-24 stroke-[1.25] text-[#1a1a1a]" />
                      </div>
                    </div>

                    <div className="space-y-1 max-w-[210px]">
                      <span className="text-[10px] font-sans font-black tracking-tight text-neutral-800 uppercase block">"{customQrSlogan}"</span>
                      <p className="text-[8.5px] text-neutral-400 font-sans leading-normal">
                        Skip waiting lines. Scan code to browse our double milkshakes, baked waffles and track your chef cooking speed live!
                      </p>
                    </div>

                    {/* Printed Footer indicator */}
                    <div className={`text-[8px] font-sans font-extrabold uppercase border rounded-md px-3 py-0.5 border-${customQrColor === 'emerald' ? 'emerald' : customQrColor === 'amber' ? 'amber' : customQrColor === 'neutral' ? 'neutral' : 'pink'}-200 text-neutral-500`}>
                      PLATE CODE: TABLE NO. 04
                    </div>

                    <button 
                      onClick={() => alert("Simulating paper tray print... Laminate template layout queued!")}
                      className="text-[9.5px] font-sans uppercase text-neutral-400 hover:text-pink-600 transition-colors flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> PRINT PHYSICAL CARD
                    </button>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              TAB 8: STAFF REGISTRY (TASK 2: Staff)
              ======================================================== */}
          {adminTab === 'staff' && (
            <div className="space-y-6">
              
              <div className="border-b border-[rgba(26,26,26,.12)] pb-4">
                <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">Diner Employee Registry & Shifts</h3>
                <p className="text-xs text-neutral-500 font-sans">Organize your kitchen team and wait-staff schedule logs below.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form to submit new employee */}
                <form onSubmit={handleAddStaff} className="lg:col-span-4 bg-white border border-[rgba(26,26,26,.12)] rounded-3xl p-5 space-y-4">
                  <span className="text-[8px] font-sans font-bold text-[#E8447A] uppercase tracking-widest block leading-none">Add Staff Member</span>
                  <h4 className="text-xs font-sans font-black text-[#1a1a1a] uppercase border-b border-[rgba(26,26,26,.12)] pb-1.5">Add Wait-Staff / Chef</h4>

                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <label className="block text-[8px] font-sans text-neutral-400 uppercase mb-1 font-bold">Full Name:</label>
                      <input 
                        type="text" 
                        placeholder="e.g. ALEX JOHNSON"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-pink-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-sans text-neutral-400 uppercase mb-1 font-bold">Office Role:</label>
                      <select 
                        value={newStaff.role}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value as any }))}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-2 py-1.5 font-sans"
                      >
                        <option value="Waiter">Waiter (Floor Service)</option>
                        <option value="Chef">Chef (Bake Production)</option>
                        <option value="Bistro Captain">Bistro Captain (Floor Lead)</option>
                        <option value="Barista">Barista (Beverage Maker)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-sans text-neutral-405 uppercase mb-1 font-bold">Active Shift Tranche:</label>
                      <select 
                        value={newStaff.shift}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, shift: e.target.value }))}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-2 py-1.5 font-sans"
                      >
                        <option value="Morning shift 07:00-15:00">Morning Shift (07:00 - 15:00)</option>
                        <option value="Evening shift 15:00-22:00">Evening Shift (15:00 - 22:00)</option>
                        <option value="Night shift 22:00-06:00">Night Shift (22:00 - 06:00)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-sans text-neutral-400 uppercase mb-1 font-bold">Phone contact:</label>
                      <input 
                        type="text" 
                        placeholder="(213) 555-1212"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10px] font-sans uppercase tracking-widest font-bold cursor-pointer transition-colors"
                    >
                      Approve Contract & Contract shift
                    </button>
                  </div>
                </form>

                {/* Staff list panel */}
                <div className="lg:col-span-8 bg-white border border-[rgba(26,26,26,.12)] rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-sans font-bold uppercase text-[#1a1a1a] border-b border-[rgba(26,26,26,.12)] pb-1.5">Registered Bistro Service Team</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {staff.map(member => (
                      <div 
                        key={member.id}
                        className="border border-[rgba(26,26,26,.12)] bg-white rounded-2xl p-4 flex gap-3 hover:border-[#E8447A] transition-colors justify-between items-start"
                      >
                        <div className="space-y-1 text-left">
                          <span className={`text-[7px] font-sans font-bold uppercase border px-1.5 py-0.2 rounded ${
                            member.role === 'Chef' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            member.role === 'Bistro Captain' ? 'bg-[rgba(232,68,122,.1)] text-[#E8447A] border-[rgba(232,68,122,.4)]' :
                            'bg-[rgba(232,68,122,.1)] text-[#E8447A] border-[rgba(232,68,122,.4)]'
                          }`}>
                            {member.role}
                          </span>
                          <h4 className="text-[11px] font-sans font-black text-neutral-850 uppercase leading-none">{member.name}</h4>
                          <span className="text-[8.5px] text-neutral-400 block font-sans">{member.shift}</span>
                          <span className="text-[8 px] text-neutral-400 block">📞 {member.phone || '(213) 555-9014'}</span>
                          <span className="text-[10px] text-[#1BC8C8] block">★ Score: {member.rating.toFixed(1)} / 5.0</span>
                        </div>

                        {member.name !== 'ANIKA PANNU' && (
                          <button
                            onClick={() => handleFireStaff(member.id)}
                            className="p-1 border border-neutral-100 hover:border-rose-200 text-neutral-400 hover:text-rose-600 rounded bg-neutral-50/50 cursor-pointer"
                            title="Delete staff"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              TAB 9: BILLING & POS DESK (TASK 4: Billing & Payments & Floor Management)
              ======================================================== */}
          {adminTab === 'billing' && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              
              <div className="border-b border-[rgba(26,26,26,.12)] pb-4">
                <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">Diner Billing Desk & Split pos</h3>
                <p className="text-xs text-neutral-500 font-sans">Simulate interactive customer checkout splitting, billing ledger calculations, and payments systems checks.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Billing ledger parameters */}
                <div className="lg:col-span-6 space-y-6 text-left font-sans text-xs">
                  
                  {/* Select active table */}
                  <div className="bg-white border border-[rgba(26,26,26,.12)] rounded-3xl p-5 space-y-4">
                    <span className="text-[8px] font-sans font-black text-[#E8447A] uppercase tracking-widest block leading-none">BILLING SOURCE TABLE:</span>
                    
                    <div className="space-y-3 font-sans">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Select table with active tab:</label>
                        <select 
                          value={posSelectedTable}
                          onChange={(e) => setPosSelectedTable(e.target.value)}
                          className="w-full bg-white border border-pink-200 rounded-xl px-3 py-1.5 focus:outline-none"
                        >
                          {tables.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.label} (Current Spend: ${t.spend.toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Waiter slip summary mock */}
                      <div className="bg-white p-3 border rounded-2xl space-y-1.5 text-neutral-700 font-sans text-[10.5px]">
                        <div className="flex justify-between font-black border-b border-[rgba(26,26,26,.12)] pb-1 mb-1">
                          <span>TAB ACCOUNT LEDGER</span>
                          <span className="text-[#1BC8C8]">Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Base net spend:</span>
                          <strong>${selectedTableSpendVal.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>CGST (2.5%) + SGST (2.5%):</span>
                          <strong>${posCalculatedGSTVal.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-[rgba(26,26,26,.18)] pt-1.5 font-black text-[#1a1a1a]">
                          <span>GRAND TOTAL:</span>
                          <span>${posCalculatedGrandTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Friends splits */}
                      <div>
                        <div className="flex justify-between font-sans text-[10.5px] items-center uppercase mb-1 text-neutral-700 font-bold">
                          <span>Divide invoice between friends:</span>
                          <span className="text-[#E8447A] font-black">{posFriendCount} Guests</span>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max="8"
                          value={posFriendCount}
                          onChange={(e) => setPosFriendCount(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-pink-100 rounded-xl appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>

                      <div className="bg-[rgba(232,68,122,.15)] border border-[rgba(26,26,26,.12)] p-3 rounded-2xl flex justify-between font-sans text-[10.5px] items-center text-[#E8447A] font-bold">
                        <span>EACH FRIEND SHARE VALUE:</span>
                        <strong className="text-sm font-black">${posSplitShareAmt.toFixed(2)}</strong>
                      </div>

                    </div>
                  </div>

                  {/* Payment engine select (Task 4 Payments) */}
                  <div className="space-y-3 bg-white border border-[rgba(26,26,26,.12)] p-5 rounded-3xl">
                    <h4 className="text-xs font-sans font-bold uppercase text-[#1a1a1a]">Mock digital payments receiver</h4>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {[
                        { id: 'applepay', name: 'Simulate Apple Pay', desc: 'Secure token NFC' },
                        { id: 'card', name: 'Insert EMV Chip', desc: 'Simulate swipe checkout' },
                        { id: 'gpay', name: 'Simulate Google Pay', desc: 'Android merchant check' },
                        { id: 'cash', name: 'Tender Cash Register', desc: 'Settle till balance' }
                      ].map(pay => (
                        <button
                          key={pay.id}
                          type="button"
                          onClick={() => {
                            setPosPaymentMethod(pay.id as any);
                            setPosIsApproved(false);
                          }}
                          className={`p-2.5 border text-left rounded-xl transition-all cursor-pointer font-bold ${
                            posPaymentMethod === pay.id 
                              ? 'bg-neutral-900 border-neutral-950 text-white shadow-xs' 
                              : 'bg-white hover:bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          <span className="uppercase block">{pay.name}</span>
                          <span className="text-[9px] text-neutral-400 font-normal block leading-none mt-0.5">{pay.desc}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={triggerPOSPaymentSimulation}
                        disabled={posIsProcessing || selectedTableSpendVal === 0}
                        className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {posIsProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Settlement in progress...
                          </>
                        ) : (
                          `Settle account tab: $${posCalculatedGrandTotal.toFixed(2)}`
                        )}
                      </button>
                    </div>

                    {posIsApproved && (
                      <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-[10.5px] space-y-1">
                        <span className="font-extrabold uppercase block text-[11px]">✔ SETTLEMENT SUCCESSFUL!</span>
                        <p className="font-sans leading-relaxed text-[10px]">
                          Invoice transaction ID <span className="font-sans font-bold">TXN-{Math.floor(Math.random() * 900000) + 100000}</span> settled. Seating status freed to vacant.
                        </p>
                      </div>
                    )}

                  </div>

                </div>

                {/* Print paper receipt view */}
                <div className="lg:col-span-6 space-y-4">
                  <span className="text-xs font-bold text-neutral-400 uppercase text-center block">Printed GST Bill Invoice</span>
                  
                  {/* Paper styled receipt */}
                  <div className="bg-white border-2 border-dashed border-neutral-300 rounded-[24px] p-6 text-left space-y-3 font-sans text-[10.5px] max-w-sm mx-auto shadow-sm relative">
                    
                    <div className="text-center space-y-0.5 border-b pb-2">
                      <p className="font-barlow font-black text-[#1a1a1a] text-sm uppercase">{dinerConfig.dinerName}</p>
                      <span className="text-[8.5px] text-neutral-400 block uppercase">842 PASTEL BLVD, SUITE 8-B</span>
                      <span className="text-[8.5px] text-neutral-400 block leading-none">LOS ANGELES, CA ● (213) 555-0192</span>
                    </div>

                    <div className="space-y-0.5 text-neutral-500 border-b pb-2 text-[9.5px]">
                      <div className="flex justify-between">
                        <span>INVOICE DEPOSIT ID:</span>
                        <strong className="text-neutral-800 font-extrabold">IN-2026-{Math.floor(Math.random() * 9000) + 1000}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>OUTLET ATTACHED:</span>
                        <strong className="text-neutral-800 font-extrabold">TABLE NO. {tables.find(t=> t.id === posSelectedTable)?.number || 4}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>GSTIN REFERENCE NO:</span>
                        <span>06AAAAA0000A1Z1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TIMESTAMP LOG:</span>
                        <span>2026-05-30 08:35:10</span>
                      </div>
                      <div className="flex justify-between uppercase">
                        <span>Digital pay channel:</span>
                        <strong className="text-neutral-800">{posPaymentMethod}</strong>
                      </div>
                    </div>

                    {/* Receipt rows */}
                    <div className="space-y-1 border-b pb-2 text-[9.5px]">
                      <div className="flex justify-between font-extrabold text-neutral-400 uppercase">
                        <span>Items purchased</span>
                        <span>Price ($)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1x Coquette Cake slice & foam</span>
                        <span>12.50</span>
                      </div>
                      <div className="flex justify-between text-neutral-400 italic">
                        <span>Server staff: waitstaff MIA</span>
                        <span>--</span>
                      </div>
                    </div>

                    {/* Calculations summary */}
                    <div className="space-y-1 font-sans text-[10.5px]">
                      <div className="flex justify-between">
                        <span>NET SUB-TOTAL:</span>
                        <strong>${selectedTableSpendVal.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT / SERVICE TAX ({dinerConfig.activeTax}%):</span>
                        <strong>${posCalculatedGSTVal.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between border-t border-dashed border-[rgba(26,26,26,.18)] pt-1 font-extrabold text-[#E8447A] text-[11px]">
                        <span>GRAND BILL TOTAL:</span>
                        <span>${posCalculatedGrandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-[8.5px] text-neutral-400 text-center uppercase pt-3 max-w-[210px] mx-auto leading-normal">
                      ● THANK YOU FOR DINING WITH SMARTDINE. ALL RECIPES SECURED UNDER PRIVATE LICENSE DIET STATUTES CODES.
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================
              TAB 10: SETTINGS (TASK 2: Settings)
              ======================================================== */}
          {adminTab === 'settings' && (
            <div className="space-y-6">
              
              <div className="border-b border-[rgba(26,26,26,.12)] pb-4">
                <h3 className="text-lg font-barlow font-black text-[#1a1a1a] uppercase tracking-tight">Diner Control Settings Panel</h3>
                <p className="text-xs text-neutral-500">Configure public variables, tax rates, operational margins and booster promo guidelines.</p>
              </div>

              <div className="bg-[rgba(240,234,210,.3)] border border-[rgba(26,26,26,.12)] rounded-3xl p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* General Name settings */}
                  <div>
                    <label className="block text-[8px] font-sans uppercase tracking-widest text-[#E8447A] font-black mb-1.5">Cafe Brand Name:</label>
                    <input 
                      type="text" 
                      value={dinerConfig.dinerName}
                      onChange={(e) => setDinerConfig(prev => ({ ...prev, dinerName: e.target.value.toUpperCase() }))}
                      className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs font-sans focus:border-pink-300 focus:outline-none"
                    />
                  </div>

                  {/* Tax rates */}
                  <div>
                    <label className="block text-[8px] font-sans uppercase tracking-widest text-[#E8447A] font-black mb-1.5">Global Tax rate (% CGST/SGST total):</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={dinerConfig.activeTax}
                      onChange={(e) => setDinerConfig(prev => ({ ...prev, activeTax: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs font-sans focus:border-pink-300 focus:outline-none"
                    />
                  </div>

                  {/* Shipping trigger */}
                  <div>
                    <label className="block text-[8px] font-sans uppercase tracking-widest text-[#E8447A] font-black mb-1.5">Free takeaway courier over ($):</label>
                    <input 
                      type="number" 
                      value={dinerConfig.shippingBarrier}
                      onChange={(e) => setDinerConfig(prev => ({ ...prev, shippingBarrier: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs font-sans focus:border-pink-300 focus:outline-none"
                    />
                  </div>

                  {/* Operating open-close hour presets */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-sans uppercase tracking-widest text-[#E8447A] font-black mb-1.5">Opening hour:</label>
                      <input 
                        type="text" 
                        value={dinerConfig.openingHour}
                        onChange={(e) => setDinerConfig(prev => ({ ...prev, openingHour: e.target.value }))}
                        className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-sans uppercase tracking-widest text-[#E8447A] font-black mb-1.5">Closing hour:</label>
                      <input 
                        type="text" 
                        value={dinerConfig.closingHour}
                        onChange={(e) => setDinerConfig(prev => ({ ...prev, closingHour: e.target.value }))}
                        className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

                {/* Boolean promos check */}
                <div className="border-t border-dashed border-[rgba(26,26,26,.15)] pt-6 flex justify-between items-center bg-white border border-[rgba(26,26,26,.12)] p-4 rounded-2xl max-w-xl">
                  <div className="space-y-0.5 text-left font-sans">
                    <strong className="text-xs font-bold text-neutral-800 uppercase block">Loyalty Stamps Booster active</strong>
                    <span className="text-[10px] text-neutral-400 block">Customers earn rewards with every completed order.</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={dinerConfig.promoActive}
                    onChange={(e) => setDinerConfig(prev => ({ ...prev, promoActive: e.target.checked }))}
                    className="w-4 h-4 text-pink-500 accent-pink-500 rounded focus:ring-transparent border-pink-200"
                  />
                </div>

                {/* Broadcast box */}
                <form onSubmit={handleBroadcastAlert} className="space-y-3 pt-4 border-t border-[rgba(26,26,26,.12)] max-w-xl">
                  <div>
                    <h5 className="text-xs font-sans font-bold uppercase text-[#1a1a1a]">Broadcast Alert to Waiter Dashboard</h5>
                    <p className="text-[10px] text-neutral-400 font-sans">Submit alert notifications that show up immediately across active terminal streams.</p>
                  </div>
                  <div className="flex gap-2 font-sans text-xs">
                    <input 
                      type="text" 
                      placeholder="e.g. Table 4 restocked"
                      value={alertBroadcast}
                      onChange={(e) => setAlertBroadcast(e.target.value)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 outline-none focus:border-pink-300"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-neutral-900 border border-neutral-950 hover:bg-pink-500 hover:border-pink-500 text-white hover:text-white rounded-xl text-[10.5px] uppercase font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Broadcast
                    </button>
                  </div>
                </form>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
