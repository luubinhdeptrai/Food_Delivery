import React from 'react';
import { View, Text } from 'react-native';

interface CheckoutProgressProps {
  currentStep: number;
  totalSteps?: number;
  stepName: string;
}

export function CheckoutProgress({
  currentStep,
  totalSteps = 3,
  stepName,
}: CheckoutProgressProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text
          className="text-primary text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          Step {currentStep} of {totalSteps}
        </Text>
        <Text
          className="text-on-surface-variant text-xs"
          style={{ fontFamily: 'Inter_500Medium' }}
        >
          {stepName}
        </Text>
      </View>
      <View className="flex-row gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < currentStep ? 'bg-primary' : 'bg-surface-container-high'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
