import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyCart } from './use-cart';
import { useSession } from '@/src/lib/auth-client';
import { useAddressStore } from '@/src/features/location/store/address-store';
import { useDeliveryEstimate } from '@/src/features/restaurants/api/restaurant-api';
import type { CheckoutSummary, CartItem } from '../types';

const DISCOUNT_THRESHOLD = 500000; // 500k VND
const DISCOUNT_PERCENT = 10; // 10%
const DEFAULT_DELIVERY_FEE = 15000; // 15k VND

function computeOrderSummary(
  subtotal: number,
  deliveryFee: number = DEFAULT_DELIVERY_FEE,
  estimatedMinutes?: number,
): CheckoutSummary {
  const remaining = Math.max(0, DISCOUNT_THRESHOLD - subtotal);
  const discount =
    subtotal >= DISCOUNT_THRESHOLD ? subtotal * (DISCOUNT_PERCENT / 100) : 0;
  const total = subtotal - discount + deliveryFee;
  return {
    subtotal,
    discount,
    delivery: deliveryFee,
    total,
    discountThreshold: DISCOUNT_THRESHOLD,
    discountPercent: DISCOUNT_PERCENT,
    remainingForDiscount: remaining,
    estimatedMinutes,
  };
}

export function useCheckout() {
  const insets = useSafeAreaInsets();
  const { selectedAddress, latitude, longitude } = useAddressStore();
  const { data: session } = useSession();
  const { data: cart, isLoading, isError } = useMyCart();

  const { data: estimate } = useDeliveryEstimate(
    cart?.restaurantId,
    latitude,
    longitude,
  );

  const handleBack = () => {
    router.back();
  };

  const handlePlaceOrder = () => {
    // TODO: Add analytics tracking for order placement
    router.dismissAll();
    router.replace('/(customer)/(tabs)');
  };
  const cartItems: CartItem[] =
    cart?.items.map((item) => ({
      id: item.cartItemId,
      name: item.itemName,
      price: item.unitPrice,
      quantity: item.quantity,
      // TODO: Populate imageUrl by fetching from a product catalog or menu API.
      // Currently CartItemResponse does not provide image data.
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop',
      selectedModifiers: item.selectedModifiers,
    })) || [];

  const deliveryFee = estimate?.deliveryFee ?? DEFAULT_DELIVERY_FEE;
  const summary = computeOrderSummary(
    cart?.totalAmount || 0,
    deliveryFee,
    estimate?.estimatedMinutes,
  );

  return {
    insets,
    session,
    cart,
    isLoading,
    isError,
    estimate,
    selectedAddress,
    cartItems,
    summary,
    handleBack,
    handlePlaceOrder,
  };
}
