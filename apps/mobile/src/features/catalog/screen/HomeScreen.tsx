import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, ShoppingCart, Search, Leaf, Apple, Fish, Egg, Croissant, Wine, ArrowRight, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const CATEGORIES = [
  { id: '1', name: 'Vegetables', icon: Leaf, active: true },
  { id: '2', name: 'Fruits', icon: Apple, active: false },
  { id: '3', name: 'Seafood', icon: Fish, active: false },
  { id: '4', name: 'Dairy', icon: Egg, active: false },
  { id: '5', name: 'Bakery', icon: Croissant, active: false },
  { id: '6', name: 'Drinks', icon: Wine, active: false },
];

const TRENDING_PRODUCTS = [
  {
    id: '1',
    name: 'Green Broccoli',
    category: 'Organic',
    weight: 'approx. 500g',
    price: '$3.50',
    oldPrice: '$4.40',
    discount: '-20%',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtEmU9jDk593mfx2xlxQ1an7t-f0x87YcXQ-XyXgQmbb1oGEAoNNfWixmZjzDaDbGT7JUTLictc9W4eEoJxMvXOAAnI6CbrV_Cvae0yWD2f5NB6focKolG3UQTRmcvbgaf1cW2ABbgUIGz3SnKvH3wWK73Xm1OZ69pD60sXsWqTIhlTPjpFMP5r-D3sxqjD1W5C0fM_7vO5mOimWwQPQxSbk7RyczkgGaV0ja2NLpd4s41eI5Z5aAsavCnfrBoWYIMoWPOIY7paENN',
  },
  {
    id: '2',
    name: 'Norwegian Salmon',
    category: 'Fresh Fish',
    weight: 'approx. 200g',
    price: '$8.90',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCly3watQ-rlq7AM1QbBUdmplFMV4ZLiuoJGZXZgforRLaccyviNN6ur9cB1mvlCYdZF6tNFGsq3W5syqhl0RtNByh0MeXD9Z2ELqVEM-kZrhKUugmnDglJ3Q4cCA0nkguFShEGuB8ygANBYHb5T-NyMM0-Ogp8TnBRAj13xSfbShJWaDiaecX2hhQ85sXbZKbsKaNEdp6MBvctVA_W9LUkI57-gYf8nJ9lNSxIxGskMaV0KUMXZ8mEugOqycjjDE9zvHEDZ-0ghi02',
  },
  {
    id: '3',
    name: 'Valencia Oranges',
    category: 'Citrus',
    weight: 'Pack of 4',
    price: '$5.20',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjlXlyIiJTPQ3L60YhdFuHexUYqfDfB3sTMle7zCI-KY7_CRIQ8mSRNMatrRmVzyOYEpStgl4WurymBXJ_VlgW58HkBlVBHslBCiFmOsqnI2cIG-QXn6pePVxrjTcvjgvzTwlo021y3HRmU5LHkDy5jNmP-Woa0JADQUan8h_7oNQteY6scJ-ukqUoJAdHoGSwIFzBOtQFlXlRBUpEoekfMLugNweQ3TkxyvfNI69561UY4TXot8L3OkaqG0eG4NzfXLXPvXM5rooR',
  },
  {
    id: '4',
    name: 'Bell Pepper Mix',
    category: 'Fresh',
    weight: 'Bag of 3',
    price: '$4.10',
    oldPrice: '$4.55',
    discount: '-10%',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhiMzBCnCrPM88ANvoddbGlB-cJvrscRyDnPfW0VpAz6e98MGmq_VjcA5Rl9fxMuWS_iCfD4uF6lPAIhabzcgM-gNL99q7aSmV4PnNWdQuoQFf2QZE61lv5rzdany4dyh5jOggKUNMi_SZ3g-SVdSZBxz0MfHx6FzoX_ZsjOgIIUvs7Fug2YCU7T6lsXUaoz7BFyUjXxpnJWX9EZKgwD5Na2_QWN9_7UJeIqQCJadfCZxikMMrBssLFTDiS3feWjHZnJVPAvEhg-oS',
  },
];

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      
      {/* TopAppBar */}
      <View 
        className="absolute top-0 w-full z-50 bg-white/90 dark:bg-zinc-950/90"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <View className="flex-row justify-between items-center px-4 h-16 w-full max-w-md mx-auto">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border border-outline-variant/20">
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU1KNhunCsl_0H3VTfjRPLXhG4bHJNwqooJkbcVNfORDbmpt-MLsyz_QnnUfNtLINude4qleHZsEHZmHoRkH2yzDR2M9g1iou3W9aOz3hxX0_VIYYkaUz4UTiA_R6nIJUJBR5pjZgbT204eJDqN1Jcn7qo71jnaq3SrSmY1p0QNhtPUAkkaUXn11BsaJzFdCJJkP4n9IpeIT7fkhKKXILsoMCgKoaYNb8mzMTiQDB0jh6zmMKIlfiM1HyvTnusLgJEcgg1sD00q-1G' }}
                className="w-full h-full"
              />
            </View>
            <View className="flex-col">
              <Text className="text-primary-container dark:text-primary-fixed font-headline font-extrabold text-lg tracking-tight">
                Digital Grocer
              </Text>
              <View className="flex-row items-center gap-1">
                <MapPin size={12} color="#40493d" />
                <Text className="text-[10px] text-on-surface-variant font-body">
                  District 1, HCM City
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity className="active:scale-95 transition-transform duration-200">
            <ShoppingCart size={24} className="text-primary-container dark:text-primary-fixed" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: insets.top + 80, 
          paddingBottom: 120, // Space for bottom nav
          paddingHorizontal: 16 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section */}
        <View className="mt-4 relative">
          <View className="absolute inset-y-0 left-4 justify-center z-10">
            <Search size={20} color="#707a6c" />
          </View>
          <TextInput
            className="w-full h-12 pl-12 pr-4 bg-surface-container-high rounded-xl font-body text-sm text-on-surface"
            placeholder="Search fresh groceries..."
            placeholderTextColor="#707a6c"
          />
        </View>

        {/* Category Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mt-8 -mx-4 px-4"
          contentContainerStyle={{ gap: 16 }}
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <TouchableOpacity key={category.id} className="items-center gap-2 active:scale-90 transition-transform">
                <View className={`w-16 h-16 rounded-full items-center justify-center shadow-sm ${category.active ? 'bg-primary-fixed' : 'bg-surface-container-lowest border border-surface-container'}`}>
                  <Icon 
                    size={32} 
                    color={category.active ? '#0d631b' : '#40493d'} 
                    fill={category.active ? '#0d631b' : 'none'}
                    strokeWidth={category.active ? 1.5 : 2}
                  />
                </View>
                <Text className={`text-[11px] font-semibold font-label ${category.active ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          <View style={{ width: 16 }} />
        </ScrollView>

        {/* Promotional Banner */}
        <TouchableOpacity className="mt-8 relative w-full h-48 rounded-3xl overflow-hidden bg-primary-container active:scale-[0.98] transition-transform">
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEAydfvb_RwKuGVoiWBAmVZ32xwiLP9xHMtHn2whqI0PKEhU7Q-tfnfGyPJu5SgYm8691I5cgNfiKvulJmI_DcfAETV9xex0q-z94DSPKtHADmgoMzVJMx7dFmSpyNZlQcYTrpWcaINQzDLvqiK1rTLS6Rk7U916Hl2XzXrN9KkbVdPLXkjbaEfPzdDVMoL746jlIrfs_jU-aWS1sUVwJiOc-A6E-blYjQwz-f3QV_DeHX8I6eg1kFUVyTAr7blKVOyRDYJzAGYe-p' }}
            className="absolute inset-0 w-full h-full opacity-60"
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-primary/40 p-6 justify-center flex-col gap-2">
            <View className="bg-secondary-container px-2 py-1 rounded-full w-fit self-start">
              <Text className="text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                Flash Sale
              </Text>
            </View>
            <Text className="font-headline font-extrabold text-white text-2xl leading-tight max-w-[180px]">
              Up to 40% OFF Fresh Produce
            </Text>
            <Text className="text-primary-fixed text-sm font-medium">
              Daily essentials at market price.
            </Text>
            <View className="mt-2 bg-white px-6 py-2 rounded-full self-start">
              <Text className="text-primary font-bold text-xs">Shop Now</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Trending Now Bento Grid */}
        <View className="mt-8">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="font-headline font-bold text-xl text-on-surface">Trending Now</Text>
            <TouchableOpacity>
              <Text className="text-primary font-bold text-xs tracking-wide">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {TRENDING_PRODUCTS.map((product) => (
              <TouchableOpacity
                key={product.id}
                className="w-[48%] bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm mb-4"
                onPress={() => router.push(`/(customer)/product/${product.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`View ${product.name} details`}
              >
                <View className="relative h-40 bg-surface-container overflow-hidden">
                  <Image 
                    source={{ uri: product.image }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                  {product.discount && (
                    <View className="absolute top-3 left-3 bg-secondary px-2 py-0.5 rounded-full">
                      <Text className="text-white text-[10px] font-bold">{product.discount}</Text>
                    </View>
                  )}
                </View>
                <View className="p-4 flex-col gap-1 flex-1">
                  <Text className="text-[10px] text-outline font-bold uppercase">{product.category}</Text>
                  <Text className="font-headline font-bold text-sm text-on-surface" numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text className="text-[10px] text-outline">{product.weight}</Text>
                  
                  <View className="mt-auto pt-3 flex-row items-center justify-between">
                    <View className="flex-col">
                      <Text className="text-secondary font-bold text-base">{product.price}</Text>
                      {product.oldPrice && (
                        <Text className="text-[10px] text-outline line-through">{product.oldPrice}</Text>
                      )}
                    </View>
                    <TouchableOpacity className="bg-primary w-10 h-10 rounded-2xl items-center justify-center shadow-md shadow-primary/20">
                      <Plus size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fresh Picks Recommendation */}
        <TouchableOpacity className="mt-4 bg-primary-fixed-dim/20 rounded-3xl p-6 flex-row items-center gap-6 overflow-hidden">
          <View className="flex-1 space-y-2">
            <Text className="font-headline font-extrabold text-primary-container text-lg">Fresh From Farm</Text>
            <Text className="text-primary-container/80 text-xs">Hand-picked daily, delivered within 2 hours of harvest.</Text>
            <View className="flex-row items-center gap-1 mt-2">
              <Text className="text-primary-container font-bold text-xs">Learn more</Text>
              <ArrowRight size={14} className="text-primary-container" />
            </View>
          </View>
          <View className="w-24 h-24 rotate-12 drop-shadow-xl absolute -right-4 -bottom-4">
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwoqCQHBPd1w2eRe7igfOW3p7shNxsjt3JiAcWkHDkiV9sSvH1DdxwBgSmycz1tesT9tJussYHGppIDKv-ohYbFJbnlgYaMJnvBwKdsgv9bGC0VVOYCdPXOD6aSj2hflYXXBSSvUCBECdRmTuz-oZK_Y0AqKCb5GCTzsGfusOhNkTjmYe_ogvHDW4xn1bsf6Veo9uwkHo4642ldt9ByGndRcfzydmzUpMWTucBfLweMk2ZgmHqG4tsZ3u6Nh6wDmaathXFFzJBNW0w' }}
              className="w-full h-full"
              contentFit="contain"
            />
          </View>
        </TouchableOpacity>
        
      </ScrollView>
    </View>
  );
}
