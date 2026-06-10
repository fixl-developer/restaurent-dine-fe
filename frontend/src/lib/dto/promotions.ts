/** Discounts + Coupons + Loyalty DTOs. */

export type DiscountType = 'percent' | 'flat';
export type DiscountScope = 'bill' | 'category' | 'item' | 'channel';
export type PromoChannel = 'dine_in' | 'window' | 'assisted';

export const DISCOUNT_SCOPE_LABELS: Record<DiscountScope, string> = {
  bill: 'Whole Bill',
  category: 'Category',
  item: 'Item',
  channel: 'Channel',
};

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Discounts ────────────────────────────────────────────────────────────────
export interface DiscountDto {
  _id: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  maxDiscount?: number;
  scope: DiscountScope;
  categoryIds: string[];
  itemIds: string[];
  channels: PromoChannel[];
  minBillAmount: number;
  daysOfWeek: number[];
  startTime?: string;
  endTime?: string;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  usageCount: number;
  maxTotalUses?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountInput {
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  maxDiscount?: number;
  scope: DiscountScope;
  categoryIds?: string[];
  itemIds?: string[];
  channels?: PromoChannel[];
  minBillAmount?: number;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  validFrom?: string;
  validUntil?: string;
  maxTotalUses?: number;
}

export type UpdateDiscountInput = Partial<CreateDiscountInput> & { isActive?: boolean };

// ── Coupons ──────────────────────────────────────────────────────────────────
export interface CouponRedemptionDto {
  customerId?: string;
  customerPhone?: string;
  orderId: string;
  amount: number;
  at: string;
}

export interface CouponDto {
  _id: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  maxDiscount?: number;
  scope: DiscountScope;
  categoryIds: string[];
  itemIds: string[];
  channels: PromoChannel[];
  minBillAmount: number;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount: number;
  redemptions: CouponRedemptionDto[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  maxDiscount?: number;
  scope?: DiscountScope;
  categoryIds?: string[];
  itemIds?: string[];
  channels?: PromoChannel[];
  minBillAmount?: number;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  perUserLimit?: number;
}

export type UpdateCouponInput = Partial<CreateCouponInput> & { isActive?: boolean };

// ── Loyalty ──────────────────────────────────────────────────────────────────
export type LoyaltyEarnBase = 'subtotal' | 'grand';

export interface LoyaltyConfigDto {
  _id: string;
  isActive: boolean;
  earnRate: number;
  redeemRate: number;
  minRedeem: number;
  maxRedeemPercent: number;
  earnOn: LoyaltyEarnBase;
  excludeWhenDiscounted: boolean;
  pointsExpiryDays?: number;
  welcomeBonus: number;
  createdAt: string;
  updatedAt: string;
}

export type UpdateLoyaltyConfigInput = Partial<{
  isActive: boolean;
  earnRate: number;
  redeemRate: number;
  minRedeem: number;
  maxRedeemPercent: number;
  earnOn: LoyaltyEarnBase;
  excludeWhenDiscounted: boolean;
  pointsExpiryDays: number;
  welcomeBonus: number;
}>;

export type LoyaltyHistoryType = 'earned' | 'redeemed' | 'adjusted' | 'expired' | 'welcome';

export const LOYALTY_HISTORY_LABELS: Record<LoyaltyHistoryType, string> = {
  earned: 'Earned',
  redeemed: 'Redeemed',
  adjusted: 'Adjusted',
  expired: 'Expired',
  welcome: 'Welcome bonus',
};

export interface LoyaltyHistoryEntry {
  _id: string;
  type: LoyaltyHistoryType;
  points: number;
  balanceAfter: number;
  orderId?: string;
  reason?: string;
  actorId?: string;
  at: string;
}

export interface LoyaltyAccountDto {
  _id: string;
  customerId: string;
  points: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  history: LoyaltyHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyAccountWithCustomer {
  customer: { _id: string; name?: string; phone?: string };
  account: LoyaltyAccountDto;
}

export interface LoyaltyRedeemPreview {
  valid: boolean;
  reason?: string;
  pointsRedeemed: number;
  amount: number;
}

// ── helpers ──────────────────────────────────────────────────────────────────
export function formatDiscountValue(d: { type: DiscountType; value: number }): string {
  return d.type === 'percent' ? `${d.value}%` : `₹${d.value}`;
}

export function isExpired(validUntil?: string): boolean {
  if (!validUntil) return false;
  return new Date(validUntil).getTime() < Date.now();
}
