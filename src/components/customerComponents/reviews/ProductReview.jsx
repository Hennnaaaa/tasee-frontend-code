'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

// Import UI components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import API routes
import {
  GET_PUBLIC_PRODUCT_REVIEWS,
  GET_PRODUCT_RATING_SUMMARY,
  MARK_REVIEW_HELPFUL,
  CREATE_REVIEW,
  UPDATE_REVIEW,
  DELETE_REVIEW,
} from '@/utils/routes/reviewRoutes';

// Import auth utility
import { getUserData } from '@/utils/auth';

// Import review form component
import ReviewForm from './ReviewForm';

// Simple Progress component
const SimpleProgress = ({ value = 0, className = '' }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
    <div
      className="h-full bg-blue-500 transition-all duration-200"
      style={{ width: `${value || 0}%` }}
    />
  </div>
);

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // State for review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  // State for user
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const auth = getUserData();
    if (auth && auth.userData && auth.token) {
      setUser(auth.userData);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    
    fetchRatingSummary();
    fetchReviews();
  }, [productId]);

  // Fetch rating summary (public, no auth needed)
  const fetchRatingSummary = async () => {
    try {
      const response = await axios.get(GET_PRODUCT_RATING_SUMMARY(productId));
      
      if (response.data.success) {
        setRatingSummary(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching rating summary:', err);
      // Don't show error for rating summary - it's optional
    }
  };

  // Fetch reviews (public, no auth needed)
  const fetchReviews = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const response = await axios.get(GET_PUBLIC_PRODUCT_REVIEWS(productId), {
        params: {
          page,
          limit: 5,
          sortBy: 'helpfulCount',
        }
      });
      
      if (response.data.success) {
        const newReviews = response.data.data.reviews;
        
        if (append) {
          setReviews(prev => [...prev, ...newReviews]);
        } else {
          setReviews(newReviews);
        }
        
        setHasMore(response.data.data.hasMore);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Don't show error for fetching reviews - show empty state instead
    } finally {
      setLoading(false);
    }
  };

  // Handle mark review as helpful
  const handleMarkHelpful = async (reviewId, helpful) => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('Please login to mark reviews as helpful');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      const auth = getUserData();
      if (!auth || !auth.token) {
        setError('Please login to mark reviews as helpful');
        setTimeout(() => setError(null), 5000);
        return;
      }

      const response = await axios.post(MARK_REVIEW_HELPFUL(reviewId), {
        helpful,
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpfulCount: response.data.data.helpfulCount }
            : review
        ));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to mark reviews as helpful');
      } else {
        setError(err.response?.data?.message || 'Error updating helpful count');
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle create review
  const handleCreateReview = async (reviewData) => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('Please login to write a review');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      const auth = getUserData();
      if (!auth || !auth.token) {
        setError('Please login to write a review');
        setTimeout(() => setError(null), 5000);
        return;
      }

      const response = await axios.post(CREATE_REVIEW, {
        productId,
        ...reviewData,
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        setShowReviewForm(false);
        fetchReviews();
        fetchRatingSummary();
        setError(null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to write a review');
      } else {
        setError(err.response?.data?.message || 'Error creating review');
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle update review
  const handleUpdateReview = async (reviewData) => {
    if (!isAuthenticated) {
      setError('Please login to update review');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      const auth = getUserData();
      if (!auth || !auth.token) {
        setError('Please login to update review');
        setTimeout(() => setError(null), 5000);
        return;
      }

      const response = await axios.put(UPDATE_REVIEW(editingReview.id), reviewData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        setEditingReview(null);
        fetchReviews();
        fetchRatingSummary();
        setError(null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to update review');
      } else {
        setError(err.response?.data?.message || 'Error updating review');
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    if (!isAuthenticated) {
      setError('Please login to delete review');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      const auth = getUserData();
      if (!auth || !auth.token) {
        setError('Please login to delete review');
        setTimeout(() => setError(null), 5000);
        return;
      }

      const response = await axios.delete(DELETE_REVIEW(reviewId), {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        }
      });
      
      if (response.data.success) {
        fetchReviews();
        fetchRatingSummary();
        setError(null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to delete review');
      } else {
        setError(err.response?.data?.message || 'Error deleting review');
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  // Load more reviews
  const handleLoadMore = () => {
    fetchReviews(currentPage + 1, true);
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  // Render star rating
  const renderStars = (rating, size = 'sm') => {
    const starSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${starSize} ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Render rating distribution
  const renderRatingDistribution = () => {
    if (!ratingSummary) return null;

    const { ratingDistribution, totalReviews } = ratingSummary;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-8">{rating}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <SimpleProgress value={percentage} className="flex-1" />
              <span className="w-12 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Check if user can review this product
  const canUserReview = () => {
    if (!isAuthenticated) return false;
    const userReview = reviews.find(review => review.user && review.user.id === user?.id);
    return !userReview;
  };

  // Get user's existing review
  const getUserReview = () => {
    if (!isAuthenticated) return null;
    return reviews.find(review => review.user && review.user.id === user?.id);
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratingSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {ratingSummary.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(ratingSummary.averageRating), 'lg')}
                </div>
                <div className="text-sm text-gray-500">
                  Based on {ratingSummary.totalReviews} review{ratingSummary.totalReviews !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="font-medium mb-3">Rating Breakdown</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review Section */}
      <Card>
        <CardContent className="pt-6">
          {isAuthenticated ? (
            <div>
              {canUserReview() ? (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">
                    Share your experience with this product
                  </p>
                  <Button onClick={() => setShowReviewForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Write a Review
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">
                    You have already reviewed this product
                  </p>
                  {getUserReview() && (
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingReview(getUserReview())}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReview(getUserReview().id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Review
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                Please login to write a review
              </p>
              <Button variant="outline" onClick={handleLoginRedirect}>
                Login to Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading && reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {review.user ? 
                          `${review.user.firstName?.[0] || ''}${review.user.lastName?.[0] || ''}` :
                          'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {review.user ? 
                          `${review.user.firstName} ${review.user.lastName}` : 
                          'Anonymous User'
                        }
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.isVerifiedPurchase && (
                          <Badge variant="outline" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}

                {review.comment && (
                  <p className="text-gray-600 mb-4">{review.comment}</p>
                )}

                {/* Helpful Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkHelpful(review.id, true)}
                          className="text-gray-500 hover:text-green-600"
                        >
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          Helpful
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkHelpful(review.id, false)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <ThumbsDown className="mr-1 h-4 w-4" />
                          Not Helpful
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoginRedirect}
                        className="text-gray-500"
                      >
                        Login to vote
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {review.helpfulCount || 0} people found this helpful
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </div>
        )}
      </div>

      {/* Review Form Modal/Dialog */}
      {(showReviewForm || editingReview) && (
        <ReviewForm
          isOpen={showReviewForm || !!editingReview}
          onClose={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
          onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
          initialData={editingReview}
          isEditing={!!editingReview}
        />
      )}
    </div>
  );
}

export default ProductReviews;