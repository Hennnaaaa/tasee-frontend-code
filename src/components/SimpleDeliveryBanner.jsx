// components/SimpleDeliveryBanner.jsx
// Simple banner component - matches your screenshot exactly

'use client';

import { Truck } from 'lucide-react';
import { deliveryConfig } from '@/config/deliveryConfig';

export default function SimpleDeliveryBanner({ 
  shippingType = 'standard', // 'standard', 'express', 'international', 'preorder'
  product = null,             // Optional: pass product to auto-detect shipping type
  className = '' 
}) {
  // Auto-detect shipping type based on product
  const getShippingType = () => {
    if (product) {
      // Out of stock = preorder
      if (product.totalInventory === 0) return 'preorder';
      // Low stock = express available
      if (product.totalInventory < 5) return 'standard';
      // In stock = standard
      return 'standard';
    }
    return shippingType;
  };

  // Get config for this shipping type
  const config = deliveryConfig[getShippingType()];
  
  // Calculate delivery dates
  const getDeliveryDates = () => {
    const today = new Date();
    const minDate = new Date(today);
    const maxDate = new Date(today);
    
    // Add business days (skip weekends)
    let daysAdded = 0;
    let currentDate = new Date(minDate);
    
    // Calculate min date
    while (daysAdded < config.minDays) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sat & Sun
        daysAdded++;
      }
    }
    minDate.setTime(currentDate.getTime());
    
    // Calculate max date
    daysAdded = 0;
    currentDate = new Date(today);
    while (daysAdded < config.maxDays) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    maxDate.setTime(currentDate.getTime());
    
    // Format dates
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
    
    return `${formatDate(minDate)} – ${formatDate(maxDate)}`;
  };

  return (
    <div className={`bg-stone-100 rounded-lg px-4 py-3 flex items-center gap-3 ${className}`}>
      <Truck className="w-5 h-5 text-stone-700 flex-shrink-0" />
      <p className="text-sm text-stone-700">
        <span className="font-medium">Estimated delivery dates:</span>{' '}
        <span className="font-semibold">{getDeliveryDates()}</span>
      </p>
    </div>
  );
}