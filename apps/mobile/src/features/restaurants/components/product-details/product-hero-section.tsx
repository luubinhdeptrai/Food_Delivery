import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface ProductHeroSectionProps {
  imageUrl: string;
  badge?: string;
}

export function ProductHeroSection({
  imageUrl,
  badge,
}: ProductHeroSectionProps) {
  return (
    <View className="h-[400px] w-full bg-surface-container-low items-center justify-center overflow-hidden">
      <LinearGradient
        colors={['transparent', '#f9f9f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          zIndex: 1,
        }}
      />

      <Image
        source={{ uri: imageUrl }}
        style={{
          width: '80%',
          height: '80%',
        }}
        resizeMode="contain"
      />

      {badge ? (
        <View
          className="absolute top-10 right-8 z-10 bg-primary-fixed rounded-full px-4 py-2"
          style={{
            shadowColor: '#1a1c1c',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            className="text-on-primary-fixed text-xs uppercase tracking-widest"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            {badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
