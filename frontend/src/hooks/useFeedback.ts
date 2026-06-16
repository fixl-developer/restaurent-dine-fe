import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type {
  FeedbackDto,
  FeedbackOrderChannel,
  FeedbackSentiment,
  FeedbackSummary,
  ReplyFeedbackInput,
} from '@/lib/dto/feedback';
import type { Paginated } from '@/lib/types';

const FEEDBACK_KEY = ['feedback'] as const;
const SUMMARY_KEY = ['feedback', 'summary'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export interface FeedbackQuery {
  rating?: number;
  minRating?: number;
  maxRating?: number;
  sentiment?: FeedbackSentiment;
  hasReply?: boolean;
  acknowledged?: boolean;
  channel?: FeedbackOrderChannel;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useFeedbackList(query: FeedbackQuery = {}) {
  return useQuery({
    queryKey: [...FEEDBACK_KEY, query],
    queryFn: () =>
      api.list<FeedbackDto>('/feedback', {
        query: {
          rating: query.rating,
          minRating: query.minRating,
          maxRating: query.maxRating,
          sentiment: query.sentiment,
          hasReply: typeof query.hasReply === 'boolean' ? String(query.hasReply) : undefined,
          acknowledged:
            typeof query.acknowledged === 'boolean' ? String(query.acknowledged) : undefined,
          channel: query.channel,
          from: query.from,
          to: query.to,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<FeedbackDto>>,
    staleTime: 10_000,
  });
}

export function useFeedbackItem(id: string | null) {
  return useQuery({
    queryKey: [...FEEDBACK_KEY, id],
    enabled: Boolean(id),
    queryFn: () => api.get<FeedbackDto>(`/feedback/${id}`),
    staleTime: 10_000,
  });
}

export function useFeedbackSummary(opts: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: [...SUMMARY_KEY, opts],
    queryFn: () =>
      api.get<FeedbackSummary>('/feedback/summary', {
        query: { from: opts.from, to: opts.to },
      }),
    staleTime: 30_000,
  });
}

export function useAcknowledgeFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<FeedbackDto>(`/feedback/${id}/acknowledge`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FEEDBACK_KEY });
      toast.success('Feedback acknowledged');
    },
    onError: (err) => handleError(err, 'Acknowledge failed'),
  });
}

export function useReplyFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReplyFeedbackInput }) =>
      api.post<{ feedback: FeedbackDto; mocked: boolean }>(`/feedback/${id}/reply`, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: FEEDBACK_KEY });
      toast.success(data.mocked ? 'Reply queued (mock mode)' : 'Reply sent');
    },
    onError: (err) => handleError(err, 'Reply failed'),
  });
}

// ── Public feedback (landing page testimonials) ─────────────────────────────
export interface PublicReviewDto {
  id: string;
  customerName?: string;
  customerCity?: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface PublicFeedbackResponse {
  reviews: PublicReviewDto[];
  summary: {
    avgRating: number;
    total: number;
  };
}

export function usePublicFeedback(opts: { limit?: number; minRating?: number } = {}) {
  return useQuery({
    queryKey: ['feedback', 'public', opts],
    queryFn: () =>
      api.get<PublicFeedbackResponse>('/feedback/public', {
        noAuth: true,
        query: { limit: opts.limit ?? 12, minRating: opts.minRating ?? 4 },
      }),
    staleTime: 5 * 60_000,
  });
}
