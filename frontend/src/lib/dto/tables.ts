/** Tables, sessions, and QR codes — DTOs mirroring backend. */

export type TableStatus = 'vacant' | 'seated' | 'ordered' | 'awaiting_bill' | 'cleaning';
export type TableShape = 'round' | 'square' | 'rect';

export interface TablePosition {
  x: number;
  y: number;
}

export const TABLE_STATUSES: TableStatus[] = [
  'vacant', 'seated', 'ordered', 'awaiting_bill', 'cleaning',
];

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  vacant: 'Vacant',
  seated: 'Seated',
  ordered: 'Ordered',
  awaiting_bill: 'Awaiting Bill',
  cleaning: 'Cleaning',
};

export interface TableDto {
  _id: string;
  number: string;
  zone?: string;
  capacity: number;
  status: TableStatus;
  shape: TableShape;
  position?: TablePosition;
  currentSessionId?: string;
  mergedWithTableIds: string[];
  mergedIntoTableId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TableSessionDto {
  _id: string;
  tableId: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  guestCount: number;
  waiterId?: string;
  customerId?: string;
  orderIds: string[];
  runningTotal: number;
  notes?: string;
}

export interface CreateTableInput {
  number: string;
  zone?: string;
  capacity?: number;
  shape?: TableShape;
  position?: TablePosition;
  sortOrder?: number;
}

export type QrType = 'table' | 'window';
export type QrStyle = 'plain' | 'branded' | 'designed';

export interface QrCodeAnalytics {
  scans: number;
  orders: number;
  revenue: number;
  lastScanAt?: string;
}

export interface QrCodeDto {
  _id: string;
  type: QrType;
  slug: string;
  label: string;
  tableId?: string;
  style: QrStyle;
  imageUrl?: string;
  imagePublicId?: string;
  isActive: boolean;
  analytics: QrCodeAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface QrAnalyticsDetail {
  qrId: string;
  label: string;
  scans: number;
  orders: number;
  revenue: number;
  averageBill: number;
  conversionRate: number;
  abandonmentRate: number;
  lastScanAt?: string;
}

export interface CreateQrInput {
  type: QrType;
  tableId?: string;
  label: string;
  style?: QrStyle;
}
