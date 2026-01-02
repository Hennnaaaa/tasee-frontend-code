// config/deliveryConfig.js
// ✅ CHANGE DELIVERY DATES HERE - Updates everywhere automatically!

export const deliveryConfig = {
  // Standard shipping (default)
  standard: {
    minDays: 23,        // ← Change this number anytime
    maxDays: 37,       // ← Change this number anytime
    label: 'Standard Delivery',
    description: 'Regular shipping to your location'
  },
  
  // Express/Fast shipping
  express: {
    minDays: 23,
    maxDays: 37,
    label: 'Express Delivery',
    description: 'Faster delivery for an additional fee',
    cost: 15.00
  },
  
  // International shipping
  international: {
    minDays: 23,
    maxDays: 37,
    label: 'International Delivery',
    description: 'Delivery outside the country'
  },
  
  // Pre-order (out of stock items)
  preorder: {
    minDays: 23,
    maxDays: 37,
    label: 'Pre-order Delivery',
    description: 'Item will ship once back in stock'
  },
};