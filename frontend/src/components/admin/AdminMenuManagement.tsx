import { useState, useRef } from 'react';
import {
  Plus, Search, GripVertical, Edit2, Trash2, ToggleLeft,
  ToggleRight, X, ChevronDown, Image, Check, AlertCircle
} from 'lucide-react';
import {
  ADMIN_CATEGORIES, ADMIN_MENU_ITEMS, ADMIN_IMAGES,
  AdminCategory, AdminMenuItem, AdminVariant, AdminAddon
} from './adminMockData';

const BADGE_OPTIONS = ['BESTSELLER', 'NEW', 'CHEF PICK', 'HEALTHY', 'SPICY', 'SEASONAL', ''];

function Badge({ text }: { text: string }) {
  if (!text) return null;
  const colors: Record<string, string> = {
    BESTSELLER: 'bg-pink-50 text-pink-700 border-pink-200',
    NEW:        'bg-blue-50 text-blue-700 border-blue-200',
    'CHEF PICK':'bg-violet-50 text-violet-700 border-violet-200',
    HEALTHY:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    SPICY:      'bg-red-50 text-red-700 border-red-200',
    SEASONAL:   'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colors[text] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {text}
    </span>
  );
}

const emptyItem = (): Omit<AdminMenuItem, 'id'> => ({
  categoryId: 'starters', name: '', description: '', price: 0,
  available: true, featured: false, badge: '', calories: 0,
  prepTime: 10, variants: [], addons: [],
});

