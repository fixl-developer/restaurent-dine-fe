import { useMemo, useState } from 'react';
import {
  Plus,
  Minus,
  AlertTriangle,
  Package,
  TrendingDown,
  X,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Pencil,
  Trash2,
  History,
  ChefHat,
  Save,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useInventory,
  useInventorySnapshot,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useStockIn,
  useStockOut,
  useAdjustStock,
  useItemMovements,
} from '@/hooks/useInventory';
import {
  useRecipes,
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
} from '@/hooks/useRecipes';
import { useItems } from '@/hooks/useMenu';
import { useSocket } from '@/hooks/useSocket';
import {
  INVENTORY_UNITS,
  STOCK_MOVEMENT_LABELS,
  type InventoryItemDto,
  type InventoryUnit,
  type RecipeDto,
  type StockMovementType,
} from '@/lib/dto/inventory';
import type { ItemDto } from '@/lib/dto/menu';

function KpiCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ElementType;
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

type ModalType = 'in' | 'out' | 'adjust' | 'create' | 'edit' | 'recipe' | 'movements' | null;

type StatusBucket = 'OK' | 'Low' | 'Out';

function bucketOf(item: InventoryItemDto): StatusBucket {
  if (item.currentStock <= 0) return 'Out';
  if (item.currentStock <= item.lowStockThreshold) return 'Low';
  return 'OK';
}

const STATUS_COLORS: Record<StatusBucket, string> = {
  OK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Low: 'bg-amber-50 text-amber-700 border-amber-200',
  Out: 'bg-red-50 text-red-700 border-red-200',
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString();
}

