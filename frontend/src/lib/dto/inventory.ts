/** Inventory + Recipes DTOs. */

export type InventoryUnit = 'kg' | 'g' | 'L' | 'ml' | 'pcs';

export const INVENTORY_UNITS: InventoryUnit[] = ['kg', 'g', 'L', 'ml', 'pcs'];

export const INVENTORY_UNIT_LABELS: Record<InventoryUnit, string> = {
  kg: 'kg',
  g: 'g',
  L: 'L',
  ml: 'ml',
  pcs: 'pcs',
};

export type StockMovementType = 'in' | 'out' | 'waste' | 'adjustment' | 'recipe_deduction';

export const STOCK_MOVEMENT_LABELS: Record<StockMovementType, string> = {
  in: 'Stock In',
  out: 'Stock Out',
  waste: 'Waste',
  adjustment: 'Adjustment',
  recipe_deduction: 'Recipe Deduction',
};

export interface InventoryItemDto {
  _id: string;
  name: string;
  sku?: string;
  unit: InventoryUnit;
  currentStock: number;
  lowStockThreshold: number;
  costPerUnit?: number;
  supplierName?: string;
  notes?: string;
  isActive: boolean;
  lastStockInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryInput {
  name: string;
  sku?: string;
  unit: InventoryUnit;
  currentStock?: number;
  lowStockThreshold?: number;
  costPerUnit?: number;
  supplierName?: string;
  notes?: string;
}

export interface UpdateInventoryInput {
  name?: string;
  sku?: string;
  unit?: InventoryUnit;
  lowStockThreshold?: number;
  costPerUnit?: number;
  supplierName?: string;
  notes?: string;
  isActive?: boolean;
}

export interface StockInInput {
  qty: number;
  unit?: InventoryUnit;
  costPerUnit?: number;
  supplierName?: string;
  reason?: string;
}

export interface StockOutInput {
  qty: number;
  unit?: InventoryUnit;
  reason: string;
}

export interface AdjustStockInput {
  delta: number;
  reason: string;
}

export interface StockMovementDto {
  _id: string;
  inventoryItemId: string;
  type: StockMovementType;
  qty: number;
  unit: InventoryUnit;
  costPerUnit?: number;
  reason?: string;
  orderId?: string;
  supplierName?: string;
  actorId?: string;
  resultingStock: number;
  createdAt: string;
}

export interface InventorySnapshotItem {
  id: string;
  name: string;
  unit: InventoryUnit;
  currentStock: number;
  lowStockThreshold: number;
  isLow: boolean;
  costPerUnit?: number;
  value?: number;
}

export interface InventorySnapshot {
  at: string;
  itemCount: number;
  lowStockCount: number;
  estimatedValue: number;
  items: InventorySnapshotItem[];
}

export interface RecipeIngredientDto {
  inventoryItemId: string;
  qty: number;
  unit: InventoryUnit;
  optional: boolean;
}

export interface RecipeDto {
  _id: string;
  itemId: string;
  variantId?: string;
  ingredients: RecipeIngredientDto[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeInput {
  itemId: string;
  variantId?: string;
  ingredients: Array<{
    inventoryItemId: string;
    qty: number;
    unit: InventoryUnit;
    optional?: boolean;
  }>;
  notes?: string;
}

export interface UpdateRecipeInput {
  ingredients?: Array<{
    inventoryItemId: string;
    qty: number;
    unit: InventoryUnit;
    optional?: boolean;
  }>;
  notes?: string;
  isActive?: boolean;
}
