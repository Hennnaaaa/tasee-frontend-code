// src/components/admin/AdminOrdersManagement.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ADMIN_GET_ALL_ORDERS, 
  ADMIN_GET_SUMMARY, 
  ADMIN_GET_ANALYTICS,
  ADMIN_UPDATE_ORDER_STATUS,
  ADMIN_BULK_UPDATE_STATUS,
  ADMIN_UPDATE_PAYMENT_STATUS,
  ADMIN_FORCE_CANCEL_ORDER,
  ADMIN_EXPORT_ORDERS
} from '@/utils/routes/orderRoutes';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/utils/auth';
import AdminLayout from '@/components/adminComponents/layout/AdminLayout';

const AdminOrdersManagement = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Separate search state
  
  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Payment status color mapping
  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[paymentStatus] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  /**
   * Get authentication headers
   */
  const getAuthHeaders = () => {
    const authData = getUserData();
    
    if (!authData || !authData.token) {
      throw new Error('No authentication token found. Please login again.');
    }

    if (authData.userData.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`,
    };
  };

  /**
   * Make authenticated API request
   */
  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Handle CSV downloads
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        const blob = await response.blob();
        return { blob, headers: response.headers };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

  /**
   * Build URL with query parameters
   */
  const buildUrlWithParams = (baseUrl, params) => {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  };

  /**
   * Fetch all orders with current filters
   */
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      const url = buildUrlWithParams(ADMIN_GET_ALL_ORDERS, filters);
      const response = await makeAuthenticatedRequest(url);
      
      if (response.success) {
        setOrders(response.data.orders || []);
        setPagination({
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 0,
          currentPage: response.data.pagination?.page || 1
        });
      }
    } catch (error) {
      setError(error.message);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch dashboard summary
   */
  const fetchSummary = async () => {
    try {
      const response = await makeAuthenticatedRequest(ADMIN_GET_SUMMARY);
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      // Don't set error state for summary failure
    }
  };

  /**
   * Update single order status
   */
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await makeAuthenticatedRequest(ADMIN_UPDATE_ORDER_STATUS, {
        method: 'PUT',
        body: JSON.stringify({ id: orderId, status })
      });

      if (response.success) {
        await fetchOrders();
        alert('Order status updated successfully!');
      }
    } catch (error) {
      alert(`Failed to update order status: ${error.message}`);
    }
  };

  /**
   * Bulk update order status
   */
  const bulkUpdateStatus = async (status) => {
    if (selectedOrders.length === 0) {
      alert('Please select orders to update');
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(ADMIN_BULK_UPDATE_STATUS, {
        method: 'PUT',
        body: JSON.stringify({ 
          orderIds: selectedOrders, 
          status 
        })
      });

      if (response.success) {
        setSelectedOrders([]);
        await fetchOrders();
        alert(`Successfully updated ${response.data.updatedCount} orders!`);
      }
    } catch (error) {
      alert(`Failed to bulk update orders: ${error.message}`);
    }
  };

  /**
   * Update payment status
   */
  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const response = await makeAuthenticatedRequest(ADMIN_UPDATE_PAYMENT_STATUS, {
        method: 'PUT',
        body: JSON.stringify({ id: orderId, paymentStatus })
      });

      if (response.success) {
        await fetchOrders();
        alert('Payment status updated successfully!');
      }
    } catch (error) {
      alert(`Failed to update payment status: ${error.message}`);
    }
  };

  /**
   * Force cancel order
   */
  const forceCancelOrder = async (orderId, reason = '') => {
    if (!confirm('Are you sure you want to force cancel this order?')) return;

    try {
      const response = await makeAuthenticatedRequest(ADMIN_FORCE_CANCEL_ORDER, {
        method: 'POST',
        body: JSON.stringify({ orderId, reason })
      });

      if (response.success) {
        await fetchOrders();
        alert('Order cancelled successfully!');
      }
    } catch (error) {
      alert(`Failed to cancel order: ${error.message}`);
    }
  };

  /**
   * Export orders to CSV
   */
  const exportOrders = async () => {
    try {
      const exportParams = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
        paymentStatus: filters.paymentStatus,
        format: 'csv'
      };

      const url = buildUrlWithParams(ADMIN_EXPORT_ORDERS, exportParams);
      const response = await makeAuthenticatedRequest(url);

      if (response.blob) {
        // Create download link
        const downloadUrl = window.URL.createObjectURL(response.blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Get filename from headers or use default
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
        alert('Orders exported successfully!');
      }
    } catch (error) {
      alert(`Failed to export orders: ${error.message}`);
    }
  };

  /**
   * Handle filter changes (excluding search)
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  /**
   * Handle search with debouncing
   */
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setFilters(prev => ({
        ...prev,
        search: searchValue,
        page: 1
      }));
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  /**
   * Toggle order selection
   */
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  /**
   * Select all orders on current page
   */
  const selectAllOrders = () => {
    if (!orders || orders.length === 0) return;
    
    const currentPageOrderIds = orders.map(order => order.id);
    setSelectedOrders(prev => {
      const allSelected = currentPageOrderIds.every(id => prev.includes(id));
      return allSelected 
        ? prev.filter(id => !currentPageOrderIds.includes(id))
        : [...new Set([...prev, ...currentPageOrderIds])];
    });
  };

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Load data on component mount and filter changes (excluding search term)
  useEffect(() => {
    const { search, ...otherFilters } = filters;
    fetchOrders();
  }, [filters.page, filters.limit, filters.status, filters.paymentStatus, filters.startDate, filters.endDate, filters.search, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  const AdminOrdersManagement = (
    <div className="p-4 w-full min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage and monitor all customer orders</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Dashboard Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Today's Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.today?.orders || 0}</p>
            <p className="text-sm text-green-600">${(summary.today?.revenue || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">This Week</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.thisWeek?.orders || 0}</p>
            <p className="text-sm text-green-600">${(summary.thisWeek?.revenue || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">This Month</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.thisMonth?.orders || 0}</p>
            <p className="text-sm text-green-600">${(summary.thisMonth?.revenue || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.pending?.orders || 0}</p>
            <p className="text-sm text-yellow-600">{summary.pending?.processing || 0} processing</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          <select
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <input
            type="date"
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />

          <input
            type="date"
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />

          <button
            onClick={exportOrders}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 whitespace-nowrap"
          >
            Export CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedOrders.length > 0 && (
            <>
              <button
                onClick={() => bulkUpdateStatus('shipped')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Mark as Shipped ({selectedOrders.length})
              </button>
              <button
                onClick={() => bulkUpdateStatus('delivered')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                Mark as Delivered ({selectedOrders.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={selectAllOrders}
                    checked={orders.length > 0 && orders.every(order => selectedOrders.includes(order.id))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders && orders.length > 0 ? orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <div>
                      <div className="font-medium text-gray-900">
                        {order.user 
                          ? `${order.user.firstName} ${order.user.lastName}`
                          : order.guestName
                        }
                      </div>
                      <div className="text-gray-500 text-xs">
                        {order.user ? order.user.email : order.guestEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
  <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
    <svg className="w-4 h-4 ml-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </span>
  <select
    value={order.status}
    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  >
    <option value="pending">Pending</option>
    <option value="processing">Processing</option>
    <option value="shipped">Shipped</option>
    <option value="delivered">Delivered</option>
    <option value="cancelled">Cancelled</option>
  </select>
</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
  <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
    <svg className="w-4 h-4 ml-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </span>
  <select
    value={order.paymentStatus}
    onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  >
    <option value="pending">Pending</option>
    <option value="paid">Paid</option>
    <option value="failed">Failed</option>
    <option value="refunded">Refunded</option>
  </select>
</div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    ${Number(order.total || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <button
                      onClick={() => forceCancelOrder(order.id, 'Cancelled by admin')}
                      className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={order.status === 'cancelled'}
                    >
                      Force Cancel
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Loading orders...' : 'No orders found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-700 mb-2 sm:mb-0">
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * filters.limit, pagination.total)} of{' '}
              {pagination.total} orders
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm bg-gray-100 rounded-md">
                Page {pagination.currentPage} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-lg">Processing...</div>
          </div>
        </div>
      )}
    </div>
  );
   return <AdminLayout>{AdminOrdersManagement}</AdminLayout>;
};

export default AdminOrdersManagement;