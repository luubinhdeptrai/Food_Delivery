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

const RESTAURANTS = [
  {
    id: '1',
    name: 'Burger Atelier',
    category: 'American • Burgers',
    rating: 4.8,
    time: '20-30 min',
    deliveryFee: '$2.99',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1X7SiDBnsyp1c7eh6hJ1CGIPStQcrkMQSc31oEieXfat8dFWo9N4TcgDIw1EOJn7U8GxMHuhP9M5JQFLxC45fnaq99Q5Ex30AR72w9i9V2SurHqoRJtLri0578RwJzi6x8M_2evPVsc3yycj_9Dw5p3MnNncA2VPlgHn_ekeD5N-R6HyABn0T8StEXwOcDifSoyYMTa2aY6RCAG9ReNK44JOFPYGsmWTybxvnT_wDNbSU_Cnp-FyBZSAoMveYqU677UNhOBXxztYS',
  },
  {
    id: '2',
    name: 'Ocean Blue Sushi',
    category: 'Japanese • Sushi',
    rating: 4.9,
    time: '35-45 min',
    deliveryFee: 'Free',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-sJksw2vATPpH8-3Um-gQiZ7awGIDJqsVjZjjYhPl3aj2GqHayU8xGnX_8h4awwo1_G1gdSXgla1PFCP9x5Rsu3U1x5Nf-h35eFOmNdOp4UElo4T94dmVhtzhX5bBuOmf0ALDV72pcBszcMKyJSZzSiLXNoCXSJeI7ghQ8i2VTt2gQCQGoNJbIAHF-0Eu2pF8Dmdd42ebMv-qWuyH2mG4gxEvWFGAA9RD3nohDWSA6hXunpH13BVDql3PFm_LHrsyV_GQXSJFCCFr',
  },
  {
    id: '3',
    name: 'Nonna\'s Trattoria',
    category: 'Italian • Pasta',
    rating: 4.6,
    time: '25-40 min',
    deliveryFee: '$1.49',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARedRJcjr5YqgqqlzfuPbZG180GRzyKTAOw4khZ-BpVd2F2Kn_X9eISaDziroPv5pcNH_uKLB6lmZlMEKH63A2eghhoYLbTAYkyuFUp3G5pSX7ah0hSO5UtTYDU6GKL9RCjWgwTf0cROhZEM_dukQ1ceyOBRdpU45d13dDbNUUkTqhRlKrQaI8JeFdlJxPEYjpMwlnX9y-83Y1lql88x0gUHYTnQSpkGRGWGcGDRDkrFBOYnsB-BS-lEcmM750Zf0vyrtSQ-Z-8BEd',
  },
];

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

          <View className="flex-col gap-6">
            {RESTAURANTS.map((restaurant) => (
              <TouchableOpacity 
                key={restaurant.id}
                onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: restaurant.id } })}
                className="bg-surface-container-lowest rounded-xl shadow-sm active:scale-[0.98] flex-row p-4 gap-4 items-center border border-surface-variant/30"
              >
                <View className="w-28 h-28 rounded-xl overflow-hidden bg-surface-container relative">
                  <Image 
                    source={{ uri: restaurant.image }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                  <View className="absolute top-2 left-2 bg-surface/90 px-2 py-0.5 rounded-full flex-row items-center gap-1 shadow-sm">
                    <Star size={12} color="#8b5000" fill="#8b5000" />
                    <Text className="font-inter text-xs font-bold text-on-background">
                      {restaurant.rating}
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
                      {restaurant.category}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center gap-3 mt-auto">
                    <View className="flex-row items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md">
                      <Clock size={14} color="#40493d" />
                      <Text className="font-inter text-xs font-medium text-on-surface-variant">
                        {restaurant.time}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Truck size={14} color={restaurant.deliveryFee === 'Free' ? "#0d631b" : "#40493d"} />
                      <Text className={`font-inter text-xs font-medium ${
                        restaurant.deliveryFee === 'Free' ? 'text-primary font-semibold' : 'text-on-surface-variant'
                      }`}>
                        {restaurant.deliveryFee}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
