// ─── Image assets (used in Menu Management and Dashboard) ────────────────────
import _cakeImg      from '../../assets/images/cake.jpg';
import _decorImg     from '../../assets/images/decor.jpg';
import _decor2Img    from '../../assets/images/decor2.jpg';
import _decor3Img    from '../../assets/images/decor3.jpg';
import _decor4Img    from '../../assets/images/decor4.jpg';
import _decor5Img    from '../../assets/images/decor5.jpg';
import _eggNoodlesImg from '../../assets/images/eggnoodles.jpg';
import _eggSaladImg  from '../../assets/images/eggsalad.jpg';
import _noodlesImg   from '../../assets/images/noodles.jpg';
import _oatsImg      from '../../assets/images/oats.jpg';
import _oats2Img     from '../../assets/images/oats2.jpg';
import _saladImg     from '../../assets/images/salad.jpg';
import _sauceImg     from '../../assets/images/sauce.jpg';

export const ADMIN_IMAGES = {
  cake:       _cakeImg,
  decor:      _decorImg,
  decor2:     _decor2Img,
  decor3:     _decor3Img,
  decor4:     _decor4Img,
  decor5:     _decor5Img,
  eggNoodles: _eggNoodlesImg,
  eggSalad:   _eggSaladImg,
  noodles:    _noodlesImg,
  oats:       _oatsImg,
  oats2:      _oats2Img,
  salad:      _saladImg,
  sauce:      _sauceImg,
};

// ─── KPIs ──────────────────────────────────────────────────────────────────
export const DASHBOARD_KPIS = {
  todayRevenue: 48320, todayRevenueChange: +12.4,
  totalOrders: 47,    totalOrdersChange: +8,
  activeTables: 12,   totalTables: 20,
  avgOrderValue: 1028,avgOrderValueChange: +5.2,
  satisfaction: 4.6,  satisfactionChange: +0.1,
};

export const SALES_TREND_14D = [
  { date: 'May 17', revenue: 32400, orders: 38, dineIn: 21000, takeaway: 11400 },
  { date: 'May 18', revenue: 28900, orders: 34, dineIn: 18000, takeaway: 10900 },
  { date: 'May 19', revenue: 41200, orders: 46, dineIn: 27000, takeaway: 14200 },
  { date: 'May 20', revenue: 38700, orders: 42, dineIn: 25000, takeaway: 13700 },
  { date: 'May 21', revenue: 52400, orders: 58, dineIn: 35000, takeaway: 17400 },
  { date: 'May 22', revenue: 67800, orders: 74, dineIn: 45000, takeaway: 22800 },
  { date: 'May 23', revenue: 58900, orders: 65, dineIn: 39000, takeaway: 19900 },
  { date: 'May 24', revenue: 34200, orders: 39, dineIn: 22000, takeaway: 12200 },
  { date: 'May 25', revenue: 29800, orders: 35, dineIn: 19000, takeaway: 10800 },
  { date: 'May 26', revenue: 43100, orders: 48, dineIn: 28000, takeaway: 15100 },
  { date: 'May 27', revenue: 39500, orders: 44, dineIn: 26000, takeaway: 13500 },
  { date: 'May 28', revenue: 55700, orders: 61, dineIn: 37000, takeaway: 18700 },
  { date: 'May 29', revenue: 71200, orders: 78, dineIn: 48000, takeaway: 23200 },
  { date: 'May 30', revenue: 48320, orders: 47, dineIn: 31000, takeaway: 17320 },
];

export const HOURLY_TODAY = [
  { hour: '8am', revenue: 1800 }, { hour: '9am', revenue: 3200 },
  { hour: '10am', revenue: 2100 }, { hour: '11am', revenue: 4500 },
  { hour: '12pm', revenue: 8700 }, { hour: '1pm', revenue: 9400 },
  { hour: '2pm', revenue: 6200 }, { hour: '3pm', revenue: 2800 },
  { hour: '4pm', revenue: 1900 }, { hour: '5pm', revenue: 3100 },
  { hour: '6pm', revenue: 6800 }, { hour: '7pm', revenue: 7320 },
];

export const QR_SCAN_TREND = [
  { day: 'May 24', tables: 124, takeaway: 89,  driveThru: 14 },
  { day: 'May 25', tables: 98,  takeaway: 71,  driveThru: 0  },
  { day: 'May 26', tables: 167, takeaway: 112, driveThru: 18 },
  { day: 'May 27', tables: 143, takeaway: 98,  driveThru: 22 },
  { day: 'May 28', tables: 201, takeaway: 134, driveThru: 27 },
  { day: 'May 29', tables: 244, takeaway: 178, driveThru: 31 },
  { day: 'May 30', tables: 189, takeaway: 145, driveThru: 11 },
];

export const ORDER_PIPELINE = { new: 8, preparing: 12, ready: 5, served: 22 };

export const TOP_ITEMS = [
  { rank: 1, name: 'Butter Chicken',  category: 'Mains',    qtySold: 84, revenue: 33516, trend: +18 },
  { rank: 2, name: 'Paneer Tikka',    category: 'Starters', qtySold: 71, revenue: 17679, trend: +12 },
  { rank: 3, name: 'Matcha Latte',    category: 'Drinks',   qtySold: 63, revenue: 8190,  trend: +7  },
  { rank: 4, name: 'Velvet Cake',     category: 'Sweets',   qtySold: 57, revenue: 11970, trend: -3  },
  { rank: 5, name: 'Avocado Toast',   category: 'Mains',    qtySold: 48, revenue: 14352, trend: +5  },
];

export const SLOW_ITEMS = [
  { name: 'Lavender Cupcake', category: 'Sweets', qtySold: 4,  lastSold: '2 days ago'  },
  { name: 'Berry Chia Bowl',  category: 'Mains',  qtySold: 6,  lastSold: '1 day ago'   },
  { name: 'Peach Smoothie',   category: 'Drinks', qtySold: 9,  lastSold: '4 hours ago' },
  { name: 'Egg Noodle Bowl',  category: 'Mains',  qtySold: 11, lastSold: '6 hours ago' },
];

export const LOW_STOCK_ALERTS = [
  { item: 'Organic Matcha Powder', current: 180, unit: 'g',      threshold: 500,  category: 'Beverages' },
  { item: 'Fresh Cream',           current: 400, unit: 'ml',     threshold: 1000, category: 'Dairy'     },
  { item: 'Avocado',               current: 6,   unit: 'pcs',    threshold: 20,   category: 'Produce'   },
  { item: 'Vanilla Extract',       current: 45,  unit: 'ml',     threshold: 200,  category: 'Baking'    },
  { item: 'Sourdough Bread',       current: 3,   unit: 'loaves', threshold: 10,   category: 'Bakery'    },
];

export const NOTIFICATIONS = [
  { id: 'n1', type: 'order',   message: 'New order #1047 — Table 7 (₹2,340)',        time: '2 min ago',  read: false },
  { id: 'n2', type: 'alert',   message: 'Matcha powder stock critically low (180g)',  time: '8 min ago',  read: false },
  { id: 'n3', type: 'order',   message: 'Order #1046 marked Ready — Table 3',         time: '14 min ago', read: false },
  { id: 'n4', type: 'payment', message: 'Payment received ₹4,500 — Table 12',         time: '22 min ago', read: true  },
  { id: 'n5', type: 'staff',   message: 'Riya Sharma started shift at 12:00 PM',      time: '48 min ago', read: true  },
  { id: 'n6', type: 'order',   message: 'Takeaway order #1044 dispatched',            time: '1 hr ago',   read: true  },
  { id: 'n7', type: 'alert',   message: 'Avocado stock below threshold (6 pcs)',      time: '1.5 hr ago', read: true  },
];

export const MONTHLY_REVENUE = [
  { week: 'Week 1', revenue: 224000, orders: 248, tax: 27888 },
  { week: 'Week 2', revenue: 268000, orders: 294, tax: 33384 },
  { week: 'Week 3', revenue: 312000, orders: 341, tax: 38868 },
  { week: 'Week 4', revenue: 289000, orders: 315, tax: 35988 },
];

export const MONTHLY_DAILY = Array.from({ length: 30 }, (_, i) => {
  const base = 28000 + Math.sin(i * 0.7) * 8000 + (i % 7 === 5 || i % 7 === 6 ? 18000 : 0);
  return { day: `May ${i + 1}`, revenue: Math.round(base + (i * 13) % 4000), orders: Math.round(32 + (i * 7) % 28) };
});

