import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

interface CheckoutDeliverySectionProps {
  userName: string;
  address: string;
  estimatedMinutes?: number;
}

export function CheckoutDeliverySection({
  userName,
  address,
  estimatedMinutes,
}: CheckoutDeliverySectionProps) {
  return (
    <View className="bg-surface-container-lowest rounded-2xl p-4 gap-4 overflow-hidden border border-outline-variant/15">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center">
            <MapPin size={16} color="#40493d" />
          </View>
          <Text
            className="text-on-surface text-base"
            style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
          >
            Delivery Address
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(customer)/checkout/delivery-address')}
        >
          <Text
            className="text-primary text-sm"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Change
          </Text>
        </TouchableOpacity>
      </View>

      <View className="pl-10">
        <Text
          className="text-on-surface text-sm mb-0.5"
          style={{ fontFamily: 'Inter_500Medium' }}
        >
          {userName}
        </Text>
        <Text
          className="text-on-surface-variant text-sm"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {address}
        </Text>
      </View>

      <View className="pl-10 mt-2">
        <View className="flex-row items-center self-start gap-1.5 bg-primary-fixed/30 px-3 py-1.5 rounded-full">
          <Clock size={14} color="#005312" />
          <Text
            className="text-on-primary-fixed-variant text-xs"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {estimatedMinutes
              ? `Arrives in ${estimatedMinutes} mins`
              : 'Estimating time...'}
          </Text>
        </View>
      </View>
    </View>
  );
}
