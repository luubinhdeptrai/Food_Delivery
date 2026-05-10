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
  Flame,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MenuItemDetailScreenProps } from '../types';

const MOCK_ITEM = {
  id: 'p1',
  name: 'The Truffle Burger',
  description: 'Double smash patty, black truffle aioli, aged swiss, caramelized onions, and wild arugula on a toasted brioche bun.',
  price: 14.50,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS57RyZgZAhRryvbhRRF1WDGf_Z0eHv2TK2mlE9ULsssfSGSULUdSUF-e5SdFcOWWiVqKJJf-5kvjm1HVds644-2dRI88O3RmoAjhamRg-RC71fKMbUdHx8IO_YFujeCP3myY8gSkTIsB0duaAiLBbVYUaA_uX_O1k6up3nemDwch3aD-cIPRQC4dF0FJTaWAlfK_xVNksCuXxVGJUCR64aseBux_fl8Q1qkKs2xVFU3YhEegAv4A9d32PBwVlbb1fMWDpuqARLc97',
  isPopular: true,
  addOns: [
    {
      id: 'a1',
      name: 'Truffle Fries',
      price: 4.50,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrYjXTnTtjbSHIaVgeK9n0_nJjrYiWtSy2ooXXa1vFu1MD1yqp6T9VtjOVMHbco11BkSTThN-mBSckViufNwey_rc6zTiceaiQ7T9kbMd8BicOMyPX1XLSs-UvjnnjvctoOuDoeYmxsT0frlUa3R4sgAJW85qIE2XB8p1Ss0Dvw9fNwNrsBfClMLPAXP5f-Wnxnh0OJAnpCenfJfZtNOOHrmns9K8l2XrVcg6SGtXYpXRuO4oDGrtxTYJ_6fI2oCVxFFzSQhme8QwG',
    },
    {
      id: 'a2',
      name: 'Craft Cola',
      price: 3.00,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoCt0QaJ-D-BypfLAFHaxy_TEFiSDef_lVtduL_zZ3rqKcn98tvUO5tL9Umgsf4JJy8XGVP-wrZGGesfsIiRThXnhfgkbr19B9pwGcD1VRbYGAvgQkKS6GOs-6a-NlwleVmOjohef7AVY4YL_Kz-2ip6QhgfFZtltnQvVfc945TQPaTaQchpmV-t-RRBQqCbQrd-u-JUyERkSd6XMn5ErA_kF0tWTQ-g0Y5vFNo2xcv2jYXpxO_MvXhUuintn-GK1XWFEo3QeisI5z',
    },
  ],
};

export function MenuItemDetailScreen({
  itemId,
  onBack,
  onFavoriteToggle,
  onAddToCart,
}: MenuItemDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  const item = MOCK_ITEM; // Real app would fetch by itemId

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    const addOnsTotal = selectedAddOns.reduce((acc, id) => {
      const addOn = item.addOns.find(a => a.id === id);
      return acc + (addOn?.price || 0);
    }, 0);
    return (item.price + addOnsTotal) * quantity;
  };

  return (
    <View className="flex-1 bg-background font-inter text-on-surface">
      <StatusBar barStyle="dark-content" />
      
      {/* Top App Bar */}
      <View 
        className="absolute top-0 w-full z-50 flex-row items-center justify-between px-6 bg-surface/80 backdrop-blur-xl"
        style={{ paddingTop: insets.top, height: insets.top + 60 }}
      >
        <TouchableOpacity 
          onPress={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-highest active:scale-95"
        >
          <ArrowLeft size={24} color="#1a1c1c" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => {
            setIsFavorited(!isFavorited);
            onFavoriteToggle?.(itemId);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-highest active:scale-95"
        >
          <Heart 
            size={24} 
            color="#1a1c1c" 
            fill={isFavorited ? "#1a1c1c" : "none"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: insets.top + 70,
          paddingBottom: insets.bottom + 100 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View className="px-4 mb-8">
          <View className="w-full h-80 rounded-3xl overflow-hidden shadow-sm bg-surface-container-low border border-surface-variant/20">
            <Image 
              source={{ uri: item.image }}
              className="w-full h-full"
              contentFit="cover"
              transition={200}
            />
          </View>
        </View>

        {/* Product Info */}
        <View className="px-6 flex-col gap-6">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-4">
              <Text className="font-jakarta-sans font-bold text-3xl text-on-surface tracking-tight mb-2">
                {item.name}
              </Text>
              {item.isPopular && (
                <View className="flex-row">
                  <View className="flex-row items-center gap-1 bg-surface-container-high px-2 py-1 rounded-md">
                    <Flame size={14} color="#8b5000" fill="#8b5000" />
                    <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Popular
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <Text className="font-jakarta-sans font-extrabold text-2xl text-secondary">
              ${item.price.toFixed(2)}
            </Text>
          </View>

          <Text className="font-inter text-base text-on-surface-variant leading-6">
            {item.description}
          </Text>

          <View className="h-[1px] bg-surface-container my-2" />

          {/* Quantity Selection */}
          <View className="flex-row justify-between items-center bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/15">
            <Text className="font-jakarta-sans font-semibold text-lg text-on-surface">Quantity</Text>
            <View className="flex-row items-center gap-4 bg-surface-container-high rounded-full px-2 py-1">
              <TouchableOpacity 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-highest"
              >
                <Minus size={20} color="#0d631b" />
              </TouchableOpacity>
              <Text className="font-jakarta-sans font-bold text-lg w-6 text-center">{quantity}</Text>
              <TouchableOpacity 
                onPress={() => setQuantity(quantity + 1)}
                className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-highest"
              >
                <Plus size={20} color="#0d631b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add-ons */}
          <View className="mt-4">
            <Text className="font-jakarta-sans font-semibold text-lg mb-4">Make it a Meal</Text>
            <View className="flex-row flex-wrap gap-4">
              {item.addOns.map((addOn) => {
                const isSelected = selectedAddOns.includes(addOn.id);
                return (
                  <TouchableOpacity 
                    key={addOn.id}
                    onPress={() => toggleAddOn(addOn.id)}
                    className={`flex-1 min-w-[140px] bg-surface-container-lowest p-4 rounded-2xl border ${
                      isSelected ? 'border-primary' : 'border-outline-variant/15'
                    } items-center text-center gap-2 active:bg-surface-container-low`}
                  >
                    <View className="w-16 h-16 rounded-full bg-surface-container overflow-hidden mb-2">
                      <Image 
                        source={{ uri: addOn.image }}
                        className="w-full h-full"
                        contentFit="cover"
                      />
                    </View>
                    <Text className="font-inter font-medium text-sm text-on-surface">{addOn.name}</Text>
                    <Text className="font-inter text-secondary text-xs font-bold">+${addOn.price.toFixed(2)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View 
        className="fixed bottom-0 left-0 w-full p-4 bg-surface/80 backdrop-blur-xl border-t-0 shadow-[0_-8px_32px_rgba(26,28,28,0.08)] z-50 rounded-t-xl sm:px-6"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity 
          onPress={() => onAddToCart?.(itemId, quantity, selectedAddOns)}
          className="w-full flex-row items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary to-primary-container py-4 shadow-lg active:scale-[0.98]"
        >
          <ShoppingBag size={24} color="#ffffff" />
          <Text className="font-jakarta-sans font-bold text-lg text-white">
            Add to Cart • ${calculateTotal().toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