export default function AdminMenuManagement() {
  const [categories, setCategories] = useState<AdminCategory[]>(ADMIN_CATEGORIES);
  const [items, setItems] = useState<AdminMenuItem[]>(ADMIN_MENU_ITEMS);
  const [activeCat, setActiveCat] = useState<string>('starters');
  const [search, setSearch] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<AdminMenuItem, 'id'>>(emptyItem());
  const [addCatInput, setAddCatInput] = useState('');
  const [catInputOpen, setCatInputOpen] = useState(false);
  const [dragOverCat, setDragOverCat] = useState<string | null>(null);
  const dragCat = useRef<string | null>(null);

  // ── Derived lists ──────────────────────────────────────────────────────────
  const visibleItems = items.filter(i => {
    const catMatch = activeCat === 'all' || i.categoryId === activeCat;
    const searchMatch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const availMatch = showUnavailable || i.available;
    return catMatch && searchMatch && availMatch;
  });

  const countFor = (catId: string) => items.filter(i => i.categoryId === catId).length;

  // ── Handlers ───────────────────────────────────────────────────────────────
  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyItem(), categoryId: activeCat });
    setDrawerOpen(true);
  }

  function openEdit(item: AdminMenuItem) {
    setEditingId(item.id);
    setForm({ categoryId: item.categoryId, name: item.name, description: item.description,
      price: item.price, available: item.available, featured: item.featured, badge: item.badge,
      calories: item.calories, prepTime: item.prepTime,
      variants: [...item.variants], addons: [...item.addons] });
    setDrawerOpen(true);
  }

  function saveItem() {
    if (!form.name.trim() || !form.price) return;
    if (editingId) {
      setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...form } : i));
    } else {
      setItems(prev => [...prev, { id: `new-${Date.now()}`, ...form }]);
    }
    setDrawerOpen(false);
  }

  function deleteItem(id: string) {
    if (!confirm('Remove this item from the menu?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function toggleAvailable(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  }

  function addCategory() {
    if (!addCatInput.trim()) return;
    const id = addCatInput.toLowerCase().replace(/\s+/g, '-');
    setCategories(prev => [...prev, { id, name: addCatInput, emoji: '🍽️', sortOrder: prev.length + 1, active: true, itemCount: 0 }]);
    setAddCatInput('');
    setCatInputOpen(false);
  }

  function toggleCatActive(id: string) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  }

  function addVariant() { setForm(f => ({ ...f, variants: [...f.variants, { name: '', price: 0 }] })); }
  function removeVariant(i: number) { setForm(f => ({ ...f, variants: f.variants.filter((_, j) => j !== i) })); }
  function updateVariant(i: number, field: keyof AdminVariant, val: string | number) {
    setForm(f => ({ ...f, variants: f.variants.map((v, j) => j === i ? { ...v, [field]: val } : v) }));
  }
  function addAddon() { setForm(f => ({ ...f, addons: [...f.addons, { name: '', price: 0 }] })); }
  function removeAddon(i: number) { setForm(f => ({ ...f, addons: f.addons.filter((_, j) => j !== i) })); }
  function updateAddon(i: number, field: keyof AdminAddon, val: string | number) {
    setForm(f => ({ ...f, addons: f.addons.map((a, j) => j === i ? { ...a, [field]: val } : a) }));
  }

  // ── Drag-and-drop category reorder ────────────────────────────────────────
  function onDragStart(id: string) { dragCat.current = id; }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverCat(id); }
  function onDrop(id: string) {
    if (!dragCat.current || dragCat.current === id) { setDragOverCat(null); return; }
    setCategories(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(c => c.id === dragCat.current);
      const toIdx = arr.findIndex(c => c.id === id);
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    });
    dragCat.current = null;
    setDragOverCat(null);
  }

  return (
    <div className="flex gap-0 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Category Sidebar ──────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shrink-0">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Categories</h2>
          <p className="text-xs text-gray-400 mt-0.5">Drag to reorder</p>
        </div>

        <div className="flex-1 p-2 space-y-1">
          {/* All */}
          <button
            onClick={() => setActiveCat('all')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeCat === 'all' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span className="text-base">📋</span>
            <span className="flex-1 text-left">All Items</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeCat === 'all' ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {items.length}
            </span>
          </button>

          {/* Category rows */}
          {categories.map(cat => (
            <div
              key={cat.id}
              draggable
              onDragStart={() => onDragStart(cat.id)}
              onDragOver={e => onDragOver(e, cat.id)}
              onDrop={() => onDrop(cat.id)}
              className={`rounded-xl border transition-all ${dragOverCat === cat.id ? 'border-pink-300 bg-pink-50' : 'border-transparent'}`}
            >
              <div className={`flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer ${activeCat === cat.id ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setActiveCat(cat.id)}>
                <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab shrink-0" />
                <span className="text-base shrink-0">{cat.emoji}</span>
                <span className={`flex-1 text-sm font-medium truncate ${!cat.active ? 'line-through opacity-50' : ''}`}>{cat.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${activeCat === cat.id ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {countFor(cat.id)}
                </span>
                <button onClick={e => { e.stopPropagation(); toggleCatActive(cat.id); }} className="shrink-0 text-gray-300 hover:text-gray-500">
                  {cat.active ? <ToggleRight className="w-4 h-4 text-pink-500" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Category */}
        <div className="p-3 border-t border-gray-100">
          {catInputOpen ? (
            <div className="flex gap-2">
              <input autoFocus value={addCatInput} onChange={e => setAddCatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                placeholder="Category name"
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-pink-400" />
              <button onClick={addCategory} className="p-1.5 bg-pink-400 text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setCatInputOpen(false)} className="p-1.5 bg-gray-100 rounded-lg"><X className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
          ) : (
            <button onClick={() => setCatInputOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 hover:border-pink-400 hover:text-pink-600 transition-colors">
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
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showUnavailable} onChange={e => setShowUnavailable(e.target.checked)} className="rounded" />
            Show unavailable
          </label>
          <span className="text-xs text-gray-400 ml-auto">{visibleItems.length} items</span>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="w-8 h-8 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No items found</p>
              <button onClick={openAdd} className="mt-3 text-sm text-pink-600 hover:underline">Add first item</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleItems.map(item => (
                <div key={item.id} className={`bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md ${!item.available ? 'opacity-60 border-gray-100' : 'border-gray-200'}`}>
                  {/* Item image */}
                  <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-50 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <Image className="w-10 h-10 text-gray-300" />
                    }
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <Badge text={item.badge} />
                      {item.featured && <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">FEATURED</span>}
                    </div>
                    <div className="absolute top-2 right-2">
                      <button onClick={() => toggleAvailable(item.id)} title={item.available ? 'Mark unavailable' : 'Mark available'}>
                        {item.available
                          ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                          : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                      </button>
                    </div>
                    {!item.available && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unavailable</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mt-0.5">{item.description}</p>
                      </div>
                      <p className="text-base font-bold text-gray-900 shrink-0">₹{item.price}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{item.calories} kcal</span>
                      <span>·</span>
                      <span>{item.prepTime} min prep</span>
                      {item.variants.length > 0 && <><span>·</span><span>{item.variants.length} variants</span></>}
                      {item.addons.length > 0 && <><span>·</span><span>{item.addons.length} add-ons</span></>}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <button onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors font-medium">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => deleteItem(item.id)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
              <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setDrawerOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Image Upload / Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Item Image</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { val: ADMIN_IMAGES.sauce,      label: 'Curry'    },
                    { val: ADMIN_IMAGES.salad,      label: 'Salad'    },
                    { val: ADMIN_IMAGES.noodles,    label: 'Noodles'  },
                    { val: ADMIN_IMAGES.cake,       label: 'Cake'     },
                    { val: ADMIN_IMAGES.decor,      label: 'Drink'    },
                    { val: ADMIN_IMAGES.decor2,     label: 'Dessert'  },
                    { val: ADMIN_IMAGES.oats,       label: 'Bowl'     },
                    { val: ADMIN_IMAGES.eggSalad,   label: 'Plate'    },
                  ].map(opt => (
                    <button key={opt.label} type="button" onClick={() => setForm(f => ({ ...f, image: opt.val }))}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${form.image === opt.val ? 'border-pink-400 ring-2 ring-pink-200' : 'border-gray-200 hover:border-pink-300'}`}>
                      <img src={opt.val} className="w-full h-full object-cover" alt={opt.label} />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 text-[7px] text-white text-center font-medium">{opt.label}</div>
                    </button>
                  ))}
                </div>
                {form.image && (
                  <div className="h-24 rounded-xl overflow-hidden border border-gray-200 relative">
                    <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute top-1.5 right-1.5">
                      <button type="button" onClick={() => setForm(f => ({ ...f, image: undefined }))}
                        className="bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70">×</button>
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded font-medium">Selected</div>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Item Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Butter Chicken"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short description of the dish..."
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Base Price (₹) *</label>
                    <input type="number" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                      placeholder="299"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Calories (kcal)</label>
                    <input type="number" value={form.calories || ''} onChange={e => setForm(f => ({ ...f, calories: +e.target.value }))}
                      placeholder="320"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Prep Time (min)</label>
                    <input type="number" value={form.prepTime || ''} onChange={e => setForm(f => ({ ...f, prepTime: +e.target.value }))}
                      placeholder="15"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Badge</label>
                  <div className="flex flex-wrap gap-2">
                    {BADGE_OPTIONS.map(b => (
                      <button key={b} onClick={() => setForm(f => ({ ...f, badge: b }))}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${form.badge === b ? 'bg-pink-400 text-white border-pink-400' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'}`}>
                        {b || 'None'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Available</p>
                    <p className="text-xs text-gray-400">Show on customer menu</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, available: !f.available }))}>
                    {form.available ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Featured</p>
                    <p className="text-xs text-gray-400">Highlight on menu homepage</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}>
                    {form.featured ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                  </button>
                </div>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Variants (Size / Portion)</label>
                  <button onClick={addVariant} className="text-xs text-pink-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {form.variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)}
                      placeholder="e.g. Large"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400" />
                    <input type="number" value={v.price || ''} onChange={e => updateVariant(i, 'price', +e.target.value)}
                      placeholder="₹"
                      className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400" />
                    <button onClick={() => removeVariant(i)} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                {form.variants.length === 0 && <p className="text-xs text-gray-400 py-1">No variants added</p>}
              </div>

              {/* Add-ons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Add-ons / Modifiers</label>
                  <button onClick={addAddon} className="text-xs text-pink-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {form.addons.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input value={a.name} onChange={e => updateAddon(i, 'name', e.target.value)}
                      placeholder="e.g. Extra Cheese"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400" />
                    <input type="number" value={a.price || ''} onChange={e => updateAddon(i, 'price', +e.target.value)}
                      placeholder="₹"
                      className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400" />
                    <button onClick={() => removeAddon(i)} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                {form.addons.length === 0 && <p className="text-xs text-gray-400 py-1">No add-ons added</p>}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              <button onClick={() => setDrawerOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={saveItem}
                className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors">
                {editingId ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
