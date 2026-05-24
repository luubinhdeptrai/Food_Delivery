import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRestaurantsApi } from '../api/admin-restaurants.api';

const QUERY_KEY = 'admin-restaurants';

export function useAdminRestaurants(params?: { offset?: number; limit?: number }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => adminRestaurantsApi.list(params),
  });
}

export function useApproveRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminRestaurantsApi.approve,
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUnapproveRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminRestaurantsApi.unapprove,
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminRestaurantsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
