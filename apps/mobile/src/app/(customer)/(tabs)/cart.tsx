import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingCart } from 'lucide-react-native';

export default function CartScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-surface items-center justify-center"
      style={{ paddingTop: insets.top }}
    >
      <View className="items-center gap-4 opacity-50">
        <ShoppingCart size={56} color="#707a6c" />
        <Text
          className="text-on-surface-variant text-lg"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Your cart is empty
        </Text>
        <Text
          className="text-outline text-sm text-center px-8"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Add items from the home screen to get started.
        </Text>
      </View>
    </View>
  );
}
