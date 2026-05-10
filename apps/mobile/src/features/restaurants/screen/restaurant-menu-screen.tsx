import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Heart,
  Star,
  Clock,
  Truck,
  Plus,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RestaurantMenuScreenProps } from '../types';

const MOCK_RESTAURANT = {
  id: '1',
  name: 'Burger Atelier',
  category: 'American • Burgers',
  rating: 4.8,
  reviewCount: 500,
  deliveryTime: '20-30 min',
  deliveryFee: '$2.99 delivery',
  heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFXNvf8B3gD01LKcAydxrqUV1pCHKJ_lNSmND6sRPDCl6_LlMHsR4JSakdZyNH18a0YprocvstMfv5sJakfrm5HDezbRTeJPnJ5HhyJOhgUitulff0kMRAt93tKINN8hujXUgnX_0YCLqZIfayvBalYrrF3b0DqVbIzLRZX4hYD94wb7LzbKM1z-BDDFoi2qkH3K4Dxl5BPE7F0w-Gdk6D0YOssNvjez8CdZIX-nfAmfJAFzfubkdfUThGQbQgtZIJqkou3pdOMbKX',
  menu: [
    {
      category: 'Popular Picks',
      items: [
        {
          id: 'p1',
          name: 'The Truffle Burger',
          description: 'Black truffle aioli, aged swiss, caramelized onions, brioche bun.',
          price: 14.50,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDa_oxftG6gnvYghR8sp7pZqfOWPYNzypaoO9idFe0yonjptOgoVtVnls1FIvsKh4M4WHSynL0bh_F8WZvvtnbhXwoKZAWMbFBkEzz5EPufWK_B_mCE4eLOwEM9pn3sGywqJMs62792PDVGnL1T7IBDFcp1HRYZpnMKDmYsDazIBsnLmWBfOijz0A9t5IDJddu15-gO5Cwz1D5s54hGFCiLLSx9GsqZ4TzQK0mgDhFzMFJBZDGYQzCzPv8sQwwgM_uixW_eWRIgn6v',
        },
        {
          id: 'p2',
          name: 'Classic Atelier',
          description: 'Double smash patty, american cheese, house pickles, special sauce.',
          price: 12.00,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSicTu_VCf61B7VCRm-tz2elZ6Y4oGNQcxvgcPTjcRh2BJ9GiQchflyYP33WmXX6K5-IsVFgbM56h-4DrdtYAJg-6C2xqrHIOyyWV6VZCBbe5OaoqDFmnsdee9uCL_dfM4MoUDIzr0fXnDGvUIy9W5dhBu2htXdYzzaUY4ovSZkzrq6grwPzJzOzWGAmj3pjyitxRxaEPPBl7nv_jFk9QKeGk1ZHm1XaYXe5ID32SOTRZ0bAyBSeD3BouqhgYBU9oxQYyeqwBrdkhR',
        },
        {
          id: 'p3',
          name: 'Truffle Parm Fries',
          description: 'Crispy shoestring fries tossed in white truffle oil and parmesan.',
          price: 6.50,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyO8ivEq_eRwhzQdr2Fl7Sqn3UdteOwP_c7ElwSzRsC7Xo8lploMgbvAvER_duCCCP8YkeqYwsN8o44njsbg1yw-pYEIRanVnRLywENwpAMB0ibn7QI2b4wFARlgvWuNuVlaLOpPjAY5f-SNFVijw8kE2UjOueG3CWjrL_dIonxRZCfQUirErp12d6RR9-YcVKHPr54DZZ7pAdio_bNXD3CDfdeTRPc8VEnbeMSBMn-Gj1iKp61aD9vTMo0ALEtBkFsN9SW8HTpc6l',
        },
      ],
    },
  ],
};

