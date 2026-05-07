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
import { ArrowLeft, ArrowRight, MapPinPlus, Pencil } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import type { ShippingAddressScreenProps } from '../types';

interface ShippingAddressOption {
  id: string;
  label: string;
  isDefault?: boolean;
  lines: string[];
  phone: string;
}

const ADDRESS_OPTIONS: ShippingAddressOption[] = [
  {
    id: 'home',
    label: 'Home',
    isDefault: true,
    lines: ['1242 Orchard Lane', 'Green Valley, CA 90210'],
    phone: '(555) 012-3456',
  },
  {
    id: 'studio',
    label: 'Creative Studio',
    lines: ['88 Artisans Way, Suite 400', 'Downtown District, CA 90211'],
    phone: '(555) 098-7654',
  },
];

const ORDER_PREVIEW_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB9afqEW_EHwkLZwswWeZrsP2Dq-jjLX78dA9Hh9tfe3VqjVRYT-Dkv_reqJhkMwEpwUT2kg6Xguk5dbYoTviXDgkC3mii0CpcBNaWF1rfiGE-JUZHFAiBoYm0_eLLYCBEZkY3F_9fSP0lPpXvEO-ePwSOzhIPOX5rwS2Fsj7tmP_SyDXODRwDh81QiWStBmiWdgIAbjmkv_pFIJtR12n0TUJPH_Bd7CJ5tm8ucPwIiXC3wohz1F2c3FpXyzuMIdEvWtuVXxXGfvYSZ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDZuTPCjmUB3A7ncwxLTzkYhfPUeovVGovdB0ukXKPzSySPoo6r-wH-f3fEW_2SvsgffZyqXcnc5hiHMwz01MvurRXey7ibncfdbSe0qB8klYyVVyDaqMNza-Z-YjmHg3LxBHSE7njpc4x3Ml932-u0yZ7Gywx2cZ8_dAnyGYFZfNZbhtmKb9_BwKwb1uBBjXabTePXAbnGkmyn3gfwdPUaMnvzo3w5vWBIJG2TBRa_nZ3tIE1go4h8OEV-BxKUuZwf6yCoFivxJYps',
];

const ORDER_TOTAL = 42.85;

