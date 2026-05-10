import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Search,
  Star,
  Clock,
  Truck,
  Pizza,
  Soup,
  Leaf,
  Croissant,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HomeTopBar } from '../components';
import { useRestaurants } from '../api/restaurant-api';

const CATEGORIES = [
  { id: 'all', name: 'All', Icon: Utensils, active: true },
  { id: 'italian', name: 'Italian', Icon: Pizza, active: false },
  { id: 'asian', name: 'Asian', Icon: Soup, active: false },
  { id: 'healthy', name: 'Healthy', Icon: Leaf, active: false },
  { id: 'bakery', name: 'Bakery', Icon: Croissant, active: false },
];

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: restaurantsData, isLoading, error } = useRestaurants();

  const restaurants = restaurantsData?.data || [];

  return (
    <View className="flex-1 bg-background font-inter text-on-surface">
      <HomeTopBar insetsTop={insets.top} />

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: insets.top + 70, 
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 16 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section */}
        <View className="mt-4 mb-8">
          <View className="relative justify-center">
            <View className="absolute left-4 z-10 pointer-events-none">
              <Search size={20} color="#707a6c" />
            </View>
            <TextInput 
              className="w-full h-12 pl-12 pr-4 bg-surface-container-high rounded-xl font-inter text-sm text-on-surface shadow-sm"
              placeholder="Search restaurants, dishes..."
              placeholderTextColor="#707a6c"
            />
          </View>
        </View>

        {/* Categories Section */}
        <View className="mb-10">
          <Text className="font-jakarta-sans text-xl font-bold mb-4 text-on-background">
            Explore by Category
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="-mx-4 px-4"
            contentContainerStyle={{ gap: 12 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat.id}
                className={`flex-col items-center gap-2 p-3 rounded-2xl shadow-sm active:scale-95 ${
                  cat.active ? 'bg-primary-fixed' : 'bg-surface-container-low'
                }`}
              >
                <View className="w-14 h-14 bg-surface-container-lowest rounded-full items-center justify-center shadow-sm">
                  <cat.Icon 
                    size={24} 
                    color={cat.active ? "#0d631b" : "#40493d"} 
                    fill={cat.active ? "#0d631b" : "none"}
                  />
                </View>
                <Text className={`font-inter text-sm font-semibold ${
                  cat.active ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Restaurants Section */}
        <View>
          <View className="flex-row justify-between items-end mb-6">
            <Text className="font-jakarta-sans text-2xl font-bold text-on-background tracking-tight">
              Featured Restaurants
            </Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-semibold">See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#0d631b" />
          ) : error ? (
            <Text className="text-error text-center my-4">Error loading restaurants</Text>
          ) : restaurants.length === 0 ? (
            <View className="items-center justify-center my-10">
              <Utensils size={48} color="#707a6c" />
              <Text className="text-on-surface-variant font-medium mt-4">No restaurants available</Text>
            </View>
          ) : (
            <View className="flex-col gap-6">
              {restaurants.map((restaurant) => (
                <TouchableOpacity 
                  key={restaurant.id}
                  onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: restaurant.id } })}
                  className="bg-surface-container-lowest rounded-xl shadow-sm active:scale-[0.98] flex-row p-4 gap-4 items-center border border-surface-variant/30"
                >
                  <View className="w-28 h-28 rounded-xl overflow-hidden bg-surface-container relative">
                    <Image 
                      source={{ uri: restaurant.coverImageUrl || restaurant.logoUrl }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                    <View className="absolute top-2 left-2 bg-surface/90 px-2 py-0.5 rounded-full flex-row items-center gap-1 shadow-sm">
                      <Star size={12} color="#8b5000" fill="#8b5000" />
                      <Text className="font-inter text-xs font-bold text-on-background">
                        {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-1 py-1">
                    <Text className="font-jakarta-sans font-bold text-lg text-on-background leading-tight mb-1">
                      {restaurant.name}
                    </Text>
                    <View className="flex-row items-center gap-1 mb-3">
                      <UtensilsCrossed size={14} color="#40493d" />
                      <Text className="font-inter text-sm text-on-surface-variant">
                        {restaurant.cuisineType || 'Cuisine'}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center gap-3 mt-auto">
                      <View className="flex-row items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md">
                        <Clock size={14} color="#40493d" />
                        <Text className="font-inter text-xs font-medium text-on-surface-variant">
                          {restaurant.deliveryTime || '—'}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Truck size={14} color={restaurant.deliveryFee === 0 ? "#0d631b" : "#40493d"} />
                        <Text className={`font-inter text-xs font-medium ${
                          restaurant.deliveryFee === 0 ? 'text-primary font-semibold' : 'text-on-surface-variant'
                        }`}>
                          {restaurant.deliveryFee === 0 ? 'Free' : (restaurant.deliveryFee ? `+${restaurant.deliveryFee}` : '—')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
