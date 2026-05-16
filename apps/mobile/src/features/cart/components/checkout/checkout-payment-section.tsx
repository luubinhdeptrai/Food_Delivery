import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export function CheckoutPaymentSection() {
  return (
    <View className="bg-surface-container-lowest rounded-2xl p-4 gap-4 overflow-hidden border border-outline-variant/15">
      <View className="flex-row justify-between items-center">
        <Text
          className="text-on-surface text-base"
          style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
        >
          Payment Method
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(customer)/checkout/payment')}
        >
          <Text
            className="text-primary text-sm"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Change
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="w-10 h-6 bg-surface-container rounded-sm items-center justify-center border border-outline-variant/30 flex-row overflow-hidden">
          <View
            className="w-3.5 h-3.5 rounded-full bg-red-500/80"
            style={{ marginRight: -6 }}
          />
          <View className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
        </View>
        <View>
          <Text
            className="text-sm text-on-surface"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Mastercard
          </Text>
          <Text
            className="text-xs text-on-surface-variant mt-0.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            **** 8829
          </Text>
        </View>
      </View>
    </View>
  );
}
