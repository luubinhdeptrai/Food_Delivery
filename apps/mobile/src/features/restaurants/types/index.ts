// ─── Product Types ────────────────────────────────────────────────────────────

export interface NutritionInfo {
  calories: number;
  fat: string;
  carbs: string;
  protein: string;
}

export interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  priceUnit: string;
  description: string;
  imageUrl: string;
  badge?: string;
  nutrition: NutritionInfo;
  relatedProducts: RelatedProduct[];
  isFavorited?: boolean;
}

// ─── Restaurant Types ─────────────────────────────────────────────────────────

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  categoryId?: string;
  status: 'available' | 'unavailable' | 'out_of_stock';
  imageUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemListResponse {
  data: MenuItem[];
  total: number;
}

export interface ModifierOption {
  id: string;
  groupId: string;
  name: string;
  price: number;
  isDefault: boolean;
  isAvailable: boolean;
}

export interface ModifierGroup {
  id: string;
  menuItemId: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  isOpen: boolean;
  isApproved: boolean;
  latitude?: number;
  longitude?: number;
  cuisineType?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  // UI-specific extensions (may not be in API yet)
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  deliveryFee?: number;
}

export interface RestaurantListResponse {
  data: Restaurant[];
  total: number;
}

// ─── Screen Props ──────────────────────────────────────────────────────────────

export interface ProductDetailScreenProps {
  productId: string;
  onBack?: () => void;
  onFavoriteToggle?: (productId: string) => void;
  onAddToCart?: (productId: string, quantity: number) => void;
  onViewAllRelated?: () => void;
  onRelatedProductAdd?: (productId: string) => void;
  onTabPress?: (tabId: string) => void;
}

export interface RestaurantMenuScreenProps {
  restaurantId: string;
  onBack?: () => void;
  onFavoriteToggle?: (restaurantId: string) => void;
  onItemPress?: (itemId: string) => void;
  onAddItem?: (itemId: string) => void;
  onTabPress?: (tabId: string) => void;
}

export interface MenuItemDetailScreenProps {
  itemId: string;
  onBack?: () => void;
  onFavoriteToggle?: (itemId: string) => void;
  onAddToCart?: (
    itemId: string,
    quantity: number,
    modifierSelections: Record<string, string[]>,
  ) => void;
}
