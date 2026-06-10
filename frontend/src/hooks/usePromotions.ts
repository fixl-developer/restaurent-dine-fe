import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type {
  CouponDto,
  CreateCouponInput,
  CreateDiscountInput,
  DiscountDto,
  DiscountScope,
  LoyaltyAccountWithCustomer,
  LoyaltyConfigDto,
  LoyaltyRedeemPreview,
  UpdateCouponInput,
  UpdateDiscountInput,
  UpdateLoyaltyConfigInput,
} from '@/lib/dto/promotions';
import type { Paginated } from '@/lib/types';

const DISCOUNTS_KEY = ['discounts'] as const;
const COUPONS_KEY = ['coupons'] as const;
const LOYALTY_KEY = ['loyalty'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

// ── Discounts ────────────────────────────────────────────────────────────────
export interface DiscountQuery {
  isActive?: boolean;
  scope?: DiscountScope;
  page?: number;
  limit?: number;
}

export function useDiscounts(query: DiscountQuery = {}) {
  return useQuery({
    queryKey: [...DISCOUNTS_KEY, query],
    queryFn: () =>
      api.list<DiscountDto>('/discounts', {
        query: {
          isActive: typeof query.isActive === 'boolean' ? String(query.isActive) : undefined,
          scope: query.scope,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<DiscountDto>>,
    staleTime: 30_000,
  });
}

export function useCreateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDiscountInput) => api.post<DiscountDto>('/discounts', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISCOUNTS_KEY });
      toast.success('Discount created');
    },
    onError: (err) => handleError(err, 'Create discount failed'),
  });
}

export function useUpdateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateDiscountInput }) =>
      api.patch<DiscountDto>(`/discounts/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISCOUNTS_KEY });
      toast.success('Discount updated');
    },
    onError: (err) => handleError(err, 'Update discount failed'),
  });
}

export function useDeleteDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/discounts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISCOUNTS_KEY });
      toast.success('Discount deleted');
    },
    onError: (err) => handleError(err, 'Delete failed'),
  });
}

// ── Coupons ──────────────────────────────────────────────────────────────────
export interface CouponQuery {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function useCoupons(query: CouponQuery = {}) {
  return useQuery({
    queryKey: [...COUPONS_KEY, query],
    queryFn: () =>
      api.list<CouponDto>('/coupons', {
        query: {
          isActive: typeof query.isActive === 'boolean' ? String(query.isActive) : undefined,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<CouponDto>>,
    staleTime: 30_000,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCouponInput) =>
      api.post<CouponDto>('/coupons', { ...input, code: input.code.toUpperCase() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COUPONS_KEY });
      toast.success('Coupon created');
    },
    onError: (err) => handleError(err, 'Create coupon failed'),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateCouponInput }) =>
      api.patch<CouponDto>(`/coupons/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COUPONS_KEY });
      toast.success('Coupon updated');
    },
    onError: (err) => handleError(err, 'Update coupon failed'),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COUPONS_KEY });
      toast.success('Coupon deleted');
    },
    onError: (err) => handleError(err, 'Delete failed'),
  });
}

// ── Loyalty config ───────────────────────────────────────────────────────────
export function useLoyaltyConfig() {
  return useQuery({
    queryKey: [...LOYALTY_KEY, 'config'],
    queryFn: () => api.get<LoyaltyConfigDto>('/loyalty/config'),
    staleTime: 60_000,
  });
}

export function useUpdateLoyaltyConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateLoyaltyConfigInput) =>
      api.patch<LoyaltyConfigDto>('/loyalty/config', patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOYALTY_KEY });
      toast.success('Loyalty settings saved');
    },
    onError: (err) => handleError(err, 'Save failed'),
  });
}

// ── Loyalty account ──────────────────────────────────────────────────────────
export function useLoyaltyAccount(customerId: string | null) {
  return useQuery({
    queryKey: [...LOYALTY_KEY, 'account', customerId],
    enabled: Boolean(customerId),
    queryFn: () => api.get<LoyaltyAccountWithCustomer>(`/loyalty/accounts/${customerId}`),
    staleTime: 15_000,
  });
}

export function useAdjustLoyaltyPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      delta,
      reason,
    }: {
      customerId: string;
      delta: number;
      reason: string;
    }) =>
      api.post(`/loyalty/accounts/${customerId}/adjust`, { delta, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOYALTY_KEY });
      toast.success('Points adjusted');
    },
    onError: (err) => handleError(err, 'Adjust failed'),
  });
}

export function usePreviewLoyaltyRedeem() {
  return useMutation({
    mutationFn: (input: { customerId: string; pointsRequested: number; billGrand: number }) =>
      api.post<LoyaltyRedeemPreview>('/loyalty/redeem-preview', input),
    onError: (err) => handleError(err, 'Preview failed'),
  });
}
