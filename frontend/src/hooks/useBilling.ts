import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { env } from '@/config/env';
import type {
  CashSessionDto, GenerateInvoiceInput, InvoiceDto, PaymentDto, RecordPaymentInput, UpiQrResponse,
} from '@/lib/dto/billing';
import type { Paginated } from '@/lib/types';

const INVOICES_KEY = ['invoices'] as const;
const PAYMENTS_KEY = ['payments'] as const;
const CASH_KEY = ['cash-sessions'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

// ── Invoices ──
export interface InvoiceQuery {
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'refunded';
  status?: 'final' | 'void';
  channel?: 'dine_in' | 'window' | 'assisted';
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export function useInvoices(query: InvoiceQuery = {}) {
  return useQuery({
    queryKey: [...INVOICES_KEY, query],
    queryFn: () =>
      api.list<InvoiceDto>('/invoices', {
        query: {
          paymentStatus: query.paymentStatus,
          status: query.status,
          channel: query.channel,
          from: query.from,
          to: query.to,
          q: query.q,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<InvoiceDto>>,
    staleTime: 15_000,
  });
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: [...INVOICES_KEY, id],
    enabled: Boolean(id),
    queryFn: () => api.get<InvoiceDto>(`/invoices/${id}`),
    staleTime: 5_000,
  });
}

export function useGenerateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: GenerateInvoiceInput }) =>
      api.post<InvoiceDto>(`/billing/orders/${orderId}/bill`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Invoice generated');
    },
    onError: (err) => handleError(err, 'Generate invoice failed'),
  });
}

export function useSplitInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, mode, equalCount, splits,
    }: {
      id: string;
      mode: 'equal' | 'item' | 'custom';
      equalCount?: number;
      splits?: Array<{ label: string; amount?: number; orderItemIds?: string[] }>;
    }) =>
      api.post<InvoiceDto>(`/invoices/${id}/split`, { mode, equalCount, splits }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
      toast.success('Bill split');
    },
    onError: (err) => handleError(err, 'Split failed'),
  });
}

export function useApplyDiscountToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.patch<InvoiceDto>(`/invoices/${id}/discount`, { amount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
      toast.success('Discount applied');
    },
    onError: (err) => handleError(err, 'Discount failed'),
  });
}

export function useVoidInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<InvoiceDto>(`/invoices/${id}/void`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
      toast.success('Invoice voided');
    },
    onError: (err) => handleError(err, 'Void failed'),
  });
}

export async function downloadInvoicePdf(id: string, invoiceNumber: string): Promise<void> {
  const accessToken = useAuthStore.getState().accessToken;
  try {
    const res = await fetch(`${env.apiBaseUrl}/invoices/${id}/pdf`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber.replace(/[\\/]/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    toast.error(`Download failed: ${(err as Error).message}`);
  }
}

export async function openInvoicePdf(id: string): Promise<void> {
  const accessToken = useAuthStore.getState().accessToken;
  try {
    const res = await fetch(`${env.apiBaseUrl}/invoices/${id}/pdf`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    toast.error(`Open PDF failed: ${(err as Error).message}`);
  }
}

// ── Payments ──
export interface PaymentQuery {
  invoiceId?: string;
  orderId?: string;
  mode?: 'cash' | 'upi' | 'card' | 'wallet' | 'online_prepay';
  status?: 'pending' | 'success' | 'failed' | 'refunded' | 'cancelled';
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function usePayments(query: PaymentQuery = {}) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, query],
    queryFn: () =>
      api.list<PaymentDto>('/payments', {
        query: {
          invoiceId: query.invoiceId,
          orderId: query.orderId,
          mode: query.mode,
          status: query.status,
          from: query.from,
          to: query.to,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<PaymentDto>>,
    staleTime: 15_000,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, input }: { invoiceId: string; input: RecordPaymentInput }) =>
      api.post<PaymentDto>(`/payments/invoices/${invoiceId}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
      qc.invalidateQueries({ queryKey: PAYMENTS_KEY });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Payment recorded');
    },
    onError: (err) => handleError(err, 'Record payment failed'),
  });
}

export function useUpiQr() {
  return useMutation({
    mutationFn: (invoiceId: string) => api.post<UpiQrResponse>('/payments/upi/qr', { invoiceId }),
    onError: (err) => handleError(err, 'UPI QR generation failed'),
  });
}

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId, amount, reason, method,
    }: { paymentId: string; amount: number; reason: string; method?: 'cash' | 'gateway' | 'wallet' | 'manual' }) =>
      api.post(`/payments/${paymentId}/refund`, { amount, reason, method }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENTS_KEY });
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
      toast.success('Refund processed');
    },
    onError: (err) => handleError(err, 'Refund failed'),
  });
}

// ── Cash sessions ──
export function useCurrentCashSession() {
  return useQuery({
    queryKey: [...CASH_KEY, 'current'],
    queryFn: () => api.get<CashSessionDto | null>('/cash-sessions/current'),
    staleTime: 10_000,
  });
}

export function useCashSessions(query: { cashierId?: string; status?: 'open' | 'closed' } = {}) {
  return useQuery({
    queryKey: [...CASH_KEY, query],
    queryFn: () =>
      api.list<CashSessionDto>('/cash-sessions', {
        query: { cashierId: query.cashierId, status: query.status, limit: 50 },
      }) as Promise<Paginated<CashSessionDto>>,
    staleTime: 15_000,
  });
}

export function useOpenCashSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ openingFloat, notes }: { openingFloat: number; notes?: string }) =>
      api.post<CashSessionDto>('/cash-sessions/open', { openingFloat, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CASH_KEY });
      toast.success('Cash session opened');
    },
    onError: (err) => handleError(err, 'Open session failed'),
  });
}

export function useCloseCashSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, actualCash, denominations, notes,
    }: { id: string; actualCash: number; denominations?: Record<string, number>; notes?: string }) =>
      api.post<CashSessionDto>(`/cash-sessions/${id}/close`, { actualCash, denominations, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CASH_KEY });
      toast.success('Cash session closed');
    },
    onError: (err) => handleError(err, 'Close session failed'),
  });
}
