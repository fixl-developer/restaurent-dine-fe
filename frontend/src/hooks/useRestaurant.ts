import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { RestaurantDto, RestaurantPatch } from '@/lib/dto/restaurant';

const QUERY_KEY = ['restaurant'] as const;

export function useRestaurant() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get<RestaurantDto>('/restaurant'),
    staleTime: 5 * 60_000,
  });
}

/** Public-facing restaurant info (brand, hours, contact) for the landing page. */
export function usePublicRestaurant() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'public'],
    queryFn: () => api.get<RestaurantDto>('/restaurant/public', { noAuth: true }),
    staleTime: 10 * 60_000,
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: RestaurantPatch) => api.patch<RestaurantDto>('/restaurant', patch),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
      toast.success('Settings saved');
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.message : 'Save failed';
      toast.error(message);
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('logo', file);
      return api.post<{ logoUrl: string; logoPublicId: string }>('/restaurant/logo', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Logo uploaded');
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.message : 'Logo upload failed';
      toast.error(message);
    },
  });
}
