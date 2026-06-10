import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type {
  CreateCustomerInput,
  CustomerDto,
  CustomerHistoryResponse,
  UpdateCustomerInput,
} from '@/lib/dto/customers';
import type { Paginated } from '@/lib/types';

const CUSTOMERS_KEY = ['customers'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export interface CustomerQuery {
  q?: string;
  tag?: string;
  hasPhone?: boolean;
  page?: number;
  limit?: number;
}

export function useCustomers(query: CustomerQuery = {}) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, query],
    queryFn: () =>
      api.list<CustomerDto>('/customers', {
        query: {
          q: query.q,
          tag: query.tag,
          hasPhone: query.hasPhone ? 'true' : undefined,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<CustomerDto>>,
    staleTime: 30_000,
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, id],
    enabled: Boolean(id),
    queryFn: () => api.get<CustomerDto>(`/customers/${id}`),
    staleTime: 15_000,
  });
}

export function useCustomerHistory(id: string | null, page = 1, limit = 25) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, id, 'history', page, limit],
    enabled: Boolean(id),
    queryFn: () =>
      api.get<CustomerHistoryResponse>(`/customers/${id}/history`, {
        query: { page, limit },
      }),
    staleTime: 15_000,
  });
}

export function useCustomerLookup() {
  return useMutation({
    mutationFn: (phone: string) =>
      api.post<CustomerDto | null>('/customers/lookup', { phone }),
    onError: (err) => handleError(err, 'Lookup failed'),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => api.post<CustomerDto>('/customers', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success('Customer added');
    },
    onError: (err) => handleError(err, 'Add customer failed'),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateCustomerInput }) =>
      api.patch<CustomerDto>(`/customers/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success('Customer updated');
    },
    onError: (err) => handleError(err, 'Update failed'),
  });
}

export function useAddCustomerTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: string }) =>
      api.post<CustomerDto>(`/customers/${id}/tags`, { tag }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
    onError: (err) => handleError(err, 'Add tag failed'),
  });
}

export function useRemoveCustomerTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: string }) =>
      api.delete(`/customers/${id}/tags/${encodeURIComponent(tag)}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
    onError: (err) => handleError(err, 'Remove tag failed'),
  });
}
