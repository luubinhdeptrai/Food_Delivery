import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CheckoutHeaderProps {
  title?: string;
  onBack: () => void;
}

export function CheckoutHeader({ title = 'Checkout', onBack }: CheckoutHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
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
          onPress={onBack}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-surface-container items-center justify-center"
        >
          <ArrowLeft size={20} color="#0d631b" />
        </TouchableOpacity>
        <Text
          className="ml-2 text-primary text-lg"
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          {title}
        </Text>
      </View>
      <View className="h-px bg-surface-container-high" />
    </View>
  );
}
