import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="checkout/shipping-address" />
      <Stack.Screen name="product/[id]" />
    </Stack>
  );
}
