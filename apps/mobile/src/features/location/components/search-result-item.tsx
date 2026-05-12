import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface SearchResultItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export function SearchResultItem({
  title,
  subtitle,
  onPress,
}: SearchResultItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-start gap-4 py-3 px-2 active:bg-surface-container rounded-lg"
      accessibilityRole="button"
      accessibilityLabel={`Location: ${title}${subtitle ? `, ${subtitle}` : ''}`}
      accessibilityHint="Selects this location"
      accessibilityState={{ disabled: false }}
    >
      <MapPin size={20} color="#bfcaba" />
      <View className="flex-1">
        <Text className="text-on-surface text-sm font-semibold">{title}</Text>
        {subtitle ? (
          <Text className="text-on-surface-variant text-xs mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
