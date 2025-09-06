
// Create a new file: src/utils/currency.js
// This utility will handle currency formatting throughout your app

export const formatPrice = (price) => {
  // Convert price to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Format with thousands separator and DA currency
  return `${numPrice.toLocaleString('fr-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} DA`;
};

export const formatPriceSimple = (price) => {
  // Simple format without locale
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${numPrice.toFixed(2)} DA`;
};

// For input fields where you need just the number
export const parsePrice = (priceString) => {
  return parseFloat(priceString.replace(' DA', '').replace(',', ''));
};
