import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { KdsOrderDto, KdsSnapshot, OrderItemStatus } from '@/lib/dto/orders';

const KDS_KEY = ['kds'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export function useKdsQueue(station?: string) {
  return useQuery({
    queryKey: [...KDS_KEY, 'queue', station ?? null],
    queryFn: () =>
      api.get<KdsOrderDto[]>('/kds/queue', { query: { station } }),
    staleTime: 5_000,
    refetchInterval: 15_000, // auto-tick so age counters stay fresh even if a socket misses
  });
}

export function useKdsSnapshot() {
  return useQuery({
    queryKey: [...KDS_KEY, 'snapshot'],
    queryFn: () => api.get<KdsSnapshot>('/kds/snapshot'),
    staleTime: 10_000,
  });
}

export function useKdsRecall(orderId: string | null) {
  return useQuery({
    queryKey: [...KDS_KEY, 'recall', orderId],
    enabled: Boolean(orderId),
    queryFn: () => api.get(`/kds/orders/${orderId}/recall`),
    staleTime: 60_000,
  });
}

export function useUpdateKdsItemStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId, itemId, status, station,
    }: { orderId: string; itemId: string; status: OrderItemStatus; station?: string }) =>
      api.patch(`/kds/orders/${orderId}/items/${itemId}/status`, { status, station }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KDS_KEY });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => handleError(err, 'Status update failed'),
  });
}
