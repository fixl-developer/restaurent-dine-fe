import { useEffect, useState } from 'react';
import {
  Download, ToggleLeft, ToggleRight, QrCode, TrendingUp,
  Smartphone, Eye, RefreshCw, Loader2, Plus, FileImage, FileText, X, Trash2,
} from 'lucide-react';
import {
  useQrCodes, useUpdateQr, useRegenerateQrSlug, useCreateQr, useBulkCreateQr,
  useDeleteQr, downloadQrAsset, previewQrAsset, useQrAnalytics,
} from '@/hooks/useQrCodes';
import { useTables } from '@/hooks/useTables';
import type { QrCodeDto, QrType } from '@/lib/dto/tables';
import { env } from '@/config/env';
import { confirmToast } from '@/lib/confirmToast';

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function QrCard({
  qr, onToggle, onPreview, onDownload, onRegenerate, onAnalytics, onDelete,
}: {
  qr: QrCodeDto;
  onToggle: () => void;
  onPreview: () => void;
  onDownload: (f: 'png' | 'svg' | 'pdf') => void;
  onRegenerate: () => void;
  onAnalytics: () => void;
  onDelete: () => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    previewQrAsset(qr._id, 'png').then((url) => { if (active) setThumb(url); });
    return () => { active = false; if (thumb) URL.revokeObjectURL(thumb); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qr._id, qr.slug]);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${qr.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      <div className="flex items-center justify-center p-6 bg-gray-50 rounded-t-2xl relative">
        <div className="bg-white p-3 rounded-xl shadow-sm">
          {thumb ? (
            <img src={thumb} alt={qr.label} className="w-24 h-24" />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <button onClick={onToggle} title={qr.isActive ? 'Deactivate' : 'Activate'}>
            {qr.isActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <button onClick={onDelete} title="Delete">
            <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500" />
          </button>
        </div>
        {!qr.isActive && (
          <div className="absolute inset-0 bg-white/60 rounded-t-2xl flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400 uppercase">Inactive</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-3 space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{qr.label}</h4>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5 break-all">
            {env.publicBaseUrl.replace(/^https?:\/\//, '')}/r/{qr.slug}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl py-2">
            <p className="text-base font-bold text-gray-900">{qr.analytics.scans.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Scans</p>
          </div>
          <div className="bg-gray-50 rounded-xl py-2">
            <p className="text-base font-bold text-gray-900">₹{Math.round(qr.analytics.revenue).toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Revenue</p>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          {qr.analytics.lastScanAt ? `Last scan: ${new Date(qr.analytics.lastScanAt).toLocaleString()}` : 'Not scanned yet'}
        </p>

        <div className="flex gap-1.5">
          <button onClick={onPreview} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button onClick={onAnalytics} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-3.5 h-3.5" /> Stats
          </button>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onDownload('png')} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-pink-400 text-white rounded-xl hover:bg-pink-500 transition-colors">
            <Download className="w-3.5 h-3.5" /> PNG
          </button>
          <button onClick={() => onDownload('pdf')} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium border border-pink-200 text-pink-700 rounded-xl hover:bg-pink-50 transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={onRegenerate} title="Regenerate slug" className="px-2 py-2 text-gray-400 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminQR() {
  const { data: codes = [], isLoading } = useQrCodes();
  const { data: tables = [] } = useTables({ includeInactive: false });
  const updateMutation = useUpdateQr();
  const regenerateMutation = useRegenerateQrSlug();
  const createMutation = useCreateQr();
  const bulkCreateMutation = useBulkCreateQr();
  const deleteMutation = useDeleteQr();

  const [view, setView] = useState<QrType>('table');
  const [preview, setPreview] = useState<QrCodeDto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createInput, setCreateInput] = useState<{ type: QrType; tableId: string; label: string }>({
    type: 'table', tableId: '', label: '',
  });
  const [analyticsId, setAnalyticsId] = useState<string | null>(null);
  const analyticsQuery = useQrAnalytics(analyticsId);

  const visible = codes.filter((c) => c.type === view);
  const totalScans = codes.reduce((s, c) => s + c.analytics.scans, 0);
  const totalRevenue = codes.reduce((s, c) => s + c.analytics.revenue, 0);
  const sortedByScans = [...codes].sort((a, b) => b.analytics.scans - a.analytics.scans);
  const top = sortedByScans[0];
  const tablesWithoutQr = tables.filter((t) => !codes.find((c) => c.type === 'table' && c.tableId === t._id));

  useEffect(() => {
    let active = true;
    if (preview) {
      previewQrAsset(preview._id, 'png').then((url) => { if (active) setPreviewUrl(url); });
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview?._id]);

  function handleToggleActive(qr: QrCodeDto) { updateMutation.mutate({ id: qr._id, patch: { isActive: !qr.isActive } }); }
  async function handleRegenerate(qr: QrCodeDto) {
    const ok = await confirmToast({
      title: `Regenerate slug for "${qr.label}"?`,
      description: 'Any printed copies of the old QR will stop working.',
      confirmLabel: 'Regenerate',
      destructive: true,
    });
    if (!ok) return;
    regenerateMutation.mutate(qr._id);
  }
  async function handleDelete(qr: QrCodeDto) {
    const ok = await confirmToast({
      title: `Delete QR code "${qr.label}"?`,
      destructive: true,
    });
    if (!ok) return;
    deleteMutation.mutate(qr._id);
  }
  function handleCreate() {
    if (createInput.type === 'table' && !createInput.tableId) return;
    if (!createInput.label.trim()) return;
    createMutation.mutate(
      { type: createInput.type, tableId: createInput.type === 'table' ? createInput.tableId : undefined, label: createInput.label.trim() },
      { onSuccess: () => { setCreateInput({ type: 'table', tableId: '', label: '' }); setCreateOpen(false); } },
    );
  }
  async function handleBulkAll() {
    if (tablesWithoutQr.length === 0) return;
    const ok = await confirmToast({
      title: `Generate QR codes for ${tablesWithoutQr.length} table(s)?`,
      confirmLabel: 'Generate',
    });
    if (!ok) return;
    bulkCreateMutation.mutate({ tableIds: tablesWithoutQr.map((t) => t._id) });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading QR codes…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">QR Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage table and takeaway QR codes, track scan analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {tablesWithoutQr.length > 0 && (
            <button onClick={handleBulkAll} disabled={bulkCreateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
              {bulkCreateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Generate for {tablesWithoutQr.length} table(s)
            </button>
          )}
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
            <Plus className="w-4 h-4" /> New QR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Scans" value={totalScans.toLocaleString()} sub="All-time" icon={Smartphone} color="bg-pink-50 text-pink-600" />
        <KpiCard label="Revenue via QR" value={`₹${Math.round(totalRevenue).toLocaleString()}`} sub="All-time" icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Most Active" value={top?.label || '—'} sub={top ? `${top.analytics.scans} scans` : '—'} icon={QrCode} color="bg-violet-50 text-violet-600" />
        <KpiCard label="Active QR Codes" value={codes.filter((c) => c.isActive).length.toString()} sub={`of ${codes.length} total`} icon={QrCode} color="bg-blue-50 text-blue-600" />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['table', 'window'] as QrType[]).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'table' ? 'Table QR Codes' : 'Window / Takeaway'}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{visible.length} codes</span>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-sm text-gray-500">No {view === 'table' ? 'table' : 'window'} QR codes yet</p>
          <button onClick={() => { setCreateInput((s) => ({ ...s, type: view })); setCreateOpen(true); }} className="text-sm text-pink-600 hover:underline mt-2">
            Create one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((qr) => (
            <QrCard
              key={qr._id}
              qr={qr}
              onToggle={() => handleToggleActive(qr)}
              onPreview={() => setPreview(qr)}
              onDownload={(format) => downloadQrAsset(qr._id, qr.label, format)}
              onRegenerate={() => handleRegenerate(qr)}
              onAnalytics={() => setAnalyticsId(qr._id)}
              onDelete={() => handleDelete(qr)}
            />
          ))}
        </div>
      )}

      {preview && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setPreview(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-80 overflow-hidden">
              <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                <span className="text-white font-bold text-sm">SmartDine</span>
                <button onClick={() => setPreview(null)}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="flex flex-col items-center p-8 space-y-4">
                <div className="bg-white border-4 border-gray-100 p-4 rounded-2xl shadow-inner">
                  {previewUrl ? (
                    <img src={previewUrl} alt="QR" className="w-44 h-44" />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900">{preview.label}</h3>
                  <p className="text-xs text-gray-400 mt-1">Scan to view menu</p>
                  <p className="text-[10px] font-mono text-gray-300 mt-1 break-all">
                    {env.publicBaseUrl}/r/{preview.slug}
                  </p>
                </div>
                <div className="flex gap-2 w-full">
                  <button onClick={() => downloadQrAsset(preview._id, preview.label, 'png')} className="flex-1 py-2 bg-pink-400 text-white rounded-xl text-xs font-medium hover:bg-pink-500 transition-colors flex items-center justify-center gap-1">
                    <FileImage className="w-3.5 h-3.5" /> PNG
                  </button>
                  <button onClick={() => downloadQrAsset(preview._id, preview.label, 'svg')} className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                    <FileImage className="w-3.5 h-3.5" /> SVG
                  </button>
                  <button onClick={() => downloadQrAsset(preview._id, preview.label, 'pdf')} className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {analyticsId && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setAnalyticsId(null)} />
          <div className="fixed inset-y-0 right-0 w-96 max-w-full z-50 bg-white shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">QR Analytics</h3>
              <button onClick={() => setAnalyticsId(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {analyticsQuery.isLoading ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
                </div>
              ) : analyticsQuery.data ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">QR</p>
                    <p className="font-semibold text-gray-900">{analyticsQuery.data.label}</p>
                  </div>
                  <Stat label="Scans" value={analyticsQuery.data.scans.toLocaleString()} />
                  <Stat label="Orders placed" value={analyticsQuery.data.orders.toLocaleString()} />
                  <Stat label="Revenue" value={`₹${analyticsQuery.data.revenue.toLocaleString()}`} />
                  <Stat label="Avg bill" value={`₹${analyticsQuery.data.averageBill.toLocaleString()}`} />
                  <Stat label="Conversion" value={`${(analyticsQuery.data.conversionRate * 100).toFixed(1)}%`} />
                  <Stat label="Abandonment" value={`${(analyticsQuery.data.abandonmentRate * 100).toFixed(1)}%`} />
                  {analyticsQuery.data.lastScanAt && (
                    <Stat label="Last scan" value={new Date(analyticsQuery.data.lastScanAt).toLocaleString()} />
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No data</p>
              )}
            </div>
          </div>
        </>
      )}

      {createOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setCreateOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[95vw] p-6">
              <h3 className="font-bold text-gray-900 mb-1">New QR Code</h3>
              <p className="text-xs text-gray-500 mb-4">Single QR — for bulk use the "Generate for tables" button</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                  <div className="flex gap-2">
                    {(['table', 'window'] as QrType[]).map((t) => (
                      <button key={t} onClick={() => setCreateInput((s) => ({ ...s, type: t, tableId: t === 'window' ? '' : s.tableId }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${createInput.type === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {t === 'table' ? 'Table' : 'Window / Takeaway'}
                      </button>
                    ))}
                  </div>
                </div>
                {createInput.type === 'table' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Table *</label>
                    <select value={createInput.tableId}
                      onChange={(e) => {
                        const t = tables.find((tt) => tt._id === e.target.value);
                        setCreateInput((s) => ({ ...s, tableId: e.target.value, label: t ? `Table ${t.number}` : s.label }));
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400">
                      <option value="">— Pick a table —</option>
                      {tablesWithoutQr.map((t) => (
                        <option key={t._id} value={t._id}>{t.number} {t.zone ? `(${t.zone})` : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Label *</label>
                  <input value={createInput.label} onChange={(e) => setCreateInput((s) => ({ ...s, label: e.target.value }))}
                    placeholder={createInput.type === 'table' ? 'Table AC-1' : 'Takeaway Window'}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setCreateOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreate} disabled={createMutation.isPending} className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 disabled:bg-pink-200">
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
