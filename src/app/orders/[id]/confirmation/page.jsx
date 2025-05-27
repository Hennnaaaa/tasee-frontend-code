// src/app/orders/[id]/confirmation/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id;
  
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
                      <p className="text-sm text-gray-600">SKU: {item.productSku || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${item.total || 0}</p>
                      <p className="text-sm text-gray-600">${item.price || 0} each</p>
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
                <span className="text-gray-900">${order.subtotal || 0}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-green-600">-${order.discount || 0}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">${order.shipping || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">${order.tax || 0}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">${order.total || 0}</span>
              </div>
            </div>
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
      </div>
    </div>
  );
}