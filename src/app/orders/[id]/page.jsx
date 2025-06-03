// src/app/orders/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/authcontext';
import { useCurrency } from '@/contexts/currencyContext';
import Link from 'next/link';
import { GET_ORDER_BY_ID, CANCEL_ORDER } from '@/utils/routes/orderRoutes';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice, currentCurrency } = useCurrency();
  const orderId = params.id;
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user?.id || !orderId) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('🔍 Fetching order details for ID:', orderId);
        
        const response = await fetch(GET_ORDER_BY_ID(orderId), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('🔍 Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch order details');
        }

        const data = await response.json();
        console.log('🔍 Order details:', data);

        if (data.success) {
          setOrder(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch order details');
        }
      } catch (err) {
        console.error('❌ Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId]);

  // Function to check if order can be cancelled (within 24 hours)
  const canCancelOrder = (orderDate) => {
    if (!orderDate) return false;
    
    const orderDateTime = new Date(orderDate);
    const currentTime = new Date();
    const hoursDifference = (currentTime - orderDateTime) / (1000 * 60 * 60);
    
    return hoursDifference <= 24;
  };

  // Function to get remaining time for cancellation
  const getCancellationTimeRemaining = (orderDate) => {
    if (!orderDate) return null;
    
    const orderDateTime = new Date(orderDate);
    const deadlineTime = new Date(orderDateTime.getTime() + 24 * 60 * 60 * 1000);
    const currentTime = new Date();
    
    if (currentTime >= deadlineTime) return null;
    
    const remainingMs = deadlineTime - currentTime;
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours: remainingHours, minutes: remainingMinutes };
  };

  // Cancel order function
  const handleCancelOrder = async () => {
    setIsCancelling(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔍 Cancelling order:', orderId);
      
      const response = await fetch(CANCEL_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      if (data.success) {
        // Update the order state
        setOrder(data.data);
        setShowCancelConfirm(false);
        
        // Show success message
        alert('Order cancelled successfully! Inventory has been restored and refund will be processed.');
        
        // Optionally redirect to orders page
        // router.push('/orders');
      } else {
        throw new Error(data.message || 'Failed to cancel order');
      }
      
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // Cancel confirmation modal component
  const CancelConfirmationModal = () => {
    if (!showCancelConfirm) return null;
    
    const timeRemaining = getCancellationTimeRemaining(order.orderDate || order.createdAt);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          
          {timeRemaining && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Time remaining to cancel:</strong> {timeRemaining.hours}h {timeRemaining.minutes}m
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Orders can only be cancelled within 24 hours of placement.
              </p>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>What happens when you cancel:</strong>
            </p>
            <ul className="text-xs text-blue-600 mt-1 list-disc list-inside">
              <li>Inventory will be restored immediately</li>
              <li>Refund will be processed (3-5 business days)</li>
              <li>You'll receive a confirmation email</li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isCancelling}
            >
              Keep Order
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view order details.</p>
          <Link
            href="/login?redirect=/orders"
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Error Loading Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Link href="/orders" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 inline-block">
              Back to Orders
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
          <Link href="/orders" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CancelConfirmationModal />
      
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/orders" className="hover:text-blue-600">Orders</Link>
          <span>→</span>
          <span className="text-gray-900">Order #{order.orderNumber || order.id?.slice(0, 8)}</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Order #{order.orderNumber || order.id?.slice(0, 8)}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(order.orderDate || order.createdAt)}
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            {/* Currency Badge */}
            {order.currency && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {order.currency}
              </span>
            )}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
              {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Currency Information */}
      {order.currency && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {/* You can add product image here if available */}
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.productName || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600">SKU: {item.productSku || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatOrderPrice(item.total || 0)}</p>
                      <p className="text-sm text-gray-600">{formatOrderPrice(item.price || 0)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No items found in this order.</p>
            )}
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="text-gray-700">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
              </div>
            </div>
          )}

          {/* Billing Address */}
          {order.billingAddress && order.billingAddress.id !== order.shippingAddress?.id && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
              <div className="text-gray-700">
                <p className="font-medium">{order.billingAddress.name}</p>
                <p>{order.billingAddress.addressLine1}</p>
                {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
                <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</p>
                <p>{order.billingAddress.country}</p>
                {order.billingAddress.phone && <p>Phone: {order.billingAddress.phone}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {/* Currency Information */}
            {order.currency && (
              <div className="mb-4 p-3 bg-white border border-gray-200 rounded-md">
                <div className="flex items-center text-sm text-gray-700">
                  <span className="mr-2">{currentCurrency.flag}</span>
                  <span>Pricing in {order.currency}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">{formatOrderPrice(order.subtotal || 0)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-green-600">-{formatOrderPrice(order.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">{formatOrderPrice(order.shipping || 0)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">{formatOrderPrice(order.tax || 0)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">{formatOrderPrice(order.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Currency Conversion Notice */}
            {order.currency && order.currency !== currentCurrency.code && (
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="text-xs text-yellow-800">
                  <span className="font-medium">Note:</span> This order was placed in {order.currency}. Prices are shown in the original currency. Current display currency is {currentCurrency.code}.
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method:</span>
                <span className="text-gray-900 capitalize">{order.paymentMethod || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Unknown'}
                </span>
              </div>
              
              {order.currency && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Currency:</span>
                  <span className="text-gray-900">{order.currency}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-3">
              {(order.status === 'delivered' || order.status === 'shipped') && (
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 font-medium transition-colors">
                  Track Package
                </button>
              )}
              
              {order.status === 'delivered' && (
                <button className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 font-medium transition-colors">
                  Leave Review
                </button>
              )}
              
              <button 
                onClick={() => window.print()} 
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 font-medium transition-colors"
              >
                Print Order
              </button>
              
              <Link 
                href="/orders" 
                className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 font-medium transition-colors"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}