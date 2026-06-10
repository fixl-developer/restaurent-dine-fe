import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type {
  CreateTableInput,
  TableDto,
  TableSessionDto,
  TableStatus,
} from '@/lib/dto/tables';

const TABLES_KEY = ['tables'] as const;
const SESSIONS_KEY = ['table-sessions'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

// ── Tables ──
export interface TableQuery {
  status?: TableStatus;
  zone?: string;
  includeInactive?: boolean;
}

export function useTables(q: TableQuery = {}) {
  return useQuery({
    queryKey: [...TABLES_KEY, q],
    queryFn: () =>
      api.get<TableDto[]>('/tables', {
        query: {
          status: q.status,
          zone: q.zone,
          includeInactive: q.includeInactive ? 'true' : undefined,
        },
      }),
    staleTime: 15_000,
  });
}

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTableInput) => api.post<TableDto>('/tables', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABLES_KEY });
      toast.success('Table added');
    },
    onError: (err) => handleError(err, 'Add table failed'),
  });
}

export function useBulkCreateTables() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tables: CreateTableInput[]) =>
      api.post<TableDto[]>('/tables/bulk', { tables }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABLES_KEY });
      toast.success('Tables added');
    },
    onError: (err) => handleError(err, 'Bulk create failed'),
  });
}

export function useUpdateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TableDto> }) =>
      api.patch<TableDto>(`/tables/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: TABLES_KEY }),
    onError: (err) => handleError(err, 'Update table failed'),
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tables/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABLES_KEY });
      toast.success('Table deleted');
    },
    onError: (err) => handleError(err, 'Delete table failed'),
  });
}

export function useTableStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      api.patch<TableDto>(`/tables/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      const previous = qc.getQueriesData<TableDto[]>({ queryKey: TABLES_KEY });
      qc.setQueriesData<TableDto[]>({ queryKey: TABLES_KEY }, (old) =>
        old ? old.map((t) => (t._id === id ? { ...t, status } : t)) : old,
      );
      return { previous };
    },
    onError: (err, _v, ctx) => {
      ctx?.previous.forEach(([k, v]) => qc.setQueryData(k, v));
      handleError(err, 'Status change failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TABLES_KEY }),
  });
}

export function useMergeTables() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ primaryId, secondaryIds }: { primaryId: string; secondaryIds: string[] }) =>
      api.post<TableDto>(`/tables/${primaryId}/merge`, { secondaryIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABLES_KEY });
      toast.success('Tables merged');
    },
    onError: (err) => handleError(err, 'Merge failed'),
  });
}

export function useSplitTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (primaryId: string) => api.post<TableDto>(`/tables/${primaryId}/split`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABLES_KEY });
      toast.success('Tables split');
    },
    onError: (err) => handleError(err, 'Split failed'),
  });
}

export function useMoveTableSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fromTableId, toTableId }: { fromTableId: string; toTableId: string }) =>
      api.post(`/tables/${fromTableId}/move`, { toTableId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABLES_KEY });
      toast.success('Session moved');
    },
    onError: (err) => handleError(err, 'Move failed'),
  });
}

// ── Table sessions ──
export function useOpenTableSessions() {
  return useQuery({
    queryKey: [...SESSIONS_KEY, 'open'],
    queryFn: () => api.get<TableSessionDto[]>('/table-sessions/open'),
    staleTime: 15_000,
  });
}

export function useOpenTableSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, guestCount }: { tableId: string; guestCount?: number }) =>
      api.post<TableSessionDto>('/table-sessions', { tableId, guestCount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABLES_KEY });
      qc.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success('Session opened');
    },
    onError: (err) => handleError(err, 'Open session failed'),
  });
}

export function useCloseTableSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<TableSessionDto>(`/table-sessions/${id}/close`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABLES_KEY });
      qc.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success('Session closed');
    },
    onError: (err) => handleError(err, 'Close session failed'),
  });
}
