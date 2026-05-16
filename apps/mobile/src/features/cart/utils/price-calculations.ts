import type { CartItem } from '../types';

/**
 * Calculates the base price of a cart item including its modifiers.
 */
export function calculateItemBasePrice(item: CartItem): number {
  const modifiersTotal =
    item.selectedModifiers?.reduce((sum, mod) => sum + mod.price, 0) ?? 0;
  return item.price + modifiersTotal;
}

/**
 * Calculates the total price of a cart item (base price * quantity).
 */
export function calculateItemTotal(item: CartItem): number {
  return calculateItemBasePrice(item) * item.quantity;
}

/**
 * Alias for calculateItemTotal to support different naming requirements in the task.
 */
export function calculateItemTotalPrice(item: CartItem): number {
  return calculateItemTotal(item);
}
