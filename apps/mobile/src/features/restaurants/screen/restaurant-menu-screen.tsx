import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
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
import { useRestaurant, useRestaurantMenu, useRestaurantCategories } from '../api/restaurant-api';

export function RestaurantMenuScreen({
  restaurantId,
  onBack,
  onFavoriteToggle,
  onItemPress,
  onAddItem,
}: RestaurantMenuScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: restaurant, isLoading: isLoadingRest } = useRestaurant(restaurantId);
  const { data: menuData, isLoading: isLoadingMenu } = useRestaurantMenu(restaurantId);
  const { data: categories, isLoading: isLoadingCats } = useRestaurantCategories(restaurantId);

  const menuItems = menuData?.data || [];
  
  const filteredItems = useMemo(() => {
    if (activeCategoryId === 'all') return menuItems;
    return menuItems.filter(item => item.categoryId === activeCategoryId);
  }, [menuItems, activeCategoryId]);

  const isLoading = isLoadingRest || isLoadingMenu || isLoadingCats;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#0d631b" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-on-surface">Restaurant not found</Text>
        <TouchableOpacity onPress={onBack} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          {restaurant.name}
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
            source={{ uri: restaurant.coverImageUrl || restaurant.logoUrl }}
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
                  {restaurant.rating || '4.5'} ({restaurant.reviewCount || '100'}+)
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={14} color="#ffffff" />
                <Text className="text-white text-sm font-medium">
                  {restaurant.deliveryTime || '20-30 min'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Truck size={14} color="#ffffff" />
                <Text className="text-white text-sm font-medium">
                  {restaurant.deliveryFee || 'Free'}
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
            <TouchableOpacity 
              onPress={() => setActiveCategoryId('all')}
              className={`px-6 py-2 rounded-full active:scale-95 ${
                activeCategoryId === 'all' 
                  ? 'bg-primary-fixed shadow-sm' 
                  : 'bg-surface-container-high'
              }`}
            >
              <Text className={`font-jakarta-sans font-semibold text-sm ${
                activeCategoryId === 'all' ? 'text-primary' : 'text-on-surface-variant'
              }`}>
                All
              </Text>
            </TouchableOpacity>
            {categories?.map((cat) => (
              <TouchableOpacity 
                key={cat.id}
                onPress={() => setActiveCategoryId(cat.id)}
                className={`px-6 py-2 rounded-full active:scale-95 ${
                  activeCategoryId === cat.id 
                    ? 'bg-primary-fixed shadow-sm' 
                    : 'bg-surface-container-high'
                }`}
              >
                <Text className={`font-jakarta-sans font-semibold text-sm ${
                  activeCategoryId === cat.id ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View className="px-6 py-8">
          <Text className="font-jakarta-sans text-2xl font-bold text-on-surface mb-6">
            {activeCategoryId === 'all' ? 'Full Menu' : (categories?.find(c => c.id === activeCategoryId)?.name || 'Menu')}
          </Text>
          <View className="flex-col gap-6">
            {filteredItems.map((item) => (
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
                    {item.imageUrl && (
                      <Image 
                        source={{ uri: item.imageUrl }}
                        className="w-full h-full"
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                    )}
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
        
        {/* Spacer for bottom nav */}
        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>
    </View>
  );
}
