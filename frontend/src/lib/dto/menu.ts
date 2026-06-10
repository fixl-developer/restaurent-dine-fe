/** Menu DTOs mirroring the backend Category / Item / ModifierGroup / Combo. */

export type FoodType = 'veg' | 'non_veg' | 'egg' | 'vegan';

export interface CategoryDto {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  sortOrder: number;
  isActive: boolean;
  translations?: Record<string, { name: string; description?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface VariantDto {
  _id: string;
  name: string;
  priceDelta: number;
  absolutePrice?: number;
  sku?: string;
  is86: boolean;
}

export interface AvailabilityWindow {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

export interface ItemDto {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  prepTimeMinutes: number;
  foodType: FoodType;
  spiceLevel: number;
  calories?: number;
  allergens: string[];
  hsnCode?: string;
  imageUrl?: string;
  imagePublicId?: string;
  variants: VariantDto[];
  modifierGroupIds: string[];
  availabilityWindows: AvailabilityWindow[];
  station?: string;
  tags: string[];
  translations?: Record<string, { name: string; description?: string }>;
  is86: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModifierDto {
  _id: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  is86: boolean;
}

export interface ModifierGroupDto {
  _id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  modifiers: ModifierDto[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComboDto {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  price: number;
  items: Array<{ itemId: string; variantId?: string; qty: number }>;
  modifierGroupIds: string[];
  availabilityWindows: AvailabilityWindow[];
  is86: boolean;
  isActive: boolean;
  sortOrder: number;
}

export type CreateCategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
};

export type CreateItemInput = {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  prepTimeMinutes?: number;
  foodType: FoodType;
  spiceLevel?: number;
  calories?: number;
  allergens?: string[];
  hsnCode?: string;
  variants?: Array<{ name: string; priceDelta?: number; absolutePrice?: number; sku?: string }>;
  modifierGroupIds?: string[];
  availabilityWindows?: AvailabilityWindow[];
  station?: string;
  tags?: string[];
  sortOrder?: number;
};

export type UpdateItemInput = Partial<CreateItemInput> & { isActive?: boolean };

// ── Frontend display helpers ────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  starters: '🥗',
  'main-course': '🍛',
  mains: '🍛',
  breads: '🫓',
  beverages: '🥤',
  drinks: '🥤',
  desserts: '🍰',
  sweets: '🍰',
  appetizers: '🥗',
  salads: '🥗',
  soup: '🍲',
  pizza: '🍕',
  pasta: '🍝',
  burgers: '🍔',
};

export function categoryEmoji(slug: string): string {
  return CATEGORY_EMOJI[slug] ?? '🍽️';
}

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  veg: '🟢 Veg',
  non_veg: '🔴 Non-veg',
  egg: '🟡 Egg',
  vegan: '🌱 Vegan',
};
