import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  ShoppingBasket,
  Plus,
  Minus,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NutritionGrid } from '../components/NutritionGrid';
import { RelatedProductCard } from '../components/RelatedProductCard';
import type { Product } from '../types/product';

// ---------------------------------------------------------------------------
// Mock product data — replace with API call via TanStack Query when backend ready
// ---------------------------------------------------------------------------
const MOCK_PRODUCT: Product = {
  id: 'avocado-hass-organic',
  name: 'Organic Hass Avocado',
  origin: 'Direct from California Farms',
  price: '$1.50',
  priceUnit: 'per each',
  badge: 'Organic',
  description:
    'Experience the buttery texture and rich, nutty flavor of our premium Organic Hass Avocados. Hand-picked at peak ripeness, they are naturally high in healthy fats, vitamin E, and potassium.',
  highlightedTerms: ['healthy fats', 'vitamin E', 'potassium'],
  nutrition: { calories: 160, fat: '15g', carbs: '9g', protein: '2g' },
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAD60Djs0joxwm6m06qctKUMto6D3MPY3a6sL3dKJjxMTRv8ME4Oaw56e9853YxwuJx097N2l00DNKLpcOjOxottoBuot0itHce-_dRMp-bN-c9uG4rrft91x9XR7nITFbJmYssKLhqYtNIPN6cKxzDqX2CU-4IRdQMa3EBS4IIj6WJGQDfCLOnD18NsrLY_pBictJPOoq4AeIT_OBVRErFzH0u-UOJzECB66r25h2HOm1Rhwl_JtihuJTrsASuyGGcUIM_nFVphs7H',
  isFavorite: false,
  relatedProducts: [
    {
      id: 'roma-tomatoes',
      name: 'Roma Tomatoes',
      price: '$0.89',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuALxWFO5TVzXhpno4wo_4PEueJ_VgpdKte2ULkFMWKbr0k8_ywivoLjJ2yYPzCFj8nmN7G1vzdFr0GOcvoeu0uXg0J7HUIDcUlScKajtfJ0djVk5Uk1-57WfGRLBHqpMB2ZBn1Cn_R7xFKMaC6PL1aB8t2aEuH2Q3T4JNy5HzemZ6tTaO-3nj3RAmWXAM0Z3L9tEPtfX5G9FDNT3jDV9hSIzsaOV0o6V5XFl-13hl_ViA4VxhhQBr4srdPX6p9SNuYdik6fvwYXfPrP',
    },
    {
      id: 'red-onion',
      name: 'Red Onion',
      price: '$1.20',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCQjXJURjhH4Vh5zZ-VIS-Cq5M-7sVH4ZgmWALKzjyJqyAeN6tcUR7yUmh7VN4zsvG01n_ug8YQxr_zuHzhBUO9Mwtpn0vzZpEnFMrvhnRo1a8H1hFgusXoqcVNYVIJUMn8iywjk0pnnOKt-MXAYuWicjMCLbsK5jMoY89x3TtwUhMSSgMcBovoAZwXdyLzUwZJljjiXj8MBS4ZAwhy0haSimyENSHWE8Tie7FtsORaPjFPqXq5XdgDFVsnOSOQHjVi3MzXf0rDurj3',
    },
    {
      id: 'seedless-limes',
      name: 'Seedless Limes',
      price: '$0.50',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDRaNjuvd-sueFMtnvaneC3VpzEneWnWwW870uothO2aftRPeHnKfQBcZD5lYnMEYs2eqsNiN4i1za4QTrRpuCGGJSGfty-wnpHTi9xx0ttFJHIlGRCKS-BaTC2kj8YkgJnJGNUunSPBDfNN_puRXDQsNtXXsmBcaJe84XSHGRkVh_-zS6zJcNnHi8P7lQ8yD65nZrAcPELf2zeoS5diyA9J1BZjLqqB4vGagxPxoAwz2btZbG6jO6EdsLZ5xXV1klSjUOfYWITUSFu',
    },
  ],
};

