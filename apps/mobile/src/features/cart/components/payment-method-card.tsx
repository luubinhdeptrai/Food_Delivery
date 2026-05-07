import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CreditCard, Leaf } from 'lucide-react-native';

interface SelectionIndicatorProps {
  selected: boolean;
}

function SelectionIndicator({ selected }: SelectionIndicatorProps) {
  return (
    <View
      className={
        selected
          ? 'h-6 w-6 rounded-full border-2 border-primary items-center justify-center'
          : 'h-6 w-6 rounded-full border-2 border-outline-variant'
      }
    >
      {selected ? <View className="h-3 w-3 rounded-full bg-primary" /> : null}
    </View>
  );
}

interface PaymentMethodCardProps {
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  tone?: 'dark' | 'neutral' | 'soft' | 'surface';
  type?: 'card' | 'option';
}

export function PaymentMethodCard({
  label,
  subtitle,
  icon,
  selected,
  onPress,
  tone = 'surface',
  type = 'option',
}: PaymentMethodCardProps) {
  const getToneStyle = () => {
    switch (tone) {
      case 'dark':
        return { backgroundColor: '#000000' };
      case 'soft':
        return { backgroundColor: '#f0fdf4' };
      case 'neutral':
        return { backgroundColor: '#eeeeee' };
      default:
        return {};
    }
  };

  if (type === 'card') {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        className={
          selected
            ? 'relative overflow-hidden rounded-[20px] bg-surface-container-lowest border-2 border-primary/10 shadow-sm'
            : 'relative overflow-hidden rounded-[20px] bg-surface-container-low border-2 border-transparent'
        }
      >
        <View className="p-5">
          <View className="flex-row items-start justify-between">
            <View className="gap-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-6 rounded bg-surface-container items-center justify-center">
                  <CreditCard
                    size={16}
                    color={selected ? '#0d631b' : '#40493d'}
                  />
                </View>
                <Text
                  className={
                    selected ? 'text-on-surface' : 'text-on-surface-variant'
                  }
                  style={{ fontFamily: 'Inter_700Bold', fontSize: 14 }}
                >
                  {label}
                </Text>
              </View>
              {subtitle && (
                <View>
                  <Text
                    className="text-outline text-[10px] tracking-tighter uppercase"
                    style={{ fontFamily: 'Inter_700Bold' }}
                  >
                    Expires
                  </Text>
                  <Text
                    className="text-on-surface text-sm"
                    style={{ fontFamily: 'Inter_500Medium' }}
                  >
                    {subtitle}
                  </Text>
                </View>
              )}
            </View>
            <SelectionIndicator selected={selected} />
          </View>
          {selected ? (
            <View className="absolute -right-4 -bottom-4 opacity-5">
              <Leaf size={120} color="#0d631b" />
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="flex-row items-center justify-between rounded-[20px] bg-surface-container-lowest p-4 shadow-sm"
    >
      <View className="flex-row items-center gap-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={getToneStyle()}
        >
          {icon}
        </View>
        <Text
          className="text-on-surface text-sm"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {label}
        </Text>
      </View>
      <SelectionIndicator selected={selected} />
    </TouchableOpacity>
  );
}
