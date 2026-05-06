import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ShoppingBasket,
} from "lucide-react-native";

import {
  NutritionCell,
  QuantitySelector,
  RelatedProductCard,
  BottomNav,
  ProductDetailTopBar,
} from "@/src/features/restaurants/components";
import type {
  ProductDetailScreenProps,
  Product,
} from "@/src/features/restaurants/types";

// ─── Mock Data ────────────────────────────────────────────────────────────────
// In a real app this would come from a TanStack Query hook

const MOCK_PRODUCT: Product = {
  id: "avocado-hass-organic",
  name: "Organic Hass Avocado",
  subtitle: "Direct from California Farms",
  price: 1.5,
  priceUnit: "per each",
  badge: "Organic",
  description:
    "Experience the buttery texture and rich, nutty flavor of our premium Organic Hass Avocados. Hand-picked at peak ripeness, they are naturally high in healthy fats, vitamin E, and potassium.",
  imageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAD60Djs0joxwm6m06qctKUMto6D3MPY3a6sL3dKJjxMTRv8ME4Oaw56e9853YxwuJx097N2l00DNKLpcOjOxottoBuot0itHce-_dRMp-bN-c9uG4rrft91x9XR7nITFbJmYssKLhqYtNIPN6cKxzDqX2CU-4IRdQMa3EBS4IIj6WJGQDfCLOnD18NsrLY_pBictJPOoq4AeIT_OBVRErFzH0u-UOJzECB66r25h2HOm1Rhwl_JtihuJTrsASuyGGcUIM_nFVphs7H",
  nutrition: {
    calories: 160,
    fat: "15g",
    carbs: "9g",
    protein: "2g",
  },
  relatedProducts: [
    {
      id: "roma-tomatoes",
      name: "Roma Tomatoes",
      price: 0.89,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuALxWFO5TVzXhpno4wo_4PEueJ_VgpdKte2ULkFMWKbr0k8_ywivoLjJ2yYPzCFj8nmN7G1vzdFr0GOcvoeu0uXg0J7HUIDcUlScKajtfJ0djVk5Uk1-57WfGRLBHqpMB2ZBn1Cn_R7xFKMaC6PL1aB8t2aEuH2Q3T4JNy5HzemZ6tTaO-3nj3RAmWXAM0Z3L9tEPtfX5G9FDNT3jDV9hSIzsaOV0o6V5XFl-13hl_ViA4VxhhQBr4srdPX6p9SNuYdik6fvwYXfPrP",
    },
    {
      id: "red-onion",
      name: "Red Onion",
      price: 1.2,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCQjXJURjhH4Vh5zZ-VIS-Cq5M-7sVH4ZgmWALKzjyJqyAeN6tcUR7yUmh7VN4zsvG01n_ug8YQxr_zuHzhBUO9Mwtpn0vzZpEnFMrvhnRo1a8H1hFgusXoqcVNYVIJUMn8iywjk0pnnOKt-MXAYuWicjMCLbsK5jMoY89x3TtwUhMSSgMcBovoAZwXdyLzUwZJljjiXj8MBS4ZAwhy0haSimyENSHWE8Tie7FtsORaPjFPqXq5XdgDFVsnOSOQHjVi3MzXf0rDurj3",
    },
    {
      id: "seedless-limes",
      name: "Seedless Limes",
      price: 0.5,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDRaNjuvd-sueFMtnvaneC3VpzEneWnWwW870uothO2aftRPeHnKfQBcZD5lYnMEYs2eqsNiN4i1za4QTrRpuCGGJSGfty-wnpHTi9xx0ttFJHIlGRCKS-BaTC2kj8YkgJnJGNUunSPBDfNN_puRXDQsNtXXsmBcaJe84XSHGRkVh_-zS6zJcNnHi8P7lQ8yD65nZrAcPELf2zeoS5diyA9J1BZjLqqB4vGagxPxoAwz2btZbG6jO6EdsLZ5xXV1klSjUOfYWITUSFu",
    },
  ],
  isFavorited: true,
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ProductDetailScreen({
  productId,
  onBack,
  onFavoriteToggle,
  onAddToCart,
  onViewAllRelated,
  onRelatedProductAdd,
}: ProductDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(MOCK_PRODUCT.isFavorited ?? false);

  const product = MOCK_PRODUCT; // Replace with useQuery in real implementation

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => q + 1);

  const handleFavorite = () => {
    setIsFavorited((prev) => !prev);
    onFavoriteToggle?.(product.id);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product.id, quantity);
  };

  const BOTTOM_NAV_HEIGHT = 72 + insets.bottom;

  return (
    <View className="flex-1 bg-surface">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ProductDetailTopBar 
        insetsTop={insets.top} 
        onBack={onBack} 
        onFavoriteToggle={handleFavorite} 
        isFavorited={isFavorited} 
      />

      {/* ── Scrollable Content ────────────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 64,
          paddingBottom: BOTTOM_NAV_HEIGHT + 24,
        }}
      >
        {/* ── Hero Image Section ─────────────────────────────────────────── */}
        <View className="h-[400px] w-full bg-surface-container-low items-center justify-center overflow-hidden">
          {/* Gradient overlay */}
          <LinearGradient
            colors={["transparent", "#f9f9f9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              zIndex: 1,
            }}
          />

          {/* Product image */}
          <Image
            source={{ uri: product.imageUrl }}
            style={{
              width: "80%",
              height: "80%",
            }}
            resizeMode="contain"
          />

          {/* Organic badge */}
          {product.badge && (
            <View
              className="absolute top-10 right-8 z-10 bg-primary-fixed rounded-full px-4 py-2"
              style={{
                shadowColor: "#1a1c1c",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text
                className="text-on-primary-fixed text-xs uppercase tracking-widest"
                style={{ fontFamily: "PlusJakartaSans_700Bold" }}
              >
                {product.badge}
              </Text>
            </View>
          )}
        </View>

        {/* ── Product Info Card ─────────────────────────────────────────────── */}
        <View
          className="mx-6 -mt-8 bg-surface-container-lowest rounded-3xl p-6 z-10"
          style={{
            shadowColor: "#1a1c1c",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.04,
            shadowRadius: 30,
            elevation: 4,
          }}
        >
          {/* Name + Price Row */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text
                className="text-on-surface text-3xl tracking-tight"
                style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }}
              >
                {product.name}
              </Text>
              <Text
                className="text-primary text-sm mt-1"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                {product.subtitle}
              </Text>
            </View>
            <View className="items-end">
              <Text
                className="text-secondary text-2xl"
                style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }}
              >
                ${product.price.toFixed(2)}
              </Text>
              <Text
                className="text-outline text-xs mt-0.5"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                {product.priceUnit}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text
            className="text-on-surface-variant leading-relaxed mb-8"
            style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 }}
          >
            {product.description}
          </Text>

          {/* ── Nutrition Bento Grid ────────────────────────────────────── */}
          <View className="flex-row gap-x-3 mb-8">
            <NutritionCell label="Calories" value={product.nutrition.calories} />
            <NutritionCell label="Fat" value={product.nutrition.fat} />
            <NutritionCell label="Carbs" value={product.nutrition.carbs} />
            <NutritionCell label="Protein" value={product.nutrition.protein} />
          </View>

          {/* ── Add to Cart Row ─────────────────────────────────────────── */}
          <View className="flex-row items-center gap-x-4">
            <QuantitySelector
              quantity={quantity}
              onDecrement={handleDecrement}
              onIncrement={handleIncrement}
            />

            <TouchableOpacity
              onPress={handleAddToCart}
              activeOpacity={0.88}
              className="flex-1 rounded-full overflow-hidden"
              style={{
                shadowColor: "#0d631b",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={["#0d631b", "#2e7d32"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 56,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingHorizontal: 20,
                }}
              >
                <ShoppingBasket size={20} color="#ffffff" />
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: "PlusJakartaSans_700Bold" }}
                >
                  Add to Cart
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Related Products Section ──────────────────────────────────────── */}
        <View className="mt-12">
          <View className="flex-row items-end justify-between px-6 mb-6">
            <Text
              className="text-on-surface text-xl"
              style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }}
            >
              Fresh Pairs
            </Text>
            <TouchableOpacity onPress={onViewAllRelated} activeOpacity={0.75}>
              <Text
                className="text-primary text-sm"
                style={{ fontFamily: "PlusJakartaSans_700Bold" }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal scroll */}
          <FlatList
            data={product.relatedProducts}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            renderItem={({ item }) => (
              <RelatedProductCard
                product={item}
                onAdd={onRelatedProductAdd}
              />
            )}
          />
        </View>
      </ScrollView>

      {/* ── Bottom Navigation ──────────────────────────────────────────────── */}
      <BottomNav insetBottom={insets.bottom} activeTab="cart" />
    </View>
  );
}