export const PAYMENT_BREAKDOWN = [
  { method: 'UPI',         amount: 486200, pct: 43, count: 512 },
  { method: 'Credit Card', amount: 338100, pct: 30, count: 356 },
  { method: 'Cash',        amount: 225600, pct: 20, count: 238 },
  { method: 'Debit Card',  amount: 79100,  pct: 7,  count: 83  },
];
export const PAYMENT_COLORS = ['#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

export const TAX_REPORT = [
  { category: 'Food & Beverages', taxable: 824000, cgst: 41200, sgst: 41200, total: 82400 },
  { category: 'Packaged Goods',   taxable: 148000, cgst: 13320, sgst: 13320, total: 26640 },
  { category: 'Alcohol',          taxable: 0,      cgst: 0,     sgst: 0,     total: 0     },
  { category: 'Delivery Charges', taxable: 52000,  cgst: 4680,  sgst: 4680,  total: 9360  },
];

export const STAFF_PERFORMANCE = [
  { name: 'Riya Sharma',  role: 'Head Waiter', ordersServed: 184, avgTime: '12 min', rating: 4.8, revenue: 312000 },
  { name: 'Arjun Mehta',  role: 'Waiter',      ordersServed: 156, avgTime: '14 min', rating: 4.6, revenue: 264000 },
  { name: 'Priya Nair',   role: 'Waiter',      ordersServed: 142, avgTime: '13 min', rating: 4.7, revenue: 241000 },
  { name: 'Dev Kumar',    role: 'Chef',         ordersServed: 198, avgTime: '18 min', rating: 4.9, revenue: 0      },
  { name: 'Sneha Pillai', role: 'Cashier',      ordersServed: 210, avgTime: '3 min',  rating: 4.5, revenue: 892000 },
];

export const INVENTORY_REPORT = [
  { item: 'Organic Matcha', unit: 'kg', opening: 5.2, consumed: 4.8, closing: 0.4, reorderAt: 1.0, status: 'Critical' },
  { item: 'Fresh Cream',    unit: 'L',  opening: 20,  consumed: 17,  closing: 3,   reorderAt: 5,   status: 'Low'      },
  { item: 'Avocado',        unit: 'pcs',opening: 60,  consumed: 54,  closing: 6,   reorderAt: 20,  status: 'Low'      },
  { item: 'Sourdough Bread',unit: 'pcs',opening: 40,  consumed: 37,  closing: 3,   reorderAt: 10,  status: 'Low'      },
  { item: 'Vanilla Extract',unit: 'ml', opening: 500, consumed: 455, closing: 45,  reorderAt: 200, status: 'Low'      },
  { item: 'Paneer',         unit: 'kg', opening: 15,  consumed: 10,  closing: 5,   reorderAt: 3,   status: 'OK'       },
  { item: 'Chicken Breast', unit: 'kg', opening: 25,  consumed: 18,  closing: 7,   reorderAt: 5,   status: 'OK'       },
  { item: 'Tomatoes',       unit: 'kg', opening: 20,  consumed: 12,  closing: 8,   reorderAt: 4,   status: 'OK'       },
];

export const FEEDBACK_SUMMARY = { avg: 4.6, total: 312, fivestar: 168, fourstar: 98, threestar: 28, twostar: 12, onestar: 6 };
export const RECENT_FEEDBACK = [
  { guest: 'Ananya S.', rating: 5, comment: 'Butter chicken was exceptional. Fast service.',  date: 'May 30', table: 7  },
  { guest: 'Rohan M.',  rating: 4, comment: 'Great ambiance. Matcha latte was a bit sweet.',   date: 'May 29', table: 12 },
  { guest: 'Kavya P.',  rating: 5, comment: 'Best avocado toast in town. Will return.',        date: 'May 29', table: 3  },
  { guest: 'Vikram J.', rating: 3, comment: 'Food was good but wait time was 25 minutes.',     date: 'May 28', table: 9  },
  { guest: 'Meera D.',  rating: 5, comment: 'Lovely place. Staff was very attentive.',         date: 'May 28', table: 5  },
  { guest: 'Aryan K.',  rating: 4, comment: 'Paneer tikka was perfect. Good value.',           date: 'May 27', table: 2  },
];

export const CATEGORY_SALES = [
  { category: 'Mains',    revenue: 524000, orders: 618, pct: 46 },
  { category: 'Drinks',   revenue: 228000, orders: 842, pct: 20 },
  { category: 'Starters', revenue: 193000, orders: 412, pct: 17 },
  { category: 'Sweets',   revenue: 194000, orders: 326, pct: 17 },
];

// ─── MENU MANAGEMENT ─────────────────────────────────────────────────────────
export interface AdminCategory {
  id: string; name: string; emoji: string; sortOrder: number; active: boolean; itemCount: number;
}
export interface AdminVariant { name: string; price: number; }
export interface AdminAddon   { name: string; price: number; }
export interface AdminMenuItem {
  id: string; categoryId: string; name: string; description: string;
  price: number; available: boolean; featured: boolean; badge: string;
  calories: number; prepTime: number; image?: string;
  variants: AdminVariant[]; addons: AdminAddon[];
}

export const ADMIN_CATEGORIES: AdminCategory[] = [
  { id: 'starters',  name: 'Starters',     emoji: '🥗', sortOrder: 1, active: true,  itemCount: 4 },
  { id: 'mains',     name: 'Main Course',  emoji: '🍛', sortOrder: 2, active: true,  itemCount: 5 },
  { id: 'sweets',    name: 'Desserts',     emoji: '🍰', sortOrder: 3, active: true,  itemCount: 4 },
  { id: 'drinks',    name: 'Drinks',       emoji: '🥤', sortOrder: 4, active: true,  itemCount: 4 },
];

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  { id: 'a1', categoryId: 'starters', name: 'Paneer Tikka',      image: _sauceImg,      description: 'Marinated cottage cheese grilled in tandoor with spices.',     price: 249, available: true,  featured: true,  badge: 'BESTSELLER', calories: 320, prepTime: 15, variants: [{name:'Half',price:249},{name:'Full',price:449}], addons: [{name:'Extra Chutney',price:20},{name:'Onion Salad',price:30}] },
  { id: 'a2', categoryId: 'starters', name: 'Veg Spring Rolls',  image: _saladImg,      description: 'Crispy rolls stuffed with spiced vegetables and noodles.',       price: 179, available: true,  featured: false, badge: 'NEW',        calories: 280, prepTime: 12, variants: [{name:'4 pcs',price:179},{name:'8 pcs',price:329}], addons: [{name:'Schezwan Dip',price:15}] },
  { id: 'a3', categoryId: 'starters', name: 'Chicken Seekh',     image: _eggSaladImg,   description: 'Spiced chicken minced kebab grilled on skewers.',                price: 299, available: true,  featured: false, badge: '',           calories: 380, prepTime: 18, variants: [{name:'3 pcs',price:299},{name:'6 pcs',price:549}], addons: [{name:'Extra Mint Chutney',price:20}] },
  { id: 'a4', categoryId: 'starters', name: 'Bruschetta',        image: _oats2Img,      description: 'Toasted bread with tomatoes, basil, olive oil, and garlic.',    price: 199, available: false, featured: false, badge: '',           calories: 210, prepTime: 10, variants: [], addons: [{name:'Add Cheese',price:40}] },
  { id: 'b1', categoryId: 'mains',    name: 'Butter Chicken',    image: _sauceImg,      description: 'Tender chicken in rich creamy tomato-based makhani sauce.',     price: 399, available: true,  featured: true,  badge: 'BESTSELLER', calories: 540, prepTime: 20, variants: [{name:'Half',price:399},{name:'Full',price:699}], addons: [{name:'Extra Gravy',price:50},{name:'Butter Naan',price:40}] },
  { id: 'b2', categoryId: 'mains',    name: 'Avocado Toast',     image: _oatsImg,       description: 'Sourdough with whipped avocado, cherry tomatoes, sea salt.',    price: 299, available: true,  featured: true,  badge: 'HEALTHY',    calories: 340, prepTime: 10, variants: [], addons: [{name:'Poached Egg',price:50},{name:'Feta Crumble',price:30}] },
  { id: 'b3', categoryId: 'mains',    name: 'Dal Makhani',       image: _decor5Img,     description: 'Slow-cooked black lentils simmered overnight with cream.',      price: 299, available: true,  featured: false, badge: '',           calories: 420, prepTime: 25, variants: [{name:'Regular',price:299},{name:'Large',price:449}], addons: [{name:'Jeera Rice',price:80}] },
  { id: 'b4', categoryId: 'mains',    name: 'Sichuan Noodles',   image: _noodlesImg,    description: 'Wok-tossed egg noodles in spicy Sichuan chilli sauce.',         price: 279, available: true,  featured: false, badge: 'SPICY',      calories: 480, prepTime: 15, variants: [{name:'Regular',price:279},{name:'Large',price:399}], addons: [{name:'Extra Egg',price:30}] },
  { id: 'b5', categoryId: 'mains',    name: 'Grilled Salmon',    image: _eggNoodlesImg, description: 'Norwegian salmon fillet with herb butter and seasonal veg.',    price: 649, available: true,  featured: false, badge: 'CHEF PICK',  calories: 520, prepTime: 22, variants: [], addons: [{name:'Side Salad',price:80},{name:'Fries',price:60}] },
  { id: 'c1', categoryId: 'sweets',   name: 'Velvet Cake',       image: _cakeImg,       description: 'Single-slice red velvet with strawberry whipped cream icing.',  price: 210, available: true,  featured: true,  badge: 'HOUSE FARE', calories: 420, prepTime: 5,  variants: [], addons: [{name:'Ice Cream Scoop',price:60}] },
  { id: 'c2', categoryId: 'sweets',   name: 'Matcha Mille Crêpe',image: _decor2Img,    description: 'Twenty crêpe layers with matcha custard cream.',              price: 290, available: true,  featured: false, badge: 'NEW',        calories: 380, prepTime: 5,  variants: [], addons: [] },
  { id: 'c3', categoryId: 'sweets',   name: 'Gulab Jamun',       image: _decor3Img,     description: 'Soft milk dumplings soaked in rose-flavored sugar syrup.',     price: 149, available: true,  featured: false, badge: '',           calories: 310, prepTime: 5,  variants: [{name:'2 pcs',price:149},{name:'4 pcs',price:269}], addons: [{name:'Ice Cream',price:60}] },
  { id: 'c4', categoryId: 'sweets',   name: 'Lavender Cupcake',  image: _cakeImg,       description: 'Vanilla chiffon with lavender buttercream and sugar roses.',   price: 120, available: false, featured: false, badge: 'SEASONAL',   calories: 280, prepTime: 3,  variants: [], addons: [] },
  { id: 'd1', categoryId: 'drinks',   name: 'Matcha Latte',      image: _decorImg,      description: 'Ceremonial grade matcha with steamed oat milk.',              price: 130, available: true,  featured: true,  badge: 'BESTSELLER', calories: 160, prepTime: 5,  variants: [{name:'Small',price:130},{name:'Large',price:180}], addons: [{name:'Extra Shot',price:30},{name:'Oat Milk',price:20}] },
  { id: 'd2', categoryId: 'drinks',   name: 'Cold Brew Coffee',   image: _decor4Img,    description: '18-hour cold brew, smooth and full-bodied.',                  price: 160, available: true,  featured: false, badge: '',           calories: 15,  prepTime: 3,  variants: [{name:'Regular',price:160},{name:'Large',price:210}], addons: [{name:'Vanilla Syrup',price:20}] },
  { id: 'd3', categoryId: 'drinks',   name: 'Fresh Lime Soda',   image: _decor3Img,     description: 'House-pressed lime with sparkling water and mint.',           price: 90,  available: true,  featured: false, badge: '',           calories: 45,  prepTime: 3,  variants: [{name:'Regular',price:90},{name:'Large',price:130}], addons: [] },
  { id: 'd4', categoryId: 'drinks',   name: 'Mango Lassi',       image: _oats2Img,      description: 'Thick Alphonso mango blended with chilled yogurt.',           price: 110, available: true,  featured: false, badge: 'SEASONAL',   calories: 220, prepTime: 4,  variants: [], addons: [] },
];