function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
}: {
  address: ShippingAddressOption;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSelect}
      className={
        selected
          ? 'bg-primary-fixed/10 border-2 border-primary/30 rounded-[20px]'
          : 'bg-surface-container-lowest border-2 border-transparent rounded-[20px]'
      }
    >
      <View className="p-5">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-start gap-4 flex-1">
            <View
              className={
                selected
                  ? 'mt-1 w-5 h-5 rounded-full border-2 border-primary items-center justify-center'
                  : 'mt-1 w-5 h-5 rounded-full border-2 border-outline-variant items-center justify-center'
              }
            >
              {selected ? (
                <View className="w-2.5 h-2.5 rounded-full bg-primary" />
              ) : null}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1 flex-wrap">
                <Text
                  className="text-on-surface text-base"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                >
                  {address.label}
                </Text>
                {address.isDefault ? (
                  <View className="bg-primary-fixed rounded-full px-2 py-0.5">
                    <Text
                      className="text-[10px]"
                      style={{ fontFamily: 'Inter_700Bold', color: '#002204' }}
                    >
                      DEFAULT
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                className="text-on-surface-variant text-sm leading-relaxed"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {address.lines.join('\n')}
              </Text>
              <Text
                className="text-on-surface-variant text-xs mt-2"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Phone: {address.phone}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onEdit}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Pencil size={18} color="#707a6c" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ShippingAddressScreen({
  onBack,
  onContinue,
  onAddNewAddress,
  onEditAddress,
  onSelectAddress,
}: ShippingAddressScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState(ADDRESS_OPTIONS[0]?.id ?? '');

  const headerHeight = useMemo(() => insets.top + 64, [insets.top]);
  const footerInset = Math.max(insets.bottom, 16);
  const footerHeight = 112 + footerInset;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectAddress?.(id);
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue(selectedId);
    } else {
      router.push('/(customer)/checkout/payment');
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ── Floating Header ─────────────────────────────────────────────── */}
      <View
        className="absolute top-0 left-0 right-0 z-50 bg-surface/80"
        style={{
          paddingTop: insets.top,
          shadowColor: '#1a1c1c',
          shadowOpacity: 0.04,
          shadowRadius: 12,
        }}
      >
        <View className="flex-row items-center px-4 h-16">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-surface-container items-center justify-center"
          >
            <ArrowLeft size={20} color="#0d631b" />
          </TouchableOpacity>
          <Text
            className="ml-2 text-primary text-lg"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Checkout
          </Text>
        </View>
        <View className="h-px bg-surface-container-high" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + 16,
          paddingBottom: footerHeight + 24,
          paddingHorizontal: 16,
          gap: 18,
        }}
      >
        {/* ── Progress Indicator ─────────────────────────────────────────── */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-primary text-sm tracking-wide"
              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
            >
              Step 1 of 3
            </Text>
            <Text
              className="text-on-surface-variant text-xs"
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              Shipping Address
            </Text>
          </View>
          <View className="flex-row gap-2">
            <View className="h-1.5 flex-1 rounded-full bg-primary" />
            <View className="h-1.5 flex-1 rounded-full bg-surface-container-high" />
            <View className="h-1.5 flex-1 rounded-full bg-surface-container-high" />
          </View>
        </View>

        {/* ── Section Title ─────────────────────────────────────────────── */}
        <View className="gap-2">
          <Text
            className="text-on-surface text-2xl"
            style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
          >
            Where should we send your harvest?
          </Text>
          <Text
            className="text-on-surface-variant text-sm"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Select a saved address or add a new delivery location.
          </Text>
        </View>

        {/* ── Address Cards ─────────────────────────────────────────────── */}
        <View className="gap-4">
          {ADDRESS_OPTIONS.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={selectedId === address.id}
              onSelect={() => handleSelect(address.id)}
              onEdit={
                onEditAddress ? () => onEditAddress(address.id) : undefined
              }
            />
          ))}

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onAddNewAddress}
            className="border-2 border-outline-variant rounded-[20px] items-center justify-center py-5 gap-2"
            style={{ borderStyle: 'dashed' }}
          >
            <MapPinPlus size={26} color="#707a6c" />
            <Text
              className="text-on-surface-variant text-sm"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
            >
              Add New Address
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Order Summary Preview ─────────────────────────────────────── */}
        <View className="mt-6 rounded-[24px] bg-surface-container-low/70 p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {ORDER_PREVIEW_IMAGES.map((uri, index) => (
                <View
                  key={uri}
                  className="w-10 h-10 rounded-full border-4 border-surface-container-low overflow-hidden"
                  style={{ marginLeft: index === 0 ? 0 : -12 }}
                >
                  <Image
                    source={{ uri }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                </View>
              ))}
              <View
                className="w-10 h-10 rounded-full border-4 border-surface-container-low bg-primary-fixed-dim items-center justify-center"
                style={{ marginLeft: -12 }}
              >
                <Text
                  className="text-[10px]"
                  style={{ fontFamily: 'Inter_700Bold', color: '#002204' }}
                >
                  +4
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text
                className="text-on-surface-variant text-[10px] tracking-widest"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                EST. DELIVERY
              </Text>
              <Text
                className="text-primary text-sm"
                style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
              >
                Today, 4pm - 6pm
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Action Bar ───────────────────────────────────────────── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-surface/90 px-4 pt-4"
        style={{
          paddingBottom: footerInset,
          shadowColor: '#1a1c1c',
          shadowOpacity: 0.06,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: -4 },
        }}
      >
        <View className="flex-row items-center justify-between mb-4 px-2">
          <Text
            className="text-on-surface-variant text-sm"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Order Total
          </Text>
          <Text
            className="text-secondary text-xl"
            style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
          >
            ${ORDER_TOTAL.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.88}
          className="rounded-full overflow-hidden"
          style={{
            shadowColor: '#0d631b',
            shadowOpacity: 0.2,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
          }}
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
              Continue to Payment
            </Text>
            <ArrowRight size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
