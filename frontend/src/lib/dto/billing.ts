/** Billing/Invoices/Payments/Cash sessions DTOs. */

export type PaymentMode = 'cash' | 'upi' | 'card' | 'wallet' | 'online_prepay';
export type PaymentProvider = 'razorpay' | 'phonepe' | 'stripe';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded' | 'cancelled';
export type SplitMode = 'none' | 'equal' | 'item' | 'custom';
export type InvoiceStatus = 'final' | 'void';
export type InvoicePaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  wallet: 'Wallet',
  online_prepay: 'Online Prepay',
};

export interface InvoiceLineItemDto {
  orderItemId?: string;
  name: string;
  variantName?: string;
  hsnCode?: string;
  qty: number;
  unitPrice: number;
  modifierTotal: number;
  lineSubtotal: number;
  taxBreakup: Array<{ name: string; type: string; rate: number; amount: number }>;
  lineTotal: number;
}

export interface InvoiceSplitDto {
  _id: string;
  label: string;
  amount: number;
  orderItemIds: string[];
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid';
}

export interface InvoiceDto {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumberSnapshot: string;
  issueDate: string;
  billedAt: string;
  cashierId?: string;
  cashierName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerGstin?: string;
  tableNumber?: string;
  channel: 'dine_in' | 'window' | 'assisted';
  restaurantSnapshot: {
    name: string;
    gstin?: string;
    fssai?: string;
    address?: string;
    contactPhone?: string;
    contactEmail?: string;
    brandColor?: string;
    logoUrl?: string;
    headerLines: string[];
    footerLines: string[];
  };
  lineItems: InvoiceLineItemDto[];
  subtotal: number;
  modifierTotal: number;
  discount: number;
  serviceCharge: number;
  taxBreakup: Array<{ name: string; type: string; rate: number; amount: number }>;
  tax: number;
  roundOff: number;
  grand: number;
  amountInWords: string;
  amountPaid: number;
  amountDue: number;
  paymentStatus: InvoicePaymentStatus;
  splitMode: SplitMode;
  splits: InvoiceSplitDto[];
  status: InvoiceStatus;
  promotions?: {
    discount?: { id: string; name: string; amount: number };
    coupon?: { id: string; code: string; amount: number };
    loyalty?: { pointsRedeemed: number; amount: number };
  };
  loyaltyPointsEarned?: number;
  voidReason?: string;
  voidedAt?: string;
}

export interface GenerateInvoiceInput {
  discount?: number;
  discountId?: string;
  couponCode?: string;
  loyaltyPoints?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerGstin?: string;
}

export interface PaymentDto {
  _id: string;
  invoiceId: string;
  orderId: string;
  splitId?: string;
  mode: PaymentMode;
  provider?: PaymentProvider;
  amount: number;
  status: PaymentStatus;
  txnRef?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  cashTendered?: number;
  changeReturned?: number;
  cashierId?: string;
  cashSessionId?: string;
  receivedAt?: string;
  notes?: string;
  refundedAmount: number;
  createdAt: string;
}

export interface RecordPaymentInput {
  splitId?: string;
  mode: PaymentMode;
  amount: number;
  provider?: PaymentProvider;
  txnRef?: string;
  cashTendered?: number;
  notes?: string;
}

export interface UpiQrResponse {
  paymentId: string;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  mocked: boolean;
  upiDeeplink?: string;
  razorpayKeyId: string | null;
}

export interface CashSessionDto {
  _id: string;
  cashierId: string;
  cashierName?: string;
  openingFloat: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  notes?: string;
}
