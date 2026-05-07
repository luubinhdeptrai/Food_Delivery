import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Truck,
  CreditCard,
  ChevronRight,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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

function ProgressIndicator() {
  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className="text-primary font-bold text-[10px] tracking-widest uppercase"
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          STEP 3 OF 3
        </Text>
        <Text
          className="text-on-surface-variant text-sm font-medium"
          style={{ fontFamily: 'Inter_500Medium' }}
        >
          Final Review
        </Text>
      </View>
      <View className="flex-row gap-2">
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
      </View>
    </View>
  );
}

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

function BentoInfoCard({
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  title: string;
  icon: any;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm mb-4">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-2">
          <Icon size={18} color="#0d631b" />
          <Text
            className="text-primary font-bold text-base"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            {title}
          </Text>
        </View>
        <TouchableOpacity onPress={onEdit}>
          <Text
            className="text-primary font-bold text-sm underline decoration-2 underline-offset-4"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Edit
          </Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function OrderItemRow({ item }: { item: CartItem }) {
  return (
    <View className="bg-surface-container-lowest flex-row items-center p-3 rounded-2xl gap-4 mb-3">
      <View className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-full"
          contentFit="cover"
        />
      </View>
      <View className="flex-1">
        <Text
          className="font-bold text-sm text-on-surface"
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          {item.name}
        </Text>
        <Text
          className="text-xs text-on-surface-variant"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {item.subtitle}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className="font-bold text-sm text-primary"
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          ${item.price.toFixed(2)}
        </Text>
        <Text
          className="text-[10px] text-on-surface-variant font-medium"
          style={{ fontFamily: 'Inter_500Medium' }}
        >
          Qty: {item.quantity}
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
      
      {/* TopAppBar */}
      <View 
        className="bg-white/80 backdrop-blur-md sticky top-0 w-full z-50 border-b border-zinc-100"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center px-4 h-16">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="p-2 rounded-full"
          >
            <ArrowLeft size={24} color="#0d631b" />
          </TouchableOpacity>
          <Text
            className="flex-1 text-center font-bold text-lg text-primary"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Checkout
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <ProgressIndicator />
        <DeliveryAlert />

        {/* Shipping & Payment Section */}
        <BentoInfoCard
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
        </BentoInfoCard>

        <BentoInfoCard
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
        </BentoInfoCard>

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
            <OrderItemRow key={item.id} item={item} />
          ))}
        </View>

        {/* Price Details */}
        <View className="bg-surface-container-low rounded-3xl p-6 mb-10">
          <Text
            className="font-bold text-base mb-4 text-on-surface"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Price Details
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text
                className="text-sm text-on-surface-variant"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Subtotal
              </Text>
              <Text
                className="text-sm text-on-surface font-medium"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                $13.70
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text
                className="text-sm text-on-surface-variant"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Delivery Fee
              </Text>
              <Text
                className="text-sm text-on-surface font-medium"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                $2.50
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text
                className="text-sm text-on-surface-variant"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Estimated Tax
              </Text>
              <Text
                className="text-sm text-on-surface font-medium"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                $1.10
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text
                className="text-sm text-primary font-bold"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                Discount (FRESH20)
              </Text>
              <Text
                className="text-sm text-primary font-bold"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                -$2.00
              </Text>
            </View>

            <View className="pt-4 mt-2 border-t border-outline-variant/20 flex-row justify-between items-end">
              <Text
                className="font-extrabold text-lg text-on-surface"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
              >
                Total
              </Text>
              <Text
                className="font-extrabold text-2xl text-secondary"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
              >
                $15.30
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Area */}
      <View 
        className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-6 pt-4 z-50 shadow-lg"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="max-w-lg mx-auto w-full">
          <TouchableOpacity
            onPress={onPlaceOrder}
            activeOpacity={0.9}
            className="rounded-full overflow-hidden shadow-lg"
          >
            <LinearGradient
              colors={['#0d631b', '#2e7d32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="py-4 flex-row items-center justify-center gap-3"
            >
              <Text
                className="text-on-primary font-extrabold text-lg"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
              >
                Place Order
              </Text>
              <ArrowRight size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text
            className="text-center text-[10px] text-on-surface-variant mt-4 uppercase tracking-widest font-bold"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            Secure Checkout Powered by HarvestPay
          </Text>
        </View>
      </View>
    </View>
  );
}
