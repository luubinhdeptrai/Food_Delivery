import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { FileEdit } from 'lucide-react-native';
import { formatCurrency } from '@/src/lib/format-utils';
import type { CartItem } from '../../types';
import { calculateItemTotal, calculateItemBasePrice } from '../../utils/price-calculations';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
}

export function CheckoutOrderSummary({ items }: CheckoutOrderSummaryProps) {
  return (
    <View className="gap-4">
      <Text
        className="text-on-surface text-lg px-2"
        style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
      >
        Order Summary
      </Text>

      <View className="bg-surface-container-lowest rounded-2xl p-2 border border-outline-variant/15">
        {items.map((item, index) => (
          <View key={item.id}>
            <View className="flex-row gap-4 p-2">
              <View className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden items-center justify-center">
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                  />
                ) : (
                  <Text
                    className="text-on-surface-variant"
                    style={{ fontFamily: 'Inter_500Medium' }}
                  >
                    No Image
                  </Text>
                )}
              </View>
              <View className="flex-1 justify-center">
                <Text
                  className="text-sm text-on-surface"
                  style={{ fontFamily: 'Inter_500Medium' }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                  <View className="mt-1 gap-1">
                    {item.selectedModifiers.map((opt, idx) => (
                      <View
                        key={`${opt.groupId}-${opt.optionId}-${idx}`}
                        className="flex-row justify-between items-center pr-2"
                      >
                        <Text
                          className="text-[11px] text-on-surface-variant leading-tight flex-1 mr-4"
                          style={{ fontFamily: 'Inter_400Regular' }}
                        >
                          • {opt.groupName}: {opt.optionName}
                        </Text>
                        {opt.price > 0 && (
                          <Text
                            className="text-[10px] text-on-surface-variant"
                            style={{ fontFamily: 'Inter_500Medium' }}
                          >
                            +{formatCurrency(opt.price)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center gap-3">
                    <Text
                      className="text-sm text-on-surface"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {formatCurrency(calculateItemTotal(item))}
                    </Text>
                    <Text
                      className="text-xs text-on-surface-variant"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      Qty: {item.quantity}
                    </Text>
                  </View>
                  <Text
                    className="text-[10px] text-on-surface-variant"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {formatCurrency(calculateItemBasePrice(item))} each
                  </Text>
                </View>
              </View>
            </View>
            {index < items.length - 1 && (
              <View className="h-px bg-surface-container mx-4 my-1" />
            )}
          </View>
        ))}
      </View>

      {/* Notes Input */}
      <View className="mt-4 relative justify-center">
        <View className="absolute left-3 z-10 top-3">
          <FileEdit size={20} color="#40493d" />
        </View>
        <TextInput
          className="bg-surface-container-high rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface"
          style={{ fontFamily: 'Inter_400Regular' }}
          placeholderTextColor="#40493d"
          placeholder="Notes for Restaurant (Optional)"
        />
      </View>
    </View>
  );
}
