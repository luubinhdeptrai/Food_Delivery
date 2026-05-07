import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CheckoutFooterProps {
  total: number;
  totalLabel?: string;
  actionLabel: string;
  onAction?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export function CheckoutFooter({
  total,
  totalLabel = 'Order Total',
  actionLabel,
  onAction,
  isLoading,
  disabled,
  helperText,
}: CheckoutFooterProps) {
  const insets = useSafeAreaInsets();
  const footerInset = Math.max(insets.bottom, 16);

  const handlePress = () => {
    if (onAction) {
      onAction();
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-surface/90 px-4 pt-4"
      style={{
        paddingBottom: footerInset,
        shadowColor: '#1a1c1c',
        shadowOpacity: 0.06,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: -4 },
      }}
    >
      <View className="max-w-lg mx-auto w-full">
        <View className="flex-row items-end justify-between mb-4 px-2">
          <View>
            <Text
              className="text-on-surface-variant text-[10px] tracking-widest uppercase mb-0.5"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              {totalLabel}
            </Text>
            <Text
              className="text-secondary text-2xl"
              style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
            >
              ${total.toFixed(2)}
            </Text>
          </View>
          {helperText && (
            <Text
              className="text-outline text-[10px]"
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              {helperText}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.88}
          disabled={disabled || isLoading || !onAction}
          className="rounded-full overflow-hidden"
          style={{
            shadowColor: '#0d631b',
            shadowOpacity: 0.2,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <LinearGradient
            colors={['#0d631b', '#2e7d32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text
              className="text-white text-base"
              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
            >
              {isLoading ? 'Processing...' : actionLabel}
            </Text>
            {!isLoading && <ArrowRight size={20} color="#ffffff" />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
