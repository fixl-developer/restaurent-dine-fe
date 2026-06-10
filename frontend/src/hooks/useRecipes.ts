import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { CreateRecipeInput, RecipeDto, UpdateRecipeInput } from '@/lib/dto/inventory';
import type { Paginated } from '@/lib/types';

const RECIPES_KEY = ['recipes'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export interface RecipeQuery {
  itemId?: string;
  page?: number;
  limit?: number;
}

export function useRecipes(query: RecipeQuery = {}) {
  return useQuery({
    queryKey: [...RECIPES_KEY, query],
    queryFn: () =>
      api.list<RecipeDto>('/recipes', {
        query: { itemId: query.itemId, page: query.page, limit: query.limit ?? 200 },
      }) as Promise<Paginated<RecipeDto>>,
    staleTime: 30_000,
  });
}

export function useRecipe(id: string | null) {
  return useQuery({
    queryKey: [...RECIPES_KEY, id],
    enabled: Boolean(id),
    queryFn: () => api.get<RecipeDto>(`/recipes/${id}`),
    staleTime: 30_000,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecipeInput) => api.post<RecipeDto>('/recipes', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECIPES_KEY });
      toast.success('Recipe saved');
    },
    onError: (err) => handleError(err, 'Save recipe failed'),
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateRecipeInput }) =>
      api.patch<RecipeDto>(`/recipes/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECIPES_KEY });
      toast.success('Recipe updated');
    },
    onError: (err) => handleError(err, 'Update recipe failed'),
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/recipes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECIPES_KEY });
      toast.success('Recipe deleted');
    },
    onError: (err) => handleError(err, 'Delete recipe failed'),
  });
}
