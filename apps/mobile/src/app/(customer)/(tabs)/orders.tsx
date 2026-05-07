import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReceiptText } from 'lucide-react-native';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-surface items-center justify-center"
      style={{ paddingTop: insets.top }}
    >
      <View className="items-center gap-4 opacity-50">
        <ReceiptText size={56} color="#707a6c" />
        <Text
          className="text-on-surface-variant text-lg"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          No orders yet
        </Text>
        <Text
          className="text-outline text-sm text-center px-8"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Your order history will appear here once you place an order.
        </Text>
      </View>
    </View>
  );
}
