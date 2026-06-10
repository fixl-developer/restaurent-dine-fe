import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { CreateUserInput, UpdateUserInput, UserDto } from '@/lib/dto/rbac';
import type { Paginated } from '@/lib/types';

const USERS_KEY = ['users'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export interface UsersQuery {
  q?: string;
  roleKey?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function useUsers(query: UsersQuery = {}) {
  return useQuery({
    queryKey: [...USERS_KEY, query],
    queryFn: () =>
      api.list<UserDto>('/users', {
        query: {
          q: query.q,
          roleKey: query.roleKey,
          isActive: typeof query.isActive === 'boolean' ? String(query.isActive) : undefined,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<UserDto>>,
    staleTime: 30_000,
  });
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: [...USERS_KEY, id],
    enabled: Boolean(id),
    queryFn: () => api.get<UserDto>(`/users/${id}`),
    staleTime: 30_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => api.post<UserDto>('/users', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('User created');
    },
    onError: (err) => handleError(err, 'Create user failed'),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateUserInput }) =>
      api.patch<UserDto>(`/users/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('User updated');
    },
    onError: (err) => handleError(err, 'Update failed'),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('User deleted');
    },
    onError: (err) => handleError(err, 'Delete failed'),
  });
}