// ─── INVENTORY ───────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string; name: string; category: string; unit: string;
  currentStock: number; minStock: number; maxStock: number;
  costPerUnit: number; supplier: string; lastRestocked: string;
  consumedToday: number; wastedToday: number;
  status: 'OK' | 'Low' | 'Critical' | 'Out';
}

export const ADMIN_INVENTORY: InventoryItem[] = [
  { id: 'i01', name: 'Organic Matcha Powder', category: 'Beverages', unit: 'g',      currentStock: 180,  minStock: 500,  maxStock: 3000, costPerUnit: 2.5,  supplier: 'Uji Matcha Co.',       lastRestocked: 'May 25', consumedToday: 120, wastedToday: 10,  status: 'Critical' },
  { id: 'i02', name: 'Fresh Cream',           category: 'Dairy',     unit: 'ml',     currentStock: 400,  minStock: 1000, maxStock: 5000, costPerUnit: 0.04, supplier: 'Amul Dairy',           lastRestocked: 'May 28', consumedToday: 600, wastedToday: 50,  status: 'Low'      },
  { id: 'i03', name: 'Avocado',               category: 'Produce',   unit: 'pcs',    currentStock: 6,    minStock: 20,   maxStock: 80,   costPerUnit: 60,   supplier: 'FreshFarm Exports',    lastRestocked: 'May 27', consumedToday: 14,  wastedToday: 2,   status: 'Low'      },
  { id: 'i04', name: 'Sourdough Bread',        category: 'Bakery',    unit: 'loaves', currentStock: 3,    minStock: 10,   maxStock: 40,   costPerUnit: 90,   supplier: 'Artisan Bakehouse',    lastRestocked: 'May 30', consumedToday: 7,   wastedToday: 1,   status: 'Low'      },
  { id: 'i05', name: 'Vanilla Extract',        category: 'Baking',    unit: 'ml',     currentStock: 45,   minStock: 200,  maxStock: 1000, costPerUnit: 0.8,  supplier: 'SpiceRoute India',     lastRestocked: 'May 20', consumedToday: 30,  wastedToday: 0,   status: 'Low'      },
  { id: 'i06', name: 'Paneer',                 category: 'Dairy',     unit: 'kg',     currentStock: 5,    minStock: 3,    maxStock: 25,   costPerUnit: 280,  supplier: 'Amul Dairy',           lastRestocked: 'May 29', consumedToday: 3,   wastedToday: 0.2, status: 'OK'       },
  { id: 'i07', name: 'Chicken Breast',         category: 'Proteins',  unit: 'kg',     currentStock: 7,    minStock: 5,    maxStock: 30,   costPerUnit: 260,  supplier: 'Venky\'s Foods',       lastRestocked: 'May 29', consumedToday: 6,   wastedToday: 0.5, status: 'OK'       },
  { id: 'i08', name: 'Tomatoes',               category: 'Produce',   unit: 'kg',     currentStock: 8,    minStock: 4,    maxStock: 20,   costPerUnit: 30,   supplier: 'FreshFarm Exports',    lastRestocked: 'May 28', consumedToday: 4,   wastedToday: 0.5, status: 'OK'       },
  { id: 'i09', name: 'Basmati Rice',           category: 'Grains',    unit: 'kg',     currentStock: 22,   minStock: 10,   maxStock: 50,   costPerUnit: 85,   supplier: 'Kohinoor Foods',       lastRestocked: 'May 22', consumedToday: 3,   wastedToday: 0,   status: 'OK'       },
  { id: 'i10', name: 'Butter',                 category: 'Dairy',     unit: 'g',      currentStock: 1200, minStock: 500,  maxStock: 5000, costPerUnit: 0.05, supplier: 'Amul Dairy',           lastRestocked: 'May 28', consumedToday: 350, wastedToday: 20,  status: 'OK'       },
  { id: 'i11', name: 'Olive Oil',              category: 'Oils',      unit: 'ml',     currentStock: 600,  minStock: 300,  maxStock: 2000, costPerUnit: 0.12, supplier: 'Del Monte Italia',     lastRestocked: 'May 15', consumedToday: 80,  wastedToday: 10,  status: 'OK'       },
  { id: 'i12', name: 'Oat Milk',               category: 'Beverages', unit: 'ml',     currentStock: 2000, minStock: 1000, maxStock: 8000, costPerUnit: 0.06, supplier: 'Oatly',               lastRestocked: 'May 27', consumedToday: 800, wastedToday: 0,   status: 'OK'       },
  { id: 'i13', name: 'Eggs',                   category: 'Proteins',  unit: 'pcs',    currentStock: 48,   minStock: 24,   maxStock: 120,  costPerUnit: 8,    supplier: 'Country Eggs Co.',     lastRestocked: 'May 29', consumedToday: 12,  wastedToday: 1,   status: 'OK'       },
  { id: 'i14', name: 'All-Purpose Flour',      category: 'Baking',    unit: 'kg',     currentStock: 12,   minStock: 5,    maxStock: 30,   costPerUnit: 45,   supplier: 'Pillsbury India',      lastRestocked: 'May 24', consumedToday: 2,   wastedToday: 0,   status: 'OK'       },
  { id: 'i15', name: 'Heavy Cream',            category: 'Dairy',     unit: 'ml',     currentStock: 350,  minStock: 400,  maxStock: 2000, costPerUnit: 0.06, supplier: 'Amul Dairy',           lastRestocked: 'May 26', consumedToday: 200, wastedToday: 15,  status: 'Low'      },
];

// ─── ORDERS ─────────────────────────────────────────────────────────────────
export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
export type OrderChannel = 'Dine-In' | 'Takeaway' | 'Delivery';
export type PaymentStatus = 'Pending' | 'Paid' | 'Partial';

export interface OrderItem { name: string; qty: number; price: number; variant?: string; }
export interface AdminOrder {
  id: string; table: string; channel: OrderChannel; status: OrderStatus;
  items: OrderItem[]; subtotal: number; tax: number; total: number;
  paymentStatus: PaymentStatus; paymentMethod?: string;
  customer?: string; phone?: string; address?: string;
  time: string; duration: string; notes?: string; waiter?: string;
  timeline: { label: string; time: string; done: boolean; }[];
}

