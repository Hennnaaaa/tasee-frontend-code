// components/OrderCard.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CANCEL_ORDER } from '@/utils/routes/orderRoutes';

const OrderCard = ({ order, onOrderUpdate }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

      console.log('🔍 Cancelling order:', order.id);
      
      const response = await fetch(CANCEL_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.id
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      if (data.success) {
        // Close confirmation modal
        setShowCancelConfirm(false);
        
        // Show success message
        alert('Order cancelled successfully! Inventory has been restored and refund will be processed.');
        
        // Call parent component's update function if provided
        if (onOrderUpdate) {
          onOrderUpdate(data.data);
        }
        
        // Refresh the page to update the order list
        window.location.reload();
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
            Are you sure you want to cancel order #{order.orderNumber || order.id?.slice(0, 8)}? This action cannot be undone.
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

  // Payment status color mapping
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <CancelConfirmationModal />
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.orderNumber || order.id?.slice(0, 8) || 'N/A'}
            </h3>
            <p className="text-sm text-gray-600">
              Placed on {formatDate(order.orderDate || order.createdAt)}
            </p>
          
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
              Payment: {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-2">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-900">{item.productName || 'Product'}</span>
                    <span className="text-gray-500 ml-2">× {item.quantity || 1}</span>
                  </div>
                  <span className="text-gray-700">${item.total || item.price || 0}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-sm text-gray-500">
                  +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No items found</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="text-sm text-gray-900">${order.subtotal || 0}</span>
          </div>
          
          {order.shipping > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Shipping:</span>
              <span className="text-sm text-gray-900">${order.shipping}</span>
            </div>
          )}
          
          {order.tax > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Tax:</span>
              <span className="text-sm text-gray-900">${order.tax}</span>
            </div>
          )}
          
          {order.discount > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Discount:</span>
              <span className="text-sm text-green-600">-${order.discount}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center font-semibold border-t border-gray-200 pt-2">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">${order.total || 0}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
          <Link
            href={`/orders/${order.id}`}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 text-center font-medium transition-colors"
          >
            View Details
          </Link>
          
          {(order.status === 'delivered' || order.status === 'shipped') && (
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 font-medium transition-colors">
              Track Order
            </button>
          )}
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Notes:</span> {order.notes}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderCard;