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
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  Check,
  X,
  BarChart3,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        fetchStats(); // Refresh stats after visibility change
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating review visibility');
    }
  };

  // Handle approve review - REMOVED (no longer needed)
  // const handleApproveReview = async (reviewId) => { ... }

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

  // Get review status info - simplified without approval
  const getReviewStatus = (review) => {
    if (review.isHidden) {
      return { label: 'Hidden from Public', variant: 'destructive', icon: EyeOff };
    }
    return { label: 'Visible to Public', variant: 'default', icon: Eye };
  };

  const reviewsContent = (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage customer reviews, ratings, and feedback across all products
            </p>
          </div>
          <div className="flex space-x-3">
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

        {/* Enhanced Stats Cards - Updated for simplified system */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.summary?.totalReviews || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{stats.summary?.recentReviews || 0} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visible Reviews</CardTitle>
                <Eye className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.summary?.visibleReviews || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Public facing reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hidden Reviews</CardTitle>
                <EyeOff className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.summary?.hiddenReviews || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Hidden from public
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Award className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">
                    {stats.summary?.avgRating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="flex">
                    {renderStars(Math.round(stats.summary?.avgRating || 0))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From visible reviews
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rating Distribution and Top Reviewed Products in Single Row */}
        {stats && (stats.ratingDistribution || (stats.topReviewedProducts && stats.topReviewedProducts.length > 0)) && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Rating Distribution */}
            {stats.ratingDistribution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Rating Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = stats.ratingDistribution[rating] || 0;
                      const total = Object.values(stats.ratingDistribution).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={rating} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 w-16">
                            <span className="text-sm font-medium">{rating}</span>
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Reviewed Products */}
            {stats.topReviewedProducts && stats.topReviewedProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Top Reviewed Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topReviewedProducts.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.reviewCount} reviews • {product.avgRating} avg rating
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(Math.round(product.avgRating))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* Enhanced Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Reviews</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, comment, or product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Visibility</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reviews</SelectItem>
                    <SelectItem value="visible">👁️ Visible to Public</SelectItem>
                    <SelectItem value="hidden">🚫 Hidden from Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Rating</label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Ratings</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                    <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                    <SelectItem value="1">⭐ 1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Actions</label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('hidden');
                      setCurrentPage(1);
                    }}
                    className="flex-1"
                  >
                    View Hidden
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Bulk Actions */}
        {selectedReviews.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedReviews.length === reviews.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      {selectedReviews.length} review(s) selected
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('unhide')}
                    disabled={bulkLoading}
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Make Visible
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('hide')}
                    disabled={bulkLoading}
                    className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                  >
                    <EyeOff className="mr-1 h-4 w-4" />
                    Hide All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkLoading}
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Enhanced Reviews Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Reviews ({pagination?.totalReviews || 0})</span>
              {pagination && (
                <span className="text-sm font-normal text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              )}
            </CardTitle>
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
              <div className="text-center p-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">No reviews found</p>
                <p className="text-muted-foreground">
                  {search || statusFilter !== 'all' || ratingFilter 
                    ? 'Try adjusting your filters to see more results'
                    : 'Reviews will appear here once customers start leaving feedback'
                  }
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedReviews.length === reviews.length && reviews.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Product & Customer</TableHead>
                      <TableHead>Rating & Review</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => {
                      const statusInfo = getReviewStatus(review);
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <TableRow key={review.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedReviews.includes(review.id)}
                              onCheckedChange={(checked) => handleSelectReview(review.id, checked)}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-2">
                              <div>
                                <div className="font-medium text-sm">
                                  {review.product?.name || 'Unknown Product'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  SKU: {review.product?.sku || 'N/A'}
                                </div>
                              </div>
                              <div className="border-t pt-2">
                                <div className="font-medium text-sm">
                                  {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Unknown User'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {review.user?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="max-w-sm">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm font-medium">{review.rating}/5</span>
                                {review.isVerifiedPurchase && (
                                  <Badge variant="outline" className="text-xs">
                                    ✓ Verified
                                  </Badge>
                                )}
                              </div>
                              
                              {review.title && (
                                <div className="font-medium text-sm line-clamp-1">
                                  {review.title}
                                </div>
                              )}
                              
                              {review.comment && (
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {review.comment}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-4 w-4 ${
                                review.isHidden ? 'text-red-500' : 'text-green-500'
                              }`} />
                              <Badge 
                                variant={statusInfo.variant} 
                                className={`text-xs ${
                                  review.isHidden ? 'bg-red-100 text-red-700 border-red-200' :
                                  'bg-green-100 text-green-700 border-green-200'
                                }`}
                              >
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex justify-end space-x-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleVisibility(review.id, review.isHidden)}
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    {review.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {review.isHidden 
                                      ? 'Make this review visible to customers' 
                                      : 'Hide this review from customer view'
                                    }
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteReview(review)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Permanently delete this review</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Enhanced Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalReviews)} of {pagination.totalReviews} reviews
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrev}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(
                        pagination.currentPage - 2 + i,
                        pagination.totalPages - 4 + i
                      ));
                      
                      if (pageNum <= pagination.totalPages) {
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
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
          description={
            reviewToDelete 
              ? `Are you sure you want to permanently delete the review "${reviewToDelete.title || 'Untitled'}" by ${reviewToDelete.user ? `${reviewToDelete.user.firstName} ${reviewToDelete.user.lastName}` : 'Unknown User'}? This action cannot be undone.`
              : 'Are you sure you want to delete this review? This action cannot be undone.'
          }
          confirmText="Delete Review"
          cancelText="Cancel"
        />
        
        {/* Bulk Action Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={bulkActionDialogOpen}
          onClose={() => setBulkActionDialogOpen(false)}
          onConfirm={handleConfirmBulkAction}
          title={`Bulk ${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} Reviews`}
          description={`Are you sure you want to ${bulkAction} ${selectedReviews.length} selected review(s)? ${bulkAction === 'delete' ? 'This action cannot be undone.' : ''}`}
          confirmText={`${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} Reviews`}
          cancelText="Cancel"
          loading={bulkLoading}
        />
      </div>
    </TooltipProvider>
  );
  
  return <AdminLayout>{reviewsContent}</AdminLayout>;
}