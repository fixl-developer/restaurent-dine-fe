/** Customer + history DTOs. */

export interface FavoriteItemDto {
  itemId: string;
  name: string;
  count: number;
  lastAt: string;
}

export interface CustomerDto {
  _id: string;
  phone?: string;
  name?: string;
  email?: string;
  tags: string[];
  allergens: string[];
  visitCount: number;
  lifetimeValue: number;
  averageBill: number;
  firstVisitAt?: string;
  lastVisitAt?: string;
  favoriteItems: FavoriteItemDto[];
  notes?: string;
  marketingOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  phone?: string;
  name?: string;
  email?: string;
  tags?: string[];
  allergens?: string[];
  notes?: string;
  marketingOptIn?: boolean;
}

export interface UpdateCustomerInput {
  phone?: string;
  name?: string;
  email?: string;
  allergens?: string[];
  notes?: string;
  marketingOptIn?: boolean;
}

export interface CustomerHistoryEntry {
  id: string;
  orderNumber: string;
  channel: 'dine_in' | 'window' | 'assisted';
  status: string;
  grand: number;
  itemCount: number;
  createdAt: string;
  invoiceNumber?: string;
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'refunded';
}

export interface CustomerHistoryResponse {
  customer: CustomerDto;
  orders: CustomerHistoryEntry[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function customerInitials(c: Pick<CustomerDto, 'name' | 'phone' | 'email'>): string {
  const source = c.name || c.email || c.phone || '?';
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1][0] ?? '')).toUpperCase();
}

export function customerDisplayName(c: Pick<CustomerDto, 'name' | 'phone' | 'email'>): string {
  return c.name || c.phone || c.email || 'Guest';
}
