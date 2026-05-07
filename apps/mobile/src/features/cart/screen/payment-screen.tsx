import React, { useMemo, useState } from 'react';
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
  Banknote,
  CreditCard,
  Leaf,
  PlusCircle,
  Smartphone,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import type { PaymentScreenProps } from '../types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

type SavedCard = {
  id: string;
  last4: string;
  expiry: string;
};

type PaymentOption = {
  id: string;
  label: string;
  tone: 'dark' | 'neutral' | 'soft';
  icon: React.ReactNode;
};

const SAVED_CARDS: SavedCard[] = [
  { id: 'card-4242', last4: '4242', expiry: '12/26' },
  { id: 'card-8812', last4: '8812', expiry: '08/25' },
];

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

const OTHER_METHODS: PaymentOption[] = [
  {
    id: 'apple-pay',
    label: 'Apple Pay',
    tone: 'dark',
    icon: <Smartphone size={18} color="#ffffff" />,
  },
  {
    id: 'google-pay',
    label: 'Google Pay',
    tone: 'neutral',
    icon: <GoogleIcon />,
  },
  {
    id: 'cash',
    label: 'Cash on Delivery',
    tone: 'soft',
    icon: <Banknote size={18} color="#0d631b" />,
  },
];

const ORDER_TOTAL = 142.5;

function SelectionIndicator({ selected }: { selected: boolean }) {
  return (
    <View
      className={
        selected
          ? 'h-6 w-6 rounded-full border-2 border-primary items-center justify-center'
          : 'h-6 w-6 rounded-full border-2 border-outline-variant'
      }
    >
      {selected ? <View className="h-3 w-3 rounded-full bg-primary" /> : null}
    </View>
  );
}

