import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AuditLogDto } from '@/lib/dto/rbac';
import type { Paginated } from '@/lib/types';

const AUDIT_KEY = ['audit-logs'] as const;

export interface AuditQuery {
  actorId?: string;
  entity?: string;
  entityId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useAuditLogs(query: AuditQuery = {}) {
  return useQuery({
    queryKey: [...AUDIT_KEY, query],
    queryFn: () =>
      api.list<AuditLogDto>('/audit-logs', {
        query: {
          actorId: query.actorId,
          entity: query.entity,
          entityId: query.entityId,
          action: query.action,
          from: query.from,
          to: query.to,
          page: query.page,
          limit: query.limit ?? 100,
        },
      }) as Promise<Paginated<AuditLogDto>>,
    staleTime: 15_000,
  });
}
