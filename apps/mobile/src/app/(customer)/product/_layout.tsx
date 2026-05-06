import { Stack } from 'expo-router';

/**
 * Stack layout for the Product sub-section.
 * Keeps the product detail screen within the customer navigation group
 * while providing a slide-in push transition on top of the tab bar.
 */
export const unstable_settings = {
  initialRouteName: '[id]',
};

export default function ProductLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#f9f9f9' },
      }}
    />
  );
}
