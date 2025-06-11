"use client";
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import axios from 'axios';
import { GET_ALL_TRANSACTIONS } from '@/utils/routes/transactionRoutes';
import { getUserData } from '@/utils/auth';
import AdminLayout from '@/components/adminComponents/layout/AdminLayout';
const TransactionPage = () => {
    const [userEmail, setUserEmail] = useState('');
    const [status, setStatus] = useState('');
    const [userRole, setUserRole] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [transactions, setTransactions] = useState([]);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [loading, setLoading] = useState(false);
    const auth = getUserData();

    // Simulate API call to fetch transactions
    const fetchTransactions = async () => {
        setLoading(true);

        try {
            // Replace this with your actual API endpoint
            console.log('Fetching transactions ');

            const response = await axios.post(GET_ALL_TRANSACTIONS,
                {
                    userEmail,
                    status,
                    userRole,
                    startDate,
                    endDate,
                    page,
                    limit
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${auth.token}`
                    }
                });
            console.log('Response from API:', response.data);

            if (response.data.success) {
                setTransactions(response.data.transactions);
                setTotalTransactions(response.data.pagination.totalItems);

            }

        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1); // Reset to first page when searching
        fetchTransactions();
    };
    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchTransactions();
    };

    const handleFieldChange = (field, value) => {
        switch (field) {
            case 'userEmail':
                setUserEmail(value);
                break;
            case 'status':
                value == "Pending" ? setStatus('pending') : value == "Processing" ? setStatus('processing') : value == "Completed" ? setStatus('completed') : value == "Cancelled" ? setStatus('cancelled') : setStatus('');
                break;
            case 'userRole':
                setUserRole(value);
                break;
            case 'startDate':
                setStartDate(value);
                break;
            case 'endDate':
                setEndDate(value);
                break;
            default:
                break;
        }
    };
    const handleRefresh = () => {
        fetchTransactions();
    };
    // Fetch Transactions whenever the filters change
    useEffect(() => {
        fetchTransactions();
    }, [ status, userRole, startDate, endDate, page]); // Refetch when any filter changes
    // Clear all filters and reset to initial state
    const handleClearFilters = () => {
        setUserEmail('');
        setStatus('');
        setUserRole('');
        setStartDate('');
        setEndDate('');
        setPage(1);
        fetchTransactions(); // Refetch with cleared filters
    };


    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const totalPages = Math.ceil(totalTransactions / limit);

    // If no transactions, show the message
    if (loading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading transactions...</div>
            </div>
        );
    }

    const TransactionContent =  (
        <div className="min-h-screen p-1">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Transaction Management</h1>
                    <p className="text-gray-600">View and manage transaction records and payments</p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Header with Search and Filters */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <h2 className="text-lg font-medium text-gray-900">Transaction Records</h2>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="mt-4 space-y-4">
                            {/* First Row - Email Search and Date Range */}
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search by Email */}
                                <div className="relative flex-1 max-w-md flex">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search by email..."
                                            value={userEmail}
                                            onChange={(e) => handleFieldChange('userEmail', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="flex items-center justify-center px-3 bg-gray-900 text-white rounded-r-md hover:bg-gray-800 transition-colors disabled:opacity-50 border-l-0"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Date Range */}
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => handleFieldChange('startDate', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Start Date"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => handleFieldChange('endDate', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="End Date"
                                    />
                                </div>
                            </div>

                            {/* Second Row - Status and Role Filters with Action Buttons */}
                            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                                {/* Status Filter */}
                                <div className="flex gap-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center mr-2">Status:</label>
                                    {['', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((statusOption) => (
                                        <button
                                            key={statusOption}
                                            onClick={() => handleFieldChange('status', statusOption)}
                                            disabled={loading}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${status === statusOption
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {statusOption || 'All'}
                                        </button>
                                    ))}
                                </div>

                                {/* Role Filter */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Role:</label>
                                    <select
                                        value={userRole}
                                        onChange={(e) => handleFieldChange('userRole', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="guest">Guest</option>
                                        <option value="registered user">Registered User</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 lg:ml-auto">
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Clear Filters
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Loading transactions...
                                </div>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="text-gray-400 mb-2">
                                    <Search className="w-16 h-16 mx-auto mb-4" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                                <p className="text-gray-500 text-center max-w-md">
                                    {userEmail || status || userRole || startDate || endDate
                                        ? "No transactions match your current filters. Try adjusting your search criteria."
                                        : "There are no transactions to display at the moment."}
                                </p>
                                {(userEmail || status || userRole || startDate || endDate) && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="mt-4 px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.transactionId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                                                    <div className="text-sm text-gray-900">{transaction.userEmail}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    ${transaction.amount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{transaction.userRole == "registered user" ? "Registered User" : "Guest User"}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    {transaction.transactionDate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination Footer - Only show when there are transactions */}
                    {!loading && transactions.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalTransactions)} of {totalTransactions} transactions
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1 || loading}
                                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-700">
                                    Page {page} of {Math.max(1, totalPages)}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages || totalPages === 0 || loading}
                                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            {TransactionContent}
        </AdminLayout>
    );
};

export default TransactionPage;