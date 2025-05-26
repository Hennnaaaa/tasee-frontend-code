'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate discount percentage if there's a discounted price
  const discountPercentage = product.discountedPrice && product.price
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  // Check if the product has any inventory
  const hasInventory = 
    (product.inventory && product.inventory > 0) || 
    (product.totalInventory && product.totalInventory > 0);
  
  return (
    <div 
      className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {/* Placeholder for product image */}
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
              ></path>
            </svg>
          </div>
          
          {/* Discount badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discountPercentage}% OFF
            </div>
          )}
          
          {/* Out of stock overlay */}
          {!hasInventory && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white px-4 py-2 rounded font-semibold text-gray-800">
                Out of Stock
              </div>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-medium text-gray-800 mb-1 hover:text-blue-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Category */}
        {product.category && (
          <div className="text-sm text-gray-500 mb-2">
            {product.category.name}
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center mt-2">
          {product.discountedPrice ? (
            <>
              <span className="text-lg font-bold text-gray-800">
                ${product.discountedPrice}
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-800">
              ${product.price}
            </span>
          )}
        </div>
        
        {/* Quick add to cart button (visible on hover) */}
        <div className={`mt-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Link 
            href={`/products/${product.id}`}
            className={`w-full block text-center py-2 rounded ${
              hasInventory 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => !hasInventory && e.preventDefault()}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;