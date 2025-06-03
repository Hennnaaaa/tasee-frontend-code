// src/app/checkout/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cartContext';
import { useAddress } from '@/contexts/addressContext';
import { useCurrency } from '@/contexts/currencyContext';
import { CheckoutAddresses } from '@/components/addressSelector';
import GuestCheckout from '@/components/guestCheckout';
import { CREATE_ORDER } from '@/utils/routes/orderRoutes';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartCount, cartTotal, isLoading: cartLoading, user } = useCart();
  const { defaultAddress, isLoading: addressLoading } = useAddress();
  const { formatPrice, currentCurrency } = useCurrency();

  // Checkout type state
  const [checkoutType, setCheckoutType] = useState(null); // null, 'user', 'guest'

  // User checkout states
  const [shippingAddressId, setShippingAddressId] = useState('');
  const [billingAddressId, setBillingAddressId] = useState('');
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Guest checkout states
  const [guestInfo, setGuestInfo] = useState(null);
  const [guestAddress, setGuestAddress] = useState(null);

  // Order processing state
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  // Clear cart function from cart context
  const { clearCart } = useCart();
  
  // Set default addresses when available (for user checkout)
  useEffect(() => {
    if (defaultAddress && checkoutType === 'user') {
      setShippingAddressId(defaultAddress.id);
      if (sameAsShipping) {
        setBillingAddressId(defaultAddress.id);
      }
    }
  }, [defaultAddress, sameAsShipping, checkoutType]);

  // Update billing address when "same as shipping" changes
  useEffect(() => {
    if (sameAsShipping && shippingAddressId && checkoutType === 'user') {
      setBillingAddressId(shippingAddressId);
    } else if (!sameAsShipping) {
      setBillingAddressId('');
    }
  }, [sameAsShipping, shippingAddressId, checkoutType]);

  // Redirect if cart is empty and user is not placing an order
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && !isPlacingOrder) {
      router.push('/cart');
    }
  }, [cartItems.length, cartLoading, router, isPlacingOrder]);

  // Set checkout type based on user status
  useEffect(() => {
    if (!cartLoading) {
      if (user) {
        setCheckoutType('user');
      }
      // Don't auto-set guest checkout, let user choose
    }
  }, [user, cartLoading]);

  const handleShippingAddressChange = (addressId) => {
    setShippingAddressId(addressId);
    if (sameAsShipping) {
      setBillingAddressId(addressId);
    }
  };

  const handleBillingAddressChange = (addressId) => {
    setBillingAddressId(addressId);
  };

  const handleSameAsShippingChange = (checked) => {
    setSameAsShipping(checked);
    if (checked && shippingAddressId) {
      setBillingAddressId(shippingAddressId);
    }
  };

  const handleGuestInfoComplete = (info) => {
    setGuestInfo(info);
  };

  const handleGuestAddressComplete = (address, info) => {
    setGuestAddress(address);
    setGuestInfo(info);
  };

  const validateCheckout = () => {
    if (checkoutType === 'user') {
      if (!shippingAddressId) {
        setOrderError('Please select a shipping address');
        return false;
      }

      if (!sameAsShipping && !billingAddressId) {
        setOrderError('Please select a billing address');
        return false;
      }
    } else if (checkoutType === 'guest') {
      if (!guestInfo || !guestAddress) {
        setOrderError('Please complete guest information and address');
        return false;
      }
    }

    if (cartItems.length === 0) {
      setOrderError('Your cart is empty');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setOrderError('');

    if (!validateCheckout()) {
      setIsPlacingOrder(false);
      return;
    }

    setIsProcessingOrder(true);

    try {
      let orderData;

      if (checkoutType === 'user') {
        // User checkout - format according to your controller
        orderData = {
          userId: user.id,
          items: cartItems.map(item => ({
            productId: item.product.id,
            sizeId: item.sizeVariant?.sizeId, // Note: Your controller expects sizeId if you have size variants
            quantity: item.quantity,
            price: item.sizeVariant?.price || item.product?.discountedPrice || item.product?.price || 0
          })),
          shippingAddressId: shippingAddressId,
          billingAddressId: sameAsShipping ? shippingAddressId : billingAddressId,
          paymentMethod: 'credit_card', // You can make this dynamic
          notes: '', // You can add a notes field to your form if needed
          currency: currentCurrency.code // Include currency in order
        };
      } else {
        // Guest checkout - format according to your controller  
        orderData = {
          guestInfo: {
            email: guestInfo.email,
            name: guestInfo.name,
            phone: guestInfo.phone
          },
          items: cartItems.map(item => ({
            productId: item.product.id,
            sizeId: item.sizeVariant?.sizeId,
            quantity: item.quantity,
            price: item.sizeVariant?.price || item.product?.discountedPrice || item.product?.price || 0
          })),
          shippingAddressId: guestAddress.id,
          billingAddressId: guestAddress.id, // Use same address for billing
          paymentMethod: 'credit_card',
          notes: '',
          currency: currentCurrency.code // Include currency in order
        };
      }

      console.log('🛒 Placing order:', orderData);

      // Make API call to create order using your controller
      const response = await fetch(CREATE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(checkoutType === 'user' ? {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          } : {})
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Order placed successfully:', data.data);

        // Clear cart after successful order (optional)
        await clearCart();

        // Redirect to order confirmation
        router.push(`/orders/${data.data.id}/confirmation`);
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('❌ Error placing order:', error);
      setOrderError(error.message || 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (cartLoading || (checkoutType === 'user' && addressLoading)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Show checkout type selection if not determined yet
  if (!checkoutType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8 text-center">Checkout</h1>

          {/* Currency Indicator */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-center text-sm text-blue-800">
              <span className="mr-2">{currentCurrency.flag}</span>
              <span>Checkout in {currentCurrency.name} ({currentCurrency.code})</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">How would you like to checkout?</h2>

              {user && (
                <button
                  onClick={() => setCheckoutType('user')}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 transition-colors mb-4"
                >
                  Continue as {user.firstName} {user.lastName}
                </button>
              )}

              <button
                onClick={() => setCheckoutType('guest')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
              >
                Checkout as Guest
              </button>

              {!user && (
                <div className="mt-6 text-center">
                  <p className="text-gray-600 mb-4">Already have an account?</p>
                  <Link
                    href="/login?redirect=/checkout"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Checkout</h1>
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <Link href="/cart" className="hover:text-blue-600">Cart</Link>
          <span className="mx-2">→</span>
          <span className="text-blue-600">Checkout</span>
          {checkoutType && (
            <>
              <span className="mx-2">•</span>
              <span className="capitalize">{checkoutType} Checkout</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Guest Checkout Flow */}
          {checkoutType === 'guest' && (
            <GuestCheckout
              onGuestInfoComplete={handleGuestInfoComplete}
              onAddressComplete={handleGuestAddressComplete}
              cartItems={cartItems}
              cartTotal={cartTotal}
            />
          )}

          {/* User Checkout Flow */}
          {checkoutType === 'user' && (
            <>
              {/* User Info Display */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Account Information</h2>
                    <p className="text-gray-600">
                      Signed in as {user.firstName} {user.lastName} ({user.email})
                    </p>
                  </div>
                  <button
                    onClick={() => setCheckoutType(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Addresses Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Delivery Information</h2>

                <CheckoutAddresses
                  shippingAddressId={shippingAddressId}
                  billingAddressId={billingAddressId}
                  onShippingAddressChange={handleShippingAddressChange}
                  onBillingAddressChange={handleBillingAddressChange}
                  sameAsShipping={sameAsShipping}
                  onSameAsShippingChange={handleSameAsShippingChange}
                />
              </div>
            </>
          )}

          {/* Payment Method Section (Placeholder) */}
          {(checkoutType === 'user' && shippingAddressId) || (checkoutType === 'guest' && guestAddress) ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">
                    Payment integration will be implemented here
                  </p>
                  <p className="text-gray-600 mb-3">
                    (Stripe, PayPal, etc.)
                  </p>
                  <div className="text-sm text-gray-500">
                    <span className="flex items-center justify-center">
                      <span className="mr-2">{currentCurrency.flag}</span>
                      Payment will be processed in {currentCurrency.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-4">
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

            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => {
                const price = item.sizeVariant?.price || item.product?.discountedPrice || item.product?.price || 0;

                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      {item.sizeVariant?.size && (
                        <p className="text-xs text-gray-500">
                          Size: {item.sizeVariant.size.name || item.sizeVariant.size.code}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals - Updated to use currency context */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({cartCount} items):</span>
                <span className="text-gray-900">{formatPrice(cartTotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">Calculated at next step</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">Calculated at next step</span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>

            {/* Exchange Rate Notice */}
            {currentCurrency.code !== 'USD' && (
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="text-xs text-yellow-800">
                  <span className="font-medium">Note:</span> Final charges may vary slightly due to exchange rate fluctuations at payment processing.
                </div>
              </div>
            )}

            {/* Checkout Info */}
            {checkoutType === 'guest' && guestInfo && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Guest Checkout</h3>
                <p className="text-xs text-blue-700">{guestInfo.name}</p>
                <p className="text-xs text-blue-700">{guestInfo.email}</p>
              </div>
            )}

            {/* Error Message */}
            {orderError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{orderError}</p>
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={
                isProcessingOrder ||
                (checkoutType === 'user' && (!shippingAddressId || (!sameAsShipping && !billingAddressId))) ||
                (checkoutType === 'guest' && (!guestInfo || !guestAddress))
              }
              className="w-full mt-6 bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessingOrder ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing Order...
                </div>
              ) : (
                `Place Order - ${formatPrice(cartTotal)}`
              )}
            </button>

            {/* Security Info */}
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure checkout powered by SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}