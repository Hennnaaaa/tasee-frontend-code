// components/DeliveryEstimate.jsx
// Full-featured delivery component with express options

'use client';

import { Truck, Clock, MapPin } from 'lucide-react';
import { deliveryConfig, getActiveDeliveryConfig } from '@/config/deliveryConfig';

export default function DeliveryEstimate({ 
  product,
  shippingType = 'standard',
  showExpress = true,
  userLocation = null,
  variant = 'full', // 'full', 'compact', 'minimal'
  className = '' 
}) {
  // Auto-detect shipping type based on product
  const detectShippingType = () => {
    if (!product) return shippingType;
    if (product.totalInventory === 0) return 'preorder';
    return shippingType;
  };

  const activeType = detectShippingType();
  const config = getActiveDeliveryConfig(activeType);
  const expressConfig = showExpress && product?.totalInventory > 0 ? deliveryConfig.express : null;

  // Calculate delivery dates
  const calculateDates = (minDays, maxDays) => {
    const today = new Date();
    const minDate = new Date(today);
    const maxDate = new Date(today);
    
    // Add business days
    const addBusinessDays = (date, days) => {
      let count = 0;
      const result = new Date(date);
      while (count < days) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 0 && result.getDay() !== 6) {
          count++;
        }
      }
      return result;
    };
    
    const min = addBusinessDays(today, minDays);
    const max = addBusinessDays(today, maxDays);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
    
    return {
      minDate: min,
      maxDate: max,
      formatted: `${formatDate(min)} – ${formatDate(max)}`
    };
  };

  const estimate = calculateDates(config.minDays, config.maxDays);
  const expressEstimate = expressConfig ? calculateDates(expressConfig.minDays, expressConfig.maxDays) : null;

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 text-sm text-stone-600 ${className}`}>
        <Truck className="w-4 h-4" />
        <span>Delivery: {estimate.formatted}</span>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-stone-50 rounded-lg p-3 ${className}`}>
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-stone-700 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 mb-1">
              {config.label}
            </p>
            <p className="text-sm text-stone-600">
              {estimate.formatted}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-stone-50 rounded-xl p-6 ${className}`}>
      {/* Standard Delivery */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Truck className="w-6 h-6 text-stone-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-stone-900">
              {config.label}
            </h3>
            {product?.totalInventory > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                In Stock
              </span>
            )}
          </div>
          <p className="text-lg font-medium text-stone-700 mb-2">
            {estimate.formatted}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-stone-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{config.minDays}-{config.maxDays} business days</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Shipping to {userLocation}</span>
              </div>
            )}
          </div>
          {config.description && (
            <p className="text-xs text-stone-500 mt-2">{config.description}</p>
          )}
        </div>
      </div>

      {/* Express Delivery Option */}
      {expressEstimate && (
        <>
          <div className="border-t border-stone-200 my-4"></div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200">
              <Truck className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-stone-900">
                  {expressConfig.label}
                </h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                  +${expressConfig.cost.toFixed(2)}
                </span>
              </div>
              <p className="text-lg font-medium text-amber-700 mb-2">
                {expressEstimate.formatted}
              </p>
              <p className="text-sm text-stone-600">
                {expressConfig.description}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Out of Stock Message */}
      {product?.totalInventory === 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Pre-order:</span> This item is currently out of stock. 
            Your order will ship once restocked.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-stone-200">
        <p className="text-xs text-stone-500">
          * Delivery dates are estimates. Business days exclude weekends and holidays.
        </p>
      </div>
    </div>
  );
}