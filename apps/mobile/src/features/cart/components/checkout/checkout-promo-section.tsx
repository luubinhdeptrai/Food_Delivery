import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Tag } from 'lucide-react-native';

export function CheckoutPromoSection() {
  return (
    <View className="bg-surface-container-lowest rounded-2xl p-1.5 border border-outline-variant/15 flex-row items-center gap-2">
      <View className="flex-1 relative justify-center">
        <View className="absolute left-3 z-10">
          <Tag size={18} color="#40493d" />
        </View>
        <TextInput
          className="bg-surface-container-high rounded-xl py-2.5 pl-10 pr-3 text-sm text-on-surface"
          style={{ fontFamily: 'Inter_400Regular' }}
          placeholderTextColor="#40493d"
          placeholder="Promo code"
          autoCapitalize="characters"
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-surface-container-high px-4 py-2.5 rounded-xl"
      >
        <Text
          className="text-on-surface text-sm"
          style={{ fontFamily: 'Inter_500Medium' }}
        >
          Apply
        </Text>
      </TouchableOpacity>
    </View>
  );
}
