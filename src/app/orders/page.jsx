// src/app/orders/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/authcontext';
import { useCurrency } from '@/contexts/currencyContext';
import { GET_USER_ORDERS } from '@/utils/routes/orderRoutes';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import OrderCard from '@/components/orderComponents/OrderCard';
import OrderFilters from '@/components/orderComponents/orderFilters';
import Link from 'next/link';
import ReviewForm from '@/components/customerComponents/reviews/ReviewForm';
import axios from 'axios';
import { getUserData } from '@/utils/auth';
import { CREATE_REVIEW } from '@/utils/routes/reviewRoutes';
import { toast } from 'react-toastify';
export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { formatPrice, currentCurrency, convertPrice } = useCurrency();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Currency display preference
  const [showInCurrentCurrency, setShowInCurrentCurrency] = useState(false);

  // State to show review form
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Get unique currencies from orders
  const getOrderCurrencies = () => {
    const currencies = [...new Set(orders.map(order => order.currency).filter(Boolean))];
    return currencies;
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
    }
  }, [isAuthenticated, router]);

  // Fetch orders
  const fetchOrders = async (page = 1, status = '') => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestBody = {
        userId: user.id,
        page: page,
        limit: 10,
        ...(status && { status })
      };

      console.log('🔍 Fetching orders with data:', requestBody);

      const response = await fetch(GET_USER_ORDERS, {
        method: 'POST', // Your API expects POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🔍 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const data = await response.json();
      console.log('🔍 Orders data:', data);

      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchOrders(1, statusFilter);
    }
  }, [user]);

  // Handle filter changes
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchOrders(1, status);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrders(page, statusFilter);
  };

  // Helper function to format order prices
  const formatOrderPrice = (amount, orderCurrency) => {
    if (!amount) return formatPrice(0);

    // If showing in current currency and order currency differs
    if (showInCurrentCurrency && orderCurrency && orderCurrency !== currentCurrency.code) {
      // Convert and show in current currency with note
      const convertedAmount = convertPrice(amount, orderCurrency);
      return `${formatPrice(convertedAmount)} (converted from ${orderCurrency})`;
    }

    // If order has a different currency, show in original currency
    if (orderCurrency && orderCurrency !== currentCurrency.code) {
      return `${orderCurrency} ${Number(amount).toFixed(2)}`;
    }

    // Use current currency formatting
    return formatPrice(amount);
  };

  const handleReviewSubmission = async (reviewData) => {
    try {
      const auth = getUserData();
      if (!auth || !auth.token) {
        setError('Please login to write a review');
        setTimeout(() => setError(null), 5000);
        return;
      }
      console.log('Submitting review for product:', selectedProduct);

      const response = await axios.post(CREATE_REVIEW, {
        productId: selectedProduct.productId,
        ...reviewData,
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });

      console.log('Review creation response :', response.data);
      if (response.data.success) {
        toast.success('Review created successfully');
        setError(null);
      }
    } catch (err) {
      console.error('Error creating review:', err);
      if (err.response?.status === 401) {
        toast.error('Please login to write a review');
      } else {
        toast.error(err.response?.data?.message || 'Error creating review');
      }
    } finally {
      setIsReviewFormOpen(false);
      setSelectedProduct(null);
    }
  }
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">Track and manage your orders</p>
      </div>

      {/* Currency Controls */}
      {!isLoading && orders.length > 0 && getOrderCurrencies().length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-3 sm:mb-0">
              <h3 className="text-sm font-medium text-blue-900">Currency Display</h3>
              <p className="text-xs text-blue-700">
                Your orders contain multiple currencies: {getOrderCurrencies().join(', ')}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-blue-800">
                <span className="mr-2">{currentCurrency.flag}</span>
                <span>Currently viewing in {currentCurrency.name}</span>
              </div>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInCurrentCurrency}
                  onChange={(e) => setShowInCurrentCurrency(e.target.checked)}
                  className="mr-2 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-blue-800">Convert to {currentCurrency.code}</span>
              </label>
            </div>
          </div>

          {showInCurrentCurrency && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <span className="font-medium">Note:</span> Converted amounts are estimates based on current exchange rates and may differ from original charges.
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <OrderFilters
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-gray-600">Loading orders...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => fetchOrders(currentPage, statusFilter)}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && !error && (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter ? `No ${statusFilter} orders found` : 'No orders found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter ?
                  'Try changing the filter to see other orders.' :
                  "You haven't placed any orders yet. Start shopping to create your first order!"
                }
              </p>
              {!statusFilter && (
                <Link
                  href="/"
                  className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 inline-block"
                >
                  Start Shopping
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Orders Grid */}
              <div className="space-y-6 mb-8">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber || order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString()}
                        </p>
                      </div>

                      <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                        {/* Currency Badge */}
                        {order.currency && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {order.currency}
                          </span>
                        )}

                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between space-x-3">
                          {/* Show first few items */}
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center justify-between w-full">
                              {/* Product info at the start */}
                              <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {item.productImage ? (
                                    <img
                                      src={item.productImage}
                                      alt={item.productName}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                                  )}
                                </div>
                                <span className="text-sm text-gray-600 max-w-24">
                                  {item.productName}
                                </span>
                              </div>

                              {/* Review button at the end */}
                              <Button
                                onClick={() => {
                                  setSelectedProduct(item);
                                  setIsReviewFormOpen(true);
                                }}
                                className="text-sm"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Write a Review
                              </Button>
                            </div>
                          ))}

                          {order.items.length > 3 && (
                            <span className="text-sm text-gray-500">
                              +{order.items.length - 3} more items
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                      <div className="mb-3 sm:mb-0">
                        <p className="text-sm text-gray-600">
                          Total: <span className="font-semibold text-gray-900">
                            {formatOrderPrice(order.total, order.currency)}
                          </span>
                        </p>
                        {order.items && (
                          <p className="text-xs text-gray-500">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>

                      </div>
                    </div>

                    {/* Currency Conversion Note */}
                    {showInCurrentCurrency && order.currency && order.currency !== currentCurrency.code && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        Original amount: {order.currency} {Number(order.total).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${page === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Order Summary */}
              <div className="mt-8 bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                    Showing {orders.length} of {pagination.total} orders
                    {statusFilter && ` with status: ${statusFilter}`}
                  </p>

                  {getOrderCurrencies().length > 1 && (
                    <div className="text-xs text-gray-500">
                      Orders in: {getOrderCurrencies().join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        onSubmit={handleReviewSubmission}
      />
    </div>
  );
}