import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type {
  CreateReservationInput,
  ReservationDto,
  ReservationStatus,
} from '@/lib/dto/reservations';
import type { Paginated } from '@/lib/types';

const RESERVATIONS_KEY = ['reservations'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

// ── Guest: create reservation (public, no auth) ─────────────────────────────
export function useCreateGuestReservation() {
  return useMutation({
    mutationFn: (input: CreateReservationInput) =>
      api.post<ReservationDto>('/guest/reservations', input, { noAuth: true }),
    onError: (err) => handleError(err, 'Reservation failed'),
  });
}

// ── Admin: list/manage reservations ─────────────────────────────────────────
export interface ReservationQuery {
  status?: ReservationStatus;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export function useReservations(query: ReservationQuery = {}) {
  return useQuery({
    queryKey: [...RESERVATIONS_KEY, query],
    queryFn: () =>
      api.list<ReservationDto>('/reservations', {
        query: {
          status: query.status,
          from: query.from,
          to: query.to,
          q: query.q,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<ReservationDto>>,
    staleTime: 15_000,
  });
}

export function useUpdateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ReservationDto> }) =>
      api.patch<ReservationDto>(`/reservations/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESERVATIONS_KEY });
      toast.success('Reservation updated');
    },
    onError: (err) => handleError(err, 'Update reservation failed'),
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<ReservationDto>(`/reservations/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESERVATIONS_KEY });
      toast.success('Reservation cancelled');
    },
    onError: (err) => handleError(err, 'Cancel failed'),
  });
}
