'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { GET_PRODUCT_BY_ID } from '@/utils/routes/customerRoutes';
import { useCart } from '@/contexts/cartContext';
import { useCurrency } from '@/contexts/currencyContext';
import { useWishlist } from '@/contexts/wishlistContext';
import { getUserData } from '@/utils/auth';
import SimpleDeliveryBanner from '@/components/SimpleDeliveryBanner';
import PriceVariantSelector from '@/components/customerComponents/products/PriceVariantSelector';
import ProductReviews from '@/components/customerComponents/reviews/ProductReview';

export default function ProductDetailsPage({ params }) {
  const { addToCart, cartCount, cartItems } = useCart();
  const { formatPrice, currentCurrency } = useCurrency();
  const { toggleWishlist, checkWishlistStatus } = useWishlist();

  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPriceVariant, setSelectedPriceVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [sizeChart, setSizeChart] = useState(null);
  const [loadingSizeChart, setLoadingSizeChart] = useState(false);

  useEffect(() => {
    if (product?.images?.length > 0) {
      const primaryIndex = product.images.findIndex(img => img.isPrimary);
      setCurrentImageIndex(primaryIndex > -1 ? primaryIndex : 0);
    }
  }, [product]);

  const authData = getUserData();
  const isAuthenticated = !!(authData?.token);

  // ── Inventory helpers ─────────────────────────────────────────
  const getCartQuantity = (productId, sizeId = null, priceVariantId = null) => {
    if (!cartItems) return 0;
    return cartItems
      .filter(item => {
        const matchesProduct = item.product.id === productId;
        const matchesSize = sizeId ? item.sizeVariant?.sizeId === sizeId : !item.sizeVariant;
        const matchesPriceVariant = priceVariantId ? item.priceVariant?.id === priceVariantId : !item.priceVariant;
        return matchesProduct && matchesSize && matchesPriceVariant;
      })
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getAvailableToAdd = (inventory, cartQuantity) => Math.max(0, inventory - cartQuantity);

  const getStockMessage = (availableToAdd, inCart) => {
    if (availableToAdd === 0 && inCart > 0) return 'In Cart';
    if (availableToAdd === 0) return 'Out of Stock';
    return '';
  };

  const cartQuantities = (() => {
    if (!product) return {};
    const quantities = {};
    if (product.productType === 'sized' && product.availableSizes) {
      product.availableSizes.forEach(size => {
        quantities[size.sizeId] = getCartQuantity(product.id, size.sizeId, selectedPriceVariant?.id);
      });
    } else {
      quantities.regular = getCartQuantity(product.id, null, selectedPriceVariant?.id);
    }
    return quantities;
  })();

  // ── API ───────────────────────────────────────────────────────
  const apiCall = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      ...options,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return response.json();
  };

  const getProductById = async (productId, includeSizes = true, includeSizeChart = false) => {
    const params = new URLSearchParams({
      includeSizes: includeSizes.toString(),
      includeSizeChart: includeSizeChart.toString(),
    });
    return apiCall(`${GET_PRODUCT_BY_ID(productId)}?${params}`);
  };

  // ── Effects ───────────────────────────────────────────────────
  useEffect(() => {
    if (product?.id) setIsInWishlist(checkWishlistStatus(product.id));
  }, [product?.id, checkWishlistStatus]);

  useEffect(() => {
    const unwrap = async () => {
      try {
        const resolved = await Promise.resolve(params);
        setProductId(resolved.id);
      } catch {
        setError('Invalid product URL');
        setLoading(false);
      }
    };
    unwrap();
  }, [params]);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(productId, true, true);
        if (res.success) {
          setProduct(res.data);
          if (res.data.sizeChart && !res.data.sizeChart.error) setSizeChart(res.data.sizeChart);
          if (res.data.availableSizes?.length > 0) setSelectedSize(res.data.availableSizes[0]);
        } else {
          setError('Failed to load product details');
        }
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // ── Event handlers ────────────────────────────────────────────
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!getUserData()?.token) { showNotification('error', 'Please log in to manage your wishlist.'); return; }
    setIsWishlistLoading(true);
    try {
      await toggleWishlist(product.id, null, product);
      setIsInWishlist(prev => !prev);
      showNotification('success', isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      showNotification('error', 'Failed to update wishlist. Please try again.');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    if (size.inventory < quantity) setQuantity(Math.min(size.inventory, 1));
  };

  const increaseQuantity = () => {
    const inCart = selectedSize ? (cartQuantities[selectedSize.sizeId] || 0) : (cartQuantities.regular || 0);
    const inv = selectedSize ? selectedSize.inventory : (product?.inventory || 0);
    const avail = getAvailableToAdd(inv, inCart);
    if (quantity < avail && quantity < 99) setQuantity(p => p + 1);
  };

  const decreaseQuantity = () => { if (quantity > 1) setQuantity(p => p - 1); };

  const handleAddToCart = async () => {
    const requiresSize = !!product.requiresSizeSelection;
    if (requiresSize && !selectedSize) { showNotification('error', 'Please select a size'); return; }
    const availInv = selectedSize ? selectedSize.inventory : (product.inventory || 0);
    if (quantity > availInv) { showNotification('error', `Only ${availInv} items available`); return; }

    try {
      setAddingToCart(true);
      if (requiresSize && selectedSize) {
        await addToCart(product, { sizeId: selectedSize.sizeId, price: selectedSize.price, inventory: selectedSize.inventory, size: selectedSize.size }, selectedPriceVariant, quantity);
      } else {
        await addToCart(product, selectedPriceVariant, null, quantity);
      }
      showNotification('success', `Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
      setQuantity(1);
    } catch (err) {
      showNotification('error', err.message || 'Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (product?.images?.length > 1) setCurrentImageIndex(p => (p + 1) % product.images.length);
  };
  const prevImage = () => {
    if (product?.images?.length > 1) setCurrentImageIndex(p => (p - 1 + product.images.length) % product.images.length);
  };
  const selectImage = (i) => setCurrentImageIndex(i);

  // ── Loading / Error states ────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-20 py-12 box-border">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-12 xl:gap-16 min-w-0">
            <div className="flex gap-3">
              <div className="hidden lg:flex flex-col gap-3 w-20 flex-shrink-0">
                {[0, 1, 2, 3].map(i => <div key={i} className="w-20 h-24 bg-stone-100 animate-pulse" />)}
              </div>
              <div className="flex-1 aspect-[3/4] bg-stone-100 animate-pulse" />
            </div>
            <div className="space-y-5 pt-4">
              <div className="h-6 bg-stone-100 animate-pulse rounded w-1/3" />
              <div className="h-9 bg-stone-100 animate-pulse rounded w-2/3" />
              <div className="h-8 bg-stone-100 animate-pulse rounded w-1/4" />
              <div className="h-px bg-stone-100" />
              <div className="h-4 bg-stone-100 animate-pulse rounded w-full" />
              <div className="h-4 bg-stone-100 animate-pulse rounded w-4/5" />
              <div className="h-4 bg-stone-100 animate-pulse rounded w-3/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-stone-500 mb-6 text-sm tracking-wide">{error || 'Product not found'}</p>
          <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`} className="text-xs tracking-widest uppercase underline text-stone-700 hover:text-stone-900">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const productImages = product.images || [];
  const hasMultipleImages = productImages.length > 1;
  const { hasStock } = product.inventoryStatus || {};
  // A sized product with no assigned sizes must be treated as out of stock
  const effectiveHasStock = hasStock && (
    product.productType !== 'sized' || (product.availableSizes?.length > 0)
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 shadow-xl text-sm tracking-wide transition-all duration-300 ${
          notification.type === 'success' ? 'bg-stone-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-20 py-8 sm:py-12 box-border">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-wide text-stone-400 mb-8 uppercase">
          <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`} className="hover:text-stone-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/catalog`} className="hover:text-stone-700 transition-colors">Catalog</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${product.category.slug}`} className="hover:text-stone-700 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-stone-600">{product.name}</span>
        </nav>

        {/* ── MAIN PRODUCT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 xl:gap-16 min-w-0">

          {/* LEFT: Image Gallery */}
          <div className="flex gap-3">

            {/* Vertical thumbnail strip — desktop only */}
            {hasMultipleImages && (
              <div className="hidden lg:flex flex-col gap-2 w-[72px] flex-shrink-0">
                {productImages.map((img, i) => (
                  <button
                    key={img.id || i}
                    onClick={() => selectImage(i)}
                    className={`w-[72px] aspect-[3/4] overflow-hidden flex-shrink-0 transition-all duration-200 ${
                      i === currentImageIndex
                        ? 'ring-2 ring-stone-900 ring-offset-1'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `View ${i + 1}`}
                      className="w-full h-full object-contain bg-stone-50"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative">
              <div className="relative w-full aspect-[3/4] bg-stone-50 overflow-hidden">

                {/* Wishlist */}
                <button
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                  className={`absolute top-4 right-4 z-20 p-2.5 transition-all duration-200 ${
                    isInWishlist
                      ? 'bg-stone-900 text-white'
                      : 'bg-white/90 text-stone-500 hover:text-stone-900'
                  } ${isWishlistLoading ? 'opacity-40' : ''} shadow-md`}
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>

                {/* Discount badge */}
                {product.discountInfo?.hasDiscount && (
                  <div className="absolute top-4 left-4 z-20 bg-stone-900 text-white text-[10px] tracking-widest uppercase px-3 py-1.5">
                    {product.discountInfo.discountPercentage}% Off
                  </div>
                )}

                {productImages.length > 0 && !imageError ? (
                  <>
                    <img
                      src={productImages[currentImageIndex]?.url || product.primaryImage}
                      alt={productImages[currentImageIndex]?.alt || product.name}
                      className="w-full h-full object-contain"
                      onError={() => setImageError(true)}
                    />

                    {/* Prev/Next */}
                    {hasMultipleImages && (
                      <>
                        <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow transition-all z-10">
                          <svg className="w-4 h-4 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow transition-all z-10">
                          <svg className="w-4 h-4 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    {hasMultipleImages && (
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] tracking-widest px-2.5 py-1">
                        {currentImageIndex + 1} / {productImages.length}
                      </div>
                    )}

                    {/* Out of stock overlay */}
                    {!effectiveHasStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                        <span className="bg-stone-900 text-white text-xs tracking-widest uppercase px-8 py-3">Out of Stock</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Horizontal thumbnails — mobile only */}
              {hasMultipleImages && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 lg:hidden">
                  {productImages.map((img, i) => (
                    <button
                      key={img.id || i}
                      onClick={() => selectImage(i)}
                      className={`flex-shrink-0 w-16 h-20 overflow-hidden transition-all duration-200 ${
                        i === currentImageIndex ? 'ring-2 ring-stone-900' : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={`View ${i + 1}`} className="w-full h-full object-contain bg-stone-50" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col gap-5 lg:pt-2 min-w-0 overflow-hidden">

            {/* Category */}
            {product.category && (
              <p className="text-[10px] tracking-[0.35em] uppercase text-stone-400">
                {product.category.name}
              </p>
            )}

            {/* Name */}
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-stone-900 leading-tight uppercase"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {(() => {
                let displayPrice;
                let originalPrice = null;
                let discountPct = null;

                if (selectedPriceVariant) {
                  displayPrice = parseFloat(selectedPriceVariant.price);
                } else if (product.priceRange?.hasPriceVariation) {
                  if (selectedSize) {
                    displayPrice = selectedSize.price;
                  } else {
                    return (
                      <span className="text-2xl font-light text-stone-900 tracking-wide">
                        {formatPrice(product.priceRange.min)} – {formatPrice(product.priceRange.max)}
                      </span>
                    );
                  }
                } else {
                  displayPrice = product.discountedPrice || product.price;
                  if (product.discountInfo?.hasDiscount) {
                    originalPrice = product.discountInfo.originalPrice;
                    discountPct = product.discountInfo.discountPercentage;
                  }
                }

                return (
                  <>
                    <span className="text-2xl font-light text-stone-900 tracking-wide">
                      {formatPrice(displayPrice)}
                    </span>
                    {originalPrice && (
                      <>
                        <span className="text-base text-stone-400 line-through font-light">
                          {formatPrice(originalPrice)}
                        </span>
                        <span className="text-xs tracking-widest uppercase bg-stone-900 text-white px-2.5 py-1">
                          {discountPct}% Off
                        </span>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            <p className="text-[10px] text-stone-400 tracking-widest uppercase">
              Price in {currentCurrency.name} ({currentCurrency.code}) {currentCurrency.flag}
            </p>

            <div className="w-full h-px bg-stone-100" />

            {/* Description */}
            {product.description && (
              <p className="text-sm text-stone-600 leading-relaxed tracking-wide">
                {product.description}
              </p>
            )}

            {/* Specs */}
            {(product.color || product.fabric || product.workDetails) && (
              <dl className="space-y-2 text-sm">
                {product.color && (
                  <div className="flex gap-4">
                    <dt className="text-[10px] tracking-widest uppercase text-stone-400 w-24 flex-shrink-0 pt-0.5">Color</dt>
                    <dd className="text-stone-700">{product.color}</dd>
                  </div>
                )}
                {product.fabric && (
                  <div className="flex gap-4">
                    <dt className="text-[10px] tracking-widest uppercase text-stone-400 w-24 flex-shrink-0 pt-0.5">Fabric</dt>
                    <dd className="text-stone-700">{product.fabric}</dd>
                  </div>
                )}
                {product.workDetails && (
                  <div className="flex gap-4">
                    <dt className="text-[10px] tracking-widest uppercase text-stone-400 w-24 flex-shrink-0 pt-0.5">Details</dt>
                    <dd className="text-stone-700">{product.workDetails}</dd>
                  </div>
                )}
              </dl>
            )}

            {/* Price Variant Selector */}
            {product?.priceVariants?.length > 0 && (
              <PriceVariantSelector
                variants={product.priceVariants}
                selectedVariant={selectedPriceVariant}
                onSelectVariant={setSelectedPriceVariant}
                formatPrice={formatPrice}
              />
            )}

            {/* Size Selection */}
            {product.productType === 'sized' && (product.noSizesAvailable || (!product.availableSizes?.length && !product.outOfStockSizes?.length)) ? (
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium mb-2">Sizes</p>
                <p className="text-xs text-red-400 tracking-wide">No sizes are currently available for this product.</p>
              </div>
            ) : product.productType === 'sized' && product.availableSizes?.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium">Select Size</p>
                  {product.productType === 'sized' && sizeChart && (
                    <button
                      onClick={() => setActiveTab('measurements')}
                      className="text-[10px] tracking-widest uppercase text-stone-400 underline hover:text-stone-700"
                    >
                      Size Guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...product.availableSizes, ...(product.outOfStockSizes || [])]
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(sv => {
                      const inCart = cartQuantities[sv.sizeId] || 0;
                      const avail = getAvailableToAdd(sv.inventory, inCart);
                      const fullyInCart = avail === 0;
                      const isSelected = selectedSize?.id === sv.id || selectedSize?.sizeId === sv.sizeId;
                      const msg = getStockMessage(avail, inCart);

                      return (
                        <button
                          key={String(sv.id)}
                          onClick={() => avail > 0 ? handleSizeSelect(sv) : null}
                          disabled={fullyInCart}
                          className={`min-w-[52px] px-3 py-2.5 border text-xs tracking-wide transition-all duration-150 flex flex-col items-center ${
                            isSelected
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : fullyInCart
                              ? 'border-stone-100 text-stone-300 cursor-not-allowed line-through'
                              : 'border-stone-200 text-stone-700 hover:border-stone-900'
                          }`}
                        >
                          <span className="font-medium">{sv.sizeCode || sv.size?.code || 'N/A'}</span>
                          {msg && (
                            <span className={`text-[9px] mt-0.5 tracking-wide ${
                              isSelected ? 'text-stone-300' : 'text-stone-400'
                            }`}>{msg}</span>
                          )}
                        </button>
                      );
                    })}
                </div>
                {selectedSize && (
                  <p className="mt-2 text-xs text-stone-500 tracking-wide">
                    {selectedSize.sizeName} — {formatPrice(selectedSize.price)}
                    {(() => {
                      const inCart = cartQuantities[selectedSize.sizeId] || 0;
                      return inCart > 0 ? <span className="ml-2 text-stone-400">({inCart} in cart)</span> : null;
                    })()}
                  </p>
                )}
              </div>
            ) : product.productType === 'regular' && product.inventory !== undefined ? (
              <div className="flex items-center gap-2">
                {(() => {
                  const inCart = cartQuantities.regular || 0;
                  const avail = getAvailableToAdd(product.inventory, inCart);
                  if (avail === 0) {
                    return (
                      <span className="text-xs tracking-widest uppercase text-red-500">
                        Out of Stock
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : null}

            {/* Quantity */}
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium mb-3">Quantity</p>
              <div className="flex items-center border border-stone-200 w-fit">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || !effectiveHasStock || addingToCart}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-30 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-medium text-stone-900 border-x border-stone-200">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={(() => {
                    if (!effectiveHasStock || addingToCart || quantity >= 99) return true;
                    const inCart = selectedSize ? (cartQuantities[selectedSize.sizeId] || 0) : (cartQuantities.regular || 0);
                    const inv = selectedSize ? selectedSize.inventory : (product?.inventory || 0);
                    return quantity >= getAvailableToAdd(inv, inCart);
                  })()}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-30 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Delivery Banner */}
            <SimpleDeliveryBanner product={product} />

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!effectiveHasStock || addingToCart || (product.requiresSizeSelection && !selectedSize)}
              className={`w-full py-4 text-xs tracking-[0.3em] uppercase font-medium transition-all duration-300 ${
                !effectiveHasStock || (product.requiresSizeSelection && !selectedSize)
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : addingToCart
                  ? 'bg-stone-500 text-white cursor-wait'
                  : 'bg-stone-900 text-white hover:bg-stone-800 active:bg-black'
              }`}
            >
              {addingToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </span>
              ) : !effectiveHasStock ? 'Out of Stock'
                : (product.requiresSizeSelection && !selectedSize) ? 'Select a Size'
                : `Add ${quantity > 1 ? `${quantity} items` : ''} to Cart`}
            </button>

            {/* Wishlist (text button) */}
            <button
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              className="w-full py-3 text-xs tracking-[0.3em] uppercase font-medium border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-current text-stone-900' : ''}`} />
              {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>

            {/* ── Info Tabs ── */}
            <div className="border-t border-stone-100 pt-6 mt-2">
              <div className="flex border-b border-stone-100">
                {['details', ...(product.productType === 'sized' && sizeChart ? ['measurements'] : [])].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-[10px] tracking-[0.25em] uppercase font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-stone-900 text-stone-900'
                        : 'border-transparent text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {tab === 'details' ? 'Details' : 'Size Chart'}
                  </button>
                ))}
              </div>

              <div className="pt-5">
                {activeTab === 'details' ? (
                  <dl className="space-y-0 divide-y divide-stone-50">
                    {product.category && (
                      <div className="flex justify-between py-3">
                        <dt className="text-[10px] tracking-widest uppercase text-stone-400">Category</dt>
                        <dd className="text-xs text-stone-700 font-medium">{product.category.name}</dd>
                      </div>
                    )}
                    <div className="flex justify-between py-3">
                      <dt className="text-[10px] tracking-widest uppercase text-stone-400">Availability</dt>
                      <dd className={`text-xs font-medium ${effectiveHasStock ? 'text-green-600' : 'text-red-500'}`}>
                        {effectiveHasStock ? 'In Stock' : 'Out of Stock'}
                      </dd>
                    </div>
                    {product.discountInfo?.hasDiscount && (
                      <div className="flex justify-between py-3">
                        <dt className="text-[10px] tracking-widest uppercase text-stone-400">You Save</dt>
                        <dd className="text-xs text-green-600 font-medium">
                          {formatPrice(product.discountInfo.savings)} ({product.discountInfo.discountPercentage}% off)
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between py-3">
                      <dt className="text-[10px] tracking-widest uppercase text-stone-400">Currency</dt>
                      <dd className="text-xs text-stone-700">{currentCurrency.flag} {currentCurrency.code}</dd>
                    </div>
                  </dl>
                ) : (
                  // Size Chart Tab
                  <div>
                    {loadingSizeChart ? (
                      <div className="flex items-center gap-3 py-6 text-stone-400 text-xs">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading size chart...
                      </div>
                    ) : sizeChart && !sizeChart.error ? (() => {
                      const availableSizes = sizeChart.sizes?.filter(s => s.isAvailableForProduct) || [];
                      const hasMeasurement = (f) => availableSizes.some(s => s[f]);
                      const fields = [
                        { key: 'numericSize', label: 'Numeric' },
                        { key: 'bust', label: 'Bust', unit: '"' },
                        { key: 'waist', label: 'Waist', unit: '"' },
                        { key: 'hips', label: 'Hips', unit: '"' },
                        { key: 'shoulder', label: 'Shoulder', unit: '"' },
                        { key: 'chest', label: 'Chest', unit: '"' },
                        { key: 'length', label: 'Length', unit: '"' },
                        { key: 'sleeves', label: 'Sleeves', unit: '"' },
                        { key: 'bottom', label: 'Bottom', unit: '"' },
                        { key: 'thigh', label: 'Thigh', unit: '"' },
                        { key: 'bottomLength', label: 'Bottom Length', unit: '"' },
                      ].filter(f => hasMeasurement(f.key));

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-stone-100">
                                <th className="py-2.5 pr-4 text-left text-[10px] tracking-widest uppercase text-stone-400 font-medium">Size</th>
                                {availableSizes.map(s => {
                                  const isSelected = selectedSize?.sizeName === s.name || selectedSize?.size?.name === s.name;
                                  return (
                                    <th key={s.id} className={`py-2.5 px-3 text-center text-[10px] tracking-widest uppercase font-semibold ${isSelected ? 'text-stone-900' : 'text-stone-500'}`}>
                                      {s.code}
                                      {isSelected && <div className="w-1.5 h-1.5 bg-stone-900 rounded-full mx-auto mt-1" />}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                              {fields.map(f => (
                                <tr key={f.key}>
                                  <td className="py-2.5 pr-4 text-[10px] tracking-wide uppercase text-stone-400">{f.label}</td>
                                  {availableSizes.map(s => (
                                    <td key={s.id} className="py-2.5 px-3 text-center text-stone-700">
                                      {s[f.key] ? `${s[f.key]}${f.unit || ''}` : '—'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="mt-4 text-[10px] text-stone-400 leading-relaxed">
                            All measurements in inches. If between sizes, size up. Contact us for fitting advice.
                          </p>
                        </div>
                      );
                    })() : (
                      <p className="py-6 text-xs text-stone-400 text-center tracking-wide">
                        {sizeChart?.error || 'Size chart not available for this product.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-16 sm:mt-20 border-t border-stone-100 pt-12">
          <h2 className="text-sm tracking-[0.3em] uppercase text-stone-500 mb-8 font-medium">
            Customer Reviews
          </h2>
          <ProductReviews productId={productId} />
        </div>
      </div>
    </div>
  );
}
