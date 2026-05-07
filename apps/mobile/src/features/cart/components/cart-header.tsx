import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface CartHeaderProps {
  insetsTop: number;
  onBack?: () => void;
}

export function CartHeader({ insetsTop, onBack }: CartHeaderProps) {
  return (
    <View
      className="absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between px-4 pb-3 bg-surface/80"
      style={{ paddingTop: insetsTop + 8 }}
    >
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-full bg-surface-container items-center justify-center"
      >
        <ArrowLeft size={20} color="#1a1c1c" />
      </TouchableOpacity>

      <Text
        className="text-on-surface text-[17px]"
        style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
      >
        Your Cart
      </Text>

      {/* Spacer to keep title centred */}
      <View className="w-10 h-10" />
    </View>
  );
}
