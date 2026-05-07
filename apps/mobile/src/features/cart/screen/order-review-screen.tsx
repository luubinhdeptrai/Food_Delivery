import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Clock,
  Truck,
  CreditCard,
} from 'lucide-react-native';
import {
  CheckoutHeader,
  CheckoutFooter,
  CheckoutProgress,
  CheckoutBentoCard,
  OrderReviewItem,
  PriceDetails,
} from '../components';
import type { ReviewScreenProps, CartItem } from '../types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ITEMS: CartItem[] = [
  {
    id: '1',
    name: 'Organic Green Grapes',
    subtitle: '500g',
    price: 4.50,
    quantity: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUEjBD6uinOHS01wXcHL5HQtOWNAsYQnw_H3K_ccM5dfqmmNWo_nTE740_5ougn-RXhyildKJUn_GiEore2UrEqabSXyyQPcqIY3EeE3vajAlgw7vCJRpq-RR-qIrzhTz79dZRVSgF8SWS2PkE9JrYHUvnTOIbfJ-VUkSO3hZOaA3t8F2TTKwPB779IMYF5uj1VSYnntParCl4-fGqQrk_mwu3Vpf_H0BGNG-giZxK7N2VU4f6QJ_3hSV989j4APdHUpRaeWcU8pCF',
  },
  {
    id: '2',
    name: 'Vine Ripened Tomatoes',
    subtitle: '1kg',
    price: 3.20,
    quantity: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzby_6OBcDywWf41gEYQeE-uyc8nvo4_1KezJjTLtiFBz7_4w6C22Gs5c7anUwxJL92KtSmLJNnJgKZrQZCt0-yLhrlNgu8WuwJFGGg8EYH62Lu5UjQn_s5pVONWiArxqbydulYLd8CqvYheCjHuOqfE04Gsa1Hm1CDRutNvp8t1a0CxSKr8iFE3oBFf67Z7AJ8336yy3CKdg0mzhfPVFajrHt2Llky6BlUkOJryPdOSgsBjnhpSMoDWh0Xepdl9DemhjBcq77kqt_',
  },
  {
    id: '3',
    name: 'Country Sourdough',
    subtitle: 'Large Loaf',
    price: 6.00,
    quantity: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfqtkH57N51GyKPe-q2QhFpYuGDqfdDbjlgLVf7Yvdt7mvPz2PKgnDU1tFVMLBRY_Ss-rylKWwZn0aE4BnZBn-zxQBZ8hjwlOnySHe780p_EipkY4-9PyJu8h-xgsdY8d2pajizAxr37scJGJHlXajRl2_qSU7w14-g_cw4RUMh7IRt3d5kB30_KoS6qkC9afWvBj8TN36-5re5F8cZzGj2PJWfi795mBkENhmBzfBwdkqJaRi_04-pBKsH-mEECpsKa69yL9BBpQl',
  },
];

// ─── Sub-Components ──────────────────────────────────────────────────────────

function DeliveryAlert() {
  return (
    <View className="bg-primary-fixed/30 border-l-4 border-primary p-4 rounded-xl mb-8 flex-row items-center gap-4">
      <View className="bg-primary-container p-2 rounded-lg">
        <Clock size={20} color="#cbffc2" />
      </View>
      <View>
        <Text
          className="text-on-primary-fixed font-bold text-sm"
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          Arrives in 30-45 mins
        </Text>
        <Text
          className="text-on-primary-fixed-variant text-[10px]"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Fresh from the local market to your door.
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function OrderReviewScreen({ onBack, onPlaceOrder }: ReviewScreenProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      
      <CheckoutHeader onBack={handleBack} />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 24, paddingTop: insets.top + 80, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <CheckoutProgress
          currentStep={3}
          stepName="Final Review"
        />
        
        <DeliveryAlert />

        {/* Shipping & Payment Section */}
        <CheckoutBentoCard
          title="Shipping Address"
          icon={Truck}
          onEdit={() => router.push('/(customer)/checkout/shipping-address')}
        >
          <View>
            <Text
              className="font-semibold text-on-surface text-sm"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Alex Rivera
            </Text>
            <Text
              className="text-on-surface-variant text-sm leading-relaxed"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              482 Willow Creek Lane{"\n"}
              Apt 4B, Silver Lake{"\n"}
              Los Angeles, CA 90026
            </Text>
          </View>
        </CheckoutBentoCard>

        <CheckoutBentoCard
          title="Payment Method"
          icon={CreditCard}
          onEdit={() => router.push('/(customer)/checkout/payment')}
        >
          <View className="flex-row items-center gap-3">
            <View className="bg-surface-container p-2 rounded-lg">
              <CreditCard size={20} color="#8b5000" />
            </View>
            <View>
              <Text
                className="font-semibold text-on-surface text-sm"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Mastercard •••• 8829
              </Text>
              <Text
                className="text-on-surface-variant text-sm"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Expires 12/26
              </Text>
            </View>
          </View>
        </CheckoutBentoCard>

        {/* Order Items */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="font-bold text-lg text-on-surface"
              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
            >
              Your Basket
            </Text>
            <View className="bg-surface-container-highest px-2 py-1 rounded-full">
              <Text
                className="text-[10px] font-bold text-on-surface-variant"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                3 ITEMS
              </Text>
            </View>
          </View>
          {MOCK_ITEMS.map((item) => (
            <OrderReviewItem key={item.id} item={item} />
          ))}
        </View>

        <PriceDetails
          subtotal={13.70}
          deliveryFee={2.50}
          tax={1.10}
          discount={{ label: 'FRESH20', amount: 2.00 }}
          total={15.30}
        />
      </ScrollView>

      <CheckoutFooter
        total={15.30}
        totalLabel="Total"
        actionLabel="Place Order"
        onAction={onPlaceOrder}
        helperText="Secure Checkout Powered by HarvestPay"
      />
    </View>
  );
}
