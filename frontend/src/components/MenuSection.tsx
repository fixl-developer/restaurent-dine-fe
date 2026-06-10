import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, CheckCircle, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import { MENU_ITEMS } from '../foodData';

interface MenuSectionProps {
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem | CartItem) => void;
  onRemoveFromCart: (itemId: string, force?: boolean) => void;
  menuItems?: MenuItem[];
}

export default function MenuSection({ cartItems, onAddToCart, onRemoveFromCart, menuItems }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('suggested');
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  const activeList = menuItems || MENU_ITEMS;

  const categories = [
    { id: 'all', label: 'View all' },
    { id: 'mains', label: 'Mains & Plates' },
    { id: 'sides', label: 'Pastries & Sides' },
    { id: 'drinks', label: 'Shakes & Matchas' },
    { id: 'sweets', label: 'Boutique Cakes' }
  ];

  // Map category ID to clear elegant display title
  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'mains': return 'Mains & Plates';
      case 'sides': return 'Pastries & Sides';
      case 'drinks': return 'Shakes & Matchas';
      case 'sweets': return 'Boutique Cakes';
      default: return 'All Dishes';
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? activeList
    : activeList.filter(it => it.category === selectedCategory);

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0; // Default/suggested
  });

  const getCartQty = (itemId: string) => {
    return cartItems.find(it => it.id === itemId)?.quantity || 0;
  };

  const handleAddWithFeedback = (item: MenuItem) => {
    onAddToCart(item);
    setAddedNotification(item.name);
    setTimeout(() => setAddedNotification(null), 1400);
  };

  return (
    <section id="menu" className="py-16 md:py-24 bg-white border-b border-neutral-100 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Category Header exactly resembling Screenshot 3 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-3 mb-6 gap-4">
          <div className="space-y-1">
            <h3 className="text-4xl md:text-5xl font-script text-neutral-950">
              {getCategoryTitle()}
            </h3>
          </div>

          {/* Subcategory list inline navigation */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.15em] font-sans">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-1 cursor-pointer transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'text-neutral-950 font-bold underline underline-offset-4 decoration-[1.5px]' 
                      : 'text-neutral-700 hover:text-neutral-950 font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prada Screenshot 3 Toolbar Statastics: count on left, Sort details on right */}
        <div className="flex items-center justify-between text-[10px] md:text-[11px] font-sans uppercase tracking-[0.16em] text-neutral-800 font-medium pb-8 border-b border-neutral-200 mb-10">
          <div>
            <span className="font-bold text-neutral-900">{sortedItems.length} PRODUCTS AVAILABLE</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-800" />
              <span>FILTERS</span>
            </div>
            
            <div className="relative flex items-center gap-1 group">
              <span>SORT BY:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-neutral-950 border-none outline-none font-bold uppercase cursor-pointer pr-1 appearance-none"
              >
                <option value="suggested">SUGGESTED</option>
                <option value="price-low">PRICE: LOW TO HIGH</option>
                <option value="price-high">PRICE: HIGH TO LOW</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-950 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid perfectly matching vertical alignment of Screenshot 2 & 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          {sortedItems.map(item => {
            const qty = getCartQty(item.id);
            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between transition-all"
              >
                
                {/* Visual Image container with light warm solid museum base (No round borders, matching Prada aesthetic) */}
                <div className="aspect-[4/5] w-full bg-neutral-50/70 border border-neutral-250 flex items-center justify-center p-6 relative overflow-hidden transition-all group-hover:bg-neutral-100/40">
                  
                  {item.badge && (
                    <span className="absolute top-4 left-4 bg-black text-white text-[8px] font-sans uppercase tracking-[0.2em] px-2.5 py-1 z-10 font-bold">
                      {item.badge}
                    </span>
                  )}
                  
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-[90%] max-w-[90%] object-contain mix-blend-multiply group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle calorie label inside museum image display */}
                  <span className="absolute bottom-4 left-4 text-[8px] font-mono tracking-[0.15em] text-neutral-800 uppercase font-bold">
                    {item.calories} KCAL
                  </span>
                </div>

                {/* Item title + price + description */}
                <div className="pt-4 flex flex-col text-left">

                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-[17px] md:text-[19px] font-script text-neutral-950 leading-snug">
                      {item.name}
                    </h4>
                    <span className="text-[13px] md:text-[14px] font-serif text-neutral-950 font-bold shrink-0 pt-0.5">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Description — spaced below name */}
                  <p className="text-[11px] md:text-[12px] text-neutral-500 font-sans leading-relaxed mt-3 min-h-[34px]">
                    {item.description}
                  </p>

                  {/* Add To Cart Controls styled cleanly with fashion store elements */}
                  <div className="pt-3.5 border-t border-neutral-200 flex items-center justify-between">
                    {qty > 0 ? (
                      <div className="flex items-center justify-between w-full bg-neutral-950 text-white rounded-none p-1.5 text-[11px] font-mono animate-fadeIn font-bold">
                        <button
                          onClick={() => onRemoveFromCart(item.id)}
                          className="w-6 h-6 hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-colors-all"
                        >
                          <Minus className="w-3 h-3 text-neutral-300" />
                        </button>
                        <span className="font-sans font-bold tracking-widest px-3 uppercase">
                          {qty} IN CART
                        </span>
                        <button
                          onClick={() => onAddToCart(item)}
                          className="w-6 h-6 hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-colors-all"
                        >
                          <Plus className="w-3 h-3 text-neutral-300" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddWithFeedback(item)}
                        className="text-[10px] md:text-[11px] font-sans tracking-[0.2em] uppercase text-neutral-900 hover:text-neutral-500 font-medium transition-all flex items-center gap-1.5 focus:outline-hidden cursor-pointer w-full py-2 hover:bg-neutral-50 border border-neutral-250 justify-center"
                      >
                        [ ADD TO CART ]
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Floating minimalist notifier toast */}
      <AnimatePresence>
        {addedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 left-6 z-50 bg-neutral-950 text-white text-[10px] uppercase tracking-[0.2em] font-sans py-3 px-6 rounded-none shadow-2xl flex items-center gap-2.5 border border-neutral-800"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 stroke-[1.5]" />
            <span>Successfully Added To Cart</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
