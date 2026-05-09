import { View, Text } from 'react-native';

export function OrderStats() {
  return (
    <View className="flex-row gap-4 mb-8 px-4">
      <View className="flex-1 bg-surface-container-lowest p-5 rounded-3xl flex-col gap-1 shadow-sm">
        <Text className="text-on-surface-variant text-xs uppercase tracking-wider" style={{ fontFamily: 'Inter_500Medium' }}>
          Total Spent
        </Text>
        <Text className="text-2xl text-primary" style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}>
          $1,248.50
        </Text>
      </View>
      <View className="flex-1 bg-primary-container p-5 rounded-3xl flex-col gap-1 shadow-sm">
        <Text className="text-on-primary-container/80 text-xs uppercase tracking-wider" style={{ fontFamily: 'Inter_500Medium' }}>
          Saved this month
        </Text>
        <Text className="text-2xl text-on-primary-container" style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}>
          $42.15
        </Text>
      </View>
    </View>
  );
}
