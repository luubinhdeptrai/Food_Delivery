import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface QuantitySelectorProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

export function QuantitySelector({
  quantity,
  onDecrement,
  onIncrement,
}: QuantitySelectorProps) {
  return (
    <View className="flex-row items-center bg-surface-container-high rounded-full p-1.5 h-14">
      <TouchableOpacity
        onPress={onDecrement}
        activeOpacity={0.75}
        className="w-10 h-10 items-center justify-center bg-surface-container-lowest rounded-full"
      >
        <Text
          className="text-on-surface text-xl"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', lineHeight: 26 }}
        >
          −
        </Text>
      </TouchableOpacity>

      <Text
        className="w-10 text-center text-on-surface text-lg"
        style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
      >
        {quantity}
      </Text>

      <TouchableOpacity
        onPress={onIncrement}
        activeOpacity={0.75}
        className="w-10 h-10 items-center justify-center bg-surface-container-lowest rounded-full"
      >
        <Text
          className="text-on-surface text-xl"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', lineHeight: 26 }}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}
