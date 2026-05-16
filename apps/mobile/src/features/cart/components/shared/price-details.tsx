import React from 'react';
import { View, Text } from 'react-native';

interface PriceDetailRowProps {
  label: string;
  value: string;
  isTotal?: boolean;
  isDiscount?: boolean;
}

function PriceDetailRow({
  label,
  value,
  isTotal,
  isDiscount,
}: PriceDetailRowProps) {
  if (isTotal) {
    return (
      <View className="pt-4 mt-2 border-t border-outline-variant/20 flex-row justify-between items-end">
        <Text
          className="font-extrabold text-lg text-on-surface"
          style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
        >
          {label}
        </Text>
        <Text
          className="font-extrabold text-2xl text-secondary"
          style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
        >
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row justify-between">
      <Text
        className={`text-sm ${isDiscount ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
        style={{
          fontFamily: isDiscount ? 'Inter_700Bold' : 'Inter_400Regular',
        }}
      >
        {label}
      </Text>
      <Text
        className={`text-sm ${isDiscount ? 'text-primary font-bold' : 'text-on-surface font-medium'}`}
        style={{
          fontFamily: isDiscount ? 'Inter_700Bold' : 'Inter_500Medium',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

interface PriceDetailsProps {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount?: {
    label: string;
    amount: number;
  };
  total: number;
}

export function PriceDetails({
  subtotal,
  deliveryFee,
  tax,
  discount,
  total,
}: PriceDetailsProps) {
  return (
    <View className="bg-surface-container-low rounded-3xl p-6 mb-10">
      <Text
        className="font-bold text-base mb-4 text-on-surface"
        style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
      >
        Price Details
      </Text>
      <View className="gap-3">
        <PriceDetailRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
        <PriceDetailRow
          label="Delivery Fee"
          value={`$${deliveryFee.toFixed(2)}`}
        />
        <PriceDetailRow label="Estimated Tax" value={`$${tax.toFixed(2)}`} />
        {discount && (
          <PriceDetailRow
            label={`Discount (${discount.label})`}
            value={`-$${discount.amount.toFixed(2)}`}
            isDiscount
          />
        )}
        <PriceDetailRow label="Total" value={`$${total.toFixed(2)}`} isTotal />
      </View>
    </View>
  );
}
