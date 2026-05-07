// ─── Cart Feature Types ────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  discountThreshold?: number;
  discountPercent?: number;
  remainingForDiscount?: number;
}

export interface CartScreenProps {
  onBack?: () => void;
  onCheckout?: () => void;
  onContinueShopping?: () => void;
}
