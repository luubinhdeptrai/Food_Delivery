import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import type { RelatedProduct } from '../types/product';

interface RelatedProductCardProps {
  product: RelatedProduct;
  onAddToCart?: (product: RelatedProduct) => void;
}

export function RelatedProductCard({ product, onAddToCart }: RelatedProductCardProps) {
  return (
    <View className="w-40 bg-surface-container-lowest rounded-3xl p-3 shadow-sm flex-col mr-4">
      {/* Product Image */}
      <View className="h-32 bg-surface-container rounded-2xl mb-3 overflow-hidden">
        <Image
          source={{ uri: product.image }}
          className="w-full h-full"
          contentFit="cover"
          transition={300}
        />
      </View>

      {/* Product Name */}
      <Text
        className="font-headline font-bold text-sm text-on-surface"
        numberOfLines={1}
      >
        {product.name}
      </Text>

      {/* Price + Add Button */}
      <View className="flex-row items-center justify-between mt-2">
        <Text className="font-headline font-black text-secondary text-sm">
          {product.price}
        </Text>
        <TouchableOpacity
          className="w-8 h-8 bg-surface-container-high rounded-full items-center justify-center active:scale-90"
          onPress={() => onAddToCart?.(product)}
          accessibilityLabel={`Add ${product.name} to cart`}
          accessibilityRole="button"
        >
          <Plus size={16} color="#0d631b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
