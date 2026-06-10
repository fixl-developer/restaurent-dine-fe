import { useState } from 'react';
import {
  Download, ToggleLeft, ToggleRight, QrCode, TrendingUp,
  Smartphone, Eye, RefreshCw, ExternalLink
} from 'lucide-react';
import { ADMIN_QR_DATA, QRItem, QR_SCAN_TREND } from './adminMockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ── Visual QR Code (CSS grid pattern) ────────────────────────────────────────
function QrVisual({ seed, size = 80 }: { seed: number; size?: number }) {
  const cells = 9;
  // Deterministic pattern based on seed
  const pattern = Array.from({ length: cells * cells }, (_, i) => {
    // Corner squares
    const row = Math.floor(i / cells), col = i % cells;
    if ((row < 2 && col < 2) || (row < 2 && col >= cells - 2) || (row >= cells - 2 && col < 2)) return 1;
    return ((seed * (i + 1) * 17) % 7 < 3) ? 1 : 0;
  });
  const cell = size / cells;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((v, i) => v ? (
        <rect key={i} x={(i % cells) * cell} y={Math.floor(i / cells) * cell} width={cell - 0.5} height={cell - 0.5} fill="#111827" rx={1} />
      ) : null)}
    </svg>
  );
}

function KpiCard({ label, value, sub, icon: Icon, color }:
  { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon className="w-5 h-5" /></div>
      <div><p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminQR() {
  const [items, setItems] = useState<QRItem[]>(ADMIN_QR_DATA);
  const [view, setView] = useState<'table' | 'takeaway'>('table');
  const [preview, setPreview] = useState<QRItem | null>(null);

  const visible = items.filter(i => i.type === view);
  const totalScans = items.reduce((s, i) => s + i.scans, 0);
  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);
  const topItem = [...items].sort((a, b) => b.scans - a.scans)[0];

  function toggleActive(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));
  }

  function handleDownload(item: QRItem) {
    alert(`Downloading QR for ${item.label} — in a real app this would generate and download a PNG.`);
  }

  const chartData = visible.map(i => ({ name: i.label.replace('Table ', 'T').replace('Takeaway ', 'TO'), scans: i.scans, revenue: Math.round(i.revenue / 1000) }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">QR Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage table and takeaway QR codes, track scan analytics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
          <RefreshCw className="w-4 h-4" /> Regenerate All
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Scans Today" value={totalScans.toLocaleString()} sub="Across all QR codes" icon={Smartphone} color="bg-pink-50 text-pink-600" />
        <KpiCard label="Revenue via QR" value={`₹${(totalRevenue / 1000).toFixed(0)}K`} sub="This month" icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Most Active" value={topItem?.label || '—'} sub={`${topItem?.scans} scans`} icon={QrCode} color="bg-violet-50 text-violet-600" />
        <KpiCard label="Active QR Codes" value={items.filter(i => i.active).length.toString()} sub={`of ${items.length} total`} icon={QrCode} color="bg-blue-50 text-blue-600" />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-3">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['table', 'takeaway'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'table' ? 'Table QR Codes' : 'Takeaway QR Codes'}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{visible.length} codes</span>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Scan Analytics — Last 7 Days</h3>
            <p className="text-xs text-gray-400 mt-0.5">Daily scans by QR type</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-900">
              {QR_SCAN_TREND.reduce((s, d) => s + d.tables + d.takeaway + d.driveThru, 0).toLocaleString()}
            </span>
            total scans this week
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={QR_SCAN_TREND} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }}
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 14 }} />
            <Bar dataKey="tables"   name="Table QRs"    stackId="a" fill="#ec4899" />
            <Bar dataKey="takeaway" name="Takeaway QRs" stackId="a" fill="#8b5cf6" />
            <Bar dataKey="driveThru" name="Drive-Thru"  stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* QR Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map(item => (
          <div key={item.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${item.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            {/* QR Preview */}
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-t-2xl relative">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <QrVisual seed={item.id.charCodeAt(item.id.length - 1) * 7 + item.scans} size={96} />
              </div>
              <div className="absolute top-2 right-2">
                <button onClick={() => toggleActive(item.id)} title={item.active ? 'Deactivate' : 'Activate'}>
                  {item.active
                    ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                    : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                </button>
              </div>
              {!item.active && (
                <div className="absolute inset-0 bg-white/60 rounded-t-2xl flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Inactive</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="px-4 pb-4 pt-3 space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{item.label}</h4>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{item.url}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl py-2">
                  <p className="text-base font-bold text-gray-900">{item.scans.toLocaleString()}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">Scans</p>
                </div>
                <div className="bg-gray-50 rounded-xl py-2">
                  <p className="text-base font-bold text-gray-900">₹{(item.revenue / 1000).toFixed(1)}K</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">Revenue</p>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center">Last scan: {item.lastScan}</p>

              <div className="flex gap-2">
                <button onClick={() => setPreview(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button onClick={() => handleDownload(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-pink-400 text-white rounded-xl hover:bg-pink-500 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {preview && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setPreview(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-72 overflow-hidden">
              <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                <span className="text-white font-bold text-sm">SmartDine</span>
                <button onClick={() => setPreview(null)}><span className="text-gray-400 text-lg">×</span></button>
              </div>
              <div className="flex flex-col items-center p-8 space-y-4">
                <div className="bg-white border-4 border-gray-100 p-4 rounded-2xl shadow-inner">
                  <QrVisual seed={preview.id.charCodeAt(preview.id.length - 1) * 7 + preview.scans} size={140} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900">{preview.label}</h3>
                  <p className="text-xs text-gray-400 mt-1">Scan to view menu</p>
                  <p className="text-[10px] font-mono text-gray-300 mt-1">{preview.url}</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button onClick={() => handleDownload(preview)}
                    className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors flex items-center justify-center gap-1.5">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
