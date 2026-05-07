import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { CartHeader } from '@/src/features/cart/components/cart-header';
import { CartItemCard } from '@/src/features/cart/components/cart-item-card';
import { OrderSummaryCard } from '@/src/features/cart/components/order-summary-card';
import { EmptyCart } from '@/src/features/cart/components/empty-cart';
import type { CartItem, CartScreenProps } from '@/src/features/cart/types';

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Replace with Zustand store or TanStack Query in a real implementation.

const INITIAL_CART: CartItem[] = [
  {
    id: 'broccoli-organic',
    name: 'Organic Green Broccoli',
    subtitle: '500g • Farm Fresh',
    price: 3.49,
    quantity: 2,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBELZ5Eb-Tlvg7UC3aSSLWtPSp1AJvLvnnN0U8npdtjPZb4pW3VxuLGWvtg6fHeqwoYYv-D3wEMrEKjW8NSgoL29eewRglOJlzgurUYawqSv9f-1ZTfYuPkt-1DBR1WpPNeUCht5G5XACE7NeqiJIdUiPhVYdKs9qiHiZ0pG5phULlYEEl6_glRqCSphzaH-6u6mhkZqg5JOKN9n3X6NKRPD0Skejlj3ze5D-qLAdRwTY4guBuoGrRYMH7HWy1y0E-rux5rQNPz_ouy',
  },
  {
    id: 'salmon-norwegian',
    name: 'Norwegian Salmon',
    subtitle: '250g • Wild Caught',
    price: 12.99,
    quantity: 1,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1kwXwpwjUHXeFwcX65ffGMFqKzJCaaijvjYUXZUwjwzzKL7-bZKpC9_N2Q5llkNy3s4Kx4d_AUto59TmsxJz-OBaTQYK7uGJ4u9xaCWaJzxn3Djv_jREobp8XepGDRiSn-3oM3dF07vpyzaStTQ4r2L-oUudPlBFPdwdYYCLva-wgl2_eG8MxgtWIk_zMfcUE-VRqE1UefQ0V8AzIehXHBJ0YuJ8K5uMIssm6KXun_tbSLPQYcViBQqVjzhtkSCen_9Oou04Cu-wH',
  },
  {
    id: 'oranges-valencia',
    name: 'Valencia Oranges',
    subtitle: '1kg • Sweet & Juicy',
    price: 4.25,
    quantity: 1,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBow1PwDhusPylLQZ4hJsukRc3aaMtY_7AIsMWs2fl9dpdIJUxW0OiBGZ8VT7mSqJCuH5Fh-4WAnYzC3w9hQA9lBNKTY2Qn31_kN68fD5nd_NVhKAT8PGM0hbp93IEzSDttJ8NgmKXqfVFqaA_H80CS4NL-KwGi69ASPoUMpHmHuLWBmLph9ZDFmW4Le3yy8OQpzDkCKTxlIkZw3RcjuS_LyvWCYtWBmqP6REPtQ1PpJz_oppmkLeBBpMXh56ECdSzTtSHYs43c6Ewf',
  },
];

// ─── Pricing Logic ─────────────────────────────────────────────────────────────

const DISCOUNT_THRESHOLD = 30;
const DISCOUNT_PERCENT = 15;
const DELIVERY_FEE = 0;

function computeOrderSummary(items: CartItem[]) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const remaining = Math.max(0, DISCOUNT_THRESHOLD - subtotal);
  const discount =
    subtotal >= DISCOUNT_THRESHOLD ? subtotal * (DISCOUNT_PERCENT / 100) : 0;
  const total = subtotal - discount + DELIVERY_FEE;
  return {
    subtotal,
    discount,
    delivery: DELIVERY_FEE,
    total,
    discountThreshold: DISCOUNT_THRESHOLD,
    discountPercent: DISCOUNT_PERCENT,
    remainingForDiscount: remaining,
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CartScreen({
  onBack,
  onCheckout,
  onContinueShopping,
}: CartScreenProps) {
  const insets = useSafeAreaInsets();
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);

  const summary = computeOrderSummary(cartItems);
  const headerHeight = insets.top + 64;
  const checkoutBarHeight = 80 + insets.bottom;

  const handleIncrement = useCallback((id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const handleDecrement = useCallback((id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      router.push('/(customer)/(tabs)');
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* ── Floating Header ──────────────────────────────────────────────────── */}
      <CartHeader insetsTop={insets.top} onBack={handleBack} />

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      {cartItems.length === 0 ? (
        <EmptyCart onContinueShopping={handleContinueShopping} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: headerHeight + 16,
            paddingBottom: checkoutBarHeight + 24,
            paddingHorizontal: 16,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Section label */}
          <Text
            className="text-on-surface text-[18px] mb-1"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </Text>

          {/* Cart items */}
          <View className="gap-3">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onRemove={handleRemove}
              />
            ))}
          </View>

          {/* Order summary */}
          <OrderSummaryCard summary={summary} />
        </ScrollView>
      )}

      {/* ── Sticky Checkout Bar ───────────────────────────────────────────────── */}
      {cartItems.length > 0 && (
        <View
          className="absolute bottom-0 left-0 right-0 px-4 pt-3 bg-surface/90"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            onPress={onCheckout}
            activeOpacity={0.85}
            className="flex-row items-center justify-between bg-primary rounded-full pl-7 pr-2 py-2 shadow-lg active:scale-95"
          >
            <Text
              className="text-on-primary text-base"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Proceed to Checkout
            </Text>
            <View className="bg-surface-container-lowest rounded-full px-4 py-2.5">
              <Text
                className="text-primary text-[15px]"
                style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
              >
                ${summary.total.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
