// src/app/orders/[id]/confirmation/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCurrency } from '@/contexts/currencyContext';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id;
  const { formatPrice, currentCurrency, convertPrice } = useCurrency();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('🔍 DEBUG: Fetching order ID:', orderId);
        
        // Construct URL directly
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`;
        console.log('🔍 DEBUG: Fetching from URL:', url);
        
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Only add auth header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('🔍 DEBUG: Added auth header');
        } else {
          console.log('🔍 DEBUG: No token found, fetching as guest');
        }
        
        console.log('🔍 DEBUG: Request headers:', headers);
        
        const response = await fetch(url, {
          method: 'GET',
          headers
        });
        
        console.log('🔍 DEBUG: Response status:', response.status);
        console.log('🔍 DEBUG: Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('🔍 DEBUG: Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('🔍 DEBUG: Response data:', data);

        if (data.success) {
          setOrder(data.data);
          console.log('✅ DEBUG: Order loaded successfully');
        } else {
          throw new Error(data.message || 'Failed to load order');
        }
      } catch (err) {
        console.error('❌ DEBUG: Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Helper function to format order prices based on stored currency
  const formatOrderPrice = (amount) => {
    if (!amount) return formatPrice(0);
    
    // If order has a stored currency that differs from current selection
    if (order?.currency && order.currency !== currentCurrency.code) {
      // Show original currency with note about conversion
      return `${order.currency} ${Number(amount).toFixed(2)}`;
    }
    
    // Use current currency formatting
    return formatPrice(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-gray-600">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Unable to Load Order</h2>
          <p className="text-gray-600 mb-2">Order ID: {orderId}</p>
          <p className="text-gray-600 mb-6">Error: {error}</p>
          <div className="space-x-4">
            <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 inline-block">
              Back to Home
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 inline-block"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your order. We'll send you a confirmation email shortly.</p>
      </div>

      {/* Currency Information */}
      {order.currency && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-blue-800">
                <span className="mr-2">💰</span>
                <span>Order placed in {order.currency}</span>
              </div>
              {order.currency !== currentCurrency.code && (
                <div className="text-xs text-blue-600">
                  Prices shown in original currency
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
              <p className="text-sm text-gray-600">Order Number: <span className="font-medium">{order.orderNumber || 'N/A'}</span></p>
              <p className="text-sm text-gray-600">Order Date: <span className="font-medium">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString()}</span></p>
              <p className="text-sm text-gray-600">Status: <span className="font-medium capitalize">{order.status || 'pending'}</span></p>
              <p className="text-sm text-gray-600">Payment Status: <span className="font-medium capitalize">{order.paymentStatus || 'pending'}</span></p>
              {order.currency && (
                <p className="text-sm text-gray-600">Currency: <span className="font-medium">{order.currency}</span></p>
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
              {order.user ? (
                <>
                  <p className="text-sm text-gray-600">Name: <span className="font-medium">{order.user.firstName || 'N/A'}</span></p>
                  <p className="text-sm text-gray-600">Email: <span className="font-medium">{order.user.email || 'N/A'}</span></p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Name: <span className="font-medium">{order.guestName || 'Guest User'}</span></p>
                  <p className="text-sm text-gray-600">Email: <span className="font-medium">{order.guestEmail || 'N/A'}</span></p>
                  <p className="text-sm text-gray-600">Phone: <span className="font-medium">{order.guestPhone || 'N/A'}</span></p>
                </>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Items Ordered</h3>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName || 'Product'}</p>
                      {item.sizeName && (
                        <p className="text-sm text-gray-600">Size: {item.sizeName}</p>
                      )}
                      <p className="text-sm text-gray-600">SKU: {item.productSku || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatOrderPrice(item.total)}</p>
                      <p className="text-sm text-gray-600">{formatOrderPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No items found</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">{formatOrderPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-green-600">-{formatOrderPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">{formatOrderPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">{formatOrderPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{formatOrderPrice(order.total)}</span>
              </div>
            </div>

            {/* Currency Conversion Notice */}
            {order.currency && order.currency !== currentCurrency.code && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="text-sm text-yellow-800">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Currency Notice:</span>
                  </div>
                  <p className="mt-1">
                    This order was placed in {order.currency}. Prices are shown in the original currency. 
                    Current display currency is {currentCurrency.code}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="text-gray-600">
              <p className="font-medium">{order.shippingAddress.name || 'N/A'}</p>
              <p>{order.shippingAddress.addressLine1 || 'N/A'}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.postalCode || 'N/A'}</p>
              <p>{order.shippingAddress.country || 'N/A'}</p>
              {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </div>
          </div>
        )}

        {/* Billing Address (if different from shipping) */}
        {order.billingAddress && 
         order.billingAddress.id !== order.shippingAddress?.id && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
            <div className="text-gray-600">
              <p className="font-medium">{order.billingAddress.name || 'N/A'}</p>
              <p>{order.billingAddress.addressLine1 || 'N/A'}</p>
              {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
              <p>{order.billingAddress.city || 'N/A'}, {order.billingAddress.state || 'N/A'} {order.billingAddress.postalCode || 'N/A'}</p>
              <p>{order.billingAddress.country || 'N/A'}</p>
              {order.billingAddress.phone && <p>Phone: {order.billingAddress.phone}</p>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="text-center space-x-4">
          <Link
            href="/customer/home"
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 inline-block"
          >
            Continue Shopping
          </Link>
          {order.user && (
            <Link
              href="/orders"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 inline-block"
            >
              View All Orders
            </Link>
          )}
        </div>

        {/* Order Tracking Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>You'll receive an order confirmation email within 10 minutes</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>We'll process your order within 1-2 business days</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span>You'll get tracking information once your order ships</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}