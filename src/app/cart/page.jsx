'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/cartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart, loading } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [notification, setNotification] = useState(null);
  
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) {
      showNotification('error', 'Quantity must be between 1 and 99');
      return;
    }

    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      await updateQuantity(itemId, newQuantity);
      showNotification('success', 'Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      
      // Handle specific error cases
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Session expired')) {
        showNotification('error', 'Session expired. Please refresh the page and try again.');
      } else if (error.message.includes('403') || error.message.includes('Access denied')) {
        showNotification('error', 'Access denied. Please refresh the page and try again.');
      } else if (error.message.includes('Insufficient inventory')) {
        showNotification('error', 'Sorry, there is not enough inventory for this quantity.');
      } else {
        showNotification('error', error.message || 'Failed to update quantity');
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId, productName) => {
    if (!window.confirm(`Remove "${productName}" from your cart?`)) {
      return;
    }

    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      await removeFromCart(itemId);
      showNotification('success', 'Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      
      // Handle specific error cases
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Session expired')) {
        showNotification('error', 'Session expired. Please refresh the page and try again.');
      } else if (error.message.includes('403') || error.message.includes('Access denied')) {
        showNotification('error', 'Access denied. Please refresh the page and try again.');
      } else {
        showNotification('error', error.message || 'Failed to remove item');
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
      return;
    }

    try {
      await clearCart();
      showNotification('success', 'Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      
      // Handle specific error cases
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Session expired')) {
        showNotification('error', 'Session expired. Please refresh the page and try again.');
      } else if (error.message.includes('403') || error.message.includes('Access denied')) {
        showNotification('error', 'Access denied. Please refresh the page and try again.');
      } else {
        showNotification('error', error.message || 'Failed to clear cart');
      }
    }
  };
  
  const handleCheckout = () => {
    if (cart.length === 0) {
      showNotification('error', 'Your cart is empty');
      return;
    }

    setCheckingOut(true);
    // This would be replaced with actual checkout logic
    setTimeout(() => {
      showNotification('info', 'Checkout functionality will be implemented soon!');
      setCheckingOut(false);
    }, 1000);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }
  
  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg 
            className="w-20 h-20 mx-auto text-gray-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1" 
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            ></path>
          </svg>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/customer/home" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Items in your cart ({cart.length})</h2>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.id} className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center mr-4 mb-4 sm:mb-0 flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.productName}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <svg 
                          className="w-8 h-8 text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="1" 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div className="mb-2 sm:mb-0">
                          <h3 className="text-lg font-medium text-gray-800 truncate">
                            {item.productName}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Size: {item.sizeName}</p>
                            <p>SKU: {item.sku}</p>
                            {item.category && (
                              <p>Category: {item.category.name}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-medium text-gray-800">
                            ${(item.productPrice * item.quantity)}
                          </p>
                          {item.originalPrice > item.productPrice && (
                            <p className="text-sm text-gray-500 line-through">
                              ${(item.originalPrice * item.quantity)}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            ${item.productPrice} each
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center">
                          <label className="text-sm text-gray-600 mr-2">Qty:</label>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updatingItems.has(item.id) || item.quantity <= 1}
                            className="h-8 w-8 border border-gray-300 rounded-l-md flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingItems.has(item.id) ? '...' : '-'}
                          </button>
                          <div className="h-8 px-3 border-t border-b border-gray-300 flex items-center justify-center min-w-[50px] bg-white">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id) || item.quantity >= 99}
                            className="h-8 w-8 border border-gray-300 rounded-r-md flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingItems.has(item.id) ? '...' : '+'}
                          </button>
                          <span className="ml-2 text-xs text-gray-500">
                            (max 99)
                          </span>
                        </div>
                        
                        {/* Remove Button */}
                        <button 
                          onClick={() => handleRemoveItem(item.id, item.productName)}
                          disabled={updatingItems.has(item.id)}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {updatingItems.has(item.id) ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Cart Actions */}
            <div className="flex justify-between bg-gray-50 p-4 border-t border-gray-200">
              <button 
                onClick={handleClearCart} 
                className="text-red-500 hover:text-red-700 font-medium"
                disabled={cart.length === 0}
              >
                Clear Cart
              </button>
              <Link 
                href="/customer/home" 
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                </span>
                <span className="text-gray-800 font-medium">${getCartTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800 font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes</span>
                <span className="text-gray-800 font-medium">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-semibold">${getCartTotal()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Final total will be calculated at checkout
              </p>
            </div>
            
            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={checkingOut || cart.length === 0}
              className={`w-full py-3 px-6 rounded-md font-medium text-white transition-colors mb-4 ${
                checkingOut || cart.length === 0
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {checkingOut 
                ? 'Processing...' 
                : 'Proceed to Checkout'
              }
            </button>
            
            {/* Security Badges */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Checkout
              </div>
              
              <p className="text-xs text-gray-500">
                Shipping, taxes, and discounts calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg max-w-md z-50 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : notification.type === 'info'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : notification.type === 'info' ? (
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
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