export const ADMIN_ORDERS: AdminOrder[] = [
  { id: '#1047', table: 'Table 7',    channel: 'Dine-In',  status: 'Preparing', items: [{name:'Butter Chicken',qty:2,price:399},{name:'Dal Makhani',qty:1,price:299},{name:'Matcha Latte',qty:2,price:130}], subtotal: 1357, tax: 136, total: 1493, paymentStatus: 'Pending', customer: 'Ananya Sharma', phone: '+91 98765 43210', time: '7:18 PM', duration: '12 min', waiter: 'Riya Sharma', notes: 'Less spice please', timeline: [{label:'Order Placed',time:'7:18 PM',done:true},{label:'Preparing',time:'7:20 PM',done:true},{label:'Ready',time:'',done:false},{label:'Served',time:'',done:false}] },
  { id: '#1046', table: 'Table 3',    channel: 'Dine-In',  status: 'Ready',     items: [{name:'Paneer Tikka',qty:1,price:249},{name:'Avocado Toast',qty:2,price:299},{name:'Cold Brew Coffee',qty:2,price:160}], subtotal: 1167, tax: 117, total: 1284, paymentStatus: 'Pending', customer: 'Vikram Joshi', phone: '+91 87654 32109', time: '7:05 PM', duration: '25 min', waiter: 'Arjun Mehta', timeline: [{label:'Order Placed',time:'7:05 PM',done:true},{label:'Preparing',time:'7:08 PM',done:true},{label:'Ready',time:'7:28 PM',done:true},{label:'Served',time:'',done:false}] },
  { id: '#1045', table: 'Takeaway',   channel: 'Takeaway', status: 'Served',    items: [{name:'Chicken Seekh',qty:2,price:299},{name:'Mango Lassi',qty:2,price:110}], subtotal: 818, tax: 82, total: 900, paymentStatus: 'Paid', paymentMethod: 'UPI', customer: 'Rohan Mehta', phone: '+91 76543 21098', time: '6:50 PM', duration: '40 min', timeline: [{label:'Order Placed',time:'6:50 PM',done:true},{label:'Preparing',time:'6:53 PM',done:true},{label:'Ready',time:'7:08 PM',done:true},{label:'Picked Up',time:'7:30 PM',done:true}] },
  { id: '#1044', table: 'Table 12',   channel: 'Dine-In',  status: 'Served',    items: [{name:'Grilled Salmon',qty:2,price:649},{name:'Dal Makhani',qty:1,price:299},{name:'Fresh Lime Soda',qty:3,price:90}], subtotal: 1867, tax: 187, total: 2054, paymentStatus: 'Paid', paymentMethod: 'Card', customer: 'Kavya Pillai', time: '6:30 PM', duration: '55 min', waiter: 'Priya Nair', timeline: [{label:'Order Placed',time:'6:30 PM',done:true},{label:'Preparing',time:'6:33 PM',done:true},{label:'Ready',time:'6:55 PM',done:true},{label:'Served',time:'7:00 PM',done:true}] },
  { id: '#1043', table: 'Table 5',    channel: 'Dine-In',  status: 'Preparing', items: [{name:'Veg Spring Rolls',qty:2,price:179},{name:'Sichuan Noodles',qty:2,price:279},{name:'Matcha Latte',qty:1,price:130}], subtotal: 1046, tax: 105, total: 1151, paymentStatus: 'Pending', customer: 'Aryan Kumar', time: '7:22 PM', duration: '8 min', waiter: 'Riya Sharma', timeline: [{label:'Order Placed',time:'7:22 PM',done:true},{label:'Preparing',time:'7:25 PM',done:true},{label:'Ready',time:'',done:false},{label:'Served',time:'',done:false}] },
  { id: '#1042', table: 'Table 9',    channel: 'Dine-In',  status: 'New',       items: [{name:'Butter Chicken',qty:1,price:399},{name:'Gulab Jamun',qty:2,price:149}], subtotal: 697, tax: 70, total: 767, paymentStatus: 'Pending', customer: 'Meera Desai', time: '7:28 PM', duration: '2 min', waiter: 'Arjun Mehta', timeline: [{label:'Order Placed',time:'7:28 PM',done:true},{label:'Preparing',time:'',done:false},{label:'Ready',time:'',done:false},{label:'Served',time:'',done:false}] },
  { id: '#1041', table: 'Delivery',   channel: 'Delivery', status: 'Served',    items: [{name:'Dal Makhani',qty:2,price:299},{name:'Basmati Rice',qty:1,price:80},{name:'Matcha Latte',qty:1,price:130}], subtotal: 808, tax: 81, total: 889, paymentStatus: 'Paid', paymentMethod: 'UPI', customer: 'Pooja Nair', address: '42, MG Road Apt 3', phone: '+91 65432 10987', time: '6:15 PM', duration: '70 min', timeline: [{label:'Order Placed',time:'6:15 PM',done:true},{label:'Preparing',time:'6:18 PM',done:true},{label:'Ready',time:'6:40 PM',done:true},{label:'Delivered',time:'7:25 PM',done:true}] },
  { id: '#1040', table: 'Table 2',    channel: 'Dine-In',  status: 'Cancelled', items: [{name:'Grilled Salmon',qty:1,price:649}], subtotal: 649, tax: 65, total: 714, paymentStatus: 'Pending', customer: 'Sanjay Patel', time: '5:55 PM', duration: '—', waiter: 'Priya Nair', notes: 'Customer left without ordering', timeline: [{label:'Order Placed',time:'5:55 PM',done:true},{label:'Cancelled',time:'6:02 PM',done:true},{label:'',time:'',done:false},{label:'',time:'',done:false}] },
  { id: '#1039', table: 'Table 15',   channel: 'Dine-In',  status: 'New',       items: [{name:'Paneer Tikka',qty:1,price:249},{name:'Velvet Cake',qty:2,price:210},{name:'Cold Brew Coffee',qty:2,price:160}], subtotal: 989, tax: 99, total: 1088, paymentStatus: 'Pending', customer: 'Ritu Singh', time: '7:26 PM', duration: '4 min', waiter: 'Riya Sharma', timeline: [{label:'Order Placed',time:'7:26 PM',done:true},{label:'Preparing',time:'',done:false},{label:'Ready',time:'',done:false},{label:'Served',time:'',done:false}] },
  { id: '#1038', table: 'Table 8',    channel: 'Dine-In',  status: 'Served',    items: [{name:'Chicken Seekh',qty:1,price:299},{name:'Butter Chicken',qty:1,price:399},{name:'Mango Lassi',qty:2,price:110}], subtotal: 918, tax: 92, total: 1010, paymentStatus: 'Paid', paymentMethod: 'Cash', customer: 'Deepak Rao', time: '5:30 PM', duration: '90 min', waiter: 'Arjun Mehta', timeline: [{label:'Order Placed',time:'5:30 PM',done:true},{label:'Preparing',time:'5:34 PM',done:true},{label:'Ready',time:'5:55 PM',done:true},{label:'Served',time:'6:00 PM',done:true}] },
];

// ─── TABLES ──────────────────────────────────────────────────────────────────
export type TableStatus = 'Vacant' | 'Seated' | 'Ordered' | 'Awaiting Bill' | 'Cleaning';
export interface AdminTable {
  id: number; name: string; capacity: number; status: TableStatus;
  section: string; orderId?: string; guestCount?: number;
  seatedAt?: string; waiter?: string; amount?: number;
}

export const ADMIN_TABLES: AdminTable[] = [
  { id: 1,  name: 'T1',  capacity: 2,  status: 'Vacant',        section: 'Main Hall' },
  { id: 2,  name: 'T2',  capacity: 2,  status: 'Ordered',       section: 'Main Hall',  orderId: '#1040', guestCount: 2, seatedAt: '5:45 PM', waiter: 'Priya Nair',  amount: 714   },
  { id: 3,  name: 'T3',  capacity: 4,  status: 'Ordered',       section: 'Main Hall',  orderId: '#1046', guestCount: 3, seatedAt: '7:00 PM', waiter: 'Arjun Mehta', amount: 1284  },
  { id: 4,  name: 'T4',  capacity: 4,  status: 'Cleaning',      section: 'Main Hall' },
  { id: 5,  name: 'T5',  capacity: 4,  status: 'Ordered',       section: 'Main Hall',  orderId: '#1043', guestCount: 4, seatedAt: '7:15 PM', waiter: 'Riya Sharma', amount: 1151  },
  { id: 6,  name: 'T6',  capacity: 6,  status: 'Vacant',        section: 'Main Hall' },
  { id: 7,  name: 'T7',  capacity: 4,  status: 'Ordered',       section: 'Main Hall',  orderId: '#1047', guestCount: 2, seatedAt: '7:10 PM', waiter: 'Riya Sharma', amount: 1493  },
  { id: 8,  name: 'T8',  capacity: 2,  status: 'Awaiting Bill', section: 'Main Hall',  orderId: '#1038', guestCount: 2, seatedAt: '5:25 PM', waiter: 'Arjun Mehta', amount: 1010  },
  { id: 9,  name: 'T9',  capacity: 2,  status: 'Seated',        section: 'Main Hall',  guestCount: 2, seatedAt: '7:20 PM', waiter: 'Priya Nair' },
  { id: 10, name: 'T10', capacity: 6,  status: 'Vacant',        section: 'Main Hall' },
  { id: 11, name: 'T11', capacity: 4,  status: 'Vacant',        section: 'Patio' },
  { id: 12, name: 'T12', capacity: 4,  status: 'Awaiting Bill', section: 'Patio',      orderId: '#1044', guestCount: 4, seatedAt: '6:25 PM', waiter: 'Priya Nair',  amount: 2054  },
  { id: 13, name: 'T13', capacity: 2,  status: 'Vacant',        section: 'Patio' },
  { id: 14, name: 'T14', capacity: 2,  status: 'Cleaning',      section: 'Patio' },
  { id: 15, name: 'T15', capacity: 4,  status: 'Ordered',       section: 'Patio',      orderId: '#1039', guestCount: 3, seatedAt: '7:22 PM', waiter: 'Riya Sharma', amount: 1088  },
  { id: 16, name: 'P1',  capacity: 10, status: 'Vacant',        section: 'Private Room' },
  { id: 17, name: 'P2',  capacity: 8,  status: 'Seated',        section: 'Private Room', guestCount: 6, seatedAt: '6:00 PM', waiter: 'Arjun Mehta' },
  { id: 18, name: 'B1',  capacity: 2,  status: 'Ordered',       section: 'Bar Counter',  orderId: '#1042', guestCount: 1, seatedAt: '7:24 PM', amount: 767 },
  { id: 19, name: 'B2',  capacity: 2,  status: 'Vacant',        section: 'Bar Counter' },
  { id: 20, name: 'B3',  capacity: 2,  status: 'Vacant',        section: 'Bar Counter' },
];

