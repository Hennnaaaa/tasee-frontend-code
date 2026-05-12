'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCurrency } from '@/contexts/currencyContext';
import { useWishlist } from '@/contexts/wishlistContext';
import { getUserData } from '@/utils/auth';

const ProductCard = ({ product }) => {
  const productImages = product.images || [];
  const hasMultipleImages = productImages.length > 1;

  const initialIndex = (() => {
    const idx = productImages.findIndex(img => img.isPrimary);
    return idx > -1 ? idx : 0;
  })();

  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const imageRef = useRef(null);
  const didSwipe = useRef(false);

  const { formatPrice } = useCurrency();
  const { toggleWishlist, checkWishlistStatus } = useWishlist();

  useEffect(() => {
    if (product?.id) setIsInWishlist(checkWishlistStatus(product.id));
  }, [product?.id, checkWishlistStatus]);

  // Native non-passive touch listeners so we can preventDefault on horizontal swipe
  useEffect(() => {
    const el = imageRef.current;
    if (!el || productImages.length <= 1) return;

    let startX = null;
    let startY = null;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      didSwipe.current = false;
    };

    const onTouchMove = (e) => {
      if (startX === null) return;
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      // Lock axis: if moving more horizontally than vertically, prevent page scroll
      if (dx > dy && dx > 6) e.preventDefault();
    };

    const onTouchEnd = (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = Math.abs(e.changedTouches[0].clientY - startY);

      if (Math.abs(dx) > 25 && Math.abs(dx) > dy) {
        didSwipe.current = true;
        if (dx < 0) {
          setCurrentImageIndex(prev => Math.min(prev + 1, productImages.length - 1));
        } else {
          setCurrentImageIndex(prev => Math.max(prev - 1, 0));
        }
      }
      startX = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false }); // must be non-passive to preventDefault
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [productImages.length]);

  const discountPercentage = product.discountedPrice && product.price
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const hasInventory = (() => {
    if (product.productSizes?.length > 0) {
      return product.productSizes.some(s => s.inventory > 0 && s.isActive !== false);
    }
    return (product.inventory || 0) > 0;
  })();

  const totalInventory = (() => {
    if (product.productSizes?.length > 0) {
      return product.productSizes
        .filter(s => s.isActive !== false)
        .reduce((sum, s) => sum + (s.inventory || 0), 0);
    }
    return product.inventory || 0;
  })();

  const isLowStock = hasInventory && totalInventory < 10;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const authData = getUserData();
    if (!authData?.token) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    setIsWishlistLoading(true);
    try {
      await toggleWishlist(product.id, null, product);
      setIsInWishlist(!isInWishlist);
    } catch {
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(Math.max(0, Math.min(index, productImages.length - 1)));
  };

  // Block Link navigation if the touch was a swipe, not a tap
  const handleLinkClick = (e) => {
    if (didSwipe.current) {
      e.preventDefault();
      didSwipe.current = false;
    }
  };

  return (
    <div className="group relative bg-white overflow-hidden w-full">

      {/* Wishlist — outside Link, always on top */}
      <button
        onClick={handleWishlistToggle}
        disabled={isWishlistLoading}
        className={`absolute top-2 left-2 z-30 p-1.5 sm:p-2 rounded-full shadow backdrop-blur-sm transition-all duration-300
          ${isInWishlist ? 'bg-red-500/90 text-white hover:bg-red-600' : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-500'}
          ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-200 ${isInWishlist ? 'fill-current' : ''} ${isWishlistLoading ? 'animate-pulse' : ''}`} />
      </button>

      <Link
        href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/products/${product.id}`}
        onClick={handleLinkClick}
      >
        {/* Image container — touch listeners attached via useEffect */}
        <div
          ref={imageRef}
          className="relative aspect-[3/4] overflow-hidden bg-stone-100 w-full select-none"
        >
          {productImages.length > 0 && !imageError ? (
            <>
              <img
                src={productImages[currentImageIndex]?.url}
                alt={productImages[currentImageIndex]?.alt || product.name}
                className="w-full h-full object-cover transition-opacity duration-200"
                onError={() => setImageError(true)}
                draggable={false}
              />

              {/* Dot indicators */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-20">
                  {productImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToImage(i); }}
                      className={`rounded-full transition-all duration-200 ${
                        i === currentImageIndex ? 'bg-white w-3.5 h-1.5' : 'bg-white/55 w-1.5 h-1.5'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-stone-400 bg-stone-100">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Discount badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-red-600 text-white text-[10px] font-light px-2 py-1 tracking-wider">
                {discountPercentage}% OFF
              </span>
            </div>
          )}

          {/* Low stock badge */}
          {isLowStock && (
            <div className="absolute top-10 left-2 bg-amber-500 text-white text-[9px] px-2 py-0.5 tracking-wider z-10">
              ONLY {totalInventory} LEFT
            </div>
          )}

          {/* Out of stock overlay */}
          {!hasInventory && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="bg-white px-6 py-3 font-light text-stone-800 tracking-widest text-sm">
                OUT OF STOCK
              </div>
            </div>
          )}

          {/* Hover overlay — desktop only (hidden on touch screens via md: prefix) */}
          <div className="absolute inset-0 bg-black/25 items-center justify-center transition-opacity duration-300 z-10 hidden md:flex opacity-0 group-hover:opacity-100">
            <span className="bg-white text-stone-800 px-6 py-2.5 font-light tracking-widest text-xs">
              VIEW DETAILS
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="px-3 py-3 sm:px-4 sm:py-4 bg-white text-center">
          <h3 className="text-xs sm:text-sm font-medium text-stone-800 mb-1.5 tracking-widest uppercase truncate hover:text-stone-500 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-2">
            {product.discountedPrice ? (
              <>
                <span className="text-sm sm:text-base font-semibold text-stone-900">
                  {formatPrice(product.discountedPrice)}
                </span>
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-semibold text-stone-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {isLowStock && (
            <p className="text-[10px] text-amber-600 tracking-wider mt-1 font-light">
              ONLY {totalInventory} LEFT
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
