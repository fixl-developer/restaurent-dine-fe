import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { OrderChannel, OrderDto, OrderStatus } from '@/lib/dto/orders';
import type { Paginated } from '@/lib/types';

const ORDERS_KEY = ['orders'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export interface OrderQuery {
  status?: OrderStatus;
  channel?: OrderChannel;
  tableId?: string;
  waiterId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useOrders(query: OrderQuery = {}) {
  return useQuery({
    queryKey: [...ORDERS_KEY, query],
    queryFn: () =>
      api.list<OrderDto>('/orders', {
        query: {
          status: query.status,
          channel: query.channel,
          tableId: query.tableId,
          waiterId: query.waiterId,
          from: query.from,
          to: query.to,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<OrderDto>>,
    staleTime: 10_000,
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: [...ORDERS_KEY, id],
    enabled: Boolean(id),
    queryFn: () => api.get<OrderDto>(`/orders/${id}`),
    staleTime: 5_000,
  });
}

export function useAcceptOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<OrderDto>(`/orders/${id}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
      toast.success('Order accepted');
    },
    onError: (err) => handleError(err, 'Accept failed'),
  });
}

export function useServeOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<OrderDto>(`/orders/${id}/serve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
      toast.success('Order served');
    },
    onError: (err) => handleError(err, 'Serve failed'),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<OrderDto>(`/orders/${id}/cancel`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
      toast.success('Order cancelled');
    },
    onError: (err) => handleError(err, 'Cancel failed'),
  });
}

export function useVoidOrderItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, itemId, reason }: { orderId: string; itemId: string; reason: string }) =>
      api.patch<OrderDto>(`/orders/${orderId}/items/${itemId}/void`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
      toast.success('Item voided');
    },
    onError: (err) => handleError(err, 'Void failed'),
  });
}

export function useWindowTokenScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (windowToken: string) =>
      api.post<OrderDto>('/orders/window/token-scan', { windowToken }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
      toast.success('Order marked picked up');
    },
    onError: (err) => handleError(err, 'Token scan failed'),
  });
}

export function useResolveGuestRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, requestId }: { orderId: string; requestId: string }) =>
      api.post(`/orders/${orderId}/requests/${requestId}/resolve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ORDERS_KEY }),
    onError: (err) => handleError(err, 'Resolve failed'),
  });
}
