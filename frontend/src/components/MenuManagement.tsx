import React, { useState, useMemo } from 'react';
import { MenuItem } from '../types';
import { DECOR_IMAGES } from '../foodData';
import { 
  Plus, Trash2, Edit2, Search, SlidersHorizontal, 
  Flame, CheckCircle, X, Download, Upload, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuManagementProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

export default function MenuManagement({
  menuItems,
  setMenuItems
}: MenuManagementProps) {
  // Interactive filters
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'starters' | 'mains' | 'desserts' | 'drinks'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'calories'>('name');

  // Modals / Drawer toggles
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Form states for adding/editing items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState<'sides' | 'mains' | 'sweets' | 'drinks'>('mains');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState(DECOR_IMAGES.burgundyPlate);
  const [formCalories, setFormCalories] = useState('320');
  const [formBadge, setFormBadge] = useState('NEW ARRIVAL');

  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Quick helper to show customized notification
  const triggerNotification = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => setActiveNotification(null), 3500);
  };

  // Convert categories mapped to parent state
  const categoryMap = {
    all: 'all',
    starters: 'sides',
    mains: 'mains',
    desserts: 'sweets',
    drinks: 'drinks'
  } as const;

  const reverseCategoryMap = {
    sides: 'starters',
    mains: 'mains',
    sweets: 'desserts',
    drinks: 'drinks'
  } as const;

  // Filter & Search logic
  const filteredAndSortedItems = useMemo(() => {
    let result = [...menuItems];

    if (selectedCategory !== 'all') {
      const targetCode = categoryMap[selectedCategory];
      result = result.filter(item => item.category === targetCode);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (sortBy === 'price-desc') {
        return b.price - a.price;
      } else if (sortBy === 'calories') {
        return (a.calories || 0) - (b.calories || 0);
      }
      return 0;
    });

    return result;
  }, [menuItems, selectedCategory, searchQuery, sortBy]);

  // Compute stats on the fly
  const menuStats = useMemo(() => {
    const totalCount = menuItems.length;
    const startersCount = menuItems.filter(item => item.category === 'sides').length;
    const mainsCount = menuItems.filter(item => item.category === 'mains').length;
    const dessertsCount = menuItems.filter(item => item.category === 'sweets').length;
    const drinksCount = menuItems.filter(item => item.category === 'drinks').length;

    return {
      totalCount,
      startersCount,
      mainsCount,
      dessertsCount,
      drinksCount
    };
  }, [menuItems]);

  // Handle item stock state toggle
  const handleToggleStock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextStock = item.inStock === undefined ? false : !item.inStock;
        return { ...item, inStock: nextStock };
      }
      return item;
    }));
    
    const matched = menuItems.find(i => i.id === id);
    triggerNotification(`Availability altered for "${matched?.name || 'Dish'}"`);
  };

  // Open item editor
  const handleEditItem = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormPrice(item.price.toString());
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormImage(item.image);
    setFormCalories((item.calories || 280).toString());
    setFormBadge(item.badge || 'CHEF SELECTION');
    setIsAddDrawerOpen(true);
  };

  // Permanently remove item from dynamic active catalog
  const handleDeleteItem = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${name.toUpperCase()}" permanently from the dining system menu list?`)) {
      setMenuItems(prev => prev.filter(it => it.id !== id));
      if (editingItemId === id) {
        handleCancelEdit();
      }
      triggerNotification(`"${name}" successfully deleted from menu.`);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    clearForm();
    setIsAddDrawerOpen(false);
  };

  const clearForm = () => {
    setFormName('');
    setFormPrice('');
    setFormCategory('mains');
    setFormDescription('');
    setFormImage(DECOR_IMAGES.burgundyPlate);
    setFormCalories('180');
    setFormBadge('CHEF SPECIAL');
  };

  // Form submission handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice.trim()) {
      alert('Please fill in both the Name and pricing fields!');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    if (editingItemId) {
      setMenuItems(prev => prev.map(item => {
        if (item.id === editingItemId) {
          return {
            ...item,
            name: formName.trim().toUpperCase(),
            price: priceNum,
            category: formCategory,
            description: formDescription.trim() || 'No description provided.',
            image: formImage,
            calories: parseInt(formCalories) || 250,
            badge: formBadge.toUpperCase() || 'BESTSELLER'
          };
        }
        return item;
      }));
      triggerNotification(`Changes published for "${formName.toUpperCase()}"!`);
    } else {
      const newItem: MenuItem = {
        id: `m-custom-${Date.now()}`,
        name: formName.trim().toUpperCase(),
        price: priceNum,
        category: formCategory,
        description: formDescription.trim() || 'No description provided.',
        image: formImage,
        calories: parseInt(formCalories) || 250,
        badge: formBadge.toUpperCase() || 'NEW SELECTION',
        inStock: true
      };
      setMenuItems(prev => [newItem, ...prev]);
      triggerNotification(`Successfully published "${newItem.name}" to active menu catalog!`);
    }

    handleCancelEdit();
  };

  // Import templates
  const handleImportTemplate = (theme: 'indian' | 'desserts' | 'continental') => {
    let imported: MenuItem[] = [];
    if (theme === 'indian') {
      imported = [
        {
          id: `m-import-pt-${Date.now()}`,
          name: 'PANEER TIKKA',
          price: 249,
          category: 'sides',
          description: 'Spiced cottage cheese cubes marinated in yogurt, cumin, pepper, and organic butter glaze.',
          image: DECOR_IMAGES.burgundyPlate,
          calories: 320,
          badge: 'BEST SELLER',
          inStock: true
        },
        {
          id: `m-import-bc-${Date.now()}`,
          name: 'BUTTER CHICKEN',
          price: 399,
          category: 'mains',
          description: 'Roasted chicken simmered in rich creamy tomato silk, flavored with green fenugreek leaves and fresh coriander.',
          image: DECOR_IMAGES.berriesDecor,
          calories: 540,
          badge: 'CHEF SPECIAL',
          inStock: true
        }
      ];
    } else if (theme === 'desserts') {
      imported = [
        {
          id: `m-import-cl-${Date.now()}`,
          name: 'LAVENDER ROSE CUPCAKE',
          price: 120,
          category: 'sweets',
          description: 'Soft-baked vanilla bean chiffon cake crowned in fragrant lavender buttercream extract and sugar roses.',
          image: DECOR_IMAGES.download16_1,
          calories: 280,
          badge: 'SPECIALTY',
          inStock: true
        }
      ];
    } else {
      imported = [
        {
          id: `m-import-at-${Date.now()}`,
          name: 'SMART AVOCADO TOAST',
          price: 299,
          category: 'mains',
          description: 'Artisan country bread smeared with hand-whipped Hass avocado, sea salt, and high-purity olive oil.',
          image: DECOR_IMAGES.burgundyPlate,
          calories: 240,
          badge: 'HEALTHY Choice',
          inStock: true
        }
      ];
    }

    setMenuItems(prev => [...imported, ...prev]);
    setIsImportModalOpen(false);
    triggerNotification(`Successfully loaded ${imported.length} new culinary records into the menu!`);
  };

  return (
    <div className="bg-[#F0EAD2] py-8 px-4 md:px-8 space-y-12 max-w-6xl mx-auto my-4 text-left font-sans text-[#1a1a1a] select-none animate-[fadeIn_0.4s_ease-out]">

      {/* Decorative Floral Header Banner matching Home & About styles */}
      <div className="relative border border-[rgba(26,26,26,0.18)] rounded-3xl bg-[#F4A5B0]/10 p-6 sm:p-10 overflow-hidden flex flex-col md:flex-row gap-8 items-center">

        {/* Background rotating cottagecore floral plate */}
        <div className="absolute -right-16 -top-16 w-48 h-48 opacity-15 pointer-events-none select-none">
          <img
            src={DECOR_IMAGES.cottagecorePlate}
            className="w-full h-full object-contain animate-[spin_40s_linear_infinite]"
            alt=""
          />
        </div>

        <div className="space-y-3 max-w-xl relative z-10 flex-grow text-left">
          <h2 className="text-3xl font-barlow font-black uppercase text-[#1a1a1a] leading-tight">
            Menu Customizer
          </h2>
          <p className="text-xs text-[#1a1a1a]/50 leading-relaxed font-sans">
            Add, edit, and manage your menu items. Changes sync to customers immediately.
          </p>
        </div>

        {/* Action Panel */}
        <div className="w-full md:w-auto flex flex-col gap-2 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => {
              setEditingItemId(null);
              clearForm();
              setIsAddDrawerOpen(true);
            }}
            className="w-full sm:w-auto bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#F0EAD2] font-mono text-[10.5px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-[100px] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Item</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 bg-white hover:bg-[#F4A5B0]/10 text-[#1a1a1a] border border-[rgba(26,26,26,0.18)] font-mono text-[9px] font-bold uppercase tracking-wider py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#1a1a1a]/50" />
              <span>Import</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 bg-white hover:bg-[#F4A5B0]/10 text-[#1a1a1a] border border-[rgba(26,26,26,0.18)] font-mono text-[9px] font-bold uppercase tracking-wider py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#1a1a1a]/50" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Action Toast Notification */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1a1a1a] border border-[rgba(240,234,210,0.15)] text-[#F0EAD2] px-4 py-3 rounded-2xl flex items-center justify-between text-xs gap-3 font-mono shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#7D8F62] shrink-0" />
              <span className="font-sans font-medium text-[#F0EAD2]">{activeNotification}</span>
            </div>
            <button onClick={() => setActiveNotification(null)} className="text-[#F0EAD2]/50 hover:text-[#F0EAD2] uppercase text-[8.5px] font-black">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Sort Utility toolbar */}
      <div className="bg-white border border-[rgba(26,26,26,0.18)] rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-center shadow-xs">
        <div className="relative flex-grow w-full">
          <Search className="w-4 h-4 text-[#1a1a1a]/40 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F0EAD2] border border-[rgba(26,26,26,0.12)] rounded-2xl pl-11 pr-10 py-3 text-xs focus:outline-none focus:border-[#F4A5B0] focus:ring-2 focus:ring-[#F4A5B0]/20 transition-all font-sans"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3 p-1.5 text-[#1a1a1a]/40 hover:text-[#1a1a1a] rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-full md:w-64 shrink-0 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#1a1a1a]/40 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-[#F0EAD2] border border-[rgba(26,26,26,0.12)] rounded-2xl p-3 text-xs text-[#1a1a1a] cursor-pointer focus:outline-none focus:border-[#F4A5B0] transition-all font-sans font-semibold"
          >
            <option value="name">Sort: Alphabetical (A-Z)</option>
            <option value="price-asc">Sort: Price (Low to High)</option>
            <option value="price-desc">Sort: Price (High to Low)</option>
            <option value="calories">Sort: Calories Level</option>
          </select>
        </div>
      </div>

      {/* Split Categories layout matching about values structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Categories checklist (Left) - Sticky on desktop */}
        <div className="lg:col-span-3 space-y-4 text-left lg:sticky lg:top-28 self-start">
          <span className="text-[10px] font-mono tracking-widest text-[#1a1a1a]/50 uppercase block font-bold border-b border-[rgba(26,26,26,0.08)] pb-2 pl-1">
            MENU SECTIONS
          </span>

          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none font-mono text-xs">
            {[
              { id: 'all', label: 'View All Dishes', count: menuStats.totalCount },
              { id: 'starters', label: 'Starters & Bites', count: menuStats.startersCount },
              { id: 'mains', label: 'Main Courses', count: menuStats.mainsCount },
              { id: 'desserts', label: 'Sweet Treats', count: menuStats.dessertsCount },
              { id: 'drinks', label: 'Cooling Drinks', count: menuStats.drinksCount },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition-all cursor-pointer font-bold flex items-center justify-between shrink-0 lg:shrink-1 ${
                    isSelected
                      ? 'bg-[#F4A5B0]/15 border-[#F4A5B0]/50 text-[#1a1a1a] shadow-xs'
                      : 'bg-white border-[rgba(26,26,26,0.12)] text-[#1a1a1a]/50 hover:bg-[#F4A5B0]/08 hover:border-[#F4A5B0]/30'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isSelected ? 'bg-[#1a1a1a] text-[#F0EAD2]' : 'bg-[#F0EAD2] border border-[rgba(26,26,26,0.12)] text-[#1a1a1a]/40'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Items Cards (Right) */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#1a1a1a]/50 font-bold px-1">
            <span>Dish recipe files ({filteredAndSortedItems.length})</span>
            <span>Currency index: ₹ (INR)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedItems.length === 0 ? (
                <div className="col-span-full bg-white border border-[rgba(26,26,26,0.18)] rounded-[32px] p-12 text-center text-xs space-y-3">
                  <SlidersHorizontal className="w-8 h-8 text-[#1a1a1a]/20 mx-auto" />
                  <h4 className="font-barlow font-black uppercase text-[#1a1a1a] text-sm">No recipes match filter</h4>
                  <p className="text-[#1a1a1a]/40 max-w-xs mx-auto leading-relaxed font-sans">
                    No active dishes exist matching this section or search word. Tap "View All Dishes" to check the entire selection.
                  </p>
                </div>
              ) : (
                filteredAndSortedItems.map((item) => {
                  const outStock = item.inStock === false;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.18 }}
                      key={item.id}
                      className={`bg-white border rounded-[28px] p-5 flex gap-4 transition-all relative ${
                        outStock
                          ? 'opacity-60 border-[rgba(26,26,26,0.10)]'
                          : 'hover:border-[#F4A5B0]/50 border-[rgba(26,26,26,0.18)] shadow-xs'
                      }`}
                    >
                      {/* Round plate preview */}
                      <div className="w-18 h-18 rounded-full overflow-hidden border border-[rgba(26,26,26,0.10)] bg-[#F0EAD2] shrink-0 relative flex items-center justify-center shadow-inner">
                        <img src={item.image} alt="" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                      </div>

                      {/* Text detail section */}
                      <div className="flex-grow space-y-2 text-left flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[7.5px] font-mono text-[#1a1a1a] font-extrabold tracking-widest bg-[#F4A5B0]/20 border border-[#F4A5B0]/30 px-1.5 py-0.5 rounded uppercase">
                              {item.badge || 'CHEF SELECTION'}
                            </span>
                            <span className="text-[8.5px] font-mono text-[#1a1a1a]/40 uppercase tracking-widest">
                              {reverseCategoryMap[item.category] || item.category}
                            </span>
                          </div>

                          <h3 className="text-sm font-barlow font-black tracking-tight text-[#1a1a1a] uppercase leading-none mt-1.5">
                            {item.name}
                          </h3>

                          <p className="text-[10.5px] text-[#1a1a1a]/50 font-sans tracking-wide leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-[rgba(26,26,26,0.08)] mt-1">
                          <div className="flex flex-col">
                            <span className="text-sm font-mono font-black text-[#1a1a1a]">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                            {item.calories && (
                              <span className="text-[7.5px] font-mono text-[#7D8F62] flex items-center gap-0.5 leading-none mt-1">
                                <Flame className="w-2.5 h-2.5 shrink-0" />
                                <span>{item.calories} KCAL</span>
                              </span>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1.5">

                            <button
                              type="button"
                              onClick={(e) => handleToggleStock(item.id, e)}
                              className={`px-2.5 py-1 rounded-full text-[8.5px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer border ${
                                outStock
                                  ? 'bg-[#F4A5B0]/15 border-[#F4A5B0]/30 text-[#1a1a1a]/60'
                                  : 'bg-[#7D8F62]/15 border-[#7D8F62]/30 text-[#7D8F62] font-extrabold'
                              }`}
                            >
                              {outStock ? 'OUT' : 'ACTIVE'}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleEditItem(item, e)}
                              className="p-1.5 bg-[#F0EAD2] hover:bg-[#F4A5B0]/20 border border-[rgba(26,26,26,0.12)] text-[#1a1a1a] rounded-lg cursor-pointer transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteItem(item.id, item.name, e)}
                              className="p-1.5 bg-[#F0EAD2] hover:bg-red-50 border border-[rgba(26,26,26,0.12)] text-[#1a1a1a]/60 hover:text-red-600 rounded-lg cursor-pointer transition-all"
                              title="Delete from list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* DRAWER: ADD / EDIT DIALECTIC RECIPE FORM */}
      <AnimatePresence>
        {isAddDrawerOpen && (
          <>
            <motion.div 
              style={{ contentVisibility: 'auto' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelEdit}
              className="fixed inset-0 bg-black/60 z-40 transition-opacity"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#F0EAD2] shadow-2xl z-50 p-6 md:p-8 flex flex-col justify-between overflow-y-auto text-left border-l border-[rgba(26,26,26,0.12)]"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-barlow font-black uppercase text-[#1a1a1a]">
                      {editingItemId ? 'Edit Dish details' : 'Create Custom Dish'}
                    </h2>
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 hover:bg-[#F4A5B0]/20 border border-[rgba(26,26,26,0.12)] text-[#1a1a1a]/50 hover:text-[#1a1a1a] rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs text-[#1a1a1a]">
                  <div>
                    <label className="block text-[8.5px] font-mono uppercase tracking-widest text-[#1a1a1a]/50 mb-1 font-bold">
                      Dish Name <span className="text-[#F4A5B0]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CARDAMOM CHERRY CAKE"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-white border border-[rgba(26,26,26,0.18)] focus:border-[#F4A5B0] focus:ring-2 focus:ring-[#F4A5B0]/20 rounded-xl px-3.5 py-2.5 font-sans font-bold text-xs focus:outline-none transition-all uppercase text-[#1a1a1a]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8.5px] font-mono uppercase tracking-widest text-[#1a1a1a]/50 mb-1 font-bold">
                        Price (₹) <span className="text-[#F4A5B0]">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 180"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full bg-white border border-[rgba(26,26,26,0.18)] focus:border-[#F4A5B0] focus:ring-2 focus:ring-[#F4A5B0]/20 rounded-xl px-3.5 py-2.5 font-sans font-bold text-xs focus:outline-none transition-all text-[#1a1a1a]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-mono uppercase tracking-widest text-[#1a1a1a]/40 mb-1 font-bold">
                        Calories level (Kcal)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 320"
                        value={formCalories}
                        onChange={(e) => setFormCalories(e.target.value)}
                        className="w-full bg-white border border-[rgba(26,26,26,0.18)] focus:border-[#F4A5B0] focus:ring-2 focus:ring-[#F4A5B0]/20 rounded-xl px-3.5 py-2.5 font-sans text-xs focus:outline-none transition-all text-[#1a1a1a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-mono uppercase tracking-widest text-[#1a1a1a]/40 mb-1 font-bold">
                      Section classification <span className="text-[#F4A5B0]">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-white border border-[rgba(26,26,26,0.18)] focus:border-[#F4A5B0] rounded-xl px-2.5 py-2.5 transition-all text-[11px] focus:outline-none cursor-pointer text-[#1a1a1a]"
                    >
                      <option value="sides">STARTERS</option>
                      <option value="mains">MAIN COURSE</option>
                      <option value="sweets">DESSERTS</option>
                      <option value="drinks">DRINKS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-mono uppercase tracking-widest text-[#1a1a1a]/40 mb-1 font-bold">
                      Highlights Accent Badge (uppercase)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CHEF SPECIAL, DIET SAFE"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-[rgba(26,26,26,0.18)] focus:border-[#F4A5B0] focus:ring-2 focus:ring-[#F4A5B0]/20 rounded-xl px-3.5 py-2.5 font-sans text-xs focus:outline-none transition-all text-[#1a1a1a]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-mono uppercase tracking-widest text-[#1a1a1a]/40 mb-1.5 font-bold">
                      Plate Avatar visual selection
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: DECOR_IMAGES.burgundyPlate, label: 'Classic plate' },
                        { val: DECOR_IMAGES.cottagecorePlate, label: 'Lace Gingham' },
                        { val: DECOR_IMAGES.berriesDecor, label: 'Glazedfruits' },
                        { val: DECOR_IMAGES.download16_1, label: 'Saucer Teacup' }
                      ].map((tpl) => (
                        <button
                          key={tpl.val}
                          type="button"
                          onClick={() => setFormImage(tpl.val)}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 shrink-0 ${
                            formImage === tpl.val ? 'border-[#F4A5B0] scale-95 shadow-xs' : 'border-[rgba(26,26,26,0.12)] hover:border-[#F4A5B0]/40'
                          }`}
                        >
                          <img src={tpl.val} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          <div className="absolute inset-x-0 bottom-0 bg-[#1a1a1a]/80 py-0.5 text-[6.5px] text-[#F0EAD2] text-center font-mono truncate px-1 font-bold leading-none">
                            {tpl.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-mono uppercase tracking-widest text-[#1a1a1a]/40 mb-1.5 font-bold">
                      Description <span className="text-[#F4A5B0]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide raw ingredients, baking process specifications, or flavor attributes..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-white border border-[rgba(26,26,26,0.18)] focus:border-[#F4A5B0] focus:ring-2 focus:ring-[#F4A5B0]/20 rounded-xl px-3.5 py-2.5 font-sans text-xs focus:outline-none transition-all leading-relaxed text-[#1a1a1a]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#F0EAD2] font-mono text-[10px] font-bold uppercase tracking-widest rounded-[100px] transition-all cursor-pointer"
                  >
                    {editingItemId ? 'Publish changes' : 'Add dish to live menu'}
                  </button>
                </form>
              </div>

              {/* Rendering preview block inside the form drawer */}
              <div className="mt-6 border border-dashed border-[rgba(26,26,26,0.15)] bg-[rgba(26,26,26,0.04)] p-4 rounded-3xl">
                <span className="text-[8px] font-mono text-[#1a1a1a]/40 uppercase font-black block mb-2">Live visual preview</span>
                <div className="bg-white border border-[rgba(26,26,26,0.12)] rounded-2xl p-3 flex gap-3 pointer-events-none select-none">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[rgba(26,26,26,0.10)]">
                    <img src={formImage} className="w-full h-full object-cover rounded-full" alt="" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-1 text-left flex-grow">
                    <span className="text-[6.5px] font-mono text-[#1a1a1a] font-extrabold uppercase tracking-widest block bg-[#F4A5B0]/20 border border-[#F4A5B0]/30 px-1 py-0.5 rounded w-max leading-none mb-1">
                      {formBadge || 'CHEF SPECIAL'}
                    </span>
                    <h5 className="font-barlow font-black text-[12px] text-[#1a1a1a] uppercase leading-none">{formName.trim() || 'UNNAMED COINT'}</h5>
                    <p className="text-[9.5px] text-[#1a1a1a]/50 font-sans line-clamp-1 leading-none">{formDescription.trim() || 'Flavor profile preview.'}</p>
                    <span className="font-mono text-xs font-bold block text-[#1a1a1a] pt-1 leading-none">₹{(parseFloat(formPrice) || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL 1: IMPORT DYNAMIC EXQUISITE TEMPLATE */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              style={{ contentVisibility: 'auto' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportModalOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#F0EAD2] rounded-[32px] p-6 max-w-xl w-full relative z-10 shadow-2xl space-y-6 text-left border border-[rgba(26,26,26,0.18)]"
            >
              <div className="space-y-1.5 border-b border-[rgba(26,26,26,0.08)] pb-4">
                <div className="flex items-center gap-1 text-[8.5px] font-mono text-[#7D8F62] font-black uppercase tracking-widest leading-none">
                  <Sparkles className="w-4 h-4 text-[#7D8F62] animate-pulse" />
                  <span>Templates injection</span>
                </div>
                <h3 className="text-xl font-barlow font-black uppercase text-[#1a1a1a] leading-none mt-1">Smart Importer</h3>
                <p className="text-xs text-[#1a1a1a]/40 font-sans leading-relaxed">
                  Import menu items from a preset template.
                </p>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => handleImportTemplate('indian')}
                  className="p-4 bg-white hover:bg-[#F4A5B0]/08 border border-[rgba(26,26,26,0.12)] hover:border-[#F4A5B0]/40 rounded-2xl cursor-pointer transition-all space-y-1 relative"
                >
                  <span className="absolute top-4 right-4 text-[9px] font-mono text-[#1a1a1a] font-bold uppercase tracking-widest bg-[#F4A5B0]/20 border border-[#F4A5B0]/30 px-2 py-0.5 rounded">
                    Popular
                  </span>
                  <h4 className="text-sm font-barlow font-black uppercase text-[#1a1a1a] leading-none">Traditional Indian</h4>
                  <p className="text-[10.5px] text-[#1a1a1a]/50 font-sans leading-relaxed">
                    Loads <strong>Paneer Tikka</strong> (Starter) and <strong>Butter Chicken</strong> (Main Course) with accurate INR pricing.
                  </p>
                </div>

                <div
                  onClick={() => handleImportTemplate('desserts')}
                  className="p-4 bg-white hover:bg-[#F4A5B0]/08 border border-[rgba(26,26,26,0.12)] hover:border-[#F4A5B0]/40 rounded-2xl cursor-pointer transition-all space-y-1 text-left"
                >
                  <h4 className="text-sm font-barlow font-black uppercase text-[#1a1a1a] leading-none">Pastry & Sweets Patisserie selection</h4>
                  <p className="text-[10.5px] text-[#1a1a1a]/50 font-sans leading-relaxed">
                    Loads cupcakes, pastries, and dessert items.
                  </p>
                </div>

                <div
                  onClick={() => handleImportTemplate('continental')}
                  className="p-4 bg-white hover:bg-[#F4A5B0]/08 border border-[rgba(26,26,26,0.12)] hover:border-[#F4A5B0]/40 rounded-2xl cursor-pointer transition-all space-y-1 text-left"
                >
                  <h4 className="text-sm font-barlow font-black uppercase text-[#1a1a1a] leading-none">Brunch Continental Favorites</h4>
                  <p className="text-[10.5px] text-[#1a1a1a]/50 font-sans leading-relaxed">
                    Includes avocado toast and brunch-style dishes.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="py-2.5 px-4 bg-white hover:bg-[#F4A5B0]/10 text-[#1a1a1a] border border-[rgba(26,26,26,0.18)] rounded-xl font-mono text-[9.5px] font-black uppercase cursor-pointer"
                >
                  Dismiss Importer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EXPORT MENU ARRAY JSON */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              style={{ contentVisibility: 'auto' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportModalOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#F0EAD2] rounded-[32px] p-6 max-w-lg w-full relative z-10 shadow-2xl space-y-5 text-left border border-[rgba(26,26,26,0.18)]"
            >
              <div className="space-y-1 pb-3 border-b border-[rgba(26,26,26,0.08)]">
                <span className="text-[8.5px] font-mono text-[#7D8F62] block uppercase tracking-widest font-black leading-none">Active menu data schema</span>
                <h3 className="text-lg font-barlow font-black uppercase text-[#1a1a1a] leading-none mt-1">Export active catalog</h3>
                <p className="text-xs text-[#1a1a1a]/40 font-sans leading-relaxed pt-1">
                  Copy this generated JSON schema array to backup or load your menu files.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-[8px] font-mono text-[#1a1a1a]/50 uppercase font-black tracking-widest font-bold">Catalog JSON Array</label>
                <div className="max-h-56 overflow-y-auto bg-[#1a1a1a] rounded-2xl p-4 font-mono text-[10px] text-[#F4A5B0] relative break-all select-all whitespace-pre leading-relaxed border border-[rgba(240,234,210,0.15)]">
                  {JSON.stringify(menuItems, null, 2)}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(menuItems, null, 2));
                    alert("Menu JSON Copied to clipboard successfully!");
                  }}
                  className="py-2.5 px-4 bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-[#F0EAD2] rounded-[100px] font-mono text-[9.5px] font-bold uppercase tracking-pointer cursor-pointer"
                >
                  Copy JSON Code
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="py-2.5 px-4 bg-white hover:bg-[#F4A5B0]/10 text-[#1a1a1a]/60 border border-[rgba(26,26,26,0.18)] rounded-xl font-mono text-[9.5px] font-bold uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
