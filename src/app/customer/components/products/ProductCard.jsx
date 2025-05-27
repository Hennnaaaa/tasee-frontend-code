'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get product images
  const productImages = product.images || [];
  const primaryImage = productImages.find(img => img.isPrimary) || productImages[0];
  const hasMultipleImages = productImages.length > 1;
  
  // Calculate discount percentage if there's a discounted price
  const discountPercentage = product.discountedPrice && product.price
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  // Check if the product has any inventory
  const hasInventory = 
    (product.inventory && product.inventory > 0) || 
    (product.totalInventory && product.totalInventory > 0) ||
    (product.productSizes && product.productSizes.some(size => size.inventory > 0));

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
      className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {/* Product Images */}
          {productImages.length > 0 && !imageError ? (
            <>
              <img
                src={productImages[currentImageIndex]?.url || primaryImage?.url}
                alt={productImages[currentImageIndex]?.alt || product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
              
              {/* Image Navigation for Multiple Images */}
              {hasMultipleImages && isHovered && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
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
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg 
                className="w-16 h-16" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
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
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {/* Discount badge */}
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discountPercentage}% OFF
              </span>
            )}
            
            {/* Stock status badges */}
            {!hasInventory && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Image count badge */}
          {productImages.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {productImages.length} photos
            </div>
          )}
          
          {/* Out of stock overlay */}
          {!hasInventory && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white px-4 py-2 rounded font-semibold text-gray-800">
                Out of Stock
              </div>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-medium text-gray-800 mb-1 hover:text-blue-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Category */}
        {product.category && (
          <div className="text-sm text-gray-500 mb-2">
            {product.category.name}
          </div>
        )}

        {/* Available Sizes */}
        {product.productSizes && product.productSizes.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            Sizes: {product.productSizes
              .filter(ps => ps.inventory > 0)
              .map(ps => ps.size?.name || ps.size?.code)
              .filter(Boolean)
              .join(', ') || 'Out of stock'}
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center mt-2">
          {product.discountedPrice ? (
            <>
              <span className="text-lg font-bold text-gray-800">
                ${parseFloat(product.discountedPrice).toFixed(2)}
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${parseFloat(product.price).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-800">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs font-medium ${
            hasInventory ? 'text-green-600' : 'text-red-600'
          }`}>
            {hasInventory ? 'In Stock' : 'Out of Stock'}
          </span>
          
          {/* Total inventory count */}
          {hasInventory && (
            <span className="text-xs text-gray-500">
              {product.totalInventory || 
               (product.productSizes?.reduce((sum, size) => sum + (size.inventory || 0), 0)) || 
               product.inventory || 0} available
            </span>
          )}
        </div>
        
        {/* Quick add to cart button (visible on hover) */}
        <div className={`mt-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Link 
            href={`/customer/products/${product.id}`}
            className={`w-full block text-center py-2 rounded font-medium transition-colors ${
              hasInventory 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => !hasInventory && e.preventDefault()}
          >
            {hasInventory ? 'View Details' : 'Out of Stock'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;