function SavedCardRow({
  card,
  selected,
  onPress,
}: {
  card: SavedCard;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={
        selected
          ? 'relative overflow-hidden rounded-[20px] bg-surface-container-lowest border-2 border-primary/10 shadow-sm'
          : 'relative overflow-hidden rounded-[20px] bg-surface-container-low border-2 border-transparent'
      }
    >
      <View className="p-5">
        <View className="flex-row items-start justify-between">
          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-6 rounded bg-surface-container items-center justify-center">
                <CreditCard
                  size={16}
                  color={selected ? '#0d631b' : '#40493d'}
                />
              </View>
              <Text
                className={
                  selected ? 'text-on-surface' : 'text-on-surface-variant'
                }
                style={{ fontFamily: 'Inter_700Bold', fontSize: 14 }}
              >
                •••• {card.last4}
              </Text>
            </View>
            <View>
              <Text
                className="text-outline text-[10px] tracking-tighter uppercase"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                Expires
              </Text>
              <Text
                className="text-on-surface text-sm"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                {card.expiry}
              </Text>
            </View>
          </View>
          <SelectionIndicator selected={selected} />
        </View>
        {selected ? (
          <View className="absolute -right-4 -bottom-4 opacity-5">
            <Leaf size={120} color="#0d631b" />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function PaymentOptionRow({
  option,
  selected,
  onPress,
}: {
  option: PaymentOption;
  selected: boolean;
  onPress: () => void;
}) {
  const toneStyle =
    option.tone === 'dark'
      ? { backgroundColor: '#000000' }
      : option.tone === 'soft'
        ? { backgroundColor: '#f0fdf4' }
        : { backgroundColor: '#eeeeee' };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="flex-row items-center justify-between rounded-[20px] bg-surface-container-lowest p-4 shadow-sm"
    >
      <View className="flex-row items-center gap-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={toneStyle}
        >
          {option.icon}
        </View>
        <Text
          className="text-on-surface text-sm"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {option.label}
        </Text>
      </View>
      <SelectionIndicator selected={selected} />
    </TouchableOpacity>
  );
}

export function PaymentScreen({
  onBack,
  onContinue,
  onAddPaymentMethod,
  onSelectPaymentMethod,
}: PaymentScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState(SAVED_CARDS[0]?.id ?? '');

  const headerHeight = useMemo(() => insets.top + 64, [insets.top]);
  const footerInset = Math.max(insets.bottom, 16);
  const footerHeight = 120 + footerInset;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectPaymentMethod?.(id);
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue(selectedId);
    } else {
      router.push('/(customer)/checkout/order-review');
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/5" />
      <View className="absolute top-1/2 -right-28 w-72 h-72 rounded-full bg-secondary/5" />

      {/* ── Floating Header ─────────────────────────────────────────────── */}
      <View
        className="absolute top-0 left-0 right-0 z-50 bg-white/80"
        style={{
          paddingTop: insets.top,
          shadowColor: '#1a1c1c',
          shadowOpacity: 0.05,
          shadowRadius: 12,
        }}
      >
        <View className="flex-row items-center px-4 h-16">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full hover:bg-zinc-100 items-center justify-center"
          >
            <ArrowLeft size={24} color="#0d631b" />
          </TouchableOpacity>
          <Text
            className="ml-2 text-primary text-lg"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Checkout
          </Text>
        </View>
        <View className="h-px bg-zinc-100" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + 16,
          paddingBottom: footerHeight + 24,
          paddingHorizontal: 16,
          gap: 32,
        }}
      >
        {/* ── Progress Indicator ───────────────────────────────────────── */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between px-1">
            <Text
              className="text-primary text-[10px] tracking-[0.15em] uppercase"
              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
            >
              Step 2 of 3
            </Text>
            <Text
              className="text-outline text-xs"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Payment Method
            </Text>
          </View>
          <View className="flex-row gap-2 h-1.5">
            <View className="flex-1 rounded-full bg-primary" />
            <View className="flex-1 rounded-full bg-primary" />
            <View className="flex-1 rounded-full bg-surface-container-highest" />
          </View>
        </View>

        {/* ── Saved Cards ─────────────────────────────────────────────── */}
        <View className="gap-4">
          <Text
            className="text-on-surface text-xl px-1"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Saved Cards
          </Text>
          <View className="gap-4">
            {SAVED_CARDS.map((card) => (
              <SavedCardRow
                key={card.id}
                card={card}
                selected={selectedId === card.id}
                onPress={() => handleSelect(card.id)}
              />
            ))}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onAddPaymentMethod}
              className="border-2 border-outline-variant rounded-xl items-center justify-center py-4 flex-row gap-2"
              style={{ borderStyle: 'dashed' }}
            >
              <PlusCircle size={20} color="#0d631b" />
              <Text
                className="text-primary text-sm"
                style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
              >
                Add New Card
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Other Payment Methods ───────────────────────────────────── */}
        <View className="gap-4">
          <Text
            className="text-on-surface text-xl px-1"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Other Methods
          </Text>
          <View className="gap-3">
            {OTHER_METHODS.map((option) => (
              <PaymentOptionRow
                key={option.id}
                option={option}
                selected={selectedId === option.id}
                onPress={() => handleSelect(option.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Action Bar ─────────────────────────────────────────── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white/80 px-4 pt-4"
        style={{
          paddingBottom: footerInset + 8,
          borderTopWidth: 1,
          borderTopColor: 'rgba(244, 244, 245, 0.1)',
          shadowColor: '#1a1c1c',
          shadowOpacity: 0.06,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: -4 },
        }}
      >
        <View className="max-w-lg mx-auto w-full">
          <View className="flex-row items-end justify-between mb-4 px-1">
            <View>
              <Text
                className="text-outline text-[10px] tracking-widest uppercase mb-0.5"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                Total Amount
              </Text>
              <Text
                className="text-secondary text-2xl"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
              >
                ${ORDER_TOTAL.toFixed(2)}
              </Text>
            </View>
            <Text
              className="text-outline text-[10px]"
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              Incl. taxes and shipping
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.9}
            className="rounded-full overflow-hidden"
          >
            <LinearGradient
              colors={['#0d631b', '#2e7d32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text
                className="text-white text-base"
                style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
              >
                Review Order
              </Text>
              <ArrowRight size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
