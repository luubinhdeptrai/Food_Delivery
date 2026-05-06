import React from 'react';
import { View, Text } from 'react-native';

interface NutritionCellProps {
  label: string;
  value: string | number;
}

export function NutritionCell({ label, value }: NutritionCellProps) {
  return (
    <View className="flex-1 bg-surface-container rounded-2xl p-3 items-center">
      <Text
        className="text-outline text-[10px] uppercase tracking-tighter mb-0.5"
        style={{ fontFamily: 'Inter_700Bold' }}
      >
        {label}
      </Text>
      <Text
        className="text-on-surface text-lg"
        style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
      >
        {value}
      </Text>
    </View>
  );
}
