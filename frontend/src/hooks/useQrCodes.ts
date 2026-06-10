import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { env } from '@/config/env';
import type { CreateQrInput, QrAnalyticsDetail, QrCodeDto, QrType } from '@/lib/dto/tables';

const QR_KEY = ['qr-codes'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export function useQrCodes(q: { type?: QrType; tableId?: string } = {}) {
  return useQuery({
    queryKey: [...QR_KEY, q],
    queryFn: () =>
      api.get<QrCodeDto[]>('/qr-codes', {
        query: { type: q.type, tableId: q.tableId },
      }),
    staleTime: 30_000,
  });
}

export function useCreateQr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQrInput) => api.post<QrCodeDto>('/qr-codes', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QR_KEY });
      toast.success('QR code created');
    },
    onError: (err) => handleError(err, 'Create QR failed'),
  });
}

export function useBulkCreateQr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableIds, style }: { tableIds: string[]; style?: 'plain' | 'branded' | 'designed' }) =>
      api.post<{ created: number; qrCodes: QrCodeDto[] }>('/qr-codes/bulk', { tableIds, style }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QR_KEY });
      toast.success(`${data.created} QR codes generated`);
    },
    onError: (err) => handleError(err, 'Bulk QR generation failed'),
  });
}

export function useUpdateQr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<QrCodeDto> }) =>
      api.patch<QrCodeDto>(`/qr-codes/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: QR_KEY }),
    onError: (err) => handleError(err, 'Update QR failed'),
  });
}

export function useRegenerateQrSlug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<QrCodeDto>(`/qr-codes/${id}/regenerate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QR_KEY });
      toast.success('QR slug regenerated');
    },
    onError: (err) => handleError(err, 'Regenerate failed'),
  });
}

export function useDeleteQr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/qr-codes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QR_KEY });
      toast.success('QR code deleted');
    },
    onError: (err) => handleError(err, 'Delete QR failed'),
  });
}

export function useQrAnalytics(id: string | null) {
  return useQuery({
    queryKey: [...QR_KEY, id, 'analytics'],
    queryFn: () => api.get<QrAnalyticsDetail>(`/qr-codes/${id}/analytics`),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

/**
 * Download a QR code asset (PNG, SVG, or PDF). Uses fetch+blob because the
 * backend endpoints are auth-protected — a plain `<a download>` would lack the
 * Bearer token.
 */
export async function downloadQrAsset(id: string, label: string, format: 'png' | 'svg' | 'pdf'): Promise<void> {
  const accessToken = useAuthStore.getState().accessToken;
  const url = `${env.apiBaseUrl}/qr-codes/${id}/${format}`;
  try {
    const res = await fetch(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `${label.replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    toast.success(`Downloaded ${format.toUpperCase()}`);
  } catch (err) {
    toast.error(`Download failed: ${(err as Error).message}`);
  }
}

export async function previewQrAsset(id: string, format: 'png' | 'svg' | 'pdf' = 'png'): Promise<string> {
  const accessToken = useAuthStore.getState().accessToken;
  const res = await fetch(`${env.apiBaseUrl}/qr-codes/${id}/${format}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
