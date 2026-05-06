import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

import { RelatedProductCard } from '../related-product-card';
import type { RelatedProduct } from '@/src/features/restaurants/types';

interface RelatedProductsSectionProps {
  relatedProducts: RelatedProduct[];
  onViewAllRelated?: () => void;
  onRelatedProductAdd?: (productId: string) => void;
}

export function RelatedProductsSection({
  relatedProducts,
  onViewAllRelated,
  onRelatedProductAdd,
}: RelatedProductsSectionProps) {
  return (
    <View className="mt-12">
      <View className="flex-row items-end justify-between px-6 mb-6">
        <Text
          className="text-on-surface text-xl"
          style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
        >
          Fresh Pairs
        </Text>
        <TouchableOpacity onPress={onViewAllRelated} activeOpacity={0.75}>
          <Text
            className="text-primary text-sm"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={relatedProducts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
        renderItem={({ item }) => (
          <RelatedProductCard product={item} onAdd={onRelatedProductAdd} />
        )}
      />
    </View>
  );
}
