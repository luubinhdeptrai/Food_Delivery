import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CheckoutBentoCardProps {
  title: string;
  icon: any;
  onEdit: () => void;
  children: React.ReactNode;
}

export function CheckoutBentoCard({
  title,
  icon: Icon,
  onEdit,
  children,
}: CheckoutBentoCardProps) {
  return (
    <View className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm mb-4">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-2">
          <Icon size={18} color="#0d631b" />
          <Text
            className="text-primary font-bold text-base"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            {title}
          </Text>
        </View>
        <TouchableOpacity onPress={onEdit}>
          <Text
            className="text-primary font-bold text-sm underline decoration-2 underline-offset-4"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Edit
          </Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}
