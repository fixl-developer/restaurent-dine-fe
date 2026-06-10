import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type {
  AdjustStockInput,
  CreateInventoryInput,
  InventoryItemDto,
  InventorySnapshot,
  StockInInput,
  StockMovementDto,
  StockMovementType,
  StockOutInput,
  UpdateInventoryInput,
} from '@/lib/dto/inventory';
import type { Paginated } from '@/lib/types';

const INVENTORY_KEY = ['inventory'] as const;
const MOVEMENTS_KEY = ['inventory', 'movements'] as const;
const SNAPSHOT_KEY = ['inventory', 'snapshot'] as const;
const LOW_STOCK_KEY = ['inventory', 'low-stock'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export interface InventoryQuery {
  q?: string;
  lowStock?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function useInventory(query: InventoryQuery = {}) {
  return useQuery({
    queryKey: [...INVENTORY_KEY, query],
    queryFn: () =>
      api.list<InventoryItemDto>('/inventory', {
        query: {
          q: query.q,
          lowStock: query.lowStock ? 'true' : undefined,
          isActive: typeof query.isActive === 'boolean' ? String(query.isActive) : undefined,
          page: query.page,
          limit: query.limit ?? 200,
        },
      }) as Promise<Paginated<InventoryItemDto>>,
    staleTime: 15_000,
  });
}

export function useInventoryItem(id: string | null) {
  return useQuery({
    queryKey: [...INVENTORY_KEY, id],
    enabled: Boolean(id),
    queryFn: () => api.get<InventoryItemDto>(`/inventory/${id}`),
    staleTime: 10_000,
  });
}

export function useLowStockInventory() {
  return useQuery({
    queryKey: LOW_STOCK_KEY,
    queryFn: () => api.get<InventoryItemDto[]>('/inventory/low-stock'),
    staleTime: 15_000,
  });
}

export function useInventorySnapshot() {
  return useQuery({
    queryKey: SNAPSHOT_KEY,
    queryFn: () => api.get<InventorySnapshot>('/inventory/snapshot'),
    staleTime: 15_000,
  });
}

export interface MovementsQuery {
  inventoryItemId?: string;
  type?: StockMovementType;
  orderId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useInventoryMovements(query: MovementsQuery = {}) {
  return useQuery({
    queryKey: [...MOVEMENTS_KEY, query],
    queryFn: () =>
      api.list<StockMovementDto>('/inventory/movements', {
        query: {
          inventoryItemId: query.inventoryItemId,
          type: query.type,
          orderId: query.orderId,
          from: query.from,
          to: query.to,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<StockMovementDto>>,
    staleTime: 10_000,
  });
}

export function useItemMovements(id: string | null, limit = 50) {
  return useQuery({
    queryKey: [...MOVEMENTS_KEY, 'by-item', id, limit],
    enabled: Boolean(id),
    queryFn: () =>
      api.list<StockMovementDto>(`/inventory/${id}/movements`, {
        query: { limit },
      }) as Promise<Paginated<StockMovementDto>>,
    staleTime: 10_000,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: INVENTORY_KEY });
  qc.invalidateQueries({ queryKey: SNAPSHOT_KEY });
  qc.invalidateQueries({ queryKey: LOW_STOCK_KEY });
  qc.invalidateQueries({ queryKey: MOVEMENTS_KEY });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInventoryInput) => api.post<InventoryItemDto>('/inventory', input),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Inventory item added');
    },
    onError: (err) => handleError(err, 'Add item failed'),
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateInventoryInput }) =>
      api.patch<InventoryItemDto>(`/inventory/${id}`, patch),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Item updated');
    },
    onError: (err) => handleError(err, 'Update failed'),
  });
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/${id}`),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Item deleted');
    },
    onError: (err) => handleError(err, 'Delete failed'),
  });
}

export function useStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StockInInput }) =>
      api.post<{ item: InventoryItemDto; movement: StockMovementDto }>(
        `/inventory/${id}/stock-in`,
        input,
      ),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Stock added');
    },
    onError: (err) => handleError(err, 'Stock-in failed'),
  });
}

export function useStockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StockOutInput }) =>
      api.post<{ item: InventoryItemDto; movement: StockMovementDto }>(
        `/inventory/${id}/stock-out`,
        input,
      ),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Stock removed');
    },
    onError: (err) => handleError(err, 'Stock-out failed'),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdjustStockInput }) =>
      api.post<{ item: InventoryItemDto; movement: StockMovementDto }>(
        `/inventory/${id}/adjust`,
        input,
      ),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Stock adjusted');
    },
    onError: (err) => handleError(err, 'Adjust failed'),
  });
}
