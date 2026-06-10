import React, { useState, useEffect } from 'react';
import { 
  QrCode, Tv, CreditCard, PieChart, Heart, 
  Check, Plus, Trash2, Shield, TrendingUp, Sparkles, 
  Clock, ArrowRight, DollarSign, CheckCircle, Users, 
  RefreshCw, FileText, Smartphone, Mail, Phone, Building,
  ListFilter, Eye, ChevronRight, Split, Landmark
} from 'lucide-react';
import { MENU_ITEMS, DECOR_IMAGES } from '../foodData';
import { MenuItem } from '../types';

export default function FeaturesView() {
  const [activeTab, setActiveTab] = useState<'qr' | 'kds' | 'billing' | 'analytics' | 'demo'>('qr');

  // ==========================================
  // STATE 1: QR CODE ORDERING GUEST UI STATES
  // ==========================================
  const [qrTable, setQrTable] = useState<string>('Table 4');
  const [qrCategory, setQrCategory] = useState<string>('all');
  const [qrCart, setQrCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [qrOrderStatus, setQrOrderStatus] = useState<null | 'received' | 'cooking' | 'ready' | 'served'>(null);
  const [qrOrderTrackerTicks, setQrOrderTrackerTicks] = useState<number>(0);
  
  // Handler for adding to simulation cart
  const addToQrCart = (item: MenuItem) => {
    setQrCart(prev => {
      const exist = prev.find(i => i.item.id === item.id);
      if (exist) {
        return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  // Handler for decreasing simulation cart
  const removeFromQrCart = (itemId: string) => {
    setQrCart(prev => {
      return prev.map(i => {
        if (i.item.id === itemId) return { ...i, qty: i.qty - 1 };
        return i;
      }).filter(i => i.qty > 0);
    });
  };

  // Start QR Order simulation
  const handlePlaceQrOrder = () => {
    if (qrCart.length === 0) return;
    setQrOrderStatus('received');
    setQrOrderTrackerTicks(10);
  };

  // Timer simulation to update guest status tracker path
  useEffect(() => {
    if (!qrOrderStatus) return;
    const interval = setInterval(() => {
      setQrOrderTrackerTicks(prev => {
        const next = prev + 30;
        if (next >= 100) {
          clearInterval(interval);
          setQrOrderStatus(curr => {
            if (curr === 'received') return 'cooking';
            return curr;
          });
          return 100;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrOrderStatus]);

  // Command to manual state triggers for guest mockup testing comfort
  const setExactGuestStatus = (status: 'received' | 'cooking' | 'ready' | 'served') => {
    setQrOrderStatus(status);
    if (status === 'received') setQrOrderTrackerTicks(25);
    if (status === 'cooking') setQrOrderTrackerTicks(50);
    if (status === 'ready') setQrOrderTrackerTicks(75);
    if (status === 'served') setQrOrderTrackerTicks(100);
  };

  // ==========================================
  // STATE 2: KITCHEN DISPLAY SYSTEM TICKETS
  // ==========================================
  const [kdsOrders, setKdsOrders] = useState([
    { id: 'Q-408', table: 'Table 4', itemSummary: '1x Strawberry Icing Velvet Cake, 1x Peach Matcha Latte', timestamp: '11:24 AM', status: 'Cooking', duration: '4 min elapsed' },
    { id: 'Q-409', table: 'Table A-2', itemSummary: '2x Sichuan Sesame Chili Noodles', timestamp: '11:28 AM', status: 'New', duration: '1 min elapsed' },
    { id: 'Q-407', table: 'Table 10', itemSummary: '1x Classic Berry Chia Porridge, 1x Egg Salad Plate', timestamp: '11:15 AM', status: 'Ready to Serve', duration: '12 min elapsed' },
    { id: 'Q-410', table: 'Takeout #4', itemSummary: '1x Peach Cream Smoothie, 1x Handmade Egg Noodles', timestamp: '11:32 AM', status: 'New', duration: 'Just now' }
  ]);
  const [kdsFilter, setKdsFilter] = useState<'all' | 'New' | 'Cooking' | 'Ready to Serve'>('all');

  const advanceKdsOrder = (id: string) => {
    setKdsOrders(prev => prev.map(o => {
      if (o.id === id) {
        if (o.status === 'New') return { ...o, status: 'Cooking' };
        if (o.status === 'Cooking') return { ...o, status: 'Ready to Serve' };
      }
      return o;
    }));
  };

  const bumpKdsOrderComplete = (id: string) => {
    setKdsOrders(prev => prev.filter(o => o.id !== id));
  };

  const resetKdsSimulator = () => {
    setKdsOrders([
      { id: 'Q-408', table: 'Table 4', itemSummary: '1x Strawberry Icing Velvet Cake, 1x Peach Matcha Latte', timestamp: '11:24 AM', status: 'Cooking', duration: '4 min elapsed' },
      { id: 'Q-409', table: 'Table A-2', itemSummary: '2x Sichuan Sesame Chili Noodles', timestamp: '11:28 AM', status: 'New', duration: '1 min elapsed' },
      { id: 'Q-407', table: 'Table 10', itemSummary: '1x Classic Berry Chia Porridge, 1x Egg Salad Plate', timestamp: '11:15 AM', status: 'Ready to Serve', duration: '12 min elapsed' },
      { id: 'Q-410', table: 'Takeout #4', itemSummary: '1x Peach Cream Smoothie, 1x Handmade Egg Noodles', timestamp: '11:32 AM', status: 'New', duration: 'Just now' }
    ]);
  };

  // ==========================================
  // STATE 3: BILLING & PAYMENT SANDBOX CODES
  // ==========================================
  const [billingTotal, setBillingTotal] = useState<number>(48.50);
  const [splitCount, setSplitCount] = useState<number>(3);
  const [billSplitNames, setBillSplitNames] = useState<string[]>(['You', 'Aria', 'Ethan']);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'card' | 'applepay' | 'gpay' | 'qr'>('applepay');
  const [isPayProcessing, setIsPayProcessing] = useState<boolean>(false);
  const [isPayApproved, setIsPayApproved] = useState<boolean>(false);

  const triggerPaymentSimulation = () => {
    setIsPayProcessing(true);
    setIsPayApproved(false);
    setTimeout(() => {
      setIsPayProcessing(false);
      setIsPayApproved(true);
    }, 1500);
  };

  // Dynamic values for GST calculations
  const gstRate = 0.05; // 5% total GST (CGST 2.5%, SGST 2.5%)
  const subtotalCost = billingTotal / (1 + gstRate);
  const calculatedGST = billingTotal - subtotalCost;
  const splitShare = billingTotal / Math.max(1, splitCount);

  // ==========================================
  // STATE 4: REPORTS & ANALYTICS WIDGETS
  // ==========================================
  const [heatmapTableNum, setHeatmapTableNum] = useState<number | null>(4);
  const analyticsKPIs = [
    { title: 'TODAY\'S NET SALES', value: '$2,410.50', shift: '+14.2% vs Thursday', color: 'text-pink-600' },
    { title: 'COVERS SERVED', value: '184 Diners', shift: '92 orders processed', color: 'text-neutral-900' },
    { title: 'AVG TABLE DWELL', value: '44 Minutes', shift: '-5m turnaround optimization', color: 'text-neutral-900' },
    { title: 'KITCHEN DISPATCH AVG', value: '7.8 Mins', shift: 'Fastest 5% of direct KDS', color: 'text-emerald-600' }
  ];

  const tableHeatmapData = [
    { id: 1, label: 'T-1 Window', status: 'high', orders: 22, occupancy: '90%' },
    { id: 2, label: 'T-2 Window', status: 'high', orders: 20, occupancy: '85%' },
    { id: 3, label: 'T-3 Center', status: 'medium', orders: 12, occupancy: '60%' },
    { id: 4, label: 'T-4 Alcove', status: 'critical', orders: 28, occupancy: '98%' },
    { id: 5, label: 'T-5 Custom', status: 'medium', orders: 15, occupancy: '70%' },
    { id: 6, label: 'T-6 Gingham', status: 'critical', orders: 26, occupancy: '95%' },
    { id: 7, label: 'T-7 Counter', status: 'low', orders: 8, occupancy: '35%' },
    { id: 8, label: 'T-8 Bar S1', status: 'low', orders: 6, occupancy: '25%' }
  ];

  // ==========================================
  // STATE 5: OPERATIVE DEMO REGISTRATION REQUESTS
  // ==========================================
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoCafe, setDemoCafe] = useState('');
  const [demoTables, setDemoTables] = useState<number>(12);
  const [demoPos, setDemoPos] = useState('Standard Clover Node');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoQuote, setDemoQuote] = useState<number>(0);

  const calculateCustomQuote = (tables: number) => {
    return 50 + tables * 8;
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName || !demoEmail || !demoCafe) {
      alert("Please enter values in all required fields!");
      return;
    }
    setDemoQuote(calculateCustomQuote(demoTables));
    setDemoSubmitted(true);
  };

  return (
    <div className="bg-[#FFFDF6] py-10 px-4 md:px-8 space-y-12">
      
      {/* Visual Title Block */}
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.3em] block">
          SMARTDINE FULL-STACK DEMO SUITE
        </span>
        <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          ACTIVE CAPABILITIES & PROTOCOLS
        </h2>
        <p className="text-xs text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Explore our restaurant modules below. Switch between the modules to interact with Live QR Guest ordering, Kitchen queue boards, tax receipts splitting, and dynamic heatmaps.
        </p>
      </div>

      {/* Tabs list navigation */}
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center border-b border-pink-100 gap-1.5 pb-0.5">
        {[
          { id: 'qr', label: 'QR ordering', icon: QrCode },
          { id: 'kds', label: 'Kitchen (KDS)', icon: Tv },
          { id: 'billing', label: 'Billing & Split', icon: CreditCard },
          { id: 'analytics', label: 'Reports & Analytics', icon: PieChart },
          { id: 'demo', label: 'Demo consultation', icon: Smartphone }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-t-2 border-x rounded-t-xl cursor-pointer ${
                isActive 
                  ? 'bg-white border-x-pink-100 border-t-pink-500 text-pink-600 font-extrabold shadow-xs' 
                  : 'bg-neutral-50/50 border-x-transparent border-t-transparent text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Canvas */}
      <div className="max-w-5xl mx-auto bg-white border border-pink-100 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* =========================================================
            TAB 1: QR ORDERING GUEST UI
            ========================================================= */}
        {activeTab === 'qr' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900 uppercase">Interactive Guest Table Session</h3>
                <p className="text-xs text-neutral-400">Simulate how customers look up items, order instantly and track preparation stage directly on their phones.</p>
              </div>
              
              {/* Select Table QR placard simulation */}
              <div className="flex items-center gap-2 text-xs bg-pink-50 border border-pink-200 py-1.5 px-3 rounded-xl">
                <span className="font-bold text-pink-600 uppercase">Selected QR Tag:</span>
                <select 
                  value={qrTable} 
                  onChange={(e) => setQrTable(e.target.value)}
                  className="bg-white border text-xs font-bold text-neutral-800 rounded px-1.5 py-0.5 outline-none"
                >
                  <option value="Table 4">Table 4 (Alcove)</option>
                  <option value="Table A-2">Table A-2 (Main Window)</option>
                  <option value="Table 10">Table 10 (Gingham Desk)</option>
                  <option value="Table 1">Table 1 (Patio)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Mobile Phone Simulation Border Box */}
              <div className="lg:col-span-7 border-4 border-neutral-900 rounded-[36px] bg-neutral-950 p-3 shadow-2xl relative max-w-sm mx-auto w-full overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-900 rounded-full z-10 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 mr-2" />
                  <div className="w-10 h-1 bg-neutral-800 rounded-full" />
                </div>
                
                {/* Mobile screen background */}
                <div className="bg-[#FFFDF6] rounded-[26px] py-6 px-3 overflow-y-auto h-[480px] text-left scrollbar-none text-neutral-800 text-[11px] space-y-4">
                  {/* Smartphone bar brand */}
                  <div className="flex justify-between items-center bg-pink-50 border border-pink-100 p-2 rounded-xl text-[9px] font-bold text-pink-600 uppercase tracking-widest mt-2">
                    <span className="flex items-center gap-1">🍔 {qrTable}</span>
                    <span>COZY RETRO DIRETTO</span>
                  </div>

                  {/* Menu browsing within mobile screen */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold uppercase tracking-tight text-neutral-900 text-xs">Aesthetic Plates</h4>
                      <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-bold">100% Organic</span>
                    </div>

                    {/* Small category micro tabs */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
                      {['all', 'sweets', 'mains', 'sides', 'drinks'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setQrCategory(cat)}
                          className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                            qrCategory === cat 
                              ? 'bg-pink-500 border-pink-600 text-white' 
                              : 'bg-white border-neutral-250 text-neutral-400'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Filtered food item rows within micro browser */}
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {MENU_ITEMS.filter(it => qrCategory === 'all' || it.category === qrCategory).map(item => (
                        <div key={item.id} className="p-1.5 border border-neutral-200/60 rounded-xl bg-white flex justify-between items-center gap-1.5">
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div className="flex-grow min-w-0">
                            <h5 className="font-bold text-neutral-800 text-[9px] truncate uppercase">{item.name}</h5>
                            <span className="text-[8px] text-neutral-400 uppercase tracking-wider">${item.price.toFixed(2)} USD</span>
                          </div>
                          <button 
                            onClick={() => addToQrCart(item)}
                            className="bg-pink-500 text-white rounded-lg text-[8px] font-bold py-1 px-2 hover:bg-pink-600 transition-colors uppercase cursor-pointer"
                          >
                            + add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shopping Cart details within mobile simulation */}
                  <div className="border-t border-dashed border-pink-100 pt-3 space-y-2.5">
                    <h4 className="font-bold uppercase tracking-tight text-neutral-900 text-xs">Instant Dining Table Cart</h4>
                    
                    {qrCart.length === 0 ? (
                      <p className="text-[9px] text-neutral-400 italic text-center py-2 bg-white rounded-xl border">No entrees selected. Tap "+ add" premium items above!</p>
                    ) : (
                      <div className="space-y-1.5 bg-white p-2 rounded-xl border text-[9px]">
                        {qrCart.map(line => (
                          <div key={line.item.id} className="flex justify-between items-center text-neutral-700">
                            <span className="truncate max-w-[130px]">{line.qty}x {line.item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">${(line.item.price * line.qty).toFixed(2)}</span>
                              <div className="flex gap-1">
                                <button onClick={() => removeFromQrCart(line.item.id)} className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1 rounded font-bold">-</button>
                                <button onClick={() => addToQrCart(line.item)} className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1 rounded font-bold">+</button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-dashed pt-1.5 flex justify-between font-bold text-neutral-800 font-mono">
                          <span>SUBTOTAL (Net):</span>
                          <span className="text-pink-600">${qrCart.reduce((s, c) => s + (c.item.price * c.qty), 0).toFixed(2)}</span>
                        </div>

                        {/* Standard/Split Checkout Choice inside mobile simulation */}
                        <div className="pt-2">
                          <button
                            onClick={handlePlaceQrOrder}
                            className="w-full py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-[9px] font-bold tracking-widest uppercase transition-all shadow-xs cursor-pointer text-center"
                          >
                            Confirm & Transmit Order
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live order tracking inside mobile device screen */}
                  {qrOrderStatus && (
                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 space-y-2.5 text-[9px]">
                      <div className="flex justify-between items-center border-b border-pink-100 pb-1.5 font-bold text-pink-700">
                        <span>LIVE ORDER STATE TRACKER</span>
                        <span className="font-mono">{qrOrderTrackerTicks}%</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { key: 'received', label: 'Order Transmitted to KDS', desc: 'Secure digital relay routed.' },
                          { key: 'cooking', label: 'Cook Station Active', desc: 'Chefs are executing your plates.' },
                          { key: 'ready', label: 'Plated & Ready to Run', desc: 'Dressed under perfect heating.' },
                          { key: 'served', label: 'Delivered to Seat', desc: 'Enjoy your warm cottage fresh meal!' }
                        ].map((st, i) => {
                          const statesOrder = ['received', 'cooking', 'ready', 'served'];
                          const currentInd = statesOrder.indexOf(qrOrderStatus);
                          const stepInd = statesOrder.indexOf(st.key);
                          const isDone = stepInd <= currentInd;
                          const isCurrent = st.key === qrOrderStatus;

                          return (
                            <div key={st.key} className="flex gap-2 items-start">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                                isDone ? 'bg-pink-500 text-white border-pink-600' : 'bg-white text-neutral-300'
                              }`}>
                                {isDone ? '✓' : i+1}
                              </span>
                              <div className="min-w-0">
                                <span className={`font-bold uppercase tracking-wider block ${
                                  isCurrent ? 'text-pink-600' : isDone ? 'text-neutral-700' : 'text-neutral-300'
                                }`}>
                                  {st.label} {isCurrent && '● Prep active'}
                                </span>
                                <span className="text-[8px] text-neutral-400">{st.desc}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Guest Control Panel Side column */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <div className="bg-pink-50/20 border border-pink-100 rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-neutral-800 uppercase tracking-wide text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    Guest Controller Tickers
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Test different live scenarios. Modify guest tracking milestones below to trigger instant status path transitions across our simulated customer interface.
                  </p>
                  
                  {/* Status manually trigger switches */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button 
                      onClick={() => setExactGuestStatus('received')}
                      className={`py-1.5 px-3 border rounded-xl text-center font-bold tracking-wider uppercase cursor-pointer ${
                        qrOrderStatus === 'received' ? 'bg-pink-500 text-white border-pink-600' : 'bg-white hover:bg-neutral-50'
                      }`}
                    >
                      Step 1: Received
                    </button>
                    <button 
                      onClick={() => setExactGuestStatus('cooking')}
                      className={`py-1.5 px-3 border rounded-xl text-center font-bold tracking-wider uppercase cursor-pointer ${
                        qrOrderStatus === 'cooking' ? 'bg-pink-500 text-white border-pink-600' : 'bg-white hover:bg-neutral-50'
                      }`}
                    >
                      Step 2: Cooking
                    </button>
                    <button 
                      onClick={() => setExactGuestStatus('ready')}
                      className={`py-1.5 px-3 border rounded-xl text-center font-bold tracking-wider uppercase cursor-pointer ${
                        qrOrderStatus === 'ready' ? 'bg-pink-500 text-white border-pink-600' : 'bg-white hover:bg-neutral-50'
                      }`}
                    >
                      Step 3: Ready
                    </button>
                    <button 
                      onClick={() => setExactGuestStatus('served')}
                      className={`py-1.5 px-3 border rounded-xl text-center font-bold tracking-wider uppercase cursor-pointer ${
                        qrOrderStatus === 'served' ? 'bg-pink-500 text-white border-pink-600' : 'bg-white hover:bg-neutral-50'
                      }`}
                    >
                      Step 4: Served
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 pt-4 space-y-2">
                    <h5 className="font-bold text-xs uppercase text-neutral-700">Quick Test Helper:</h5>
                    <button
                      onClick={() => {
                        // Pre-populate simulated guest item choices
                        setQrCart([
                          { item: MENU_ITEMS[0], qty: 1 },
                          { item: MENU_ITEMS[4], qty: 2 },
                          { item: MENU_ITEMS[8], qty: 1 }
                        ]);
                        setQrOrderStatus('received');
                      }}
                      className="w-full text-center py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                    >
                      Populate Cart & Start Demo Order
                    </button>
                  </div>
                </div>

                {/* Benefits tag */}
                <div className="p-4 border border-dashed rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-neutral-800 uppercase block">✓ Zero Install Requirement</span>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">
                    Diners can initiate seat-side browsing without installing heavy app store clients. Built in standard CSS and HTML structure compatible with major iOS & Android browser engines.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: KITCHEN DISPLAY SYSTEM KDS UI
            ========================================================= */}
        {activeTab === 'kds' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900 uppercase">Kitchen Tv Terminal Dispatch</h3>
                <p className="text-xs text-neutral-400">Avoid lost kitchen order slips. Watch live chef counters update items in preparation status queues.</p>
              </div>

              {/* Reset simulation ticket handlers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={resetKdsSimulator}
                  className="flex items-center gap-1 bg-white border hover:bg-neutral-50 rounded-xl py-1.5 px-3 text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Tickets
                </button>
              </div>
            </div>

            {/* Filter tags panel */}
            <div className="flex gap-2 border-b pb-3 overflow-x-auto scrollbar-none">
              <span className="text-xs text-neutral-400 self-center font-bold uppercase mr-2">Filter queue:</span>
              {[
                { id: 'all', label: 'All Incoming Orders' },
                { id: 'New', label: 'New Tickets Only' },
                { id: 'Cooking', label: 'Active Preparation' },
                { id: 'Ready to Serve', label: 'Ready for table' }
              ].map(fil => (
                <button
                  key={fil.id}
                  onClick={() => setKdsFilter(fil.id as any)}
                  className={`py-1 px-3 text-xs font-bold uppercase rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                    kdsFilter === fil.id 
                      ? 'bg-pink-500 border-pink-600 text-white' 
                      : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-400'
                  }`}
                >
                  {fil.label}
                </button>
              ))}
            </div>

            {/* Grid queue layout of KDS tickets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kdsOrders.filter(o => kdsFilter === 'all' || o.status === kdsFilter).map(order => {
                const isNew = order.status === 'New';
                const isCooking = order.status === 'Cooking';
                const isReady = order.status === 'Ready to Serve';

                return (
                  <div 
                    key={order.id} 
                    className={`rounded-2xl border p-4 space-y-4 flex flex-col justify-between shadow-xs transition-colors ${
                      isNew ? 'bg-amber-50/50 border-amber-200' :
                      isCooking ? 'bg-pink-50/30 border-pink-200 animate-pulse' :
                      'bg-green-50/40 border-green-200'
                    }`}
                  >
                    <div className="space-y-3">
                      
                      {/* Ticket header details */}
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                        <span className="text-xs font-bold text-neutral-800 font-mono">{order.id}</span>
                        <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span className="text-neutral-500">{order.duration}</span>
                        </div>
                      </div>

                      {/* Seat Ref & Items */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block">Location context:</span>
                        <h4 className="text-sm font-bold text-neutral-900 uppercase leading-snug">{order.table}</h4>
                        <div className="text-xs text-neutral-600 bg-white p-2 rounded-xl border border-dashed font-mono">
                          {order.itemSummary}
                        </div>
                      </div>

                      {/* Dynamic status bubble indicator */}
                      <div>
                        <span className={`text-[9px] font-extrabold uppercase border px-2 py-0.5 rounded-full inline-block ${
                          isNew ? 'bg-amber-100 border-amber-300 text-amber-700' :
                          isCooking ? 'bg-pink-500 border-pink-600 text-white' :
                          'bg-green-600 border-green-700 text-white'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                    </div>

                    {/* Controller actions inside ticket footer */}
                    <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                      {isNew && (
                        <button
                          onClick={() => advanceKdsOrder(order.id)}
                          className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cook Order 🍳
                        </button>
                      )}
                      
                      {isCooking && (
                        <button
                          onClick={() => advanceKdsOrder(order.id)}
                          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Mark Ready 🍰
                        </button>
                      )}

                      {isReady ? (
                        <button
                          onClick={() => bumpKdsOrderComplete(order.id)}
                          className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Dispatched / Bump
                        </button>
                      ) : (
                        <button
                          onClick={() => bumpKdsOrderComplete(order.id)}
                          className="w-full py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Cancel / Void Slip
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}

              {kdsOrders.length === 0 && (
                <div className="col-span-4 text-center py-12 bg-neutral-50 border rounded-3xl space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div>
                    <h5 className="font-bold text-neutral-800 text-sm uppercase">Kitchen station is clear!</h5>
                    <p className="text-xs text-neutral-400">All customer entrees and pastries cooked perfectly. Tap "Reset Tickets" to repopulate.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 3: BILLING & SPLIT PAYMENTS SUITE
            ========================================================= */}
        {activeTab === 'billing' && (
          <div className="space-y-8 text-left">
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 uppercase">Billing Desk & Split sandbox</h3>
              <p className="text-xs text-neutral-400">Generate professional receipts with GST breakdowns. Tap different split numbers or payment systems.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interactive split configuration and payment mockups */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Simulated Cost Configuration */}
                <div className="border border-pink-100 rounded-2xl p-5 bg-pink-50/10 space-y-4">
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-100/40 px-2.5 py-0.5 rounded-full inline-block uppercase">
                    Invoice Variables
                  </span>
                  
                  <div className="space-y-3 font-sans">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Simulated Total Cart Value ($):</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={billingTotal}
                        onChange={(e) => setBillingTotal(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white text-xs font-bold border border-neutral-300 rounded-xl px-3 py-2 outline-none text-neutral-700"
                      />
                    </div>

                    {/* Guest Split Slider */}
                    <div>
                      <div className="flex justify-between items-center text-xs text-neutral-700 uppercase font-bold mb-1">
                        <span>Divide Between Friends:</span>
                        <span className="text-pink-600">{splitCount} Guests</span>
                      </div>
                      <input 
                        type="range"
                        min="1"
                        max="8"
                        value={splitCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setSplitCount(val);
                          // populate generic names array
                          const baseNames = ['You', 'Aria', 'Ethan', 'Chloe', 'James', 'Mia', 'Daniel', 'Sophia'];
                          setBillSplitNames(baseNames.slice(0, val));
                        }}
                        className="w-full h-1.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Split breakdown outputs */}
                <div className="border border-neutral-100 rounded-2xl p-5 space-y-3.5 bg-[#FFFDF9]">
                  <h4 className="font-bold text-xs uppercase text-neutral-800 flex items-center gap-1.5">
                    <Split className="w-4 h-4 text-pink-500" />
                    Interactive Bill Splitting Outcomes
                  </h4>
                  
                  <div className="space-y-2">
                    {billSplitNames.map((name, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-neutral-100 pb-1.5">
                        <span className="font-bold text-neutral-700 uppercase">{idx + 1}. {name}</span>
                        <div className="text-right">
                          <span className="font-mono text-pink-600 font-bold">${splitShare.toFixed(2)}</span>
                          <span className="text-[9px] text-neutral-400 block tracking-wide">{(100 / splitCount).toFixed(0)}% proportion</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-neutral-50 p-3 rounded-xl text-[10px] text-neutral-400 font-serif italic text-center">
                    "Tax liability is uniformly divided according to custom hospitality rules."
                  </div>
                </div>

                {/* Simulated Payment Methods Option Panel */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase text-neutral-800">Choose simulated Payment Engine:</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'applepay', label: 'Simulate Apple Pay', detail: 'Contactless token authentication' },
                      { id: 'card', label: 'Simulate Chip Insert', detail: 'Mock PCI compliance reader' },
                      { id: 'gpay', label: 'Simulate Google Pay', detail: 'Instant sandbox authorization' },
                      { id: 'qr', label: 'Diner QR scan', detail: 'Direct table-linked terminal' }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        onClick={() => {
                          setSelectedPayMethod(pm.id as any);
                          setIsPayApproved(false);
                        }}
                        className={`p-3 border text-left rounded-2xl transition-all cursor-pointer ${
                          selectedPayMethod === pm.id 
                            ? 'bg-neutral-900 border-neutral-950 text-white shadow-md' 
                            : 'bg-white hover:bg-neutral-50 border-neutral-250 text-neutral-700'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase block">{pm.label}</span>
                        <span className={`text-[9px] block mt-0.5 ${selectedPayMethod === pm.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                          {pm.detail}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Payment simulation action check trigger */}
                  <div className="pt-2">
                    <button
                      onClick={triggerPaymentSimulation}
                      disabled={isPayProcessing}
                      className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[2px_2px_0px_#db2777] active:translate-x-[1px] active:translate-y-[1px] border border-pink-600 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isPayProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing Simulated Handshake...
                        </>
                      ) : (
                        `Transmit payment of $${billingTotal.toFixed(2)}`
                      )}
                    </button>
                  </div>

                  {isPayApproved && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-700 flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase block mb-0.5">Simulated Payment Received!</span>
                        <p className="leading-relaxed text-[11px]">
                          Invoice transaction ID <span className="font-mono font-bold">TXN-77728</span> approved. Sandbox database updated corresponding to table status registers.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Right Column: Authentic Printed GST Invoice look */}
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block text-center">Printed GST Invoice Preview</span>
                
                {/* Paper Styled Receipt Container */}
                <div className="bg-white border-2 border-dashed border-neutral-300 rounded-r shadow-xs text-neutral-600 font-mono text-[10.5px] p-6 max-w-sm mx-auto space-y-4 text-left leading-relaxed relative">
                  
                  {/* Decorative vintage ribbon top cut */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(45deg,#d4d4d8_25%,transparent_25%,transparent_75%,#d4d4d8_75%),linear-gradient(45deg,#d4d4d8_25%,transparent_25%,transparent_75%,#d4d4d8_75%)] bg-[length:10px_10px] bg-repeat-x opacity-30 mt-[-1px]" />
                  
                  {/* Invoice Header details */}
                  <div className="text-center space-y-1">
                    <h4 className="font-bold text-neutral-900 text-sm">SMARTDINE RESTAURANTS CO.</h4>
                    <p className="text-[9px] text-neutral-400 uppercase">842 PASTEL BLVD, SUITE 100</p>
                    <p className="text-[9px] text-neutral-400">PHONE: (213) 555-0192</p>
                    <p className="text-[9px] text-neutral-400 font-bold">FSSAI LIC NO: 12226999000104</p>
                  </div>

                  {/* Metadata fields */}
                  <div className="border-t border-b border-dashed border-neutral-300 py-2 space-y-0.5 text-neutral-500">
                    <div className="flex justify-between">
                      <span>INVOICE ID:</span>
                      <span className="font-bold text-neutral-800">TXN-2026-99081</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DATE STAMP:</span>
                      <span>2026-05-29 11:36:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DINING TABLE:</span>
                      <span className="font-bold text-neutral-800">TABLE 04 ALCOVE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PAY MODE:</span>
                      <span className="text-neutral-800 uppercase font-bold">{selectedPayMethod}</span>
                    </div>
                  </div>

                  {/* Interactive mock transaction rows */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-neutral-400 text-[9px] tracking-wider uppercase font-bold">
                      <span>Dish Description</span>
                      <span>Subtotal</span>
                    </div>
                    
                    <div className="flex justify-between text-neutral-800">
                      <span>• House Sweet Fare Platter</span>
                      <span>${(subtotalCost * 0.4).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-800">
                      <span>• Chef Traditional Selection</span>
                      <span>${(subtotalCost * 0.6).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Dynamic Tax Breakdown details */}
                  <div className="border-t border-neutral-200 pt-2 space-y-1">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal Value:</span>
                      <span>${subtotalCost.toFixed(2)}</span>
                    </div>
                    
                    {/* GST Split CGST/SGST */}
                    <div className="flex justify-between text-neutral-400">
                      <span>CGST @ 2.5%:</span>
                      <span>${(calculatedGST / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>SGST @ 2.5%:</span>
                      <span>${(calculatedGST / 2).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between font-bold text-neutral-900 border-t border-dashed border-neutral-300 pt-1.5 text-xs">
                      <span>TOTAL (INCL. GST):</span>
                      <span className="text-pink-600">${billingTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Footer barcode visual */}
                  <div className="pt-3 text-center space-y-2">
                    <div className="h-6 bg-neutral-900 mx-auto w-40 opacity-75 flex items-center justify-between px-2 text-white text-[7px]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #18181b, #18181b 3px, #ffffff 3px, #ffffff 6px)' }}>
                      {/* Barcode representation */}
                    </div>
                    <div className="text-[8px] text-neutral-400 uppercase tracking-widest">
                      Thank you for dining! <br />
                      Stamps are sent to your phone.
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: REPORTS & MULTI-USER ANALYTICS
            ========================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 text-left">
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 uppercase">Operator Dashboard Analytics</h3>
              <p className="text-xs text-neutral-400">View performance metrics and guest dwell volumes across busy evening slots.</p>
            </div>

            {/* Bento Grid layout of dynamic KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsKPIs.map(kpi => (
                <div key={kpi.title} className="bg-neutral-50/50 border border-pink-100 rounded-2xl p-4 space-y-1.5 shadow-xs">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
                    {kpi.title}
                  </span>
                  <p className={`text-xl font-black ${kpi.color}`}>
                    {kpi.value}
                  </p>
                  <span className="text-[10px] text-neutral-500 block">
                    {kpi.shift}
                  </span>
                </div>
              ))}
            </div>

            {/* Two Column Layout: Charts & Traffic Heatmaps */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Sales Trend Bar Charts */}
              <div className="lg:col-span-6 border border-neutral-150 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center bg-white border-b pb-2">
                  <h4 className="font-bold text-xs uppercase text-neutral-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-pink-500" />
                    Weekly Sales Trend Ticker
                  </h4>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">AESTHETIC UNIT SAMPLES</span>
                </div>

                {/* SVG Visual Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-3.5 pt-4 px-2 relative border-b border-l border-neutral-150">
                  
                  {/* Backdrop dashed marks */}
                  <div className="absolute left-0 right-0 border-t border-dashed border-neutral-200/80 top-1/4 pointer-events-none" />
                  <div className="absolute left-0 right-0 border-t border-dashed border-neutral-200/80 top-2/4 pointer-events-none" />
                  <div className="absolute left-0 right-0 border-t border-dashed border-neutral-200/80 top-3/4 pointer-events-none" />

                  {/* Graph Columns */}
                  {[
                    { day: 'MON', val: 40, label: '$900' },
                    { day: 'TUE', val: 65, label: '$1400' },
                    { day: 'WED', val: 55, label: '$1200' },
                    { day: 'THU', val: 80, label: '$1800' },
                    { day: 'FRI', val: 95, label: '$2400' },
                    { day: 'SAT', val: 100, label: '$2600' },
                    { day: 'SUN', val: 85, label: '$2100' }
                  ].map(col => (
                    <div key={col.day} className="flex-1 flex flex-col items-center gap-1 group relative z-10">
                      <span className="text-[8px] font-mono font-bold text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 bg-neutral-900 text-white rounded px-1.5 py-0.2 scale-90">
                        {col.label}
                      </span>
                      
                      {/* Bar fill visually */}
                      <div className="w-full relative rounded-t-md overflow-hidden bg-pink-100 hover:bg-pink-500 transition-colors cursor-pointer" style={{ height: `${col.val}%`, minHeight: '10%' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                      </div>
                      
                      <span className="text-[8px] font-bold text-neutral-500 tracking-wider">
                        {col.day}
                      </span>
                    </div>
                  ))}

                </div>
              </div>

              {/* Table Occupancy Heatmap */}
              <div className="lg:col-span-6 border border-neutral-150 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center bg-white border-b pb-2">
                  <h4 className="font-bold text-xs uppercase text-neutral-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-pink-500" />
                    Heatmap: Table Occupancy / Order Density
                  </h4>
                  <span className="text-[9px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded uppercase">Live updates</span>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                  Choose a layout station in the cafe block map below to monitor live statistics and estimated hourly covers. Hour slots vary with peak traffic density.
                </p>

                {/* Heatmap Layout Grid */}
                <div className="grid grid-cols-4 gap-2.5">
                  {tableHeatmapData.map(tb => {
                    const isCritical = tb.status === 'critical';
                    const isHigh = tb.status === 'high';
                    const isMed = tb.status === 'medium';
                    const isSelected = heatmapTableNum === tb.id;

                    return (
                      <button
                        key={tb.id}
                        onClick={() => setHeatmapTableNum(tb.id)}
                        className={`aspect-square rounded-xl flex flex-col justify-between p-2 text-left relative transition-all border outline-none cursor-pointer ${
                          isSelected ? 'scale-105 shadow-md border-neutral-950 border-2' : 'border-neutral-200'
                        } ${
                          isCritical ? 'bg-pink-500 hover:bg-pink-600' :
                          isHigh ? 'bg-pink-300 hover:bg-pink-450' :
                          isMed ? 'bg-pink-150 hover:bg-pink-200/60' :
                          'bg-pink-50 hover:bg-pink-100/40'
                        }`}
                      >
                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                          isCritical || isHigh ? 'text-white' : 'text-neutral-700'
                        }`}>
                          {tb.label}
                        </span>
                        
                        <div className="text-right">
                          <span className={`text-[12px] font-black block leading-none ${
                            isCritical || isHigh ? 'text-white' : 'text-neutral-900'
                          }`}>
                            {tb.occupancy}
                          </span>
                          <span className={`text-[8px] font-mono ${
                            isCritical || isHigh ? 'text-pink-100' : 'text-neutral-400'
                          }`}>
                            {tb.orders} orders
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Table telemetry drawer */}
                {heatmapTableNum !== null && (() => {
                  const data = tableHeatmapData.find(t => t.id === heatmapTableNum);
                  if (!data) return null;
                  return (
                    <div className="p-3 bg-[#FFFDF6] border border-pink-150 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between items-center font-bold uppercase text-neutral-800">
                        <span>Selected Station: {data.label}</span>
                        <span className="text-pink-600 font-bold">{data.orders} Completed Invoices</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                        Historically, this table enjoys {data.occupancy} dwell ratings on weekends. Recommended positioning: Keep digital rewards signage highly legible here to inspire additional cake purchases.
                      </p>
                    </div>
                  );
                })()}

              </div>

            </div>

          </div>
        )}

        {/* =========================================================
            TAB 5: CONTACT / DEMO REQUEST FORM PAGE
            ========================================================= */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-extrabold text-neutral-900 uppercase">Curated Operator consultation</h3>
              <p className="text-xs text-neutral-400">Request table QR placard kits, POS hardware integrations (Clover, LightSpeed, Square), or get a modern setup estimate.</p>
            </div>

            {!demoSubmitted ? (
              <form onSubmit={handleDemoSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                
                {/* Form fields column */}
                <div className="lg:col-span-7 space-y-4 font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700 uppercase flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-pink-500" /> Name of Owner *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        placeholder="e.g. Cassandra Fox"
                        className="w-full bg-white text-xs border border-neutral-300 rounded-xl px-3 py-2.5 outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700 uppercase flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-pink-500" /> Phone number *
                      </label>
                      <input 
                        type="tel" 
                        required
                        placeholder="e.g. (310) 555-9201"
                        className="w-full bg-white text-xs border border-neutral-300 rounded-xl px-3 py-2.5 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700 uppercase flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-pink-500" /> Cafe / Bistro Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={demoCafe}
                        onChange={(e) => setDemoCafe(e.target.value)}
                        placeholder="e.g. Cherry Tulip Patisserie"
                        className="w-full bg-white text-xs border border-neutral-300 rounded-xl px-3 py-2.5 outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700 uppercase flex items-center gap-1">
                        Contact Email *
                      </label>
                      <input 
                        type="email" 
                        required
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        placeholder="Fox@tulipcafe.com"
                        className="w-full bg-white text-xs border border-neutral-300 rounded-xl px-3 py-2.5 outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Slider of table capacity */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-neutral-700 uppercase font-bold mb-1">
                      <span>Dining Station Capacity:</span>
                      <span className="text-pink-600">{demoTables} Active Tables</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="100"
                      value={demoTables}
                      onChange={(e) => setDemoTables(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  {/* Active POS dropdown */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-700 uppercase">POS software connection needed:</label>
                    <select
                      value={demoPos}
                      onChange={(e) => setDemoPos(e.target.value)}
                      className="w-full bg-white text-xs font-medium border border-neutral-300 rounded-xl px-3 py-2.5 outline-none"
                    >
                      <option value="Standard Clover Node">Clover POS Node (Standard Local)</option>
                      <option value="Lightspeed Restaurant">Lightspeed Hospitality API</option>
                      <option value="Square for Restaurants">Square POS Sync Framework</option>
                      <option value="Toast Cloud Platform">Toast Cloud Integration</option>
                      <option value="None Standalone">No POS integration (Use Standalone SmartDine console)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-700 uppercase">Custom Questions & Specifications:</label>
                    <textarea 
                      placeholder="e.g. I need custom gingham logo cards printed with our logo."
                      rows={3}
                      className="w-full bg-white text-xs border border-neutral-300 rounded-xl px-3 py-2 outline-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[2px_2px_0px_#db2777] active:translate-x-[1px] active:translate-y-[1px] border border-pink-600 cursor-pointer text-center"
                  >
                    Submit Consultation Request
                  </button>

                </div>

                {/* Live quote side panel */}
                <div className="lg:col-span-5 border border-pink-100 rounded-2xl p-5 bg-pink-50/10 space-y-4">
                  <h4 className="font-bold text-xs uppercase text-neutral-800 flex items-center gap-1.5 border-b pb-2">
                    <Landmark className="w-4 h-4 text-pink-500" />
                    Instant Quote Estimator
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Based on your active station capacity selection, here is an automated estimate for software licensing and physical QR placard printing:
                  </p>

                  <div className="space-y-2 font-mono text-[11px] bg-white border border-neutral-200 rounded-xl p-3">
                    <div className="flex justify-between text-neutral-600">
                      <span>BASE HOSTING FLAT:</span>
                      <span>$50.00 / mo</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>QR PRINTING ({demoTables} STATIONS):</span>
                      <span>${(demoTables * 8.00).toFixed(2)} USD</span>
                    </div>
                    <div className="border-t border-dashed my-2 pt-1.5 flex justify-between font-bold text-neutral-900 text-xs">
                      <span>ESTIMATED SUM:</span>
                      <span className="text-pink-600">${calculateCustomQuote(demoTables).toFixed(2)} / mo</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-400 font-serif italic uppercase text-center leading-relaxed">
                    "Includes free complimentary table gingham design files & 7-day client onboarding help."
                  </div>
                </div>

              </form>
            ) : (
              <div className="max-w-md mx-auto text-center space-y-4 p-8 border border-green-200 bg-green-50/30 rounded-3xl">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <div className="space-y-2">
                  <h4 className="font-bold text-neutral-900 text-base uppercase">Consultation Sent, {demoName}!</h4>
                  <p className="text-xs text-green-700 leading-relaxed font-sans">
                    We received your sign-up for <span className="font-bold">{demoCafe}</span> with {demoTables} active tables. A local SmartDine designer will contact you at <span className="font-bold">{demoEmail}</span> within 2 hours.
                  </p>
                  
                  <div className="p-3.5 bg-white border rounded-xl font-mono text-[10px] max-w-xs mx-auto space-y-1 text-neutral-500">
                    <span className="font-bold text-pink-600 uppercase block tracking-wider">YOUR RETRO TICKET PREPARED:</span>
                    <div>TICKET REF ID: <span className="font-bold text-neutral-800">#DEMO-2521</span></div>
                    <div>LICENSING RATE RATE: <span className="font-bold text-neutral-800">${demoQuote.toFixed(2)} / mo</span></div>
                    <div>POS SYNC TYPE: <span className="font-bold text-neutral-800">{demoPos}</span></div>
                  </div>
                </div>
                
                <button
                  onClick={() => setDemoSubmitted(false)}
                  className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Edit details / Back to form
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
