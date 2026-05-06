import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, ShoppingCart } from 'lucide-react-native';

interface HomeTopBarProps {
  insetsTop: number;
}

export function HomeTopBar({ insetsTop }: HomeTopBarProps) {
  return (
    <View 
      className="absolute top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 shadow-sm dark:shadow-none"
      style={{ paddingTop: Math.max(insetsTop, 16), paddingBottom: 16 }}
    >
      <View className="flex-row justify-between items-center px-4 w-full max-w-md mx-auto">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border border-outline-variant/20">
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAU1KNhunCsl_0H3VTfjRPLXhG4bHJNwqooJkbcVNfORDbmpt-MLsyz_QnnUfNtLINude4qleHZsEHZmHoRkH2yzDR2M9g1iou3W9aOz3hxX0_VIYYkaUz4UTiA_R6nIJUJBR5pjZgbT204eJDqN1Jcn7qo71jnaq3SrSmY1p0QNhtPUAkkaUXn11BsaJzFdCJJkP4n9IpeIT7fkhKKXILsoMCgKoaYNb8mzMTiQDB0jh6zmMKIlfiM1HyvTnusLgJEcgg1sD00q-1G" }}
              className="w-full h-full"
              contentFit="cover"
            />
          </View>
          <View className="flex-col">
            <Text className="text-primary-container dark:text-primary-fixed font-jakarta-sans font-extrabold tracking-tight text-lg">Digital Grocer</Text>
            <View className="flex-row items-center gap-1">
              <MapPin size={12} color="#707a6c" />
              <Text className="text-[10px] text-on-surface-variant font-inter">District 1, HCM City</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity className="active:scale-95 transition-transform duration-200">
          <ShoppingCart size={24} color="#0d631b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
