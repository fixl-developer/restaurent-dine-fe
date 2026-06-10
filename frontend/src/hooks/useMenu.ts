import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type {
  CategoryDto,
  CreateCategoryInput,
  CreateItemInput,
  ItemDto,
  ModifierGroupDto,
  UpdateItemInput,
} from '@/lib/dto/menu';
import type { Paginated } from '@/lib/types';

const CATEGORIES_KEY = ['menu', 'categories'] as const;
const ITEMS_KEY = ['menu', 'items'] as const;
const MODIFIER_GROUPS_KEY = ['menu', 'modifier-groups'] as const;

function handleError(err: unknown, fallback: string) {
  const message = err instanceof ApiError ? err.message : fallback;
  toast.error(message);
}

// ── Categories ──────────────────────────────────────────────────────────────
export function useCategories(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, opts.includeInactive ?? false],
    queryFn: () =>
      api.get<CategoryDto[]>('/categories', {
        query: { includeInactive: opts.includeInactive ? 'true' : undefined },
      }),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.post<CategoryDto>('/categories', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success('Category added');
    },
    onError: (err) => handleError(err, 'Create category failed'),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CategoryDto> }) =>
      api.patch<CategoryDto>(`/categories/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
    onError: (err) => handleError(err, 'Update category failed'),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success('Category deleted');
    },
    onError: (err) => handleError(err, 'Delete category failed'),
  });
}

export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: string[]) => api.post('/categories/reorder', { order }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
    onError: (err) => handleError(err, 'Reorder failed'),
  });
}

// ── Items ───────────────────────────────────────────────────────────────────
export interface ItemQuery {
  q?: string;
  categoryId?: string;
  foodType?: 'veg' | 'non_veg' | 'egg' | 'vegan';
  is86?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function useItems(query: ItemQuery = {}) {
  return useQuery({
    queryKey: [...ITEMS_KEY, query],
    queryFn: () =>
      api.list<ItemDto>('/items', {
        query: {
          q: query.q,
          categoryId: query.categoryId,
          foodType: query.foodType,
          is86: query.is86,
          isActive: query.isActive,
          page: query.page,
          limit: query.limit ?? 200,
        },
      }) as Promise<Paginated<ItemDto>>,
    staleTime: 30_000,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateItemInput) => api.post<ItemDto>('/items', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
      toast.success('Item added');
    },
    onError: (err) => handleError(err, 'Create item failed'),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateItemInput }) =>
      api.patch<ItemDto>(`/items/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
      toast.success('Item updated');
    },
    onError: (err) => handleError(err, 'Update item failed'),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
      toast.success('Item deleted');
    },
    onError: (err) => handleError(err, 'Delete item failed'),
  });
}

export function useToggleItem86() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is86 }: { id: string; is86: boolean }) =>
      api.patch<ItemDto>(`/items/${id}/86`, { is86 }),
    onMutate: async ({ id, is86 }) => {
      // Optimistic update across all cached item lists
      const previous = qc.getQueriesData<Paginated<ItemDto>>({ queryKey: ITEMS_KEY });
      qc.setQueriesData<Paginated<ItemDto>>({ queryKey: ITEMS_KEY }, (old) =>
        old ? { ...old, items: old.items.map((i) => (i._id === id ? { ...i, is86 } : i)) } : old,
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      handleError(err, '86 toggle failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ITEMS_KEY }),
  });
}

export function useUploadItemImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const form = new FormData();
      form.append('image', file);
      return api.post<{ imageUrl: string; imagePublicId: string }>(`/items/${id}/image`, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
      toast.success('Image uploaded');
    },
    onError: (err) => handleError(err, 'Image upload failed'),
  });
}

export function useBulkPriceUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Array<{ id: string; basePrice: number }>) =>
      api.post<{ matched: number; modified: number }>('/items/bulk-price', { updates }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
      toast.success('Bulk prices updated');
    },
    onError: (err) => handleError(err, 'Bulk price update failed'),
  });
}

// ── Modifier groups (read-only for Phase 3; full CRUD lands in a later sub-task)
export function useModifierGroups() {
  return useQuery({
    queryKey: MODIFIER_GROUPS_KEY,
    queryFn: () => api.get<ModifierGroupDto[]>('/modifier-groups'),
    staleTime: 60_000,
  });
}

// ── Bulk menu import/export ────────────────────────────────────────────────
export function useMenuImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post<{ total: number; created: number; updated: number; errors: Array<{ row: number; reason: string }> }>('/menu/import', form);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      if (data.errors.length === 0) {
        toast.success(`Imported ${data.created + data.updated} rows`);
      } else {
        toast.warning(`Imported ${data.created + data.updated} rows, ${data.errors.length} errors`);
      }
    },
    onError: (err) => handleError(err, 'Menu import failed'),
  });
}

export function menuExportUrl(): string {
  return api.url('/menu/export');
}
