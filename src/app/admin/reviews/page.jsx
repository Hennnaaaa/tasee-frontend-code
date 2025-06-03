'use client';

import { useState, useEffect } from 'react';
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import API routes
import {
  GET_ALL_REVIEWS,
  TOGGLE_REVIEW_VISIBILITY,
  ADMIN_DELETE_REVIEW,
  GET_REVIEW_STATS,
  BULK_UPDATE_REVIEWS,
  EXPORT_REVIEWS,
} from '@/utils/routes/reviewRoutes';

// Import components
import AdminLayout from '@/components/adminComponents/layout/AdminLayout';
import ConfirmationDialog from '@/components/adminComponents/products/ConfirmationDialog';

// Import auth utility
import { getUserData } from '@/utils/auth';
export default function AdminReviewsPage() {
  const router = useRouter();
  
  // State for reviews
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // State for filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  // State for bulk operations
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // State for modals
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
      router.push('/login');
      return;
    }
    
    fetchReviews();
    fetchStats();
  }, [router, currentPage, statusFilter, ratingFilter, search]);

  // Fetch reviews with authentication
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }

      const payload = {
        page: currentPage,
        limit: 20,
        status: statusFilter,
        rating: ratingFilter || null,
        search: search,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const response = await axios.post(GET_ALL_REVIEWS, payload, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setPagination(response.data.data.pagination);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      setError(err.response?.data?.message || 'Error fetching reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch review statistics
  const fetchStats = async () => {
    try {
      const auth = getUserData();
      if (!auth || !auth.token) return;

      const response = await axios.post(GET_REVIEW_STATS, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Handle toggle review visibility
  const handleToggleVisibility = async (reviewId, currentlyHidden) => {
    try {
      const auth = getUserData();
      if (!auth || !auth.token) return;

      const response = await axios.post(TOGGLE_REVIEW_VISIBILITY, {
        reviewId,
        hidden: !currentlyHidden,
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        fetchReviews();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating review visibility');
    }
  };

  // Handle delete review
  const handleDeleteReview = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    
    try {
      const auth = getUserData();
      if (!auth || !auth.token) return;

      const response = await axios.post(ADMIN_DELETE_REVIEW, {
        reviewId: reviewToDelete.id,
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        fetchReviews();
        fetchStats();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting review');
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action) => {
    if (selectedReviews.length === 0) return;

    setBulkAction(action);
    setBulkActionDialogOpen(true);
  };

  // Handle confirm bulk action
  const handleConfirmBulkAction = async () => {
    try {
      setBulkLoading(true);
      const auth = getUserData();
      if (!auth || !auth.token) return;

      const response = await axios.post(BULK_UPDATE_REVIEWS, {
        reviewIds: selectedReviews,
        action: bulkAction,
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        setSelectedReviews([]);
        fetchReviews();
        fetchStats();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error performing bulk action');
    } finally {
      setBulkLoading(false);
      setBulkActionDialogOpen(false);
      setBulkAction('');
    }
  };

  // Handle export reviews
  const handleExportReviews = async () => {
    try {
      const auth = getUserData();
      if (!auth || !auth.token) return;

      const response = await axios.post(EXPORT_REVIEWS, {
        status: statusFilter !== 'all' ? statusFilter : null,
        rating: ratingFilter || null,
        format: 'csv',
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reviews_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error exporting reviews');
    }
  };

  // Handle select all reviews
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedReviews(reviews.map(review => review.id));
    } else {
      setSelectedReviews([]);
    }
  };

  // Handle select individual review
  const handleSelectReview = (reviewId, checked) => {
    if (checked) {
      setSelectedReviews([...selectedReviews, reviewId]);
    } else {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const reviewsContent = (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Management</h1>
          <p className="text-muted-foreground">
            Manage product reviews and ratings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportReviews}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={fetchReviews}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            {/* <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalReviews}</div>
            </CardContent> */}
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            {/* <CardContent>
              <div className="text-2xl font-bold">{stats.overview.approvedReviews}</div>
            </CardContent> */}
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            {/* <CardContent>
              <div className="text-2xl font-bold">{stats.overview.pendingReviews}</div>
            </CardContent> */}
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            {/* <CardContent>
              <div className="text-2xl font-bold">{stats.overview.averageRating.toFixed(1)}</div>
            </CardContent> */}
          </Card>
        </div>
      )}
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedReviews.length} review(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  disabled={bulkLoading}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('hide')}
                  disabled={bulkLoading}
                >
                  Hide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkLoading}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-6 w-6 mb-2" />
                <span>Loading reviews...</span>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">No reviews found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedReviews.length === reviews.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReviews.includes(review.id)}
                          onCheckedChange={(checked) => handleSelectReview(review.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{review.product?.name || 'Unknown Product'}</div>
                          <div className="text-sm text-muted-foreground">{review.product?.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Unknown User'}
                          </div>
                          <div className="text-sm text-muted-foreground">{review.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm">{review.rating}/5</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div>
                          {review.title && (
                            <div className="font-medium mb-1 truncate">{review.title}</div>
                          )}
                          {review.comment && (
                            <div className="text-sm text-muted-foreground truncate">{review.comment}</div>
                          )}
                          {review.isVerifiedPurchase && (
                            <Badge variant="outline" className="mt-1">Verified Purchase</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          {review.isApproved ? (
                            <Badge variant="success">Approved</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {review.isHidden && (
                            <Badge variant="destructive">Hidden</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleVisibility(review.id, review.isHidden)}
                            title={review.isHidden ? 'Show Review' : 'Hide Review'}
                          >
                            {review.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteReview(review)}
                            title="Delete Review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Review"
        description={`Are you sure you want to delete this review? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
      
      {/* Bulk Action Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={bulkActionDialogOpen}
        onClose={() => setBulkActionDialogOpen(false)}
        onConfirm={handleConfirmBulkAction}
        title={`Bulk ${bulkAction} Reviews`}
        description={`Are you sure you want to ${bulkAction} ${selectedReviews.length} selected review(s)?`}
        confirmText={bulkAction}
        cancelText="Cancel"
        loading={bulkLoading}
      />
    </div>
  );
  
  return <AdminLayout>{reviewsContent}</AdminLayout>;
}