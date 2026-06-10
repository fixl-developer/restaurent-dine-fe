export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customization?: {
    main?: string;
    drink?: string;
    side?: string;
    topping?: string;
    size?: string;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'mains' | 'sides' | 'drinks' | 'sweets';
  description: string;
  image: string;
  calories: number;
  badge?: string;
  inStock?: boolean;
}

export interface CustomCombo {
  main: string;
  drink: string;
  side: string;
  topping: string;
  size: 'XS(10CM)' | 'S(12CM)' | 'M(15CM)' | 'L(18CM)';
}

export interface Order {
  id: string;
  table: string; // e.g. "Table 4" or "Takeout Delivery"
  items: string; // formatted list summary of entrees
  itemsList?: CartItem[]; // richer data structure
  cost: number;
  state: 'Pending' | 'In Kitchen' | 'Completed' | 'Served' | 'Ready to Serve';
  timestamp: string;
  duration?: string;
  notes?: string;
  address?: string;
}

export interface TableUnit {
  id: string;
  number: number;
  label: string; // e.g., "T-1 Window"
  capacity: number;
  status: 'vacant' | 'occupied' | 'reserved';
  customerName?: string;
  serverName?: string;
  spend: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  stamps: number; // loyalty stamps count (0 to 8)
  totalSpend: number;
  lastOrderDate: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string; // e.g., "Kg", "Liters", "Boxes"
  minLimit: number; // warning buffer threshold
  status: 'healthy' | 'low' | 'out';
  costPerUnit: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Chef' | 'Waiter' | 'Bistro Captain' | 'Barista' | 'Kitchen Hand';
  status: 'active' | 'break' | 'off-duty';
  shift: string; // e.g. "Morning 07:00-15:00"
  rating: number; // star rating e.g. 4.8
  phone: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'order' | 'waiter-call' | 'payment' | 'stock' | 'system';
}
