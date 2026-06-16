import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { LandingContentDto, LandingContentPatch } from '@/lib/dto/landing';

const LANDING_KEY = ['landing-content'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

/** Public landing content — gallery + how-it-works + hero copy. */
export function usePublicLandingContent() {
  return useQuery({
    queryKey: [...LANDING_KEY, 'public'],
    queryFn: () =>
      api.get<LandingContentDto>('/landing/public', { noAuth: true }),
    staleTime: 10 * 60_000,
  });
}

/** Admin-only update. */
export function useUpdateLandingContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: LandingContentPatch) =>
      api.patch<LandingContentDto>('/landing', patch),
    onSuccess: (data) => {
      qc.setQueryData([...LANDING_KEY, 'public'], data);
      toast.success('Landing content saved');
    },
    onError: (err) => handleError(err, 'Save failed'),
  });
}

/** Admin: upload a gallery image (multipart). */
export function useUploadGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('image', file);
      return api.post<{ id: string; imageUrl: string }>('/landing/gallery', form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LANDING_KEY });
      toast.success('Image uploaded');
    },
    onError: (err) => handleError(err, 'Upload failed'),
  });
}

/** Admin: remove a gallery image. */
export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/landing/gallery/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LANDING_KEY });
      toast.success('Image removed');
    },
    onError: (err) => handleError(err, 'Delete failed'),
  });
}
