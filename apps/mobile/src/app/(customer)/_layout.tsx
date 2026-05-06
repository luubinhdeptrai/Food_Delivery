import { Tabs } from 'expo-router';
import { Home, ShoppingCart, ReceiptText, User } from 'lucide-react-native';
import { View, Text, Platform } from 'react-native';

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 12,
          shadowColor: '#1a1c1c',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 24,
          borderTopWidth: 0,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl ${focused ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
              <Home size={24} color={focused ? '#14532d' : '#71717a'} fill={focused ? '#14532d' : 'none'} />
              <Text className={`font-inter text-[11px] font-semibold tracking-wide uppercase mt-1 ${focused ? 'text-green-900 dark:text-green-300' : 'text-zinc-500 dark:text-zinc-500'}`}>
                Home
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View className="flex flex-col items-center justify-center px-5 py-2 rounded-2xl">
              <ShoppingCart size={24} color={focused ? '#14532d' : '#71717a'} fill={focused ? '#14532d' : 'none'} />
              <Text className={`font-inter text-[11px] font-semibold tracking-wide uppercase mt-1 ${focused ? 'text-green-900 dark:text-green-300' : 'text-zinc-500 dark:text-zinc-500'}`}>
                Cart
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <View className="flex flex-col items-center justify-center px-5 py-2 rounded-2xl">
              <ReceiptText size={24} color={focused ? '#14532d' : '#71717a'} fill={focused ? '#14532d' : 'none'} />
              <Text className={`font-inter text-[11px] font-semibold tracking-wide uppercase mt-1 ${focused ? 'text-green-900 dark:text-green-300' : 'text-zinc-500 dark:text-zinc-500'}`}>
                Orders
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className="flex flex-col items-center justify-center px-5 py-2 rounded-2xl">
              <User size={24} color={focused ? '#14532d' : '#71717a'} fill={focused ? '#14532d' : 'none'} />
              <Text className={`font-inter text-[11px] font-semibold tracking-wide uppercase mt-1 ${focused ? 'text-green-900 dark:text-green-300' : 'text-zinc-500 dark:text-zinc-500'}`}>
                Profile
              </Text>
            </View>
          ),
        }}
      />
      {/* Product detail sub-group — hidden from tab bar */}
      <Tabs.Screen
        name="product"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
