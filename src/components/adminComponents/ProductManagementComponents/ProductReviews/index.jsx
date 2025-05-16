'use client'
import React, { useState } from 'react';
import { Star, MessageSquare, User, Calendar, MoreHorizontal, Eye, EyeOff, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProductReviews = ({ productId, productName, onClose }) => {
  // Mock reviews data - you'd fetch this from your backend
  const [reviews] = useState([
    {
      id: 1,
      userName: 'John Doe',
      userAvatar: '',
      rating: 5,
      comment: 'Great product! Exactly what I was looking for.',
      date: '2024-01-15',
      isVisible: true,
      isVerifiedPurchase: true,
      helpful: 12,
      images: []
    },
    {
      id: 2,
      userName: 'Jane Smith',
      userAvatar: '',
      rating: 4,
      comment: 'Good quality, but shipping took longer than expected.',
      date: '2024-01-10',
      isVisible: true,
      isVerifiedPurchase: false,
      helpful: 8,
      images: ['/api/placeholder/100/100']
    },
    {
      id: 3,
      userName: 'Mike Johnson',
      userAvatar: '',
      rating: 3,
      comment: 'Average product. Could be better for the price.',
      date: '2024-01-05',
      isVisible: false,
      isVerifiedPurchase: true,
      helpful: 3,
      images: []
    },
  ]);

  const [filterRating, setFilterRating] = useState('all');
  const [showHidden, setShowHidden] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyDialogOpen(true);
  };

  const handleToggleVisibility = (reviewId) => {
    // Update review visibility in your backend
    console.log(`Toggle visibility for review ${reviewId}`);
  };

  const handleDelete = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      // Delete review in your backend
      console.log(`Delete review ${reviewId}`);
    }
  };

  const submitReply = () => {
    // Submit reply to backend
    console.log(`Reply to review ${selectedReview.id}: ${replyText}`);
    setReplyDialogOpen(false);
    setReplyText('');
  };

  const filteredReviews = reviews.filter(review => {
    if (!showHidden && !review.isVisible) return false;
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length
  }));

  const StarRating = ({ rating, size = 'sm' }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Reviews for {productName}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rating Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                  <StarRating rating={Math.round(averageRating)} size="md" />
                  <div className="text-sm text-gray-600">{reviews.length} reviews</div>
                </div>
                <div className="space-y-2">
                  {ratingCounts.map(({ rating, count }) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-2">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${(count / reviews.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Customer Reviews</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={showHidden ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowHidden(!showHidden)}
                      >
                        {showHidden ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                        {showHidden ? 'Showing Hidden' : 'Hide Hidden'}
                      </Button>
                    </div>
                  </div>

                  <Tabs value={filterRating} onValueChange={setFilterRating} className="mt-4">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="5">5 ★</TabsTrigger>
                      <TabsTrigger value="4">4 ★</TabsTrigger>
                      <TabsTrigger value="3">3 ★</TabsTrigger>
                      <TabsTrigger value="2">2 ★</TabsTrigger>
                      <TabsTrigger value="1">1 ★</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {filteredReviews.map((review) => (
                        <div
                          key={review.id}
                          className={`p-4 border rounded-lg ${
                            !review.isVisible ? 'bg-gray-50 opacity-75' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <Avatar>
                                <AvatarImage src={review.userAvatar} alt={review.userName} />
                                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{review.userName}</span>
                                  {review.isVerifiedPurchase && (
                                    <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                                  )}
                                  {!review.isVisible && (
                                    <Badge variant="destructive" className="text-xs">Hidden</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <StarRating rating={review.rating} />
                                  <span className="text-sm text-gray-600">{review.date}</span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                                
                                {review.images.length > 0 && (
                                  <div className="flex gap-2 mt-2">
                                    {review.images.map((img, idx) => (
                                      <img
                                        key={idx}
                                        src={img}
                                        alt={`Review image ${idx + 1}`}
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-sm text-gray-600">
                                    Helpful ({review.helpful})
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReply(review)}
                                  >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleToggleVisibility(review.id)}>
                                  {review.isVisible ? (
                                    <>
                                      <EyeOff className="w-4 h-4 mr-2" />
                                      Hide Review
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Show Review
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(review.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Review
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedReview?.userName}'s Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={selectedReview?.rating || 0} />
                <span className="text-sm text-gray-600">{selectedReview?.date}</span>
              </div>
              <p className="text-sm">{selectedReview?.comment}</p>
            </div>
            <Textarea
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitReply}>Send Reply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductReviews;