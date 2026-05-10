import { useLocalSearchParams, useRouter } from "expo-router";
import { RestaurantMenuScreen } from "@/src/features/restaurants";

export default function RestaurantMenuPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleFavoriteToggle = (restaurantId: string) => {
    console.log("Toggle favorite for restaurant:", restaurantId);
  };

  const handleItemPress = (itemId: string) => {
    router.push({ pathname: '/restaurant/menu-item/[id]', params: { id: itemId } });
  };

  const handleAddItem = (itemId: string) => {
    // TODO: Integrate with cart store
    console.log("Add item to cart:", itemId);
  };

  return (
    <RestaurantMenuScreen
      restaurantId={id ?? ""}
      onBack={handleBack}
      onFavoriteToggle={handleFavoriteToggle}
      onItemPress={handleItemPress}
      onAddItem={handleAddItem}
    />
  );
}