// ---------------------------------------------------------------------------
// Helper: highlight keyword spans in the product description
// ---------------------------------------------------------------------------
function HighlightedDescription({
  text,
  terms,
}: {
  text: string;
  terms: string[];
}) {
  // Split text around highlighted terms and render spans
  const parts: { text: string; highlight: boolean }[] = [];
  let remaining = text;

  // Simple greedy split — works well for short descriptions with known terms
  let cursor = 0;
  const lowerRemaining = remaining.toLowerCase();
  const occurrences: { start: number; end: number; term: string }[] = [];

  for (const term of terms) {
    let idx = lowerRemaining.indexOf(term.toLowerCase(), 0);
    while (idx !== -1) {
      occurrences.push({ start: idx, end: idx + term.length, term });
      idx = lowerRemaining.indexOf(term.toLowerCase(), idx + 1);
    }
  }

  // Sort by start position
  occurrences.sort((a, b) => a.start - b.start);

  let pos = 0;
  for (const occ of occurrences) {
    if (occ.start > pos) {
      parts.push({ text: text.slice(pos, occ.start), highlight: false });
    }
    parts.push({ text: text.slice(occ.start, occ.end), highlight: true });
    pos = occ.end;
  }
  if (pos < text.length) {
    parts.push({ text: text.slice(pos), highlight: false });
  }

  return (
    <Text className="text-on-surface-variant leading-relaxed mb-8 font-body text-sm">
      {parts.map((part, i) =>
        part.highlight ? (
          <Text key={i} className="text-primary font-bold">
            {part.text}
          </Text>
        ) : (
          <Text key={i}>{part.text}</Text>
        )
      )}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Main Screen Component
// ---------------------------------------------------------------------------
interface ProductDetailScreenProps {
  productId?: string;
}

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(MOCK_PRODUCT.isFavorite ?? false);

  // In production, replace MOCK_PRODUCT with: const { data: product } = useProduct(productId);
  const product = MOCK_PRODUCT;

  function handleDecrement() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function handleIncrement() {
    setQuantity((q) => q + 1);
  }

  function handleAddToCart() {
    Alert.alert(
      'Added to Cart! 🛒',
      `${quantity}x ${product.name} has been added to your cart.`,
      [{ text: 'OK' }]
    );
  }

  function handleToggleFavorite() {
    setIsFavorite((prev) => !prev);
  }

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />

      {/* ------------------------------------------------------------------ */}
      {/* Top App Bar — Glassmorphism floating header                         */}
      {/* ------------------------------------------------------------------ */}
      <View
        className="absolute top-0 w-full z-50 bg-white/80"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <View className="flex-row items-center justify-between px-4 h-14 w-full">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full hover:bg-green-50/50 active:scale-95"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={22} color="#0d631b" />
          </TouchableOpacity>

          <Text className="font-headline font-bold text-lg text-primary">
            Fresh Market
          </Text>

          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full hover:bg-green-50/50 active:scale-95"
            onPress={handleToggleFavorite}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
          >
            <Heart
              size={22}
              color="#0d631b"
              fill={isFavorite ? '#0d631b' : 'none'}
            />
          </TouchableOpacity>
        </View>

        {/* Subtle separator */}
        <View className="h-px bg-surface-container-high" />
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Scrollable Content                                                  */}
      {/* ------------------------------------------------------------------ */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 56, // below app bar
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 100 : 108,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Hero Section: Organic Composition -------------------------- */}
        <View className="relative h-96 w-full bg-surface-container-low items-center justify-center overflow-hidden">
          {/* Gradient fade at bottom */}
          <LinearGradient
            colors={['transparent', '#f9f9f9']}
            className="absolute bottom-0 left-0 right-0 h-24 z-10"
          />

          {/* Product image with editorial "pop" */}
          <Image
            source={{ uri: product.image }}
            className="w-4/5 h-4/5"
            contentFit="contain"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
            }}
            transition={400}
          />

          {/* Badge */}
          {product.badge && (
            <View className="absolute top-10 right-6 z-20">
              <View className="bg-primary-fixed px-4 py-2 rounded-full shadow-sm">
                <Text className="text-on-surface font-headline font-bold text-xs uppercase tracking-widest">
                  {product.badge}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ---- Product Details Card --------------------------------------- */}
        <View className="px-4 -mt-6 relative z-20">
          <View className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
            {/* Name & Price row */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-4">
                <Text className="font-headline font-extrabold text-2xl text-on-surface tracking-tight leading-tight">
                  {product.name}
                </Text>
                <Text className="text-primary font-semibold mt-1 font-body text-sm">
                  {product.origin}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-headline font-black text-2xl text-secondary">
                  {product.price}
                </Text>
                <Text className="text-xs text-outline font-medium font-label">
                  {product.priceUnit}
                </Text>
              </View>
            </View>

            {/* Description with highlighted keywords */}
            <HighlightedDescription
              text={product.description}
              terms={product.highlightedTerms}
            />

            {/* Nutrition Bento Grid */}
            <NutritionGrid nutrition={product.nutrition} />

            {/* Quantity selector + Add to Cart */}
            <View className="flex-row items-center gap-4">
              {/* Quantity Selector */}
              <View className="flex-row items-center bg-surface-container-high rounded-full p-1.5 h-14">
                <TouchableOpacity
                  className="w-10 h-10 items-center justify-center bg-surface-container-lowest rounded-full active:scale-90"
                  onPress={handleDecrement}
                  accessibilityLabel="Decrease quantity"
                  accessibilityRole="button"
                >
                  <Minus size={18} color="#1a1c1c" />
                </TouchableOpacity>

                <Text className="w-10 text-center font-headline font-bold text-lg text-on-surface">
                  {quantity}
                </Text>

                <TouchableOpacity
                  className="w-10 h-10 items-center justify-center bg-surface-container-lowest rounded-full active:scale-90"
                  onPress={handleIncrement}
                  accessibilityLabel="Increase quantity"
                  accessibilityRole="button"
                >
                  <Plus size={18} color="#1a1c1c" />
                </TouchableOpacity>
              </View>

              {/* Add to Cart CTA — gradient button */}
              <TouchableOpacity
                className="flex-1 h-14 rounded-full shadow-md active:scale-95 overflow-hidden"
                onPress={handleAddToCart}
                accessibilityLabel="Add to cart"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#0d631b', '#2e7d32']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-1 flex-row items-center justify-center gap-2"
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <ShoppingBasket size={20} color="#ffffff" />
                  <Text className="text-on-primary font-headline font-bold text-base">
                    Add to Cart
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ---- Related Products Section ----------------------------------- */}
        <View className="mt-10 mb-2">
          <View className="flex-row justify-between items-end mb-5 px-4">
            <Text className="font-headline font-extrabold text-xl text-on-surface">
              Fresh Pairs
            </Text>
            <TouchableOpacity accessibilityRole="button">
              <Text className="text-primary font-bold text-sm font-body">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
          >
            {product.relatedProducts.map((related) => (
              <RelatedProductCard
                key={related.id}
                product={related}
                onAddToCart={(p) =>
                  Alert.alert('Added!', `${p.name} added to cart.`)
                }
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