// ─── QR MANAGEMENT ──────────────────────────────────────────────────────────
export interface QRItem {
  id: string; label: string; type: 'table' | 'takeaway';
  tableId?: number; scans: number; revenue: number;
  lastScan: string; active: boolean; url: string;
}

export const ADMIN_QR_DATA: QRItem[] = [
  { id: 'q1',  label: 'Table 1',    type: 'table',    tableId: 1,  scans: 142, revenue: 28400, lastScan: '7:12 PM', active: true,  url: 'smartdine.app/t/1'  },
  { id: 'q2',  label: 'Table 2',    type: 'table',    tableId: 2,  scans: 98,  revenue: 19200, lastScan: '5:55 PM', active: true,  url: 'smartdine.app/t/2'  },
  { id: 'q3',  label: 'Table 3',    type: 'table',    tableId: 3,  scans: 187, revenue: 41800, lastScan: '7:05 PM', active: true,  url: 'smartdine.app/t/3'  },
  { id: 'q4',  label: 'Table 4',    type: 'table',    tableId: 4,  scans: 112, revenue: 22400, lastScan: '6:10 PM', active: true,  url: 'smartdine.app/t/4'  },
  { id: 'q5',  label: 'Table 5',    type: 'table',    tableId: 5,  scans: 203, revenue: 48700, lastScan: '7:22 PM', active: true,  url: 'smartdine.app/t/5'  },
  { id: 'q6',  label: 'Table 6',    type: 'table',    tableId: 6,  scans: 76,  revenue: 15200, lastScan: '5:30 PM', active: true,  url: 'smartdine.app/t/6'  },
  { id: 'q7',  label: 'Table 7',    type: 'table',    tableId: 7,  scans: 219, revenue: 52600, lastScan: '7:18 PM', active: true,  url: 'smartdine.app/t/7'  },
  { id: 'q8',  label: 'Table 8',    type: 'table',    tableId: 8,  scans: 154, revenue: 34200, lastScan: '6:45 PM', active: true,  url: 'smartdine.app/t/8'  },
  { id: 'q9',  label: 'Table 9',    type: 'table',    tableId: 9,  scans: 89,  revenue: 17800, lastScan: '7:20 PM', active: true,  url: 'smartdine.app/t/9'  },
  { id: 'q10', label: 'Table 10',   type: 'table',    tableId: 10, scans: 64,  revenue: 12800, lastScan: '4:20 PM', active: true,  url: 'smartdine.app/t/10' },
  { id: 'qt1', label: 'Takeaway #1',type: 'takeaway',             scans: 312, revenue: 78400, lastScan: '7:25 PM', active: true,  url: 'smartdine.app/takeaway/1' },
  { id: 'qt2', label: 'Takeaway #2',type: 'takeaway',             scans: 147, revenue: 34200, lastScan: '6:50 PM', active: true,  url: 'smartdine.app/takeaway/2' },
  { id: 'qt3', label: 'Drive-Thru', type: 'takeaway',             scans: 89,  revenue: 21300, lastScan: '5:40 PM', active: false, url: 'smartdine.app/drive/1'    },
];

// ─── BILLING ─────────────────────────────────────────────────────────────────
export const PAYMENT_HISTORY = [
  { id: 'p001', orderId: '#1044', table: 'Table 12', method: 'Card',  amount: 2054, time: '7:28 PM', status: 'Success', customer: 'Kavya Pillai'  },
  { id: 'p002', orderId: '#1045', table: 'Takeaway', method: 'UPI',   amount: 900,  time: '7:32 PM', status: 'Success', customer: 'Rohan Mehta'   },
  { id: 'p003', orderId: '#1038', table: 'Table 8',  method: 'Cash',  amount: 1010, time: '7:08 PM', status: 'Success', customer: 'Deepak Rao'    },
  { id: 'p004', orderId: '#1041', table: 'Delivery', method: 'UPI',   amount: 889,  time: '7:26 PM', status: 'Success', customer: 'Pooja Nair'    },
  { id: 'p005', orderId: '#1033', table: 'Table 4',  method: 'Card',  amount: 1680, time: '6:45 PM', status: 'Success', customer: 'Mohit Sharma'  },
  { id: 'p006', orderId: '#1031', table: 'Table 1',  method: 'Cash',  amount: 540,  time: '6:20 PM', status: 'Success', customer: 'Neha Gupta'   },
  { id: 'p007', orderId: '#1029', table: 'Table 6',  method: 'UPI',   amount: 2310, time: '5:55 PM', status: 'Success', customer: 'Rahul Verma'  },
  { id: 'p008', orderId: '#1027', table: 'Takeaway', method: 'Wallet',amount: 645,  time: '5:30 PM', status: 'Success', customer: 'Simran Kaur'  },
];

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
export interface CustomerVisit { date: string; orderId: string; amount: number; items: string; channel: string; }
export interface CustomerFeedback { date: string; rating: number; comment: string; }
export interface AdminCustomer {
  id: string; name: string; email: string; phone: string;
  tags: string[]; joined: string; totalVisits: number; totalSpend: number;
  avgOrderValue: number; lastVisit: string; rating: number;
  favoriteItems: string[]; loyaltyPoints: number; tier: string;
  visitHistory: CustomerVisit[]; feedback: CustomerFeedback[];
}

