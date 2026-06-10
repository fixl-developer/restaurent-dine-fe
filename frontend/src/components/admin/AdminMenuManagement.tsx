import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, GripVertical, Edit2, Trash2, ToggleLeft, ToggleRight,
  X, Image as ImageIcon, Check, AlertCircle, Upload, Download, Loader2, FileSpreadsheet,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useReorderCategories,
  useItems, useCreateItem, useUpdateItem, useDeleteItem, useToggleItem86, useUploadItemImage,
  useModifierGroups, useMenuImport, menuExportUrl,
} from '@/hooks/useMenu';
import { useSocket } from '@/hooks/useSocket';
import {
  CategoryDto, ItemDto, categoryEmoji, FoodType, FOOD_TYPE_LABELS, CreateItemInput,
} from '@/lib/dto/menu';

interface ItemFormState {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  prepTimeMinutes: number;
  foodType: FoodType;
  spiceLevel: number;
  calories: number | '';
  allergens: string;
  station: string;
  tags: string;
  variants: Array<{ _id?: string; name: string; absolutePrice: number }>;
  modifierGroupIds: string[];
}

const emptyForm = (categoryId: string): ItemFormState => ({
  name: '',
  description: '',
  categoryId,
  basePrice: 0,
  prepTimeMinutes: 10,
  foodType: 'veg',
  spiceLevel: 0,
  calories: '',
  allergens: '',
  station: '',
  tags: '',
  variants: [],
  modifierGroupIds: [],
});

function formFromItem(item: ItemDto): ItemFormState {
  return {
    name: item.name,
    description: item.description ?? '',
    categoryId: item.categoryId,
    basePrice: item.basePrice,
    prepTimeMinutes: item.prepTimeMinutes,
    foodType: item.foodType,
    spiceLevel: item.spiceLevel,
    calories: item.calories ?? '',
    allergens: item.allergens.join(', '),
    station: item.station ?? '',
    tags: item.tags.join(', '),
    variants: item.variants.map((v) => ({
      _id: v._id,
      name: v.name,
      absolutePrice: v.absolutePrice ?? item.basePrice + (v.priceDelta ?? 0),
    })),
    modifierGroupIds: item.modifierGroupIds,
  };
}

function buildItemPayload(form: ItemFormState): CreateItemInput {
  const splitList = (s: string) => s.split(',').map((p) => p.trim()).filter(Boolean);
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    categoryId: form.categoryId,
    basePrice: form.basePrice,
    prepTimeMinutes: form.prepTimeMinutes,
    foodType: form.foodType,
    spiceLevel: form.spiceLevel,
    calories: form.calories === '' ? undefined : Number(form.calories),
    allergens: splitList(form.allergens),
    tags: splitList(form.tags),
    station: form.station.trim() || undefined,
    variants: form.variants
      .filter((v) => v.name.trim() && v.absolutePrice > 0)
      .map((v) => ({ name: v.name.trim(), absolutePrice: v.absolutePrice })),
    modifierGroupIds: form.modifierGroupIds,
  };
}

