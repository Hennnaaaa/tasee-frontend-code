'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getProductById } from '@/utils/routes/customerRoutes';
import { useCart } from '@/contexts/cartContext';
import { useCurrency } from '@/contexts/currencyContext';
import { useWishlist } from '@/contexts/wishlistContext';
import { getUserData } from '@/utils/auth';

// Import the ProductReviews component
import ProductReviews from '@/components/customerComponents/reviews/ProductReview';

export default function ProductDetailsPage({ params }) {
  const router = useRouter();
  const { addToCart, cartCount } = useCart();
  const { formatPrice, currentCurrency } = useCurrency();
  const { toggleWishlist, checkWishlistStatus } = useWishlist();
  
  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Zoom state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});

  // Check authentication and wishlist status
  const authData = getUserData();
  const isAuthenticated = !!(authData?.token);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Check wishlist status when product changes
  useEffect(() => {
    if (product?.id) {
      const wishlistStatus = checkWishlistStatus(product.id);
      setIsInWishlist(wishlistStatus);
    }
  }, [product?.id, checkWishlistStatus]);

  // Handle params unwrapping for Next.js 15
  useEffect(() => {
    const unwrapParams = async () => {
      try {
        const resolvedParams = await Promise.resolve(params);
        setProductId(resolvedParams.id);
      } catch (err) {
        console.error('Error resolving params:', err);
        setError('Invalid product URL');
        setLoading(false);
      }
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const response = await getProductById(productId, true);

        if (response.success) {
          const productData = response.data;
          setProduct(productData);

          console.log("📦 Product data loaded:", {
            productType: productData.productType,
            hasAvailableSizes: productData.hasAvailableSizes,
            totalInventory: productData.totalInventory,
            availableSizesCount: productData.availableSizes?.length || 0
          });

          // Auto-select the first available size if any
          if (productData.availableSizes && productData.availableSizes.length > 0) {
            setSelectedSize(productData.availableSizes[0]);
            console.log("📦 Auto-selected first available size:", productData.availableSizes[0]);
          }
        } else {
          setError('Failed to load product details');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check authentication using token from localStorage
    const authData = getUserData();
    if (!authData?.token) {
      showNotification('error', 'Please log in to manage your wishlist.');
      return;
    }

    setIsWishlistLoading(true);
    try {
      await toggleWishlist(product.id, null, product);
      showNotification('success', isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      showNotification('error', 'Failed to update wishlist. Please try again.');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleSizeSelect = (size) => {
    console.log("📦 Size selected:", size);
    setSelectedSize(size);

    // Reset quantity to 1 or max available if less than current quantity
    if (size.inventory < quantity) {
      setQuantity(Math.min(size.inventory, 1));
    }
  };

  const increaseQuantity = () => {
    const maxQuantity = selectedSize ? selectedSize.inventory : (product?.inventory || 0);
    if (quantity < maxQuantity && quantity < 99) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddToCart = async () => {
    // Check if product requires size selection
    const requiresSize = product.productType === 'sized' && product.availableSizes?.length > 0;

    if (requiresSize && !selectedSize) {
      showNotification('error', 'Please select a size');
      return;
    }

    // Validate quantity
    if (quantity < 1 || quantity > 99) {
      showNotification('error', 'Quantity must be between 1 and 99');
      return;
    }

    // Check inventory
    const availableInventory = selectedSize ? selectedSize.inventory : (product.inventory || 0);
    if (quantity > availableInventory) {
      showNotification('error', `Only ${availableInventory} items available`);
      return;
    }

    try {
      setAddingToCart(true);

      console.log("🛒 Adding to cart:", {
        productId: product.id,
        productType: product.productType,
        selectedSize: selectedSize,
        quantity: quantity
      });

      if (requiresSize && selectedSize) {
        // Product with sizes - create sizeVariant object
        const sizeVariant = {
          sizeId: selectedSize.sizeId,
          price: selectedSize.price,
          inventory: selectedSize.inventory,
          size: selectedSize.size
        };

        await addToCart(product, sizeVariant, quantity);
      } else {
        // Regular product without sizes
        await addToCart(product, null, quantity);
      }

      showNotification('success', `Added ${quantity} item(s) to cart successfully!`);

      // Reset quantity to 1 after successful add
      setQuantity(1);

    } catch (err) {
      console.error('Error adding to cart:', err);
      showNotification('error', err.message || 'Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Image gallery functions
  const handleImageError = () => {
    setImageError(true);
  };

  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Enhanced zoom functions
  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({});
  };

  const handleMouseMove = (e) => {
    if (!isZooming) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.5)',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
          {error || 'Product not found'}
        </div>
        <Link
          href="/"
          className="text-blue-500 hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  // Get product images
  const productImages = product.images || [];
  const hasMultipleImages = productImages.length > 1;

  // Use enhanced inventory status
  const { hasStock, isLowStock, totalAvailable } = product.inventoryStatus || {};

  // Check if it's low stock (less than 5 items)
  const isLowStockDisplay = hasStock && totalAvailable <= 5;

  return (
    <div className="w-full px-4 md:px-8 py-4 md:py-8">
      {/* Cart Count Display */}
      {cartCount > 0 && (
        <div className="mb-4">
          <Link
            href="/cart"
            className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5-3M7 13l1.5 3M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
            </svg>
            Cart ({cartCount})
          </Link>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-8">
        {/* Product Image Gallery - Left Side */}
        <div className="flex gap-12 w-1/2">
          {/* Thumbnail Images - Left Side */}
          {hasMultipleImages && (
            <div className="flex flex-col gap-3 w-20">
              {productImages.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => selectImage(index)}
                  className={`relative bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-lg group ${
                    index === currentImageIndex 
                      ? 'border-black shadow-lg ring-2 ring-gray-200' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ height: '200px', width: '120px' }}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{
                      imageRendering: 'high-quality'
                    }}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  
                  {/* Primary badge */}
                  {image.isPrimary && (
                    <div className="absolute top-1 left-1 bg-black text-white text-xs px-1 py-0.5 rounded font-medium">
                      Main
                    </div>
                  )}
                  
                  {/* Active indicator */}
                  {index === currentImageIndex && (
                    <div className="absolute inset-0 border-2 border-black rounded-lg bg-black/5"></div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Main Image - Much Larger */}
          <div className="flex-1 ml-8">
            <div 
              className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-zoom-in"
              style={{ 
                height: '1000px',
                width: '70%'
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {/* Wishlist Button - Top Right */}
              <div className="absolute top-6 right-6 z-30">
                <button
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                  className={`
                    p-4 rounded-full transition-all duration-300 shadow-xl backdrop-blur-md
                    ${isInWishlist 
                      ? 'bg-red-500/90 text-white hover:bg-red-600 hover:scale-110' 
                      : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110'
                    }
                    ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    transform
                  `}
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart 
                    className={`w-6 h-6 transition-all duration-200 ${
                      isInWishlist ? 'fill-current' : ''
                    } ${isWishlistLoading ? 'animate-pulse' : ''}`}
                  />
                </button>
              </div>

              {productImages.length > 0 && !imageError ? (
                <>
                  {/* Advanced Zoom Container */}
                  <div className="relative w-full h-full overflow-hidden bg-white">
                    <img
                      src={productImages[currentImageIndex]?.url || product.primaryImage}
                      alt={productImages[currentImageIndex]?.alt || product.name}
                      className="w-full h-full object-cover transition-all duration-300 ease-out filter brightness-105 contrast-105"
                      onError={handleImageError}
                      style={{
                        imageRendering: 'high-quality',
                        objectPosition: 'center center',
                        ...zoomStyle
                      }}
                    />
                    
                    {/* Zoom Overlay Effect */}
                    {isZooming && (
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 transition-opacity duration-300"></div>
                    )}
                  </div>

                  {/* Enhanced Navigation arrows */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-md hover:bg-white rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 opacity-0 hover:opacity-100 z-10"
                      >
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-md hover:bg-white rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 opacity-0 hover:opacity-100 z-10 mr-20"
                      >
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {hasMultipleImages && (
                    <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  )}

                  {/* Stock status badge */}
                  {isLowStockDisplay && (
                    <div className="absolute top-20 left-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
                        </svg>
                        Only {totalAvailable} left!
                      </span>
                    </div>
                  )}

                  {/* Zoom Indicator */}
                  {isZooming && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium transition-all duration-300">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Zoomed • Move mouse to explore
                      </span>
                    </div>
                  )}
                </>
              ) : (
                /* Enhanced Placeholder */
                <div className="flex items-center justify-center h-full text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <svg
                      className="w-32 h-32 mx-auto mb-6 opacity-50"
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
                    <p className="text-lg font-medium">No image available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details - Right Side (Desktop) */}
        <div className="w-1/2 space-y-6 -ml-48">
          <div>
            <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-wide">{String(product.name || '')}</h1>

            {/* Category */}
            {product.category && (
              <div className="text-gray-600 mb-4 text-lg font-light">
                {String(product.category.name || '')}
              </div>
            )}
          </div>

          {/* Price - Enhanced Typography */}
          <div className="flex items-center space-x-4">
            {product.discountInfo?.hasDiscount ? (
              <>
                <span className="text-3xl font-light text-gray-900">
                  {formatPrice(product.discountInfo.discountedPrice)}
                </span>
                <span className="text-xl text-gray-500 line-through font-light">
                  {formatPrice(product.discountInfo.originalPrice)}
                </span>
                <span className="bg-black text-white text-sm font-medium px-4 py-1.5 rounded-full">
                  {product.discountInfo.discountPercentage}% OFF
                </span>
              </>
            ) : product.priceRange?.hasPriceVariation ? (
              <span className="text-3xl font-light text-gray-900">
                {formatPrice(product.priceRange.min)} - {formatPrice(product.priceRange.max)}
              </span>
            ) : (
              <span className="text-3xl font-light text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="text-xl font-medium mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{String(product.description || '')}</p>
            </div>
          )}

          {/* Size Selection */}
          {product.productType === 'sized' && product.availableSizes?.length > 0 ? (
            <div>
              <h2 className="text-xl font-medium mb-4">Select Size</h2>
              <div className="flex flex-wrap gap-3">
                {[...product.availableSizes, ...product.outOfStockSizes]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map(sizeVariant => (
                    <button
                      key={String(sizeVariant.id)}
                      onClick={() => sizeVariant.inventory > 0 ? handleSizeSelect(sizeVariant) : null}
                      className={`h-14 min-w-[60px] px-5 border transition-all duration-200 hover:shadow-md ${
                        selectedSize?.id === sizeVariant.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      } ${
                        sizeVariant.inventory <= 0
                          ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                          : ''
                      }`}
                      disabled={sizeVariant.inventory <= 0}
                    >
                      <div className="text-center">
                        <div className="font-medium">{String(sizeVariant.sizeName || sizeVariant.size?.name || 'Unknown')}</div>
                        {sizeVariant.inventory <= 0 ? (
                          <div className="text-xs text-red-500">Sold Out</div>
                        ) : sizeVariant.inventory <= 5 ? (
                          <div className="text-xs text-orange-500">{sizeVariant.inventory} left</div>
                        ) : null}
                      </div>
                    </button>
                  ))
                }
              </div>
              {selectedSize && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                  <div className="text-sm text-gray-700">
                    <strong className="text-black">{selectedSize.sizeName}</strong> - 
                    Price: <span className="font-semibold">{formatPrice(selectedSize.price)}</span> | 
                    Stock: <span className="font-semibold">
                      {selectedSize.inventory <= 5 ? `${Number(selectedSize.inventory)} available` : 'Available'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : product.productType === 'regular' && product.inventory !== undefined ? (
            <div className="p-4 bg-gray-50 rounded-xl border">
              <div className="text-sm text-gray-600">
                {product.inventory <= 5 ? (
                  <span className="text-orange-600 font-medium">
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
                    </svg>
                    Low Stock: {Number(product.inventory)} available
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    In Stock
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Quantity Selector */}
          <div>
            <h2 className="text-xl font-medium mb-4">Quantity</h2>
            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
              <button
                onClick={decreaseQuantity}
                className="h-12 w-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={quantity <= 1 || !hasStock || addingToCart}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>
              <div className="h-12 px-6 flex items-center justify-center min-w-[60px] bg-white border-x border-gray-300 font-medium text-lg">
                {quantity}
              </div>
              <button
                onClick={increaseQuantity}
                className="h-12 w-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={
                  !hasStock ||
                  quantity >= 99 ||
                  addingToCart ||
                  (selectedSize ? quantity >= Number(selectedSize?.inventory || 0) : quantity >= Number(product?.inventory || 0))
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div>
            <button
              onClick={handleAddToCart}
              disabled={!hasStock || addingToCart || (product.requiresSizeSelection && !selectedSize)}
              className={`w-full py-4 px-6 font-medium text-white transition-all duration-300 text-lg uppercase tracking-wide ${
                !hasStock
                  ? 'bg-gray-400 cursor-not-allowed'
                  : (product.requiresSizeSelection && !selectedSize)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : addingToCart
                      ? 'bg-gray-500 cursor-wait'
                      : 'bg-black hover:bg-gray-800 active:bg-gray-900'
              }`}
            >
              {addingToCart
                ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding to Cart...
                  </span>
                )
                : !hasStock
                  ? 'Out of Stock'
                  : (product.requiresSizeSelection && !selectedSize)
                    ? 'Select a Size'
                    : `Add ${quantity} to Cart`}
            </button>
          </div>

          {/* Stock Warning */}
          {isLowStockDisplay && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-amber-800 font-medium">
                  Only {totalAvailable} left in stock - order soon!
                </p>
              </div>
            </div>
          )}

          {/* Product Information */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-medium mb-4">Product Information</h2>
            <div className="space-y-3">
              {product.category && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-600">Category</dt>
                  <dd className="text-gray-900 font-medium">{String(product.category.name || '')}</dd>
                </div>
              )}
              <div className="flex justify-between py-2">
                <dt className="text-gray-600">Availability</dt>
                <dd>
                  {hasStock ? (
                    totalAvailable < 5 ? (
                      <span className="text-amber-600 font-medium">
                        Low Stock ({totalAvailable} available)
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        In Stock
                      </span>
                    )
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </dd>
              </div>
              {product.discountInfo?.hasDiscount && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-600">You Save</dt>
                  <dd className="text-green-600 font-semibold">
                    {formatPrice(product.discountInfo.savings)} ({product.discountInfo.discountPercentage}% off)
                  </dd>
                </div>
              )}
              <div className="flex justify-between py-2">
                <dt className="text-gray-600">Currency</dt>
                <dd className="text-gray-900 font-medium">
                  <span className="flex items-center">
                    {currentCurrency.flag} {currentCurrency.name} ({currentCurrency.code})
                  </span>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Main Image */}
        <div className="mb-6">
          <div 
            className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg"
            style={{ 
              height: '600px',
              width: '100%'
            }}
          >
            {/* Wishlist Button - Top Right (Mobile) */}
            <div className="absolute top-4 right-4 z-30">
              <button
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
                className={`
                  p-3 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm
                  ${isInWishlist 
                    ? 'bg-red-500/90 text-white hover:bg-red-600' 
                    : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                  }
                  ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  transform hover:scale-110
                `}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart 
                  className={`w-5 h-5 transition-all duration-200 ${
                    isInWishlist ? 'fill-current' : ''
                  } ${isWishlistLoading ? 'animate-pulse' : ''}`}
                />
              </button>
            </div>

            {productImages.length > 0 && !imageError ? (
              <>
                <div className="relative w-full h-full overflow-hidden bg-white">
                  <img
                    src={productImages[currentImageIndex]?.url || product.primaryImage}
                    alt={productImages[currentImageIndex]?.alt || product.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    style={{
                      imageRendering: 'high-quality',
                      objectPosition: 'center center'
                    }}
                  />
                </div>

                {/* Mobile Navigation arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 z-10"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 z-10 mr-16"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Mobile Image counter */}
                {hasMultipleImages && (
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {productImages.length}
                  </div>
                )}

                {/* Mobile Stock status badge */}
                {isLowStockDisplay && (
                  <div className="absolute top-16 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
                      </svg>
                      Only {totalAvailable} left!
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-3 opacity-50"
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
                  <p className="text-sm font-medium">No image available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Thumbnail Gallery */}
        {hasMultipleImages && (
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {productImages.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => selectImage(index)}
                  className={`relative bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                    index === currentImageIndex 
                      ? 'border-black shadow-md' 
                      : 'border-transparent'
                  }`}
                  style={{ height: '80px', width: '80px' }}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      imageRendering: 'high-quality'
                    }}
                  />
                  
                  {image.isPrimary && (
                    <div className="absolute top-1 left-1 bg-black text-white text-xs px-1 py-0.5 rounded font-medium">
                      Main
                    </div>
                  )}
                  
                  {index === currentImageIndex && (
                    <div className="absolute inset-0 border-2 border-black rounded-lg bg-black/5"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2 tracking-wide">{String(product.name || '')}</h1>

            {/* Category */}
            {product.category && (
              <div className="text-gray-600 mb-3 text-base font-light">
                {String(product.category.name || '')}
              </div>
            )}
          </div>

          {/* Mobile Price */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {product.discountInfo?.hasDiscount ? (
              <>
                <span className="text-2xl md:text-3xl font-light text-gray-900">
                  {formatPrice(product.discountInfo.discountedPrice)}
                </span>
                <span className="text-lg text-gray-500 line-through font-light">
                  {formatPrice(product.discountInfo.originalPrice)}
                </span>
                <span className="bg-black text-white text-sm font-medium px-3 py-1 rounded-full w-fit">
                  {product.discountInfo.discountPercentage}% OFF
                </span>
              </>
            ) : product.priceRange?.hasPriceVariation ? (
              <span className="text-2xl md:text-3xl font-light text-gray-900">
                {formatPrice(product.priceRange.min)} - {formatPrice(product.priceRange.max)}
              </span>
            ) : (
              <span className="text-2xl md:text-3xl font-light text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Mobile Description */}
          {product.description && (
            <div>
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{String(product.description || '')}</p>
            </div>
          )}

          {/* Mobile Size Selection */}
          {product.productType === 'sized' && product.availableSizes?.length > 0 ? (
            <div>
              <h2 className="text-lg font-medium mb-3">Select Size</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[...product.availableSizes, ...product.outOfStockSizes]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map(sizeVariant => (
                    <button
                      key={String(sizeVariant.id)}
                      onClick={() => sizeVariant.inventory > 0 ? handleSizeSelect(sizeVariant) : null}
                      className={`h-12 px-3 border transition-all duration-200 text-sm ${
                        selectedSize?.id === sizeVariant.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      } ${
                        sizeVariant.inventory <= 0
                          ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                          : ''
                      }`}
                      disabled={sizeVariant.inventory <= 0}
                    >
                      <div className="text-center">
                        <div className="font-medium">{String(sizeVariant.sizeName || sizeVariant.size?.name || 'Unknown')}</div>
                        {sizeVariant.inventory <= 0 ? (
                          <div className="text-xs text-red-500">Out</div>
                        ) : sizeVariant.inventory <= 5 ? (
                          <div className="text-xs text-orange-500">{sizeVariant.inventory}</div>
                        ) : null}
                      </div>
                    </button>
                  ))
                }
              </div>
              {selectedSize && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="text-sm text-gray-700">
                    <strong className="text-black">{selectedSize.sizeName}</strong> - 
                    Price: <span className="font-semibold">{formatPrice(selectedSize.price)}</span> | 
                    Stock: <span className="font-semibold">
                      {selectedSize.inventory <= 5 ? `${Number(selectedSize.inventory)} available` : 'Available'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : product.productType === 'regular' && product.inventory !== undefined ? (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-600">
                {product.inventory <= 5 ? (
                  <span className="text-orange-600 font-medium">
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
                    </svg>
                    Low Stock: {Number(product.inventory)} available
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    In Stock
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Mobile Quantity Selector */}
          <div>
            <h2 className="text-lg font-medium mb-3">Quantity</h2>
            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
              <button
                onClick={decreaseQuantity}
                className="h-12 w-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={quantity <= 1 || !hasStock || addingToCart}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>
              <div className="h-12 px-6 flex items-center justify-center min-w-[60px] bg-white border-x border-gray-300 font-medium">
                {quantity}
              </div>
              <button
                onClick={increaseQuantity}
                className="h-12 w-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={
                  !hasStock ||
                  quantity >= 99 ||
                  addingToCart ||
                  (selectedSize ? quantity >= Number(selectedSize?.inventory || 0) : quantity >= Number(product?.inventory || 0))
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Add to Cart Button */}
          <div className="pt-6">
            <button
              onClick={handleAddToCart}
              disabled={!hasStock || addingToCart || (product.requiresSizeSelection && !selectedSize)}
              className={`w-full py-4 px-6 font-semibold text-white transition-all duration-300 text-lg uppercase tracking-wide rounded-xl ${
                !hasStock
                  ? 'bg-gray-400 cursor-not-allowed'
                  : (product.requiresSizeSelection && !selectedSize)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : addingToCart
                      ? 'bg-gray-500 cursor-wait'
                      : 'bg-black hover:bg-gray-800 active:bg-gray-900 shadow-lg hover:shadow-xl'
              }`}
            >
              {addingToCart
                ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding to Cart...
                  </span>
                )
                : !hasStock
                  ? 'Out of Stock'
                  : (product.requiresSizeSelection && !selectedSize)
                    ? 'Select a Size'
                    : `Add ${quantity} to Cart`}
            </button>
          </div>

          {/* Mobile Stock Warning */}
          {isLowStockDisplay && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-amber-800 font-medium">
                  Only {totalAvailable} left in stock - order soon!
                </p>
              </div>
            </div>
          )}

          {/* Mobile Product Information */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-medium mb-3">Product Information</h2>
            <div className="space-y-2">
              {product.category && (
                <div className="flex justify-between py-1">
                  <dt className="text-gray-600 text-sm">Category</dt>
                  <dd className="text-gray-900 font-medium text-sm">{String(product.category.name || '')}</dd>
                </div>
              )}
              <div className="flex justify-between py-1">
                <dt className="text-gray-600 text-sm">Availability</dt>
                <dd className="text-sm">
                  {hasStock ? (
                    totalAvailable < 5 ? (
                      <span className="text-amber-600 font-medium">
                        Low Stock ({totalAvailable})
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        In Stock
                      </span>
                    )
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </dd>
              </div>
              {product.discountInfo?.hasDiscount && (
                <div className="flex justify-between py-1">
                  <dt className="text-gray-600 text-sm">You Save</dt>
                  <dd className="text-green-600 font-semibold text-sm">
                    {formatPrice(product.discountInfo.savings)} ({product.discountInfo.discountPercentage}% off)
                  </dd>
                </div>
              )}
              <div className="flex justify-between py-1">
                <dt className="text-gray-600 text-sm">Currency</dt>
                <dd className="text-gray-900 font-medium text-sm">
                  <span className="flex items-center">
                    {currentCurrency.flag} {currentCurrency.name} ({currentCurrency.code})
                  </span>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="mt-8 lg:mt-12">
        <ProductReviews productId={product.id} />
      </div>

      {/* Related Products Section */}
      {product.category && (
        <div className="mt-8 lg:mt-12">
          <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">Related Products</h3>
          <div className="text-gray-600">
            <Link
              href={`/categories/${product.category.id}`}
              className="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm lg:text-base"
            >
              View More in {product.category.name}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Back to Products Button */}
      <div className="mt-6 lg:mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm lg:text-base"
        >
          <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Products
        </Link>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md p-4 rounded-md shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-3">
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add scrollbar hide utility */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}