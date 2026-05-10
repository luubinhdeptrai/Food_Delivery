import { useLocalSearchParams, useRouter } from "expo-router";
import { MenuItemDetailScreen } from "@/src/features/restaurants";

export default function MenuItemDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleFavoriteToggle = (itemId: string) => {
    console.log("Toggle favorite for menu item:", itemId);
  };

  const handleAddToCart = (itemId: string, quantity: number, addOnIds: string[]) => {
    // TODO: Integrate with cart store
    console.log("Add menu item to cart:", itemId, "qty:", quantity, "addOns:", addOnIds);
  };

  return (
    <MenuItemDetailScreen
      itemId={id ?? ""}
      onBack={handleBack}
      onFavoriteToggle={handleFavoriteToggle}
      onAddToCart={handleAddToCart}
    />
  );
}
