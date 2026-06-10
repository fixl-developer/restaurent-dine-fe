import { TableUnit, StockItem, StaffMember, CustomerProfile, NotificationAlert, Order } from './types';

export const INITIAL_TABLES: TableUnit[] = [
  { id: 't1', number: 1, label: 'Table 1 (Patio Bloom)', capacity: 2, status: 'vacant', spend: 0 },
  { id: 't2', number: 2, label: 'Table 2 (Patio Window)', capacity: 2, status: 'reserved', customerName: 'BEATRICE LEE', serverName: 'SOPHIA CHEN', spend: 0 },
  { id: 't3', number: 3, label: 'Table 3 (Rose Alcove)', capacity: 4, status: 'vacant', spend: 0 },
  { id: 't4', number: 4, label: 'Table 4 (Cozy Hearth)', capacity: 4, status: 'occupied', customerName: 'ETHAN HUNT', serverName: 'WAITRESS MIA', spend: 22.10 },
  { id: 't5', number: 5, label: 'Table 5 (Peachy Corner)', capacity: 6, status: 'reserved', customerName: 'CHLOE GOMEZ', serverName: 'CAPTAIN JAMES', spend: 0 },
  { id: 't6', number: 6, label: 'Table 6 (Pastel Lounge)', capacity: 4, status: 'occupied', customerName: 'ARIA VANCE', serverName: 'WAITRESS MIA', spend: 16.50 },
  { id: 't7', number: 7, label: 'Table 7 (Marble Counter)', capacity: 1, status: 'vacant', spend: 0 },
  { id: 't8', number: 8, label: 'Table 8 (Matcha Bar S1)', capacity: 1, status: 'occupied', customerName: 'LUCAS RIO', serverName: 'BARISTA ETHAN', spend: 9.70 }
];

export const INITIAL_STOCK: StockItem[] = [
  { id: 's-flour', name: 'Almond Baking Pastry Flour', category: 'Dry Goods', quantity: 45, unit: 'Kg', minLimit: 15, status: 'healthy', costPerUnit: 2.20 },
  { id: 's-berries', name: 'Fresh Organic Raspberries & Berries', category: 'Produce', quantity: 12, unit: 'Kg', minLimit: 10, status: 'healthy', costPerUnit: 8.50 },
  { id: 's-straw', name: 'Premium Sweet Strawberries', category: 'Produce', quantity: 4, unit: 'Kg', minLimit: 8, status: 'low', costPerUnit: 9.00 },
  { id: 's-matcha', name: 'Ceremonial Grade Uji Matcha', category: 'Tea', quantity: 2.5, unit: 'Kg', minLimit: 1.0, status: 'healthy', costPerUnit: 45.00 },
  { id: 's-milk', name: 'Organic Almond Cream Milk', category: 'Dairy', quantity: 3, unit: 'Liters', minLimit: 10, status: 'low', costPerUnit: 3.50 },
  { id: 's-sugar', name: 'Organic Coconut Blossom Nectar', category: 'Dry Goods', quantity: 0, unit: 'Kg', minLimit: 5, status: 'out', costPerUnit: 5.80 },
  { id: 's-peach', name: 'Sweet Glazed Wild Peaches', category: 'Produce', quantity: 8, unit: 'Kg', minLimit: 5, status: 'healthy', costPerUnit: 4.20 },
  { id: 's-yeast', name: 'French Croissant Leaven Yeast', category: 'Bakery', quantity: 18, unit: 'Boxes', minLimit: 6, status: 'healthy', costPerUnit: 1.80 }
];

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'emp1', name: 'SOPHIA CHEN', role: 'Bistro Captain', status: 'active', shift: 'Morning shift 07:00-15:00', rating: 4.9, phone: '(213) 555-1201' },
  { id: 'emp2', name: 'WAITRESS MIA', role: 'Waiter', status: 'active', shift: 'Morning shift 07:00-15:00', rating: 4.8, phone: '(213) 555-1202' },
  { id: 'emp3', name: 'BARISTA ETHAN', role: 'Staff Member', status: 'active', shift: 'Evening shift 15:00-22:00', rating: 4.90 } as unknown as StaffMember, // Casting to resolve structural differences cleanly if needed, but we will make it strict
  { id: 'emp4', name: 'ANIKA PANNU', role: 'Chef', status: 'active', shift: 'General Admin 09:00-18:00', rating: 5.0, phone: '(213) 555-0100' },
  { id: 'emp5', name: 'BAKER DANIEL', role: 'Chef', status: 'break', shift: 'Morning Baking 05:00-13:00', rating: 4.7, phone: '(213) 555-1204' }
];

