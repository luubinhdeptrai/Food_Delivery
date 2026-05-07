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

export interface ShippingAddressScreenProps {
  onBack?: () => void;
  onContinue?: (selectedAddressId: string) => void;
  onAddNewAddress?: () => void;
  onEditAddress?: (addressId: string) => void;
  onSelectAddress?: (addressId: string) => void;
}

export interface PaymentScreenProps {
  onBack?: () => void;
  onContinue?: (selectedPaymentMethodId: string) => void;
  onAddPaymentMethod?: () => void;
  onSelectPaymentMethod?: (paymentMethodId: string) => void;
}

export interface ReviewScreenProps {
  onBack?: () => void;
  onPlaceOrder?: () => void;
}
