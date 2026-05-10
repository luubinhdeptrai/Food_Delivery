/**
 * Formats a number as VND currency string with dots as thousand separators.
 * @param price The price in VND (e.g., 50000)
 * @returns Formatted string (e.g., "50.000")
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

/**
 * Formats a price with the currency suffix.
 * @param price The price in VND
 * @returns Formatted string (e.g., "50.000 VND")
 */
export const formatCurrency = (price: number): string => {
  return `${formatPrice(price)} VND`;
};
