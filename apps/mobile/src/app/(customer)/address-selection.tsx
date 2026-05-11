import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Search,
  Navigation,
  ChevronRight,
  Home,
  Briefcase,
  Edit2,
  History,
  Plus,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAddressStore } from '@/src/features/restaurants/store/address-store';

export default function AddressSelectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setSelectedAddress } = useAddressStore();

  const handleSelectAddress = (address: string) => {
    setSelectedAddress(address);
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View 
        className="bg-white/80 backdrop-blur-md absolute top-0 w-full z-50 flex-row items-center px-6 border-b border-surface-variant/20"
        style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full active:bg-surface-variant"
        >
          <ArrowLeft size={24} color="#00490e" />
        </TouchableOpacity>
        <Text className="font-jakarta-sans font-bold text-lg text-primary ml-2">
          Delivery Address
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: insets.top + 70, 
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 24 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section */}
        <View className="mb-8">
          <View className="relative justify-center">
            <View className="absolute left-4 z-10 pointer-events-none">
              <Search size={20} color="#40493d" />
            </View>
            <TextInput 
              className="w-full h-14 pl-12 pr-4 bg-surface-container-high rounded-xl font-jakarta-sans font-medium text-sm text-on-surface"
              placeholder="Search for area, street, or landmark"
              placeholderTextColor="#40493d"
            />
          </View>
        </View>

        {/* Current Location Button */}
        <TouchableOpacity 
          onPress={() => handleSelectAddress('Current Location (Green Valley)')}
          className="flex-row items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl mb-10 shadow-sm active:bg-surface-container"
        >
          <View className="bg-primary-fixed p-3 rounded-full shadow-sm">
            <Navigation size={24} color="#00490e" fill="#00490e" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-on-surface font-jakarta-sans">Use current location</Text>
            <Text className="text-sm text-on-surface-variant">Using GPS for better accuracy</Text>
          </View>
          <ChevronRight size={20} color="#bfcaba" />
        </TouchableOpacity>

        {/* Map Visualization */}
        <View className="mb-10 h-40 w-full rounded-2xl overflow-hidden relative shadow-sm border border-surface-variant/10">
          <Image 
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhzmhZKCUolF2XW75TN31tPXR3P6XddNn-Q5QoXW1Q18LTMrjJrBH4G96BNKcwqpTJWIajE0yAoL29FcQoGgmcxjJ6PimsFLHyeRyiF05iH6SWiR7heKDtrSnWdYCD7pc5fl3k9IBuFeKioKVZt7zU4qTpzPqmXXrKSbf6TyIEPPquFOh_ztp0miFrwsHFk5BItRZfJMOD9oTVa5yAjiO46wMHPj6rf4Is6DLNkpGqKtdhz-qYlNMc9yZDOe2IalF3Z3_HeIJfcho8" }}
            className="w-full h-full opacity-90"
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-black/10" />
          <View className="absolute bottom-4 left-4 bg-white/90 px-3 py-1.5 rounded-full shadow-sm flex-row items-center gap-2">
            <View className="w-2 h-2 bg-primary rounded-full" />
            <Text className="text-[10px] font-bold tracking-wider uppercase text-on-surface">
              Live Coverage Area
            </Text>
          </View>
        </View>

        {/* Saved Addresses */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-jakarta-sans font-bold text-lg text-on-surface">Saved Addresses</Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-bold">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {/* Home */}
            <TouchableOpacity 
              onPress={() => handleSelectAddress('1242 Orchard Lane')}
              className="bg-surface-container-lowest p-5 rounded-2xl flex-row items-start gap-4 shadow-sm active:bg-surface-container"
            >
              <View className="bg-surface-container p-3 rounded-full">
                <Home size={24} color="#40493d" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-bold font-jakarta-sans text-on-surface">Home</Text>
                  <TouchableOpacity>
                    <Edit2 size={18} color="#bfcaba" />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-on-surface-variant leading-relaxed">
                  1242 Orchard Lane, Green Valley
                </Text>
              </View>
            </TouchableOpacity>

            {/* Work/Studio */}
            <TouchableOpacity 
              onPress={() => handleSelectAddress('88 Artisans Way')}
              className="bg-surface-container-lowest p-5 rounded-2xl flex-row items-start gap-4 shadow-sm active:bg-surface-container"
            >
              <View className="bg-surface-container p-3 rounded-full">
                <Briefcase size={24} color="#40493d" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-bold font-jakarta-sans text-on-surface">Creative Studio</Text>
                  <TouchableOpacity>
                    <Edit2 size={18} color="#bfcaba" />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-on-surface-variant leading-relaxed">
                  88 Artisans Way, Suite 400
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Searches */}
        <View className="mb-8">
          <Text className="font-jakarta-sans font-bold text-lg text-on-surface mb-4">Recent Searches</Text>
          <View className="gap-2">
            <TouchableOpacity 
              onPress={() => handleSelectAddress('241 Maple Avenue')}
              className="flex-row items-center gap-4 py-3 px-2 active:bg-surface-container rounded-lg"
            >
              <History size={20} color="#bfcaba" />
              <Text className="text-on-surface-variant text-sm">241 Maple Avenue, North Hills</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleSelectAddress('Farmers Market Plaza')}
              className="flex-row items-center gap-4 py-3 px-2 active:bg-surface-container rounded-lg"
            >
              <History size={20} color="#bfcaba" />
              <Text className="text-on-surface-variant text-sm">Farmers Market Plaza, Downtown</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View 
        className="fixed bottom-0 left-0 w-full p-6 bg-white/90 backdrop-blur-xl border-t border-surface-variant/20"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity className="w-full bg-primary h-14 rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]">
          <Plus size={24} color="#ffffff" />
          <Text className="text-on-primary font-bold text-base">Add New Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
