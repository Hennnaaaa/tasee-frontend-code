'use client';

import { useState, useEffect } from 'react';
import { Star, Edit, Trash2, RefreshCw, Package } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Import UI components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import API routes
import {
  GET_MY_REVIEWS,
  UPDATE_REVIEW,
  DELETE_REVIEW,
} from '@/utils/routes/reviewRoutes';

// Import components
import ReviewForm from '@/components/customerComponents/reviews/ReviewForm';

// Import auth utility
import { getUserData } from '@/utils/auth';

export default function UserReviewsPage() {
  const router = useRouter();
  
  // State for reviews
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for review form
  const [editingReview, setEditingReview] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData) {
      router.push('/login');
      return;
    }
    
    fetchMyReviews();
  }, [router, currentPage, statusFilter]);

  // Fetch user's reviews
  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(GET_MY_REVIEWS, {
        params: {
          page: currentPage,
          limit: 10,
          status: statusFilter,
        },
        headers: {
          Authorization: `Bearer ${auth.token}`,
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
      
      setError(err.response?.data?.message || 'Error fetching your reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle update review
  const handleUpdateReview = async (reviewData) => {
    try {
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }

      const response = await axios.put(UPDATE_REVIEW(editingReview.id), reviewData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        setEditingReview(null);
        fetchMyReviews(); // Refresh reviews
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating review');
    }
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }

      const response = await axios.delete(DELETE_REVIEW(reviewId), {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        fetchMyReviews(); // Refresh reviews
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting review');
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

  // Get status badge variant
  const getStatusBadgeVariant = (review) => {
    if (review.isHidden) return 'destructive';
    if (!review.isApproved) return 'secondary';
    return 'success';
  };

  // Get status text
  const getStatusText = (review) => {
    if (review.isHidden) return 'Hidden';
    if (!review.isApproved) return 'Pending';
    return 'Approved';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground">
            Manage your product reviews and ratings
          </p>
        </div>
        <Button variant="outline" onClick={fetchMyReviews}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <RefreshCw className="animate-spin h-8 w-8 mb-4" />
            <span>Loading your reviews...</span>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reviews found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't written any reviews yet. Start shopping and share your experience!
            </p>
            <Button onClick={() => router.push('/products')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  

                  {/* Review Content */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg mb-1">
                          {review.product?.name || 'Unknown Product'}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">
                            {review.rating}/5
                          </span>
                          <Badge variant={getStatusBadgeVariant(review)}>
                            {getStatusText(review)}
                          </Badge>
                          {review.isVerifiedPurchase && (
                            <Badge variant="outline">Verified Purchase</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                          {review.updatedAt !== review.createdAt && (
                            <span> • Updated {new Date(review.updatedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingReview(review)}
                          title="Edit Review"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteReview(review.id)}
                          title="Delete Review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h4 className="font-medium mb-2">{review.title}</h4>
                    )}

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-muted-foreground mb-4">{review.comment}</p>
                    )}

                    {/* Review Stats */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{review.helpfulCount} people found this helpful</span>
                      {review.product?.price && (
                        <span>Product Price: ${review.product.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalReviews} total reviews)
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
        </div>
      )}

      {/* Review Form Modal */}
      {editingReview && (
        <ReviewForm
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          onSubmit={handleUpdateReview}
          initialData={editingReview}
          isEditing={true}
        />
      )}
    </div>
  );
}