export default function AdminMenuManagement() {
  const qc = useQueryClient();

  // ── Queries ──
  const { data: categories = [], isLoading: catsLoading } = useCategories({ includeInactive: true });
  const [activeCat, setActiveCat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(true);
  const { data: itemList, isLoading: itemsLoading } = useItems({
    categoryId: activeCat === 'all' ? undefined : activeCat,
    q: search || undefined,
    is86: showUnavailable ? undefined : false,
    limit: 200,
  });
  const items = itemList?.items ?? [];
  const { data: modifierGroups = [] } = useModifierGroups();

  // ── Mutations ──
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const toggle86 = useToggleItem86();
  const uploadImage = useUploadItemImage();
  const importMutation = useMenuImport();

  // ── Local UI state ──
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ItemDto | null>(null);
  const [form, setForm] = useState<ItemFormState>(() => emptyForm('all'));
  const [addCatInput, setAddCatInput] = useState('');
  const [catInputOpen, setCatInputOpen] = useState(false);
  const [dragOverCat, setDragOverCat] = useState<string | null>(null);
  const dragCat = useRef<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  // Set default activeCat to first real category once loaded
  useEffect(() => {
    if (activeCat === 'all' && categories.length > 0) {
      // keep 'all' — user explicitly selected a category later
    }
  }, [categories.length, activeCat]);

  // Refresh on live menu changes from the backend
  useSocket('/menu', {
    'item:86_changed': () => qc.invalidateQueries({ queryKey: ['menu', 'items'] }),
    'item:updated': () => qc.invalidateQueries({ queryKey: ['menu', 'items'] }),
    'category:updated': () => qc.invalidateQueries({ queryKey: ['menu', 'categories'] }),
    'menu:updated': () => {
      qc.invalidateQueries({ queryKey: ['menu', 'items'] });
      qc.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });

  // ── Derived ──
  const countFor = (catId: string) => items.filter((i) => i.categoryId === catId).length;
  const itemsByCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items) map.set(i.categoryId, (map.get(i.categoryId) ?? 0) + 1);
    return map;
  }, [items]);

  // ── Handlers ──
  function openAdd() {
    setEditing(null);
    setForm(emptyForm(activeCat !== 'all' ? activeCat : categories[0]?._id ?? ''));
    setDrawerOpen(true);
  }
  function openEdit(item: ItemDto) {
    setEditing(item);
    setForm(formFromItem(item));
    setDrawerOpen(true);
  }

  function handleSaveItem() {
    if (!form.name.trim() || !form.categoryId || form.basePrice <= 0) {
      return;
    }
    const payload = buildItemPayload(form);
    if (editing) {
      updateItem.mutate(
        { id: editing._id, patch: payload },
        { onSuccess: () => setDrawerOpen(false) },
      );
    } else {
      createItem.mutate(payload, { onSuccess: () => setDrawerOpen(false) });
    }
  }

  function handleDeleteItem(id: string) {
    if (!confirm('Remove this item from the menu?')) return;
    deleteItem.mutate(id);
  }

  function handleToggleAvail(item: ItemDto) {
    toggle86.mutate({ id: item._id, is86: !item.is86 });
  }

  function handleImageSelect(file: File | null) {
    if (!file || !editing) return;
    uploadImage.mutate({ id: editing._id, file });
  }

  // Categories
  function handleAddCategory() {
    if (!addCatInput.trim()) return;
    createCategory.mutate(
      { name: addCatInput.trim() },
      {
        onSuccess: () => {
          setAddCatInput('');
          setCatInputOpen(false);
        },
      },
    );
  }
  function handleToggleCat(c: CategoryDto) {
    updateCategory.mutate({ id: c._id, patch: { isActive: !c.isActive } });
  }
  function handleDeleteCategory(c: CategoryDto) {
    if (!confirm(`Delete category "${c.name}"? (only if empty)`)) return;
    deleteCategory.mutate(c._id);
  }

  // Drag-and-drop reorder
  function onDragStart(id: string) { dragCat.current = id; }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverCat(id); }
  function onDrop(targetId: string) {
    const sourceId = dragCat.current;
    setDragOverCat(null);
    dragCat.current = null;
    if (!sourceId || sourceId === targetId) return;
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => c._id);
    const fromIdx = sorted.indexOf(sourceId);
    const toIdx = sorted.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = sorted.splice(fromIdx, 1);
    sorted.splice(toIdx, 0, moved);
    reorderCategories.mutate(sorted);
  }

  // Bulk
  function handleImport(file: File | null) {
    if (file) importMutation.mutate(file);
  }

  // ── Variant + Modifier-group helpers ──
  function addVariant() {
    setForm((f) => ({ ...f, variants: [...f.variants, { name: '', absolutePrice: 0 }] }));
  }
  function updateVariant(i: number, patch: Partial<{ name: string; absolutePrice: number }>) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)),
    }));
  }
  function removeVariant(i: number) {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, j) => j !== i) }));
  }
  function toggleModGroup(id: string) {
    setForm((f) => ({
      ...f,
      modifierGroupIds: f.modifierGroupIds.includes(id)
        ? f.modifierGroupIds.filter((g) => g !== id)
        : [...f.modifierGroupIds, id],
    }));
  }

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  if (catsLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading menu…
      </div>
    );
  }

  return (
    <div className="flex gap-0 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
      {/* ── Category Sidebar ───────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shrink-0">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Categories</h2>
          <p className="text-xs text-gray-400 mt-0.5">Drag to reorder</p>
        </div>

        <div className="flex-1 p-2 space-y-1">
          <button
            onClick={() => setActiveCat('all')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeCat === 'all' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-base">📋</span>
            <span className="flex-1 text-left">All Items</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeCat === 'all' ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {items.length}
            </span>
          </button>

          {sortedCategories.map((cat) => (
            <div
              key={cat._id}
              draggable
              onDragStart={() => onDragStart(cat._id)}
              onDragOver={(e) => onDragOver(e, cat._id)}
              onDrop={() => onDrop(cat._id)}
              className={`rounded-xl border transition-all ${
                dragOverCat === cat._id ? 'border-pink-300 bg-pink-50' : 'border-transparent'
              }`}
            >
              <div
                className={`flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer ${
                  activeCat === cat._id ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveCat(cat._id)}
              >
                <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab shrink-0" />
                <span className="text-base shrink-0">{categoryEmoji(cat.slug)}</span>
                <span className={`flex-1 text-sm font-medium truncate ${!cat.isActive ? 'line-through opacity-50' : ''}`}>
                  {cat.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    activeCat === cat._id ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {itemsByCat.get(cat._id) ?? 0}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCat(cat);
                  }}
                  title={cat.isActive ? 'Disable category' : 'Enable category'}
                  className="shrink-0 text-gray-300 hover:text-gray-500"
                >
                  {cat.isActive ? <ToggleRight className="w-4 h-4 text-pink-500" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat);
                  }}
                  title="Delete category"
                  className="shrink-0 text-gray-300 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-100">
          {catInputOpen ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={addCatInput}
                onChange={(e) => setAddCatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Category name"
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-pink-400"
              />
              <button
                onClick={handleAddCategory}
                disabled={createCategory.isPending}
                className="p-1.5 bg-pink-400 text-white rounded-lg disabled:bg-pink-200"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setCatInputOpen(false)} className="p-1.5 bg-gray-100 rounded-lg">
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCatInputOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 hover:border-pink-400 hover:text-pink-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnavailable}
              onChange={(e) => setShowUnavailable(e.target.checked)}
              className="rounded"
            />
            Show 86-ed
          </label>
          <span className="text-xs text-gray-400 ml-auto">
            {itemsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : `${items.length} items`}
          </span>
          <input
            ref={importRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={(e) => handleImport(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => importRef.current?.click()}
            title="Import menu from CSV/XLSX"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {importMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Import
          </button>
          <a
            href={menuExportUrl()}
            target="_blank"
            rel="noreferrer"
            title="Export current menu as CSV"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </a>
          <button
            onClick={openAdd}
            disabled={categories.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 disabled:bg-pink-200 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="w-8 h-8 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No items found</p>
              {categories.length === 0 ? (
                <p className="text-xs text-gray-400 mt-1">Add a category first</p>
              ) : (
                <button onClick={openAdd} className="mt-3 text-sm text-pink-600 hover:underline">
                  Add first item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                    item.is86 ? 'opacity-60 border-gray-100' : 'border-gray-200'
                  }`}
                >
                  {/* Image */}
                  <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-50 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-gray-300" />
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-white/80">
                        {FOOD_TYPE_LABELS[item.foodType]}
                      </span>
                      {item.tags?.includes('featured') && (
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleToggleAvail(item)}
                        title={item.is86 ? 'Mark available' : 'Mark 86 (out of stock)'}
                      >
                        {!item.is86 ? (
                          <ToggleRight className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                    </div>
                    {item.is86 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">86 / Out of stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mt-0.5">{item.description}</p>
                      </div>
                      <p className="text-base font-bold text-gray-900 shrink-0">₹{item.basePrice}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400 flex-wrap">
                      {item.calories !== undefined && <span>{item.calories} kcal</span>}
                      <span>·</span>
                      <span>{item.prepTimeMinutes} min prep</span>
                      {item.variants.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{item.variants.length} variants</span>
                        </>
                      )}
                      {item.modifierGroupIds.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{item.modifierGroupIds.length} modifier groups</span>
                        </>
                      )}
                      {item.station && (
                        <>
                          <span>·</span>
                          <span>{item.station}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors font-medium"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Import results banner */}
          {importMutation.data && importMutation.data.errors.length > 0 && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                <h4 className="text-sm font-semibold text-amber-900">Import completed with errors</h4>
              </div>
              <p className="text-xs text-amber-700 mb-2">
                {importMutation.data.created} created, {importMutation.data.updated} updated, {importMutation.data.errors.length} errors
              </p>
              <ul className="text-xs text-amber-800 space-y-0.5 max-h-32 overflow-y-auto">
                {importMutation.data.errors.map((e) => (
                  <li key={e.row}>Row {e.row}: {e.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Add/Edit Drawer ───────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-semibold text-gray-900">{editing ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setDrawerOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Item Image</label>
                <div className="h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative bg-gray-50">
                  {editing?.imageUrl ? (
                    <img src={editing.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-xs">No image</p>
                    </div>
                  )}
                </div>
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => imageRef.current?.click()}
                  disabled={!editing || uploadImage.isPending}
                  className="mt-2 w-full py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {uploadImage.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {!editing ? 'Save item first to upload an image' : editing.imageUrl ? 'Replace image' : 'Upload image'}
                </button>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Item Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Butter Chicken"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description of the dish…"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Base Price (₹) *</label>
                    <input
                      type="number"
                      value={form.basePrice || ''}
                      onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
                      placeholder="299"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                    >
                      {sortedCategories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Food Type *</label>
                    <select
                      value={form.foodType}
                      onChange={(e) => setForm((f) => ({ ...f, foodType: e.target.value as FoodType }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                    >
                      {(['veg', 'non_veg', 'egg', 'vegan'] as FoodType[]).map((f) => (
                        <option key={f} value={f}>
                          {FOOD_TYPE_LABELS[f]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Spice (0–5)</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={form.spiceLevel}
                      onChange={(e) => setForm((f) => ({ ...f, spiceLevel: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Prep Time (min)</label>
                    <input
                      type="number"
                      value={form.prepTimeMinutes}
                      onChange={(e) => setForm((f) => ({ ...f, prepTimeMinutes: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Calories</label>
                    <input
                      type="number"
                      value={form.calories}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, calories: e.target.value === '' ? '' : Number(e.target.value) }))
                      }
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Kitchen Station</label>
                    <input
                      value={form.station}
                      onChange={(e) => setForm((f) => ({ ...f, station: e.target.value }))}
                      placeholder="e.g. tandoor, grill, beverages"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Allergens (comma-separated)</label>
                    <input
                      value={form.allergens}
                      onChange={(e) => setForm((f) => ({ ...f, allergens: e.target.value }))}
                      placeholder="dairy, gluten, nuts"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tags (comma-separated)</label>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                      placeholder="featured, bestseller, new"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Variants (Size / Portion)</label>
                  <button onClick={addVariant} type="button" className="text-xs text-pink-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {form.variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      value={v.name}
                      onChange={(e) => updateVariant(i, { name: e.target.value })}
                      placeholder="e.g. Large"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400"
                    />
                    <input
                      type="number"
                      value={v.absolutePrice || ''}
                      onChange={(e) => updateVariant(i, { absolutePrice: Number(e.target.value) })}
                      placeholder="₹"
                      className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400"
                    />
                    <button onClick={() => removeVariant(i)} type="button" className="text-gray-300 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {form.variants.length === 0 && <p className="text-xs text-gray-400 py-1">No variants added</p>}
              </div>

              {/* Modifier Groups */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Modifier Groups</label>
                {modifierGroups.length === 0 ? (
                  <p className="text-xs text-gray-400">No modifier groups created yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {modifierGroups.map((g) => {
                      const checked = form.modifierGroupIds.includes(g._id);
                      return (
                        <button
                          key={g._id}
                          type="button"
                          onClick={() => toggleModGroup(g._id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-colors ${
                            checked ? 'border-pink-300 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">{g.name}</p>
                            <p className="text-[10px] text-gray-400">
                              {g.isRequired ? 'required, ' : 'optional, '}
                              {g.modifiers.length} options · {g.minSelections}–{g.maxSelections}
                            </p>
                          </div>
                          {checked && <Check className="w-4 h-4 text-pink-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                disabled={createItem.isPending || updateItem.isPending}
                className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 disabled:bg-pink-200 transition-colors inline-flex items-center justify-center gap-2"
              >
                {(createItem.isPending || updateItem.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
