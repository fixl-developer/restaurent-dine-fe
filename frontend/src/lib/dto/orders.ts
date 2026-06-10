/** Order & KDS DTOs mirroring the backend. */

export type OrderChannel = 'dine_in' | 'window' | 'assisted';

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  dine_in: 'Dine-In',
  window: 'Window',
  assisted: 'Assisted',
};

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'settled'
  | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'placed', 'accepted', 'preparing', 'ready', 'served', 'settled', 'cancelled',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Placed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  settled: 'Settled',
  cancelled: 'Cancelled',
};

export type OrderItemStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface OrderItemModifierDto {
  groupId: string;
  groupName: string;
  modifierId: string;
  modifierName: string;
  priceDelta: number;
}

export interface OrderItemDto {
  _id: string;
  itemId?: string;
  comboId?: string;
  variantId?: string;
  name: string;
  variantName?: string;
  qty: number;
  basePrice: number;
  modifiers: OrderItemModifierDto[];
  notes?: string;
  station?: string;
  lineTotal: number;
  status: OrderItemStatus;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
  voidReason?: string;
  voidedById?: string;
}

export interface OrderTimelineEntry {
  _id: string;
  status: string;
  at: string;
  byUserId?: string;
  byName?: string;
  note?: string;
}

export interface GuestRequestDto {
  _id: string;
  type: 'call_waiter' | 'water' | 'bill' | 'other';
  message?: string;
  at: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedById?: string;
}

export interface OrderTotalsDto {
  subtotal: number;
  modifierTotal: number;
  discount: number;
  serviceCharge: number;
  tax: number;
  taxBreakup: Array<{ name: string; type: string; rate: number; amount: number }>;
  roundOff: number;
  grand: number;
}

export interface OrderDto {
  _id: string;
  orderNumber: string;
  channel: OrderChannel;
  status: OrderStatus;
  tableId?: string;
  tableSessionId?: string;
  windowToken?: string;
  guestPhone?: string;
  guestName?: string;
  pickupAt?: string;
  pickedUpAt?: string;
  qrCodeId?: string;
  customerId?: string;
  waiterId?: string;
  acceptedById?: string;
  items: OrderItemDto[];
  totals: OrderTotalsDto;
  estimatedPrepMinutes: number;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  timeline: OrderTimelineEntry[];
  guestRequests: GuestRequestDto[];
  guestNotes?: string;
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// KDS DTOs (the backend's kds.service responses)
export interface KdsItemDto {
  id: string;
  name: string;
  variantName?: string;
  qty: number;
  notes?: string;
  station?: string;
  status: string;
  modifiers: string[];
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
}

export interface KdsOrderDto {
  id: string;
  orderNumber: string;
  channel: OrderChannel;
  tableId?: string;
  windowToken?: string;
  createdAt: string;
  ageSeconds: number;
  items: KdsItemDto[];
}

export interface KdsSnapshot {
  stations: Record<string, KdsOrderDto[]>;
  total: number;
}
