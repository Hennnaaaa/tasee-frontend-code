// components/WishlistButton.jsx

'use client';
import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useWishlist } from '@/contexts/wishlistContext';
import { useAuth } from '@/contexts/authcontext';

const WishlistButton = ({ 
  productId, 
  sizeId = null,
  productData = null,
  variant = 'default', 
  size = 'md',
  showText = false,
  className = '',
  onToggle = null
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Check wishlist status
  useEffect(() => {
    if (isAuthenticated && productId) {
      const status = isInWishlist(productId, sizeId);
      setInWishlist(status);
    } else {
      setInWishlist(false);
    }
  }, [productId, sizeId, isAuthenticated, isInWishlist]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please log in to add items to your wishlist');
      return;
    }

    setLoading(true);

    try {
      const result = await toggleWishlist(productId, sizeId, productData);
      
      if (result.success) {
        setInWishlist(result.inWishlist);
        
        if (onToggle) {
          onToggle(result);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl'
  };

  // Variant classes
  const variantClasses = {
    default: `
      rounded-full border-2 transition-all duration-200 
      ${inWishlist 
        ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600' 
        : 'bg-white border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
      }
    `,
    minimal: `
      transition-all duration-200
      ${inWishlist 
        ? 'text-red-500 hover:text-red-600' 
        : 'text-gray-400 hover:text-red-500'
      }
    `,
    filled: `
      rounded-lg border-2 transition-all duration-200
      ${inWishlist 
        ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' 
        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
      }
    `,
    outline: `
      rounded-lg border-2 bg-transparent transition-all duration-200
      ${inWishlist 
        ? 'border-red-500 text-red-500 hover:bg-red-50' 
        : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
      }
    `
  };

  // Icon size based on button size
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28
  };

  const buttonClass = `
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${className}
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    ${loading ? 'cursor-wait' : 'cursor-pointer'}
  `;

  // Don't show button if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={buttonClass}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <Loader2 size={iconSizes[size]} className="animate-spin" />
      ) : (
        <Heart 
          size={iconSizes[size]} 
          fill={inWishlist ? 'currentColor' : 'none'}
          className={`transition-transform duration-200 ${
            inWishlist ? 'scale-110' : 'hover:scale-110'
          }`}
        />
      )}
      
      {showText && (
        <span className="text-sm font-medium">
          {loading 
            ? 'Loading...' 
            : inWishlist 
              ? 'In Wishlist' 
              : 'Add to Wishlist'
          }
        </span>
      )}
    </button>
  );
};

// Compact version for product cards
export const WishlistButtonCompact = ({ productId, sizeId, productData, className = '' }) => (
  <WishlistButton
    productId={productId}
    sizeId={sizeId}
    productData={productData}
    variant="minimal"
    size="sm"
    className={`absolute top-2 right-2 z-10 ${className}`}
  />
);

// Full button with text for product pages
export const WishlistButtonFull = ({ productId, sizeId, productData, className = '' }) => (
  <WishlistButton
    productId={productId}
    sizeId={sizeId}
    productData={productData}
    variant="outline"
    size="lg"
    showText={true}
    className={`px-6 py-3 ${className}`}
  />
);

export default WishlistButton;