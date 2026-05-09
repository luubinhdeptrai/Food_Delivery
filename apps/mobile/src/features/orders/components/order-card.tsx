import { View, Text, Image, TouchableOpacity } from 'react-native';

export interface OrderItem {
  id: string;
  image: string;
  alt?: string;
}

export interface OrderProps {
  id: string;
  date: string;
  status: 'Processing' | 'Delivered';
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
  actionText: string;
  onActionPress: () => void;
}

export function OrderCard({
  id,
  date,
  status,
  items,
  totalItems,
  totalPrice,
  actionText,
  onActionPress,
}: OrderProps) {
  const isProcessing = status === 'Processing';

  return (
    <View className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm mb-6 mx-4">
      <View className="p-5 flex-col gap-4">
        {/* Header */}
        <View className="flex-row justify-between items-start">
          <View className="flex-col">
            <Text className="text-base text-on-surface" style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
              {id}
            </Text>
            <Text className="text-on-surface-variant text-sm" style={{ fontFamily: 'Inter_400Regular' }}>
              {date}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full border ${
              isProcessing
                ? 'bg-secondary-container/10 border-secondary/20'
                : 'bg-primary/10 border-primary/20'
            }`}
          >
            <Text
              className={`text-xs ${isProcessing ? 'text-secondary' : 'text-primary'}`}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {status}
            </Text>
          </View>
        </View>

        {/* Thumbnails */}
        <View className="flex-row gap-2">
          {items.slice(0, 3).map((item) => (
            <View
              key={item.id}
              className="w-14 h-14 rounded-2xl bg-surface-container overflow-hidden"
            >
              <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
            </View>
          ))}
          {totalItems > 3 && (
            <View className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center">
              <Text
                className="text-xs text-on-surface-variant"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                +{totalItems - 3}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between pt-2">
          <View className="flex-col">
            <Text className="text-on-surface-variant text-xs" style={{ fontFamily: 'Inter_400Regular' }}>
              {totalItems} Items
            </Text>
            <Text className="text-lg text-on-surface" style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onActionPress}
            activeOpacity={0.8}
            className="bg-primary px-6 py-3 rounded-full shadow-md items-center justify-center min-w-[120px]"
          >
            <Text className="text-on-primary text-sm" style={{ fontFamily: 'Inter_700Bold' }}>
              {actionText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
