'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/currencyContext';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Currency context
  const { formatPrice, currentCurrency } = useCurrency();
  
  // Get product images
  const productImages = product.images || [];
  const primaryImage = productImages.find(img => img.isPrimary) || productImages[0];
  const hasMultipleImages = productImages.length > 1;
  
  // Calculate discount percentage if there's a discounted price
  const discountPercentage = product.discountedPrice && product.price
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  // Enhanced inventory check - properly handles both regular and sized products
  const hasInventory = (() => {
    // If product has sizes, check if any size has inventory
    if (product.productSizes && product.productSizes.length > 0) {
      return product.productSizes.some(size => 
        size.inventory > 0 && size.isActive !== false
      );
    }
    // For regular products, check base inventory
    return product.inventory && product.inventory > 0;
  })();

  // Calculate total available inventory
  const totalInventory = (() => {
    if (product.productSizes && product.productSizes.length > 0) {
      return product.productSizes
        .filter(size => size.isActive !== false)
        .reduce((sum, size) => sum + (size.inventory || 0), 0);
    }
    return product.inventory || 0;
  })();

  // Check if it's low stock (less than 10 items)
  const isLowStock = hasInventory && totalInventory < 10;

  // Handle image navigation
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div 
      className="group relative bg-white overflow-hidden transition-all duration-500 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/customer/products/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 w-full">
          {/* Product Images */}
          {productImages.length > 0 && !imageError ? (
            <>
              <img
                src={productImages[currentImageIndex]?.url || primaryImage?.url}
                alt={productImages[currentImageIndex]?.alt || product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={handleImageError}
              />
              
              {/* Image Navigation for Multiple Images */}
              {hasMultipleImages && isHovered && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 transition-all duration-200 shadow-lg"
                  >
                    <svg className="w-5 h-5 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 transition-all duration-200 shadow-lg"
                  >
                    <svg className="w-5 h-5 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            /* Placeholder for no image */
            <div className="absolute inset-0 flex items-center justify-center text-stone-400 bg-stone-100">
              <svg 
                className="w-20 h-20" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Discount badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-6 right-6">
              <span className="bg-red-600 text-white text-sm font-light px-4 py-2 tracking-wider">
                {discountPercentage}% OFF
              </span>
            </div>
          )}

          {/* Low stock warning - UPDATED: Only show for products with less than 10 items */}
          {isLowStock && (
            <div className="absolute top-6 left-6 bg-yellow-500 text-white text-xs font-light px-3 py-1 tracking-wider">
              ONLY {totalInventory} LEFT
            </div>
          )}

          {/* Lock icon for secured products */}
          <div className="absolute bottom-6 right-6">
            <div className="bg-black/80 text-white p-2 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Out of stock overlay */}
          {!hasInventory && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white px-8 py-4 font-light text-stone-800 tracking-widest text-lg">
                OUT OF STOCK
              </div>
            </div>
          )}

          {/* Hover overlay with quick actions */}
          <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="text-center">
              <button className="bg-white text-stone-800 px-12 py-4 font-light tracking-widest hover:bg-stone-100 transition-colors duration-300 text-lg">
                VIEW DETAILS
              </button>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Product Information */}
      <div className="p-8 bg-white text-center">
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-normal text-stone-800 mb-2 hover:text-stone-600 transition-colors tracking-wide uppercase">
            {product.name}
          </h3>
        </Link>
        
        {/* Available Sizes - Updated to show only available sizes */}
        {product.productSizes && product.productSizes.length > 0 && (
          <div className="text-sm text-stone-500 mb-3 font-light tracking-wide">
            SIZES: {product.productSizes
              .filter(ps => ps.inventory > 0 && ps.isActive !== false)
              .map(ps => ps.size?.name || ps.size?.code)
              .filter(Boolean)
              .join(' • ') || 'Out of stock'}
          </div>
        )}
        
        {/* Price - Updated to use currency context */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          {product.discountedPrice ? (
            <>
              <span className="text-lg font-normal text-stone-800 tracking-wide">
                {formatPrice(product.discountedPrice)}
              </span>
              <span className="text-sm text-stone-500 line-through font-light">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-normal text-stone-800 tracking-wide">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Currency indicator - Shows current currency for clarity */}
        <div className="text-xs text-stone-400 mb-2 font-light tracking-wider">
          PRICE IN {currentCurrency.name.toUpperCase()}
        </div>

        {/* Stock Status - UPDATED: Only show count for low stock items */}
        <div className="text-xs font-light tracking-wide">
          {hasInventory ? (
            isLowStock ? (
              <span className="text-yellow-600">
                LOW STOCK ({totalInventory} available)
              </span>
            ) : (
              <span className="text-green-600">
                IN STOCK
              </span>
            )
          ) : (
            <span className="text-red-600">
              OUT OF STOCK
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;