export const ADMIN_CUSTOMERS: AdminCustomer[] = [
  { id: 'c01', name: 'Ananya Sharma',  email: 'ananya@gmail.com',    phone: '+91 98765 43210', tags: ['VIP','Regular'],       joined: 'Jan 2025', totalVisits: 42, totalSpend: 84600, avgOrderValue: 2014, lastVisit: 'May 30', rating: 4.9, loyaltyPoints: 1240, tier: 'Gold',     favoriteItems: ['Butter Chicken','Matcha Latte','Avocado Toast'],    visitHistory: [{date:'May 30',orderId:'#1047',amount:2340,items:'2x Butter Chicken, 2x Matcha Latte',channel:'Dine-In'},{date:'May 22',orderId:'#1031',amount:1890,items:'1x Grilled Salmon, 2x Cold Brew',channel:'Dine-In'},{date:'May 15',orderId:'#1018',amount:2120,items:'Paneer Tikka, Dal Makhani',channel:'Dine-In'}], feedback:[{date:'May 30',rating:5,comment:'Exceptional food and service as always.'},{date:'May 22',rating:5,comment:'Grilled salmon was perfectly cooked.'}] },
  { id: 'c02', name: 'Rohan Mehta',    email: 'rohan.m@outlook.com', phone: '+91 87654 32109', tags: ['Regular'],             joined: 'Mar 2025', totalVisits: 18, totalSpend: 32400, avgOrderValue: 1800, lastVisit: 'May 29', rating: 4.2, loyaltyPoints: 480,  tier: 'Silver',   favoriteItems: ['Matcha Latte','Paneer Tikka'],                       visitHistory: [{date:'May 29',orderId:'#1045',amount:900,items:'Chicken Seekh, Mango Lassi',channel:'Takeaway'},{date:'May 20',orderId:'#1028',amount:1240,items:'Paneer Tikka, Matcha Latte',channel:'Dine-In'}],   feedback:[{date:'May 29',rating:4,comment:'Good food. Matcha latte was slightly sweet.'}] },
  { id: 'c03', name: 'Kavya Pillai',   email: 'kavya.p@gmail.com',   phone: '+91 76543 21098', tags: ['VIP','Food Lover'],    joined: 'Nov 2024', totalVisits: 67, totalSpend: 142000,avgOrderValue: 2119, lastVisit: 'May 29', rating: 5.0, loyaltyPoints: 2100, tier: 'Platinum', favoriteItems: ['Avocado Toast','Grilled Salmon','Velvet Cake'],     visitHistory: [{date:'May 29',orderId:'#1044',amount:2054,items:'2x Grilled Salmon, Dal Makhani',channel:'Dine-In'},{date:'May 23',orderId:'#1035',amount:1780,items:'Avocado Toast, Velvet Cake, Matcha',channel:'Dine-In'}], feedback:[{date:'May 29',rating:5,comment:'Best restaurant in LA. Period.'},{date:'May 23',rating:5,comment:'Avocado toast is always perfect.'}] },
  { id: 'c04', name: 'Vikram Joshi',   email: 'vikram.j@yahoo.com',  phone: '+91 65432 10987', tags: ['Regular'],             joined: 'Feb 2025', totalVisits: 11, totalSpend: 14800, avgOrderValue: 1345, lastVisit: 'May 28', rating: 3.5, loyaltyPoints: 180,  tier: 'Bronze',   favoriteItems: ['Butter Chicken','Gulab Jamun'],                      visitHistory: [{date:'May 28',orderId:'#1043',amount:767,items:'Butter Chicken, Gulab Jamun',channel:'Dine-In'},{date:'May 10',orderId:'#1012',amount:1240,items:'Dal Makhani, Spring Rolls',channel:'Dine-In'}],      feedback:[{date:'May 28',rating:3,comment:'Food good but 25-min wait was too long.'}] },
  { id: 'c05', name: 'Meera Desai',    email: 'meera.d@gmail.com',   phone: '+91 54321 09876', tags: ['VIP','Regular'],       joined: 'Aug 2024', totalVisits: 54, totalSpend: 98200, avgOrderValue: 1818, lastVisit: 'May 28', rating: 4.8, loyaltyPoints: 1580, tier: 'Gold',     favoriteItems: ['Paneer Tikka','Matcha Latte','Velvet Cake'],         visitHistory: [{date:'May 28',orderId:'#1042',amount:1490,items:'Paneer Tikka Full, 2x Matcha',channel:'Dine-In'},{date:'May 19',orderId:'#1025',amount:2100,items:'Grilled Salmon, Velvet Cake',channel:'Dine-In'}], feedback:[{date:'May 28',rating:5,comment:'Staff was incredibly attentive.'},{date:'May 19',rating:5,comment:'Perfect evening out.'}] },
  { id: 'c06', name: 'Aryan Kumar',    email: 'aryan.k@gmail.com',   phone: '+91 43210 98765', tags: ['New'],                 joined: 'May 2026', totalVisits: 3,  totalSpend: 4200,  avgOrderValue: 1400, lastVisit: 'May 27', rating: 4.5, loyaltyPoints: 60,   tier: 'Bronze',   favoriteItems: ['Sichuan Noodles','Cold Brew Coffee'],               visitHistory: [{date:'May 27',orderId:'#1039',amount:1151,items:'Spring Rolls, Sichuan Noodles',channel:'Dine-In'},{date:'May 20',orderId:'#1024',amount:890,items:'Sichuan Noodles, Cold Brew',channel:'Dine-In'}],   feedback:[{date:'May 27',rating:4,comment:'Great first experience. Will return.'}] },
  { id: 'c07', name: 'Pooja Nair',     email: 'pooja.n@gmail.com',   phone: '+91 32109 87654', tags: ['Regular','Food Lover'],joined: 'Dec 2024', totalVisits: 28, totalSpend: 52400, avgOrderValue: 1871, lastVisit: 'May 26', rating: 4.6, loyaltyPoints: 780,  tier: 'Silver',   favoriteItems: ['Dal Makhani','Butter Chicken','Mango Lassi'],        visitHistory: [{date:'May 26',orderId:'#1041',amount:889,items:'Dal Makhani, Basmati Rice',channel:'Delivery'},{date:'May 18',orderId:'#1022',amount:1340,items:'Butter Chicken, Dal Makhani',channel:'Delivery'}],  feedback:[{date:'May 26',rating:5,comment:'Always reliable delivery.'},{date:'May 18',rating:4,comment:'Good food, delivery was prompt.'}] },
  { id: 'c08', name: 'Deepak Rao',     email: 'deepak.r@gmail.com',  phone: '+91 21098 76543', tags: ['Regular'],             joined: 'Apr 2025', totalVisits: 14, totalSpend: 21600, avgOrderValue: 1543, lastVisit: 'May 25', rating: 4.1, loyaltyPoints: 290,  tier: 'Bronze',   favoriteItems: ['Chicken Seekh','Butter Chicken'],                   visitHistory: [{date:'May 25',orderId:'#1038',amount:1010,items:'Chicken Seekh, Butter Chicken',channel:'Dine-In'},{date:'May 12',orderId:'#1015',amount:890,items:'2x Chicken Seekh',channel:'Takeaway'}],          feedback:[{date:'May 25',rating:4,comment:'Consistent quality every time.'}] },
  { id: 'c09', name: 'Simran Kaur',    email: 'simran.k@gmail.com',  phone: '+91 10987 65432', tags: ['New','Food Lover'],    joined: 'Apr 2026', totalVisits: 5,  totalSpend: 7800,  avgOrderValue: 1560, lastVisit: 'May 24', rating: 4.8, loyaltyPoints: 110,  tier: 'Bronze',   favoriteItems: ['Matcha Latte','Velvet Cake','Avocado Toast'],        visitHistory: [{date:'May 24',orderId:'#1036',amount:645,items:'Matcha Latte, Velvet Cake',channel:'Takeaway'},{date:'May 18',orderId:'#1021',amount:890,items:'Avocado Toast, Matcha',channel:'Dine-In'}],          feedback:[{date:'May 24',rating:5,comment:'Love this place! Matcha is the best in city.'}] },
  { id: 'c10', name: 'Rahul Verma',    email: 'rahul.v@gmail.com',   phone: '+91 09876 54321', tags: ['Inactive'],            joined: 'Sep 2024', totalVisits: 8,  totalSpend: 12400, avgOrderValue: 1550, lastVisit: 'Apr 2026', rating: 3.8,loyaltyPoints: 95,   tier: 'Bronze',   favoriteItems: ['Paneer Tikka','Fresh Lime Soda'],                   visitHistory: [{date:'Apr 20',orderId:'#1008',amount:1240,items:'Paneer Tikka, Fresh Lime Soda',channel:'Dine-In'},{date:'Mar 15',orderId:'#980',amount:880,items:'Spring Rolls, Mango Lassi',channel:'Dine-In'}],   feedback:[{date:'Apr 20',rating:4,comment:'Good but nothing exceptional.'}] },
];

// ─── LOYALTY ─────────────────────────────────────────────────────────────────
export const LOYALTY_STATS = {
  totalMembers: 312, activeMembers: 248, pointsIssued: 124800,
  pointsRedeemed: 48200, redemptionRate: 38.6, avgPointsPerMember: 400,
};

export interface AdminReward {
  id: string; name: string; description: string;
  pointsRequired: number; valueType: 'Free Item' | 'Discount %' | 'Cashback';
  value: number; redemptions: number; active: boolean; icon: string;
}

export const ADMIN_REWARDS: AdminReward[] = [
  { id: 'r01', name: 'Free Matcha Latte',    description: 'Redeem for 1 complimentary Matcha Latte', pointsRequired: 200,  valueType: 'Free Item',   value: 130,  redemptions: 84,  active: true,  icon: '🍵' },
  { id: 'r02', name: '10% Off Next Bill',    description: '10% discount on your next dine-in order',  pointsRequired: 300,  valueType: 'Discount %',  value: 10,   redemptions: 127, active: true,  icon: '🏷️' },
  { id: 'r03', name: 'Free Dessert',         description: 'Choose any dessert on the house',           pointsRequired: 400,  valueType: 'Free Item',   value: 210,  redemptions: 62,  active: true,  icon: '🍰' },
  { id: 'r04', name: '₹200 Cashback',        description: 'Cashback credited to wallet',               pointsRequired: 500,  valueType: 'Cashback',    value: 200,  redemptions: 41,  active: true,  icon: '💰' },
  { id: 'r05', name: 'VIP Table Upgrade',    description: 'Priority seating at premium section',       pointsRequired: 800,  valueType: 'Free Item',   value: 0,    redemptions: 18,  active: true,  icon: '⭐' },
  { id: 'r06', name: '20% Off Weekday',      description: '20% off on weekday lunch visits',           pointsRequired: 1000, valueType: 'Discount %',  value: 20,   redemptions: 29,  active: false, icon: '📅' },
];

export interface AdminCoupon {
  id: string; code: string; discount: number; type: 'Percentage' | 'Fixed';
  minOrder: number; usageLimit: number; usedCount: number;
  validFrom: string; validTo: string; status: 'Active' | 'Expired' | 'Scheduled';
  appliesTo: string; createdBy: string;
}

