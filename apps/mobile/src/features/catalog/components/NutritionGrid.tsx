import React from 'react';
import { View, Text } from 'react-native';
import type { NutritionInfo } from '../types/product';

interface NutritionGridProps {
  nutrition: NutritionInfo;
}

export function NutritionGrid({ nutrition }: NutritionGridProps) {
  const items = [
    { label: 'Calories', value: String(nutrition.calories) },
    { label: 'Fat', value: nutrition.fat },
    { label: 'Carbs', value: nutrition.carbs },
    { label: 'Protein', value: nutrition.protein },
  ];

  return (
    <View className="flex-row gap-3 mb-8">
      {items.map((item) => (
        <View
          key={item.label}
          className="flex-1 bg-surface-container rounded-2xl p-3 items-center"
        >
          <Text className="text-[10px] font-bold uppercase tracking-tighter text-outline font-label">
            {item.label}
          </Text>
          <Text className="font-headline font-bold text-lg text-on-surface mt-0.5">
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
