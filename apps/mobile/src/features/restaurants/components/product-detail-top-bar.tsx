import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Heart } from 'lucide-react-native';

interface ProductDetailTopBarProps {
  insetsTop: number;
  onBack?: () => void;
  onFavoriteToggle?: () => void;
  isFavorited: boolean;
}

export function ProductDetailTopBar({
  insetsTop,
  onBack,
  onFavoriteToggle,
  isFavorited,
}: ProductDetailTopBarProps) {
  return (
    <View
      className="absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between px-4 bg-surface-container-lowest"
      style={{
        paddingTop: insetsTop + 8,
        paddingBottom: 12,
        shadowColor: '#1a1c1c',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.75}
        className="w-10 h-10 items-center justify-center rounded-full hover:bg-primary-fixed"
      >
        <ArrowLeft size={24} color="#0d631b" />
      </TouchableOpacity>

      <Text
        className="text-lg text-primary"
        style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
      >
        Fresh Market
      </Text>

      <TouchableOpacity
        onPress={onFavoriteToggle}
        activeOpacity={0.75}
        className="w-10 h-10 items-center justify-center rounded-full"
      >
        <Heart
          size={24}
          color="#0d631b"
          fill={isFavorited ? '#0d631b' : 'none'}
        />
      </TouchableOpacity>
    </View>
  );
}