export default function AdminInventory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | StatusBucket>('All');
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<InventoryItemDto | null>(null);

  // Movement form fields
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('Consumed');
  const [supplier, setSupplier] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [movementUnit, setMovementUnit] = useState<InventoryUnit | ''>('');
  const [adjustDelta, setAdjustDelta] = useState('');

  // Create/Edit form fields
  const [form, setForm] = useState({
    name: '',
    sku: '',
    unit: 'kg' as InventoryUnit,
    currentStock: '',
    lowStockThreshold: '',
    costPerUnit: '',
    supplierName: '',
    notes: '',
  });

  // Server data
  const inventoryQuery = useInventory({
    q: search.trim() || undefined,
    lowStock: statusFilter === 'Low' ? true : undefined,
    isActive: true,
  });
  const snapshotQuery = useInventorySnapshot();
  const itemsList = inventoryQuery.data?.items ?? [];

  // Mutations
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const stockIn = useStockIn();
  const stockOut = useStockOut();
  const adjustStock = useAdjustStock();

  // Live low-stock alerts
  useSocket('/staff', {
    'inventory:low_stock': (payload: unknown) => {
      const p = payload as { name?: string; currentStock?: number; unit?: string };
      if (p?.name) {
        toast.warning(`Low stock: ${p.name} (${p.currentStock} ${p.unit})`, { duration: 6000 });
      }
      inventoryQuery.refetch();
      snapshotQuery.refetch();
    },
  });

  // Filtered (client-side status bucketing)
  const filtered = useMemo(() => {
    return itemsList.filter((i) => {
      if (statusFilter === 'All') return true;
      return bucketOf(i) === statusFilter;
    });
  }, [itemsList, statusFilter]);

  const snapshot = snapshotQuery.data;
  const lowCount = snapshot?.lowStockCount ?? 0;
  const outCount = itemsList.filter((i) => i.currentStock <= 0).length;
  const totalValue = snapshot?.estimatedValue ?? 0;

  // ── Handlers ────────────────────────────────────────────────────────────────
  function openStockModal(type: 'in' | 'out' | 'adjust', item: InventoryItemDto) {
    setModal(type);
    setSelected(item);
    setQty('');
    setAdjustDelta('');
    setReason('Consumed');
    setSupplier(item.supplierName ?? '');
    setCostPerUnit(item.costPerUnit ? String(item.costPerUnit) : '');
    setMovementUnit('');
  }

  function openCreate() {
    setSelected(null);
    setForm({
      name: '',
      sku: '',
      unit: 'kg',
      currentStock: '',
      lowStockThreshold: '',
      costPerUnit: '',
      supplierName: '',
      notes: '',
    });
    setModal('create');
  }

  function openEdit(item: InventoryItemDto) {
    setSelected(item);
    setForm({
      name: item.name,
      sku: item.sku ?? '',
      unit: item.unit,
      currentStock: String(item.currentStock),
      lowStockThreshold: String(item.lowStockThreshold),
      costPerUnit: item.costPerUnit !== undefined ? String(item.costPerUnit) : '',
      supplierName: item.supplierName ?? '',
      notes: item.notes ?? '',
    });
    setModal('edit');
  }

  async function submitStockIn() {
    if (!selected) return;
    const q = parseFloat(qty);
    if (!q || q <= 0) {
      toast.error('Enter a positive quantity');
      return;
    }
    await stockIn.mutateAsync({
      id: selected._id,
      input: {
        qty: q,
        unit: movementUnit || undefined,
        costPerUnit: costPerUnit ? parseFloat(costPerUnit) : undefined,
        supplierName: supplier || undefined,
        reason: 'Restock',
      },
    });
    setModal(null);
  }

  async function submitStockOut() {
    if (!selected) return;
    const q = parseFloat(qty);
    if (!q || q <= 0) {
      toast.error('Enter a positive quantity');
      return;
    }
    await stockOut.mutateAsync({
      id: selected._id,
      input: {
        qty: q,
        unit: movementUnit || undefined,
        reason,
      },
    });
    setModal(null);
  }

  async function submitAdjust() {
    if (!selected) return;
    const d = parseFloat(adjustDelta);
    if (!d || Number.isNaN(d)) {
      toast.error('Enter a non-zero delta');
      return;
    }
    await adjustStock.mutateAsync({
      id: selected._id,
      input: { delta: d, reason: reason || 'Adjustment' },
    });
    setModal(null);
  }

  async function submitCreate() {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    await createItem.mutateAsync({
      name: form.name.trim(),
      sku: form.sku || undefined,
      unit: form.unit,
      currentStock: form.currentStock ? parseFloat(form.currentStock) : undefined,
      lowStockThreshold: form.lowStockThreshold ? parseFloat(form.lowStockThreshold) : undefined,
      costPerUnit: form.costPerUnit ? parseFloat(form.costPerUnit) : undefined,
      supplierName: form.supplierName || undefined,
      notes: form.notes || undefined,
    });
    setModal(null);
  }

  async function submitEdit() {
    if (!selected) return;
    await updateItem.mutateAsync({
      id: selected._id,
      patch: {
        name: form.name.trim(),
        sku: form.sku || undefined,
        unit: form.unit,
        lowStockThreshold: form.lowStockThreshold ? parseFloat(form.lowStockThreshold) : undefined,
        costPerUnit: form.costPerUnit ? parseFloat(form.costPerUnit) : undefined,
        supplierName: form.supplierName || undefined,
        notes: form.notes || undefined,
      },
    });
    setModal(null);
  }

  async function handleDelete(item: InventoryItemDto) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    await deleteItem.mutateAsync(item._id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track stock levels, consumption, recipes, and supplier costs
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              inventoryQuery.refetch();
              snapshotQuery.refetch();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${inventoryQuery.isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setModal('recipe')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ChefHat className="w-4 h-4" /> Recipes
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Items"
          value={snapshot?.itemCount ?? itemsList.length}
          sub="Tracked ingredients"
          color="bg-blue-50 text-blue-600"
          icon={Package}
        />
        <KpiCard
          label="Out of Stock"
          value={outCount}
          sub="Immediate reorder needed"
          color="bg-red-50 text-red-600"
          icon={AlertTriangle}
        />
        <KpiCard
          label="Low Stock"
          value={lowCount}
          sub="At or below threshold"
          color="bg-amber-50 text-amber-600"
          icon={TrendingDown}
        />
        <KpiCard
          label="Total Stock Value"
          value={`₹${Math.round(totalValue).toLocaleString()}`}
          sub="At current cost"
          color="bg-emerald-50 text-emerald-600"
          icon={Package}
        />
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50 w-56"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | StatusBucket)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="All">All statuses</option>
              <option value="OK">OK</option>
              <option value="Low">Low</option>
              <option value="Out">Out</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">
            {inventoryQuery.isLoading
              ? 'Loading...'
              : `${filtered.length} of ${itemsList.length} items`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  'Item',
                  'SKU',
                  'Current Stock',
                  'Threshold',
                  'Cost / Unit',
                  'Supplier',
                  'Last Stock-In',
                  'Status',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => {
                const status = bucketOf(item);
                const ratio = item.lowStockThreshold > 0
                  ? Math.min(100, (item.currentStock / Math.max(item.lowStockThreshold, 1)) * 50)
                  : item.currentStock > 0 ? 100 : 0;
                const barColor =
                  status === 'Out' ? 'bg-red-500' : status === 'Low' ? 'bg-amber-400' : 'bg-emerald-500';
                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {item.name}
                      {item.notes && (
                        <div className="text-[10px] text-gray-400 font-normal max-w-[200px] truncate">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.sku || '—'}</td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap font-medium">
                          {item.currentStock} {item.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {item.lowStockThreshold} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {item.costPerUnit !== undefined ? `₹${item.costPerUnit}/${item.unit}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">
                      {item.supplierName || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(item.lastStockInAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openStockModal('in', item)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                          title="Stock In"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openStockModal('out', item)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="Stock Out"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openStockModal('adjust', item)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          title="Adjust"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelected(item);
                            setModal('movements');
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                          title="History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!inventoryQuery.isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In / Out / Adjust modal */}
      {(modal === 'in' || modal === 'out' || modal === 'adjust') && selected && (
        <Modal onClose={() => setModal(null)}>
          <div
            className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${
              modal === 'in' ? 'bg-emerald-50' : modal === 'out' ? 'bg-red-50' : 'bg-blue-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {modal === 'in' ? (
                <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
              ) : modal === 'out' ? (
                <ArrowDownCircle className="w-5 h-5 text-red-500" />
              ) : (
                <RefreshCw className="w-5 h-5 text-blue-500" />
              )}
              <h3 className="font-semibold text-gray-900">
                {modal === 'in' ? 'Record Stock In' : modal === 'out' ? 'Record Stock Out' : 'Adjust Stock'}
              </h3>
            </div>
            <button onClick={() => setModal(null)}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <div className="text-xs text-gray-500">Item</div>
              <div className="font-semibold text-gray-900">{selected.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Current: {selected.currentStock} {selected.unit} · Threshold: {selected.lowStockThreshold}{' '}
                {selected.unit}
              </div>
            </div>

            {modal !== 'adjust' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="0"
                    step="0.001"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                  <select
                    value={movementUnit}
                    onChange={(e) => setMovementUnit(e.target.value as InventoryUnit | '')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                  >
                    <option value="">{selected.unit}</option>
                    {INVENTORY_UNITS.filter((u) => u !== selected.unit).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {modal === 'adjust' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Delta (negative reduces, positive increases) — in {selected.unit}
                </label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(e.target.value)}
                  placeholder="0"
                  step="0.001"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            )}

            {modal === 'in' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Cost per unit (optional)
                  </label>
                  <input
                    type="number"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Supplier / Source
                  </label>
                  <input
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Amul Dairy"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
              </>
            )}

            {modal === 'out' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reason</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Consumed', 'Wasted', 'Damaged', 'Transfer'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`py-2 text-sm rounded-xl border font-medium transition-colors ${
                        reason === r
                          ? 'bg-pink-400 text-white border-pink-400'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {modal === 'adjust' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reason</label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Stocktake correction"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            )}
          </div>

          <div className="px-6 pb-5 flex gap-3">
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={stockIn.isPending || stockOut.isPending || adjustStock.isPending}
              onClick={
                modal === 'in' ? submitStockIn : modal === 'out' ? submitStockOut : submitAdjust
              }
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                modal === 'in'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : modal === 'out'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {modal === 'in' ? 'Add Stock' : modal === 'out' ? 'Record Out' : 'Apply Adjustment'}
            </button>
          </div>
        </Modal>
      )}

      {/* Create / Edit modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal onClose={() => setModal(null)}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {modal === 'create' ? 'Add Inventory Item' : 'Edit Inventory Item'}
            </h3>
            <button onClick={() => setModal(null)}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="Tomato"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="SKU (optional)"
                value={form.sku}
                onChange={(v) => setForm({ ...form, sku: v })}
                placeholder="TOM-001"
              />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value as InventoryUnit })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                >
                  {INVENTORY_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {modal === 'create' && (
              <Field
                label={`Initial stock (${form.unit})`}
                type="number"
                value={form.currentStock}
                onChange={(v) => setForm({ ...form, currentStock: v })}
                placeholder="0"
              />
            )}
            <Field
              label={`Low-stock threshold (${form.unit})`}
              type="number"
              value={form.lowStockThreshold}
              onChange={(v) => setForm({ ...form, lowStockThreshold: v })}
              placeholder="0"
            />
            <Field
              label="Cost per unit (₹)"
              type="number"
              value={form.costPerUnit}
              onChange={(v) => setForm({ ...form, costPerUnit: v })}
              placeholder="0.00"
            />
            <Field
              label="Supplier name"
              value={form.supplierName}
              onChange={(v) => setForm({ ...form, supplierName: v })}
              placeholder="Amul Dairy"
            />
            <Field
              label="Notes"
              value={form.notes}
              onChange={(v) => setForm({ ...form, notes: v })}
              placeholder="Store refrigerated..."
            />
          </div>

          <div className="px-6 pb-5 flex gap-3">
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createItem.isPending || updateItem.isPending}
              onClick={modal === 'create' ? submitCreate : submitEdit}
              className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {modal === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* Movements drawer */}
      {modal === 'movements' && selected && (
        <MovementsDrawer
          itemId={selected._id}
          itemName={selected.name}
          unit={selected.unit}
          onClose={() => setModal(null)}
        />
      )}

      {/* Recipes manager */}
      {modal === 'recipe' && (
        <RecipesManager inventoryItems={itemsList} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Field component
// ──────────────────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={type === 'number' ? 'any' : undefined}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Modal shell
// ──────────────────────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Movements drawer
// ──────────────────────────────────────────────────────────────────────────────
function MovementsDrawer({
  itemId,
  itemName,
  unit,
  onClose,
}: {
  itemId: string;
  itemName: string;
  unit: InventoryUnit;
  onClose: () => void;
}) {
  const movementsQuery = useItemMovements(itemId, 100);
  const movements = movementsQuery.data?.items ?? [];

  const typeStyles: Record<StockMovementType, string> = {
    in: 'bg-emerald-50 text-emerald-700',
    out: 'bg-red-50 text-red-700',
    waste: 'bg-rose-50 text-rose-700',
    adjustment: 'bg-blue-50 text-blue-700',
    recipe_deduction: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto z-10">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h3 className="font-semibold text-gray-900">Stock Movements</h3>
            <p className="text-xs text-gray-500">{itemName}</p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-2">
          {movementsQuery.isLoading && (
            <div className="text-center text-sm text-gray-400 py-10">Loading...</div>
          )}
          {!movementsQuery.isLoading && movements.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-10">No movements yet.</div>
          )}
          {movements.map((m) => (
            <div
              key={m._id}
              className="flex items-start justify-between gap-3 py-3 border-b border-gray-50 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeStyles[m.type]}`}
                  >
                    {STOCK_MOVEMENT_LABELS[m.type]}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      m.qty > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {m.qty > 0 ? '+' : ''}
                    {m.qty} {m.unit}
                  </span>
                </div>
                {m.reason && <p className="text-xs text-gray-500">{m.reason}</p>}
                {m.supplierName && (
                  <p className="text-xs text-gray-400">Supplier: {m.supplierName}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Resulting</p>
                <p className="text-sm font-semibold text-gray-700">
                  {m.resultingStock} {unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Recipes manager
// ──────────────────────────────────────────────────────────────────────────────
function RecipesManager({
  inventoryItems,
  onClose,
}: {
  inventoryItems: InventoryItemDto[];
  onClose: () => void;
}) {
  const [editing, setEditing] = useState<RecipeDto | 'new' | null>(null);

  const recipesQuery = useRecipes();
  const itemsQuery = useItems({ isActive: true });
  const recipes = recipesQuery.data?.items ?? [];
  const menuItems = itemsQuery.data?.items ?? [];

  const menuItemById = useMemo(() => {
    const m = new Map<string, ItemDto>();
    menuItems.forEach((it) => m.set(it._id, it));
    return m;
  }, [menuItems]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full overflow-y-auto z-10">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <ChefHat className="w-5 h-5 text-pink-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Recipes</h3>
              <p className="text-xs text-gray-500">
                Map menu items to ingredients for auto-deduction
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing('new')}
              className="flex items-center gap-2 px-3 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> New
            </button>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {editing ? (
          <RecipeEditor
            recipe={editing === 'new' ? null : editing}
            menuItems={menuItems}
            inventoryItems={inventoryItems}
            onDone={() => setEditing(null)}
          />
        ) : (
          <div className="px-6 py-5 space-y-2">
            {recipesQuery.isLoading && (
              <div className="text-center text-sm text-gray-400 py-10">Loading...</div>
            )}
            {!recipesQuery.isLoading && recipes.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-10">
                No recipes yet. Click "New" to map a menu item to ingredients.
              </div>
            )}
            {recipes.map((r) => {
              const menuItem = menuItemById.get(r.itemId);
              const variantName =
                r.variantId && menuItem
                  ? menuItem.variants.find((v) => v._id === r.variantId)?.name
                  : undefined;
              return (
                <RecipeRow
                  key={r._id}
                  recipe={r}
                  itemName={menuItem?.name ?? 'Unknown item'}
                  variantName={variantName}
                  inventoryItems={inventoryItems}
                  onEdit={() => setEditing(r)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeRow({
  recipe,
  itemName,
  variantName,
  inventoryItems,
  onEdit,
}: {
  recipe: RecipeDto;
  itemName: string;
  variantName?: string;
  inventoryItems: InventoryItemDto[];
  onEdit: () => void;
}) {
  const deleteRecipe = useDeleteRecipe();
  const invById = useMemo(() => {
    const m = new Map<string, InventoryItemDto>();
    inventoryItems.forEach((i) => m.set(i._id, i));
    return m;
  }, [inventoryItems]);

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-900">
            {itemName}
            {variantName && <span className="text-gray-500 font-normal"> · {variantName}</span>}
          </div>
          {recipe.notes && <p className="text-xs text-gray-500 mt-0.5">{recipe.notes}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={async () => {
              if (confirm('Delete this recipe?')) {
                await deleteRecipe.mutateAsync(recipe._id);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {recipe.ingredients.map((ing, idx) => {
          const inv = invById.get(ing.inventoryItemId);
          return (
            <span
              key={idx}
              className="text-xs bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-gray-700"
            >
              {inv?.name ?? 'Unknown'} · {ing.qty} {ing.unit}
              {ing.optional && <span className="text-gray-400 ml-1">(opt)</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

interface IngredientRow {
  inventoryItemId: string;
  qty: string;
  unit: InventoryUnit;
  optional: boolean;
}

function RecipeEditor({
  recipe,
  menuItems,
  inventoryItems,
  onDone,
}: {
  recipe: RecipeDto | null;
  menuItems: ItemDto[];
  inventoryItems: InventoryItemDto[];
  onDone: () => void;
}) {
  const isNew = recipe === null;
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();

  const [itemId, setItemId] = useState(recipe?.itemId ?? menuItems[0]?._id ?? '');
  const [variantId, setVariantId] = useState(recipe?.variantId ?? '');
  const [notes, setNotes] = useState(recipe?.notes ?? '');
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    recipe?.ingredients.map((ing) => ({
      inventoryItemId: ing.inventoryItemId,
      qty: String(ing.qty),
      unit: ing.unit,
      optional: ing.optional,
    })) ?? [
      { inventoryItemId: inventoryItems[0]?._id ?? '', qty: '', unit: inventoryItems[0]?.unit ?? 'kg', optional: false },
    ],
  );

  const selectedItem = menuItems.find((m) => m._id === itemId);
  const variantOptions = selectedItem?.variants ?? [];

  function addIngredient() {
    setIngredients([
      ...ingredients,
      {
        inventoryItemId: inventoryItems[0]?._id ?? '',
        qty: '',
        unit: inventoryItems[0]?.unit ?? 'kg',
        optional: false,
      },
    ]);
  }

  function updateRow(idx: number, patch: Partial<IngredientRow>) {
    setIngredients(ingredients.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }

  function removeRow(idx: number) {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  }

  async function submit() {
    if (!itemId) {
      toast.error('Select a menu item');
      return;
    }
    const parsed = ingredients
      .map((row) => ({
        inventoryItemId: row.inventoryItemId,
        qty: parseFloat(row.qty),
        unit: row.unit,
        optional: row.optional,
      }))
      .filter((row) => row.inventoryItemId && !Number.isNaN(row.qty) && row.qty > 0);

    if (parsed.length === 0) {
      toast.error('Add at least one ingredient with a positive quantity');
      return;
    }

    if (isNew) {
      await createRecipe.mutateAsync({
        itemId,
        variantId: variantId || undefined,
        ingredients: parsed,
        notes: notes || undefined,
      });
    } else {
      await updateRecipe.mutateAsync({
        id: recipe!._id,
        patch: { ingredients: parsed, notes: notes || undefined },
      });
    }
    onDone();
  }

  return (
    <div className="px-6 py-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Menu item</label>
          <select
            value={itemId}
            onChange={(e) => {
              setItemId(e.target.value);
              setVariantId('');
            }}
            disabled={!isNew}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">Select item...</option>
            {menuItems.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Variant (optional)</label>
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            disabled={!isNew || variantOptions.length === 0}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">— Base recipe —</option>
            {variantOptions.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600">Ingredients</label>
          <button
            onClick={addIngredient}
            className="text-xs text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add ingredient
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-2"
            >
              <select
                value={row.inventoryItemId}
                onChange={(e) => {
                  const inv = inventoryItems.find((i) => i._id === e.target.value);
                  updateRow(idx, {
                    inventoryItemId: e.target.value,
                    unit: inv?.unit ?? row.unit,
                  });
                }}
                className="col-span-5 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-pink-400 bg-white"
              >
                <option value="">Select...</option>
                {inventoryItems.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={row.qty}
                onChange={(e) => updateRow(idx, { qty: e.target.value })}
                placeholder="Qty"
                step="any"
                className="col-span-3 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-pink-400 bg-white"
              />
              <select
                value={row.unit}
                onChange={(e) => updateRow(idx, { unit: e.target.value as InventoryUnit })}
                className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-pink-400 bg-white"
              >
                {INVENTORY_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <label className="col-span-1 flex items-center justify-center text-[10px] text-gray-500 gap-1">
                <input
                  type="checkbox"
                  checked={row.optional}
                  onChange={(e) => updateRow(idx, { optional: e.target.checked })}
                />
                opt
              </label>
              <button
                onClick={() => removeRow(idx)}
                className="col-span-1 p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Field
        label="Notes"
        value={notes}
        onChange={setNotes}
        placeholder="Optional recipe notes..."
      />

      <div className="flex gap-3 pt-2">
        <button
          onClick={onDone}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={createRecipe.isPending || updateRecipe.isPending}
          onClick={submit}
          className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {isNew ? 'Create Recipe' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
