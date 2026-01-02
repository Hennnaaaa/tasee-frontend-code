// config/deliveryConfig.js
// ✅ CHANGE DELIVERY DATES HERE - Updates everywhere automatically!

export const deliveryConfig = {
  // Standard shipping (default)
  standard: {
    minDays: 43,        // ← Change this number anytime
    maxDays: 53,       // ← Change this number anytime
    label: 'Standard Delivery',
    description: 'Regular shipping to your location'
  },
  
  // Express/Fast shipping
  express: {
    minDays: 43,
    maxDays: 53,
    label: 'Express Delivery',
    description: 'Faster delivery for an additional fee',
    cost: 15.00
  },
  
  // International shipping
  international: {
    minDays: 43,
    maxDays: 53,
    label: 'International Delivery',
    description: 'Delivery outside the country'
  },
  
  // Pre-order (out of stock items)
  preorder: {
    minDays: 43,
    maxDays: 53,
    label: 'Pre-order Delivery',
    description: 'Item will ship once back in stock'
  },
};