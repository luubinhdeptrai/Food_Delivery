export interface NutritionInfo {
  calories: number;
  fat: string;
  carbs: string;
  protein: string;
}

export interface RelatedProduct {
  id: string;
  name: string;
  price: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  origin: string;
  price: string;
  priceUnit: string;
  badge?: string;
  description: string;
  highlightedTerms: string[];
  nutrition: NutritionInfo;
  image: string;
  isFavorite?: boolean;
  relatedProducts: RelatedProduct[];
}
