import { z } from 'zod';

export const restaurantFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(7, 'Phone number is required'),
  description: z.string().optional(),
  cuisineType: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

export const updateRestaurantFormSchema = restaurantFormSchema.partial().extend({
  isOpen: z.boolean().optional(),
});

export type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;
export type UpdateRestaurantFormValues = z.infer<typeof updateRestaurantFormSchema>;
