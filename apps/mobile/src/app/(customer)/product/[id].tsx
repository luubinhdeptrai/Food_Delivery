import { useLocalSearchParams } from 'expo-router';
import { ProductDetailScreen } from '@/src/features/catalog';

export default function ProductDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductDetailScreen productId={id} />;
}
