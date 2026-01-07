// src/app/cart/page.js - COMPLETE with Mobile UI Fixes + Price Variant Support
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/cartContext';
import { useCurrency } from '@/contexts/currencyContext';
import SimpleDeliveryBanner from '@/components/SimpleDeliveryBanner';

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    updateCartItem,
    removeCartItem,
    clearCart,
    user,
  } = useCart();

  const { formatPrice, currentCurrency } = useCurrency();

  const [notification, setNotification] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [imageErrors, setImageErrors] = useState(new Set());

  // Utility functions
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

  // ✅ UPDATED: Price calculation with price variant priority
  const calculateItemPrice = (item) => {
    // Priority order:
    // 1. Price variant price (if variant selected)
    // 2. Size variant price (if size selected)
    // 3. Product discounted price
    // 4. Product regular price
    
    const priceVariantPrice = item.priceVariant?.price;
    const sizePrice = item.sizeVariant?.price;
    const discountedPrice = item.product?.discountedPrice;
    const regularPrice = item.product?.price;
    
    // Final price calculation with priority
    const price = priceVariantPrice || sizePrice || discountedPrice || regularPrice || 0;
    
    // Original price for discount display (only if no variant prices)
    const originalPrice = item.product?.price;
    
    // Only show discount if:
    // - No price variant selected (variants have their own pricing)
    // - Product has discounted price lower than original
    const hasDiscount = !priceVariantPrice && 
                       !sizePrice && 
                       discountedPrice && 
                       discountedPrice < originalPrice;

    return { price, originalPrice, hasDiscount };
  };

  // Event handlers
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
      showNotification('success', 'Cart updated successfully');
    } catch (error) {
      console.error('Error updating cart item:', error);
      showNotification('error', error.message || 'Failed to update cart item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeCartItem(itemId);
      showNotification('success', 'Item removed from cart');
    } catch (error) {
      console.error('Error removing cart item:', error);
      showNotification('error', error.message || 'Failed to remove cart item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      await clearCart();
      showNotification('success', 'Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      showNotification('error', error.message || 'Failed to clear cart');
    }
  };

  // Component for product image
  const ProductImage = ({ product }) => {
    const productImages = product.images || [];
    const primaryImage = productImages.find(img => img.isPrimary) || productImages[0];
    const hasImageError = imageErrors.has(product.id);

    if (productImages.length > 0 && !hasImageError && primaryImage) {
      return (
        <img
          src={primaryImage.url}
          alt={primaryImage.alt || product.name}
          className="w-full h-full object-cover rounded-lg"
          onError={() => handleImageError(product.id)}
        />
      );
    }

    return (
      <svg
        className="w-8 h-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
        />
      </svg>
    );
  };

  // ✅ UPDATED: Cart item component with MOBILE UI FIXES + Price Variant Display
  const CartItem = ({ item }) => {
    const isUpdating = updatingItems.has(item.id);
    const { price, originalPrice, hasDiscount } = calculateItemPrice(item);

    return (
      <div
        className={`border border-gray-200 rounded-lg p-4 md:p-6 ${
          isUpdating ? 'opacity-50' : ''
        }`}
      >
        {/* ✅ MOBILE OPTIMIZED: Stack on mobile, flex on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden">
              <ProductImage product={item.product} />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* ✅ Product Title - Truncate on overflow */}
                <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/products/${item.product.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                </h3>
                
                {/* Product Category */}
                {item.product?.category && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                    {item.product.category.name}
                  </p>
                )}
                
                {/* ✅ Price Variant Badge - Mobile Optimized */}
                {item.priceVariant && (
                  <div className="mt-2 inline-flex items-center px-2 sm:px-3 py-1 bg-purple-50 border border-purple-200 rounded-full max-w-full">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 mr-1 sm:mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-purple-900 truncate">
                      {item.priceVariant.name}
                    </span>
                    {item.priceVariant.isDefault && (
                      <span className="ml-1 sm:ml-2 text-xs text-purple-600 whitespace-nowrap">
                        (Default)
                      </span>
                    )}
                  </div>
                )}

                {/* Price Variant Description */}
                {item.priceVariant?.description && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {item.priceVariant.description}
                  </p>
                )}
                
                {/* Size Information */}
                {item.sizeVariant?.size && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                    <span className="font-medium">Size:</span> {item.sizeVariant.size.name || item.sizeVariant.size.code}
                  </p>
                )}

                {/* SKU */}
                {item.product?.sku && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    <span className="font-medium">SKU:</span> {item.product.sku}
                  </p>
                )}

                {/* ✅ MOBILE OPTIMIZED: Price Display with Responsive Typography */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {/* Main Price - Responsive sizing */}
                  <span className="text-lg sm:text-xl font-semibold text-gray-900">
                    {formatPrice(price)}
                  </span>
                  
                  {/* Discount Badge - Wrap to new line on small screens */}
                  {hasDiscount && (
                    <>
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}

                  {/* Variant Price Badge */}
                  {item.priceVariant && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Style Price
                    </span>
                  )}
                </div>
              </div>

              {/* Remove Button - Positioned for mobile */}
              <button
                onClick={() => handleRemoveItem(item.id)}
                disabled={isUpdating}
                className="flex-shrink-0 text-red-600 hover:text-red-800 disabled:opacity-50 p-1 rounded-full hover:bg-red-50 transition-colors"
                title="Remove item"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* ✅ MOBILE OPTIMIZED: Quantity Controls - Stack on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-4">
              <div className="flex items-center justify-between sm:justify-start">
                <label className="text-xs sm:text-sm font-medium text-gray-700 mr-3">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isUpdating}
                    className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md text-sm"
                  >
                    -
                  </button>
                  <div className="h-7 sm:h-8 px-3 flex items-center justify-center min-w-[40px] sm:min-w-[50px] bg-white border-l border-r border-gray-300 text-sm">
                    {item.quantity}
                  </div>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={
                      item.quantity >= (item.sizeVariant?.inventory || 99) || 
                      item.quantity >= 99 || 
                      isUpdating
                    }
                    className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md text-sm"
                  >
                    +
                  </button>
                </div>
                
                {/* Inventory - Show on mobile too */}
                {item.sizeVariant?.inventory && (
                  <div className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                    {item.sizeVariant.inventory} left
                  </div>
                )}
              </div>

              {/* ✅ MOBILE OPTIMIZED: Item Total - Prevent overflow */}
              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {formatPrice(price * item.quantity)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {item.quantity} × {formatPrice(price)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Delivery Banner */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <SimpleDeliveryBanner 
            product={item.product}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-8">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5-3M7 13l1.5 3M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Start shopping to add items to your cart.
          </p>
          <Link
            href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`}
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
          Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </h1>
        {!user && (
          <div className="text-xs sm:text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
            Guest Mode - Items stored locally
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Cart Actions */}
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center justify-center sm:justify-start"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Cart
            </button>

            <Link
              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center sm:justify-start"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 lg:sticky lg:top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            {/* Currency Information */}
            <div className="mb-4 p-3 bg-white border border-gray-200 rounded-md">
              <div className="flex items-center text-sm text-gray-700">
                <span className="mr-2">{currentCurrency.flag}</span>
                <span>Pricing in {currentCurrency.name}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Items ({cartCount}):</span>
                <span className="text-gray-900 break-words">{formatPrice(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900 text-xs sm:text-sm">Calculated at checkout</span>
              </div>
              
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900 text-xs sm:text-sm">Calculated at checkout</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Exchange Rate Notice */}
            {currentCurrency.code !== 'USD' && (
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="text-xs text-yellow-800">
                  <span className="font-medium">Note:</span> Final charges may vary slightly due to exchange rate fluctuations at checkout.
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Link
                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/checkout`}
                className="block w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 transition-colors text-center text-sm sm:text-base"
              >
                Proceed to Checkout
              </Link>
              
              {!user && (
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    New customer? No account needed!
                  </p>
                  <p className="text-xs text-gray-500">
                    You can checkout as a guest or create an account during checkout
                  </p>
                </div>
              )}
              
              <Link
                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`}
                className="block w-full text-center bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Cart Type Info */}
            <div className="mt-6 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs sm:text-sm">
                  {user ? (
                    <span className="text-blue-800">
                      Cart synced to your account
                    </span>
                  ) : (
                    <span className="text-blue-800">
                      Guest cart - Sign in to save your items
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <div className="ml-auto pl-3">
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
    </div>
  );
}