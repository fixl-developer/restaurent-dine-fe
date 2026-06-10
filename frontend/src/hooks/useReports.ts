import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { env } from '@/config/env';
import { useAuthStore } from '@/stores/auth.store';
import type {
  ExportFormat,
  FeedbackReportDto,
  FootfallReportDto,
  InventoryReportDto,
  ItemsReportDto,
  KpiDashboardDto,
  PaymentsReportDto,
  ProfitabilityReportDto,
  ReportChannel,
  ReportGroupBy,
  ReportType,
  SalesReportDto,
  StaffReportDto,
  TaxReportDto,
} from '@/lib/dto/reports';

const REPORTS_KEY = ['reports'] as const;

export interface RangeOpts {
  from?: string;
  to?: string;
}

export function useKpiDashboard(refetchMs = 30_000) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'kpi'],
    queryFn: () => api.get<KpiDashboardDto>('/reports/kpi-dashboard'),
    staleTime: 15_000,
    refetchInterval: refetchMs,
  });
}

export interface SalesQuery extends RangeOpts {
  groupBy?: ReportGroupBy;
  channel?: ReportChannel;
}

export function useSalesReport(query: SalesQuery = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'sales', query],
    queryFn: () =>
      api.get<SalesReportDto>('/reports/sales', {
        query: {
          from: query.from,
          to: query.to,
          groupBy: query.groupBy,
          channel: query.channel,
        },
      }),
    staleTime: 30_000,
  });
}

export interface ItemsQuery extends RangeOpts {
  sortBy?: 'top' | 'slow';
  limit?: number;
}

export function useItemsReport(query: ItemsQuery = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'items', query],
    queryFn: () =>
      api.get<ItemsReportDto>('/reports/items', {
        query: { from: query.from, to: query.to, sortBy: query.sortBy, limit: query.limit },
      }),
    staleTime: 30_000,
  });
}

export function useTaxReport(query: RangeOpts = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'tax', query],
    queryFn: () =>
      api.get<TaxReportDto>('/reports/tax', { query: { from: query.from, to: query.to } }),
    staleTime: 30_000,
  });
}

export function usePaymentsReport(query: RangeOpts = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'payments', query],
    queryFn: () =>
      api.get<PaymentsReportDto>('/reports/payments', {
        query: { from: query.from, to: query.to },
      }),
    staleTime: 30_000,
  });
}

export function useStaffReport(query: RangeOpts = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'staff', query],
    queryFn: () =>
      api.get<StaffReportDto>('/reports/staff', { query: { from: query.from, to: query.to } }),
    staleTime: 30_000,
  });
}

export function useFootfallReport(query: RangeOpts = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'footfall', query],
    queryFn: () =>
      api.get<FootfallReportDto>('/reports/footfall', {
        query: { from: query.from, to: query.to },
      }),
    staleTime: 30_000,
  });
}

export function useInventoryReport(query: RangeOpts = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'inventory', query],
    queryFn: () =>
      api.get<InventoryReportDto>('/reports/inventory', {
        query: { from: query.from, to: query.to },
      }),
    staleTime: 30_000,
  });
}

export function useFeedbackReport(query: RangeOpts = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'feedback', query],
    queryFn: () =>
      api.get<FeedbackReportDto>('/reports/feedback', {
        query: { from: query.from, to: query.to },
      }),
    staleTime: 30_000,
  });
}

export function useProfitabilityReport(query: RangeOpts = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'profitability', query],
    queryFn: () =>
      api.get<ProfitabilityReportDto>('/reports/profitability', {
        query: { from: query.from, to: query.to },
      }),
    staleTime: 30_000,
  });
}

/**
 * Download a report as CSV / XLSX / PDF. The backend export endpoints stream
 * binary content and need a Bearer token, so we use a raw fetch + blob.
 */
export async function downloadReportExport(
  type: ReportType,
  format: ExportFormat,
  range: RangeOpts & { groupBy?: ReportGroupBy; channel?: ReportChannel },
): Promise<void> {
  const accessToken = useAuthStore.getState().accessToken;
  const params = new URLSearchParams();
  params.set('format', format);
  if (range.from) params.set('from', range.from);
  if (range.to) params.set('to', range.to);
  if (range.groupBy) params.set('groupBy', range.groupBy);
  if (range.channel) params.set('channel', range.channel);
  try {
    const res = await fetch(
      `${env.apiBaseUrl}/reports/${type}/export?${params.toString()}`,
      {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Downloaded ${format.toUpperCase()}`);
  } catch (err) {
    toast.error(`Export failed: ${(err as Error).message}`);
  }
}