export function RestaurantMenuScreen({
  restaurantId,
  onBack,
  onFavoriteToggle,
  onItemPress,
  onAddItem,
}: RestaurantMenuScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('Popular Picks');
  const [isFavorited, setIsFavorited] = useState(false);

  const restaurant = MOCK_RESTAURANT; // In a real app, fetch based on restaurantId

  return (
    <View className="flex-1 bg-surface">
      <StatusBar barStyle="light-content" />
      
      {/* Top App Bar */}
      <View 
        className="absolute top-0 w-full z-50 flex-row items-center justify-between px-6"
        style={{ paddingTop: insets.top, height: insets.top + 60 }}
      >
        <TouchableOpacity 
          onPress={onBack}
          className="bg-white/20 backdrop-blur-md p-2 rounded-full active:scale-95"
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <Text className="font-jakarta-sans font-bold text-white text-lg tracking-tight">
          Restaurant Atelier
        </Text>
        
        <TouchableOpacity 
          onPress={() => {
            setIsFavorited(!isFavorited);
            onFavoriteToggle?.(restaurantId);
          }}
          className="bg-white/20 backdrop-blur-md p-2 rounded-full active:scale-95"
        >
          <Heart 
            size={24} 
            color="#ffffff" 
            fill={isFavorited ? "#ffffff" : "none"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="relative w-full h-80">
          <Image 
            source={{ uri: restaurant.heroImage }}
            className="w-full h-full"
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.7)']}
            locations={[0, 0.2, 0.5, 1]}
            className="absolute inset-0"
          />
          <View className="absolute bottom-0 left-0 right-0 p-6">
            <Text className="font-jakarta-sans text-3xl font-extrabold text-white mb-2">
              {restaurant.name}
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <Star size={14} color="#ffb05f" fill="#ffb05f" />
                <Text className="text-white text-sm font-medium">
                  {restaurant.rating} ({restaurant.reviewCount}+)
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={14} color="#ffffff" />
                <Text className="text-white text-sm font-medium">
                  {restaurant.deliveryTime}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Truck size={14} color="#ffffff" />
                <Text className="text-white text-sm font-medium">
                  {restaurant.deliveryFee}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Nav */}
        <View className="mt-6 px-6">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="-mx-6 px-6 pb-2"
            contentContainerStyle={{ gap: 12 }}
          >
            {restaurant.menu.map((cat) => (
              <TouchableOpacity 
                key={cat.category}
                onPress={() => setActiveCategory(cat.category)}
                className={`px-6 py-2 rounded-full active:scale-95 ${
                  activeCategory === cat.category 
                    ? 'bg-primary-fixed shadow-sm' 
                    : 'bg-surface-container-high'
                }`}
              >
                <Text className={`font-jakarta-sans font-semibold text-sm ${
                  activeCategory === cat.category ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {cat.category}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity className="bg-surface-container-high px-6 py-2 rounded-full active:scale-95">
              <Text className="font-jakarta-sans font-semibold text-sm text-on-surface-variant">Gourmet Burgers</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-surface-container-high px-6 py-2 rounded-full active:scale-95">
              <Text className="font-jakarta-sans font-semibold text-sm text-on-surface-variant">Sides & Shakes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Menu Items */}
        {restaurant.menu.filter(c => c.category === activeCategory).map((cat) => (
          <View key={cat.category} className="px-6 py-8">
            <Text className="font-jakarta-sans text-2xl font-bold text-on-surface mb-6">
              {cat.category}
            </Text>
            <View className="flex-col gap-6">
              {cat.items.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  onPress={() => onItemPress?.(item.id)}
                  className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm active:scale-[0.98] border border-surface-variant/20"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 pr-4">
                      <Text className="font-jakarta-sans text-lg font-bold text-on-surface mb-1">
                        {item.name}
                      </Text>
                      <Text 
                        numberOfLines={2}
                        className="font-inter text-sm text-on-surface-variant leading-5"
                      >
                        {item.description}
                      </Text>
                    </View>
                    <View className="w-24 h-24 rounded-2xl bg-surface-container overflow-hidden border border-outline-variant/15">
                      <Image 
                        source={{ uri: item.image }}
                        className="w-full h-full"
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-jakarta-sans font-bold text-lg text-secondary">
                      ${item.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => onAddItem?.(item.id)}
                      className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-md active:scale-90"
                    >
                      <Plus size={24} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        
        {/* Spacer for bottom nav */}
        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>
    </View>
  );
}
