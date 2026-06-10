import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { CreateRoleInput, RoleDto, UpdateRoleInput } from '@/lib/dto/rbac';

const ROLES_KEY = ['roles'] as const;
const PERMISSIONS_KEY = ['roles', 'permissions'] as const;

function handleError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => api.get<RoleDto[]>('/roles'),
    staleTime: 60_000,
  });
}

export function useRole(id: string | null) {
  return useQuery({
    queryKey: [...ROLES_KEY, id],
    enabled: Boolean(id),
    queryFn: () => api.get<RoleDto>(`/roles/${id}`),
    staleTime: 30_000,
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn: () => api.get<string[]>('/roles/permissions'),
    staleTime: Infinity,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) => api.post<RoleDto>('/roles', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Role created');
    },
    onError: (err) => handleError(err, 'Create role failed'),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateRoleInput }) =>
      api.patch<RoleDto>(`/roles/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Role updated');
    },
    onError: (err) => handleError(err, 'Update failed'),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Role deleted');
    },
    onError: (err) => handleError(err, 'Delete failed'),
  });
}
