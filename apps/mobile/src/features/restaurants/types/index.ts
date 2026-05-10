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
  name: string;
  description: string;
  price: number;
  image: string;
  isPopular?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: string;
  heroImage: string;
  menu: {
    category: string;
    items: MenuItem[];
  }[];
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
  onAddToCart?: (itemId: string, quantity: number, addOnIds: string[]) => void;
}
