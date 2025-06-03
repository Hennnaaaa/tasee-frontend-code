'use client';

import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ReviewForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isEditing = false 
}) {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        rating: initialData.rating || 0,
        title: initialData.title || '',
        comment: initialData.comment || '',
      });
    } else {
      setFormData({
        rating: 0,
        title: '',
        comment: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!formData.comment.trim()) {
      setError('Please write a comment');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        rating: 0,
        title: '',
        comment: '',
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle rating click
  const handleRatingClick = (rating) => {
    handleInputChange('rating', rating);
  };

  // Handle rating hover
  const handleRatingHover = (rating) => {
    setHoveredRating(rating);
  };

  // Handle rating mouse leave
  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  // Render star rating input
  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= (hoveredRating || formData.rating);
          
          return (
            <button
              key={index}
              type="button"
              className="focus:outline-none transition-colors"
              onClick={() => handleRatingClick(starValue)}
              onMouseEnter={() => handleRatingHover(starValue)}
              onMouseLeave={handleRatingLeave}
            >
              <Star
                className={`h-6 w-6 ${
                  isActive 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              />
            </button>
          );
        })}
        <span className="ml-2 text-sm text-muted-foreground">
          {formData.rating > 0 ? `${formData.rating}/5` : 'Select rating'}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            {renderStarRating()}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Give your review a title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={255}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.title.length}/255
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product..."
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              rows={5}
              maxLength={1000}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.comment.length}/1000
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.rating === 0}
            >
              {loading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}