export const ADMIN_COUPONS: AdminCoupon[] = [
  { id: 'cp01', code: 'WELCOME20',  discount: 20,  type: 'Percentage', minOrder: 500,  usageLimit: 100, usedCount: 68,  validFrom: 'May 1',  validTo: 'Jun 30', status: 'Active',    appliesTo: 'All items',      createdBy: 'Admin' },
  { id: 'cp02', code: 'MATCHA50',   discount: 50,  type: 'Fixed',      minOrder: 200,  usageLimit: 50,  usedCount: 50,  validFrom: 'Apr 1',  validTo: 'Apr 30', status: 'Expired',   appliesTo: 'Drinks only',    createdBy: 'Admin' },
  { id: 'cp03', code: 'SUMMER15',   discount: 15,  type: 'Percentage', minOrder: 800,  usageLimit: 200, usedCount: 43,  validFrom: 'May 15', validTo: 'Jul 31', status: 'Active',    appliesTo: 'Mains & Drinks', createdBy: 'Manager' },
  { id: 'cp04', code: 'LUNCH100',   discount: 100, type: 'Fixed',      minOrder: 600,  usageLimit: 80,  usedCount: 0,   validFrom: 'Jun 1',  validTo: 'Jun 30', status: 'Scheduled', appliesTo: 'Lunch menu',     createdBy: 'Admin' },
  { id: 'cp05', code: 'VIPFREE',    discount: 100, type: 'Percentage', minOrder: 0,    usageLimit: 10,  usedCount: 6,   validFrom: 'May 1',  validTo: 'Dec 31', status: 'Active',    appliesTo: 'VIP customers',  createdBy: 'Admin' },
  { id: 'cp06', code: 'WEEKEND10',  discount: 10,  type: 'Percentage', minOrder: 400,  usageLimit: 500, usedCount: 187, validFrom: 'May 1',  validTo: 'May 31', status: 'Expired',   appliesTo: 'All items',      createdBy: 'Manager' },
];

export interface Campaign {
  id: string; name: string; type: string; discount: string;
  startDate: string; endDate: string; status: 'Active' | 'Ended' | 'Upcoming';
  targetAudience: string; redemptions: number; revenue: number;
}

export const ADMIN_CAMPAIGNS: Campaign[] = [
  { id: 'cam01', name: 'Summer Feast Promotion', type: 'Seasonal',     discount: '15% off mains', startDate: 'May 15',  endDate: 'Jul 31',  status: 'Active',   targetAudience: 'All customers',    redemptions: 142, revenue: 284000 },
  { id: 'cam02', name: 'Welcome New Members',    type: 'Onboarding',   discount: '20% first visit',startDate: 'Jan 1',   endDate: 'Dec 31',  status: 'Active',   targetAudience: 'New sign-ups',     redemptions: 68,  revenue: 102000 },
  { id: 'cam03', name: 'Weekday Lunch Special',  type: 'Day-parting',  discount: '₹100 off',       startDate: 'Jun 1',   endDate: 'Jun 30',  status: 'Upcoming', targetAudience: 'All customers',    redemptions: 0,   revenue: 0      },
  { id: 'cam04', name: 'VIP Appreciation Week',  type: 'Loyalty',      discount: 'Free item',      startDate: 'Apr 1',   endDate: 'Apr 7',   status: 'Ended',    targetAudience: 'Platinum & Gold',  redemptions: 29,  revenue: 58000  },
  { id: 'cam05', name: 'Birthday Month Offer',   type: 'Personalized', discount: '25% off',        startDate: 'Jan 1',   endDate: 'Dec 31',  status: 'Active',   targetAudience: 'Birthday month',   redemptions: 38,  revenue: 76000  },
];

// ─── RESTAURANT SETTINGS ─────────────────────────────────────────────────────
export const RESTAURANT_SETTINGS = {
  profile: {
    name: 'SmartDine Restaurant',
    tagline: 'Fresh, honest cooking in a welcoming space.',
    address: '842 Pastel Blvd, Los Angeles, CA 90028',
    city: 'Los Angeles', state: 'CA', pincode: '90028', country: 'India',
    phone: '+91 98765 43210', email: 'contact@smartdine.app',
    website: 'www.smartdine.app',
    cuisine: 'Multi-Cuisine', seatingCapacity: 80,
    establishedYear: '2022',
    description: 'A neighborhood restaurant focused on honest cooking using quality seasonal ingredients.',
  },
  gst: {
    gstin: '27AAXXX1234Z1Z5', legalName: 'SmartDine Hospitality Pvt Ltd',
    cgstRate: 5, sgstRate: 5, igstRate: 0, hsnCode: '9963',
    tdsApplicable: false, compositeScheme: false,
  },
  hours: [
    { day: 'Monday',    open: '08:00', close: '22:00', closed: false },
    { day: 'Tuesday',   open: '08:00', close: '22:00', closed: false },
    { day: 'Wednesday', open: '08:00', close: '22:00', closed: false },
    { day: 'Thursday',  open: '08:00', close: '22:00', closed: false },
    { day: 'Friday',    open: '08:00', close: '23:00', closed: false },
    { day: 'Saturday',  open: '09:00', close: '23:30', closed: false },
    { day: 'Sunday',    open: '09:00', close: '21:00', closed: false },
  ],
  payments: { upi: true, card: true, cash: true, wallet: true, netBanking: false, emi: false },
  languages: { primary: 'English', supported: ['English', 'Hindi', 'Kannada'] },
  receipt: {
    headerText: 'Thank you for dining with us!',
    footerText: 'Visit again soon. FSSAI: 10024211002345',
    showGST: true, showLogo: true, showQR: true, showTable: true,
    showWaiter: false, printCopies: 1,
  },
  branding: { primaryColor: '#ec4899', fontFamily: 'Inter', logoUrl: '' },
};

// ─── USERS & ROLES ────────────────────────────────────────────────────────────
export const ALL_PERMISSIONS = [
  'View Dashboard', 'Manage Menu', 'View Orders', 'Manage Orders',
  'Manage Tables', 'Access Billing', 'View Reports', 'Export Reports',
  'Manage Inventory', 'Manage Customers', 'Manage Coupons',
  'Manage Staff', 'Manage Settings', 'View Audit Logs',
];

export interface AdminRole {
  id: string; name: string; description: string; color: string;
  members: number; permissions: string[];
}

export const ADMIN_ROLES: AdminRole[] = [
  { id: 'owner',   name: 'Owner',       description: 'Full access to all modules',              color: 'bg-violet-100 text-violet-700', members: 1, permissions: ALL_PERMISSIONS },
  { id: 'manager', name: 'Manager',     description: 'Manage operations and staff',             color: 'bg-blue-100 text-blue-700',    members: 2, permissions: ['View Dashboard','Manage Menu','View Orders','Manage Orders','Manage Tables','Access Billing','View Reports','Export Reports','Manage Inventory','Manage Customers','Manage Coupons','Manage Staff'] },
  { id: 'chef',    name: 'Chef',        description: 'Kitchen and menu access',                 color: 'bg-orange-100 text-orange-700', members: 2, permissions: ['View Orders','Manage Orders','Manage Menu','Manage Inventory'] },
  { id: 'waiter',  name: 'Waiter',      description: 'Table and order management',              color: 'bg-emerald-100 text-emerald-700',members: 4, permissions: ['View Orders','Manage Orders','Manage Tables'] },
  { id: 'cashier', name: 'Cashier',     description: 'Billing and payment collection',          color: 'bg-amber-100 text-amber-700',  members: 1, permissions: ['View Orders','Access Billing','View Reports'] },
];

