import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Tag } from 'lucide-react-native';

interface CheckoutPromoSectionProps {
  onApply: (code: string) => void;
  initialValue?: string;
}

export function CheckoutPromoSection({
  onApply,
  initialValue = '',
}: CheckoutPromoSectionProps) {
  const [promoCode, setPromoCode] = useState(initialValue);

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
          value={promoCode}
          onChangeText={setPromoCode}
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        className={`px-4 py-2.5 rounded-xl ${
          promoCode.trim() ? 'bg-primary' : 'bg-surface-container-high'
        }`}
        onPress={() => onApply(promoCode)}
        disabled={!promoCode.trim()}
      >
        <Text
          className={`text-sm ${
            promoCode.trim() ? 'text-on-primary' : 'text-on-surface'
          }`}
          style={{ fontFamily: 'Inter_500Medium' }}
        >
          Apply
        </Text>
      </TouchableOpacity>
    </View>
  );
}
