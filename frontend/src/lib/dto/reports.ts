/** Reports + KPI dashboard DTOs. */

export type ReportGroupBy = 'day' | 'week' | 'month';
export type ReportChannel = 'dine_in' | 'window' | 'assisted';
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export type ReportType =
  | 'sales'
  | 'items'
  | 'tax'
  | 'payments'
  | 'staff'
  | 'footfall'
  | 'inventory'
  | 'feedback'
  | 'profitability';

export interface DateRange {
  from?: string;
  to?: string;
}

// ── KPI Dashboard ────────────────────────────────────────────────────────────
export interface KpiDashboardDto {
  today: { orders: number; gross: number };
  week: { orders: number; gross: number };
  month: { orders: number; gross: number };
  openOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  todayFeedback: { count: number; avgRating: number };
}

// ── Sales ────────────────────────────────────────────────────────────────────
export interface SalesBucket {
  bucket: string;
  invoiceCount: number;
  gross: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  net: number;
}

export interface SalesByChannel {
  channel: ReportChannel | null;
  invoiceCount: number;
  gross: number;
}

export interface SalesReportDto {
  groupBy: ReportGroupBy;
  range: DateRange;
  buckets: SalesBucket[];
  byChannel: SalesByChannel[];
  totals: {
    invoiceCount: number;
    gross: number;
    discount: number;
    tax: number;
    serviceCharge: number;
  };
}

// ── Items ────────────────────────────────────────────────────────────────────
export interface ItemReportRow {
  itemId: string;
  name: string;
  qty: number;
  revenue: number;
  orderCount: number;
}

export interface ItemsReportDto {
  range: DateRange;
  sortBy: 'top' | 'slow';
  items: ItemReportRow[];
}

// ── Tax ──────────────────────────────────────────────────────────────────────
export interface TaxBreakupRow {
  name: string;
  type: string;
  rate: number;
  amount: number;
}

export interface TaxReportDto {
  range: DateRange;
  breakup: TaxBreakupRow[];
  summary: { invoiceCount: number; taxableTurnover: number; totalTax: number };
}

// ── Payments ─────────────────────────────────────────────────────────────────
export interface PaymentModeRow {
  mode: string;
  count: number;
  gross: number;
  refunded: number;
  net: number;
}

export interface RefundRow {
  method: string;
  count: number;
  amount: number;
}

export interface PaymentsReportDto {
  range: DateRange;
  byMode: PaymentModeRow[];
  refunds: RefundRow[];
  voidedInvoices: number;
}

// ── Staff ────────────────────────────────────────────────────────────────────
export interface WaiterRow {
  userId: string;
  name?: string;
  email?: string;
  orderCount: number;
  gross: number;
  cancelled: number;
}

export interface CashierRow {
  userId: string;
  name?: string;
  email?: string;
  invoiceCount: number;
  gross: number;
  discount: number;
}

export interface ItemVoidActorRow {
  userId: string;
  name?: string;
  email?: string;
  voidCount: number;
}

export interface StaffReportDto {
  range: DateRange;
  waiters: WaiterRow[];
  cashiers: CashierRow[];
  itemVoidsByActor: ItemVoidActorRow[];
}

// ── Footfall ─────────────────────────────────────────────────────────────────
export interface PeakHourRow {
  hour: number;
  count: number;
  gross: number;
}

export interface FootfallReportDto {
  range: DateRange;
  channelMix: Array<{ channel: ReportChannel | null; count: number }>;
  peakHours: PeakHourRow[];
  diningRoom: {
    sessionCount: number;
    avgDwellMinutes: number;
    avgTicket: number;
    avgGuestCount: number;
  };
}

// ── Inventory ────────────────────────────────────────────────────────────────
export interface InventoryConsumptionRow {
  inventoryItemId: string;
  name: string;
  consumed: number;
  unit: string;
  costValue: number | null;
}

export interface InventoryWastageRow {
  inventoryItemId: string;
  name: string;
  wasted: number;
  unit: string;
  costValue: number | null;
}

export interface InventoryLowStockRow {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  threshold: number;
}

export interface InventoryReportDto {
  range: DateRange;
  consumption: InventoryConsumptionRow[];
  wastage: InventoryWastageRow[];
  lowStock: InventoryLowStockRow[];
}

// ── Feedback ─────────────────────────────────────────────────────────────────
export interface FeedbackReportDto {
  range: DateRange;
  summary: {
    total: number;
    avgRating: number;
    positive: number;
    neutral: number;
    negative: number;
  };
  tagDistribution: Array<{ tag: string; count: number }>;
  byChannel: Array<{ channel: ReportChannel | null; count: number; avgRating: number }>;
  trend: Array<{ day: string; count: number; avgRating: number }>;
}

// ── Profitability ────────────────────────────────────────────────────────────
export interface ProfitabilityRow {
  itemId: string;
  name: string;
  qty: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  margin: number;
}

export interface ProfitabilityReportDto {
  range: DateRange;
  items: ProfitabilityRow[];
}

// ── helpers ──────────────────────────────────────────────────────────────────
export const CHANNEL_NAMES: Record<ReportChannel, string> = {
  dine_in: 'Dine-In',
  window: 'Window',
  assisted: 'Assisted',
};

export const PAYMENT_MODE_LABELS: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  wallet: 'Wallet',
  online_prepay: 'Online Prepay',
};

export function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}