export interface AdminUser {
  id: string; name: string; email: string; phone: string; roleId: string;
  status: 'Active' | 'Off Duty' | 'Inactive'; lastLogin: string; lastActivity: string;
  ordersToday: number; joinedDate: string; avatar: string;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: 'u01', name: 'Kiran Patel',    email: 'kiran@smartdine.app',  phone: '+91 98765 00001', roleId: 'owner',   status: 'Active',   lastLogin: 'Today 9:00 AM',   lastActivity: '2 min ago',  ordersToday: 0,  joinedDate: 'Jan 2022', avatar: 'KP' },
  { id: 'u02', name: 'Neha Gupta',     email: 'neha@smartdine.app',   phone: '+91 98765 00002', roleId: 'manager', status: 'Active',   lastLogin: 'Today 10:30 AM',  lastActivity: '15 min ago', ordersToday: 0,  joinedDate: 'Mar 2023', avatar: 'NG' },
  { id: 'u03', name: 'Riya Sharma',    email: 'riya@smartdine.app',   phone: '+91 98765 00003', roleId: 'waiter',  status: 'Active',   lastLogin: 'Today 12:00 PM',  lastActivity: '5 min ago',  ordersToday: 22, joinedDate: 'Jun 2023', avatar: 'RS' },
  { id: 'u04', name: 'Arjun Mehta',    email: 'arjun@smartdine.app',  phone: '+91 98765 00004', roleId: 'waiter',  status: 'Active',   lastLogin: 'Today 12:00 PM',  lastActivity: '8 min ago',  ordersToday: 18, joinedDate: 'Aug 2023', avatar: 'AM' },
  { id: 'u05', name: 'Priya Nair',     email: 'priya@smartdine.app',  phone: '+91 98765 00005', roleId: 'waiter',  status: 'Active',   lastLogin: 'Today 12:00 PM',  lastActivity: '12 min ago', ordersToday: 16, joinedDate: 'Sep 2023', avatar: 'PN' },
  { id: 'u06', name: 'Dev Kumar',      email: 'dev@smartdine.app',    phone: '+91 98765 00006', roleId: 'chef',    status: 'Active',   lastLogin: 'Today 8:00 AM',   lastActivity: '3 min ago',  ordersToday: 47, joinedDate: 'Feb 2023', avatar: 'DK' },
  { id: 'u07', name: 'Sneha Pillai',   email: 'sneha@smartdine.app',  phone: '+91 98765 00007', roleId: 'cashier', status: 'Active',   lastLogin: 'Today 11:00 AM',  lastActivity: '1 min ago',  ordersToday: 12, joinedDate: 'Apr 2023', avatar: 'SP' },
  { id: 'u08', name: 'Raj Malhotra',   email: 'raj@smartdine.app',    phone: '+91 98765 00008', roleId: 'waiter',  status: 'Off Duty', lastLogin: 'May 29 6:00 PM',  lastActivity: '1 day ago',  ordersToday: 0,  joinedDate: 'Nov 2023', avatar: 'RM' },
  { id: 'u09', name: 'Aisha Khan',     email: 'aisha@smartdine.app',  phone: '+91 98765 00009', roleId: 'chef',    status: 'Off Duty', lastLogin: 'May 28 10:00 PM', lastActivity: '2 days ago', ordersToday: 0,  joinedDate: 'Jan 2024', avatar: 'AK' },
  { id: 'u10', name: 'Mohit Kapoor',   email: 'mohit@smartdine.app',  phone: '+91 98765 00010', roleId: 'manager', status: 'Inactive', lastLogin: 'Apr 15 3:00 PM',  lastActivity: '45 days ago',ordersToday: 0,  joinedDate: 'May 2023', avatar: 'MK' },
];

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string; timestamp: string; user: string; role: string;
  module: string; action: string; details: string; ip: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'al001', timestamp: 'May 30, 7:31 PM',  user: 'Sneha Pillai',  role: 'Cashier',  module: 'Billing',    action: 'Payment Collected',   details: 'Collected ₹2,054 via Card from Table 12 — Order #1044',         ip: '192.168.1.12', status: 'Success' },
  { id: 'al002', timestamp: 'May 30, 7:29 PM',  user: 'Riya Sharma',   role: 'Waiter',   module: 'Orders',     action: 'Order Status Updated', details: 'Order #1046 marked Ready — Table 3',                            ip: '192.168.1.8',  status: 'Success' },
  { id: 'al003', timestamp: 'May 30, 7:26 PM',  user: 'Sneha Pillai',  role: 'Cashier',  module: 'Billing',    action: 'Payment Collected',   details: 'Collected ₹900 via UPI from Takeaway — Order #1045',            ip: '192.168.1.12', status: 'Success' },
  { id: 'al004', timestamp: 'May 30, 7:24 PM',  user: 'Arjun Mehta',   role: 'Waiter',   module: 'Orders',     action: 'New Order Created',   details: 'Order #1047 placed for Table 7 — ₹1,493',                       ip: '192.168.1.9',  status: 'Success' },
  { id: 'al005', timestamp: 'May 30, 7:20 PM',  user: 'Neha Gupta',    role: 'Manager',  module: 'Inventory',  action: 'Stock Out Recorded',  details: 'Consumed 3 kg Paneer from inventory',                           ip: '192.168.1.5',  status: 'Success' },
  { id: 'al006', timestamp: 'May 30, 7:15 PM',  user: 'Dev Kumar',     role: 'Chef',     module: 'Orders',     action: 'Order Status Updated', details: 'Order #1043 moved to Preparing — Table 5',                      ip: '192.168.1.14', status: 'Success' },
  { id: 'al007', timestamp: 'May 30, 7:10 PM',  user: 'Kiran Patel',   role: 'Owner',    module: 'Menu',       action: 'Menu Item Updated',   details: 'Updated price of Grilled Salmon from ₹599 to ₹649',             ip: '192.168.1.2',  status: 'Success' },
  { id: 'al008', timestamp: 'May 30, 7:05 PM',  user: 'Priya Nair',    role: 'Waiter',   module: 'Tables',     action: 'Table Status Changed', details: 'Table 3 set to Ready — Order #1046',                            ip: '192.168.1.10', status: 'Success' },
  { id: 'al009', timestamp: 'May 30, 6:58 PM',  user: 'Neha Gupta',    role: 'Manager',  module: 'Coupons',    action: 'Coupon Applied',      details: 'Coupon WELCOME20 applied — Discount ₹280 on Order #1044',       ip: '192.168.1.5',  status: 'Success' },
  { id: 'al010', timestamp: 'May 30, 6:50 PM',  user: 'Riya Sharma',   role: 'Waiter',   module: 'Orders',     action: 'Order Cancelled',     details: 'Order #1040 cancelled — Table 2. Reason: Customer left.',       ip: '192.168.1.8',  status: 'Warning' },
  { id: 'al011', timestamp: 'May 30, 6:45 PM',  user: 'Kiran Patel',   role: 'Owner',    module: 'Settings',   action: 'Settings Updated',    details: 'Updated restaurant closing hours for Friday to 23:00',           ip: '192.168.1.2',  status: 'Success' },
  { id: 'al012', timestamp: 'May 30, 6:40 PM',  user: 'Sneha Pillai',  role: 'Cashier',  module: 'Billing',    action: 'Payment Collected',   details: 'Collected ₹1,010 via Cash from Table 8 — Order #1038',          ip: '192.168.1.12', status: 'Success' },
  { id: 'al013', timestamp: 'May 30, 6:35 PM',  user: 'Neha Gupta',    role: 'Manager',  module: 'Inventory',  action: 'Low Stock Alert',     details: 'Matcha Powder stock at 180g — below threshold of 500g',         ip: '192.168.1.5',  status: 'Warning' },
  { id: 'al014', timestamp: 'May 30, 6:30 PM',  user: 'Arjun Mehta',   role: 'Waiter',   module: 'Orders',     action: 'Order Status Updated', details: 'Order #1038 marked Served — Table 8',                           ip: '192.168.1.9',  status: 'Success' },
  { id: 'al015', timestamp: 'May 30, 6:20 PM',  user: 'Unknown',       role: '—',        module: 'Auth',       action: 'Login Failed',        details: 'Failed login attempt for email: test@hacker.com',               ip: '203.45.12.88', status: 'Failed'  },
  { id: 'al016', timestamp: 'May 30, 6:15 PM',  user: 'Kiran Patel',   role: 'Owner',    module: 'Staff',      action: 'Staff Role Updated',  details: 'Raj Malhotra role changed from Waiter to Off Duty',             ip: '192.168.1.2',  status: 'Success' },
  { id: 'al017', timestamp: 'May 30, 6:10 PM',  user: 'Dev Kumar',     role: 'Chef',     module: 'Menu',       action: 'Item Availability',   details: 'Bruschetta marked Unavailable — out of sourdough bread',        ip: '192.168.1.14', status: 'Success' },
  { id: 'al018', timestamp: 'May 30, 6:05 PM',  user: 'Priya Nair',    role: 'Waiter',   module: 'Tables',     action: 'Table Cleared',       details: 'Table 4 cleared and set to Cleaning status',                    ip: '192.168.1.10', status: 'Success' },
  { id: 'al019', timestamp: 'May 30, 5:58 PM',  user: 'Neha Gupta',    role: 'Manager',  module: 'Inventory',  action: 'Stock In Recorded',   details: 'Added 10 loaves Sourdough Bread from Artisan Bakehouse',        ip: '192.168.1.5',  status: 'Success' },
  { id: 'al020', timestamp: 'May 30, 5:45 PM',  user: 'Kiran Patel',   role: 'Owner',    module: 'Loyalty',    action: 'Reward Redeemed',     details: 'Kavya Pillai redeemed 400 points for Free Dessert',             ip: '192.168.1.2',  status: 'Success' },
  { id: 'al021', timestamp: 'May 30, 5:30 PM',  user: 'Sneha Pillai',  role: 'Cashier',  module: 'Billing',    action: 'Bill Split',          details: 'Bill for Table 6 split into 3 parts — ₹770 each',               ip: '192.168.1.12', status: 'Success' },
  { id: 'al022', timestamp: 'May 30, 5:20 PM',  user: 'Riya Sharma',   role: 'Waiter',   module: 'Orders',     action: 'New Order Created',   details: 'Order #1038 placed for Table 8 — ₹1,010',                       ip: '192.168.1.8',  status: 'Success' },
  { id: 'al023', timestamp: 'May 30, 5:10 PM',  user: 'Neha Gupta',    role: 'Manager',  module: 'Menu',       action: 'Menu Item Added',     details: 'Added new item: Truffle Pasta — ₹499 in Mains category',        ip: '192.168.1.5',  status: 'Success' },
  { id: 'al024', timestamp: 'May 30, 4:55 PM',  user: 'Kiran Patel',   role: 'Owner',    module: 'Reports',    action: 'Report Exported',     details: 'May 2026 Sales Report exported as PDF by Owner',                ip: '192.168.1.2',  status: 'Success' },
  { id: 'al025', timestamp: 'May 30, 4:40 PM',  user: 'Dev Kumar',     role: 'Chef',     module: 'Inventory',  action: 'Wastage Recorded',    details: 'Recorded 0.5 kg wasted Chicken Breast — quality issue',         ip: '192.168.1.14', status: 'Success' },
];