// Enriching structural field constraints for types compatibility
INITIAL_STAFF[2] = { id: 'emp3', name: 'BARISTA ETHAN', role: 'Barista', status: 'active', shift: 'Evening shift 15:00-22:00', rating: 4.7, phone: '(213) 555-1203' };

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  { id: 'c1', name: 'BEATRICE LEE', phone: '(213) 555-8831', email: 'beatrice.l@retrocafe.com', visits: 18, stamps: 6, totalSpend: 245.80, lastOrderDate: '2026-05-28' },
  { id: 'c2', name: 'ETHAN HUNT', phone: '(213) 555-0041', email: 'ethan@imf.gov', visits: 12, stamps: 3, totalSpend: 154.20, lastOrderDate: '2026-05-30' },
  { id: 'c3', name: 'CHLOE GOMEZ', phone: '(213) 555-9012', email: 'chloe.g@outlook.com', visits: 24, stamps: 8, totalSpend: 310.50, lastOrderDate: '2026-05-29' },
  { id: 'c4', name: 'ARIA VANCE', phone: '(213) 555-1560', email: 'aria@vancearts.org', visits: 5, stamps: 1, totalSpend: 68.10, lastOrderDate: '2026-05-30' },
  { id: 'c5', name: 'LUCAS RIO', phone: '(213) 555-3211', email: 'lucas.rio@icloud.com', visits: 2, stamps: 2, totalSpend: 22.40, lastOrderDate: '2026-05-30' }
];

export const INITIAL_ALERTS: NotificationAlert[] = [
  { id: 'a1', title: 'New Table Order Placed', message: 'Table No. 3 transmitted order for 2x Coquette Pink Velvet Cake.', timestamp: '11:24 AM', isRead: false, type: 'order' },
  { id: 'a2', title: 'Waiter Request Bell Ringing', message: 'Table No. 4 Heath clicked waiter assistance chime.', timestamp: '11:26 AM', isRead: false, type: 'waiter-call' },
  { id: 'a3', title: 'Critical Stock Alert', message: 'Organic Coconut Blossom Nectar is officially out of stock.', timestamp: '08:15 AM', isRead: true, type: 'stock' },
  { id: 'a4', title: 'Payment Confirmed', message: 'Table 8 checkout of $9.70 processed via Apple Pay.', timestamp: '11:10 AM', isRead: true, type: 'payment' }
];

export const INITIAL_ORDERS: Order[] = [
  { id: '9045', table: 'Table No. 3', items: '2x Coquette Pink Velvet Cake, 1x Princess Berries Bowl', cost: 22.10, state: 'Pending', timestamp: '11:24 AM', duration: '4 min elapsed' },
  { id: '9046', table: 'Room 501 Delivery', items: '1x Fiore Burgundy Gnocchi, 1x Retro Cola', cost: 16.50, state: 'In Kitchen', timestamp: '11:18 AM', duration: '10 min elapsed' },
  { id: '9047', table: 'Table No. 9', items: '1x Dolly Baked Croissant, 1x Iced Matcha', cost: 9.70, state: 'Completed', timestamp: '11:02 AM', duration: 'Completed' },
  { id: '9048', table: 'Table No. 1', items: '1x Smiley Eggs & Bacon stack', cost: 9.80, state: 'Pending', timestamp: '11:28 AM', duration: 'Just now' }
];

// Rich analytical reports trends
export const REVENUE_SAMPLE_DAYS = [
  { day: 'Mon', sales: 1240, orders: 84, scans: 140, spendAvg: 14.70 },
  { day: 'Tue', sales: 1390, orders: 92, scans: 165, spendAvg: 15.10 },
  { day: 'Wed', sales: 1110, orders: 75, scans: 120, spendAvg: 14.80 },
  { day: 'Thu', sales: 1480, orders: 98, scans: 198, spendAvg: 15.10 },
  { day: 'Fri', sales: 1920, orders: 120, scans: 245, spendAvg: 16.00 },
  { day: 'Sat', sales: 2410, orders: 154, scans: 310, spendAvg: 15.65 },
  { day: 'Sun', sales: 2150, orders: 138, scans: 278, spendAvg: 15.58 }
];

export const CATEGORY_BREAKDOWN_DATA = [
  { name: 'Sweets & Cakes', value: 38, cost: 915.80, color: '#f472b6' },
  { name: 'Mains & Platers', value: 32, cost: 771.20, color: '#ec4899' },
  { name: 'Diner Sides', value: 18, cost: 433.80, color: '#db2777' },
  { name: 'Drinks & Foams', value: 12, cost: 289.70, color: '#fbcfe8' }
];

export const HOURLY_DEMAND_TREND = [
  { hour: '08:00 AM', breakfasts: 14, sweets: 8, drinks: 22 },
  { hour: '10:00 AM', breakfasts: 24, sweets: 18, drinks: 40 },
  { hour: '12:00 PM', breakfasts: 35, sweets: 24, drinks: 52 },
  { hour: '02:00 PM', breakfasts: 12, sweets: 42, drinks: 68 },
  { hour: '04:00 PM', breakfasts: 8, sweets: 38, drinks: 48 },
  { hour: '06:00 PM', breakfasts: 28, sweets: 30, drinks: 34 },
  { hour: '08:00 PM', breakfasts: 15, sweets: 45, drinks: 44 }
];
