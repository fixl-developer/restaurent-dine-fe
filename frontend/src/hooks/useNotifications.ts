import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type {
  CreateTemplateInput,
  NotificationChannel,
  NotificationEventDef,
  NotificationLogDto,
  NotificationStatus,
  NotificationTemplateDto,
  PreviewTemplateInput,
  PreviewTemplateResult,
  TestSendInput,
  UpdateTemplateInput,
} from '@/lib/dto/notifications';
import type { Paginated } from '@/lib/types';

const EVENTS_KEY = ['notifications', 'events'] as const;
const TEMPLATES_KEY = ['notifications', 'templates'] as const;
const LOGS_KEY = ['notifications', 'logs'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

// ── Events catalogue ─────────────────────────────────────────────────────────
export function useNotificationEvents() {
  return useQuery({
    queryKey: EVENTS_KEY,
    queryFn: () => api.get<NotificationEventDef[]>('/notifications/events'),
    staleTime: Infinity,
  });
}

// ── Templates ────────────────────────────────────────────────────────────────
export interface TemplateQuery {
  eventKey?: string;
  channel?: NotificationChannel;
}

export function useNotificationTemplates(query: TemplateQuery = {}) {
  return useQuery({
    queryKey: [...TEMPLATES_KEY, query],
    queryFn: () =>
      api.get<NotificationTemplateDto[]>('/notifications/templates', {
        query: { eventKey: query.eventKey, channel: query.channel },
      }),
    staleTime: 30_000,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTemplateInput) =>
      api.post<NotificationTemplateDto>('/notifications/templates', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
      toast.success('Template created');
    },
    onError: (err) => handleError(err, 'Create failed'),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateTemplateInput }) =>
      api.patch<NotificationTemplateDto>(`/notifications/templates/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
      toast.success('Template saved');
    },
    onError: (err) => handleError(err, 'Update failed'),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/templates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
      toast.success('Template deleted');
    },
    onError: (err) => handleError(err, 'Delete failed'),
  });
}

export function usePreviewTemplate() {
  return useMutation({
    mutationFn: (input: PreviewTemplateInput) =>
      api.post<PreviewTemplateResult>('/notifications/templates/preview', input),
    onError: (err) => handleError(err, 'Preview failed'),
  });
}

export function useTestSend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TestSendInput) => api.post('/notifications/test', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOGS_KEY });
      toast.success('Test send queued');
    },
    onError: (err) => handleError(err, 'Test send failed'),
  });
}

// ── Logs ─────────────────────────────────────────────────────────────────────
export interface LogQuery {
  eventKey?: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  to?: string;
  relatedOrderId?: string;
  from?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export function useNotificationLogs(query: LogQuery = {}) {
  return useQuery({
    queryKey: [...LOGS_KEY, query],
    queryFn: () =>
      api.list<NotificationLogDto>('/notifications/logs', {
        query: {
          eventKey: query.eventKey,
          channel: query.channel,
          status: query.status,
          to: query.to,
          relatedOrderId: query.relatedOrderId,
          from: query.from,
          // Backend uses `to_` to disambiguate from the recipient `to` filter
          to_: query.toDate,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<NotificationLogDto>>,
    staleTime: 10_000,
  });
}
