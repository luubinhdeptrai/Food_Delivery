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

// ─── Screen Props ──────────────────────────────────────────────────────────────

export interface ProductDetailScreenProps {
  productId: string;
  onBack?: () => void;
  onFavoriteToggle?: (productId: string) => void;
  onAddToCart?: (productId: string, quantity: number) => void;
  onViewAllRelated?: () => void;
  onRelatedProductAdd?: (productId: string) => void;
}
