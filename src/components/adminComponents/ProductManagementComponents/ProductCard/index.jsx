import React, { useState } from 'react';
import { ChevronDown, Edit2, Trash2, Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ProductCard = ({ product, onEdit, onDelete, onViewReviews }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const discountPercentage = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  // Mock review data - replace with actual data from your backend
  const reviewData = {
    count: 23,
    average: 4.3
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image carousel */}
          <div className="relative group">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            
            {product.images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
                
                {/* Image indicators */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Image count badge */}
            {product.images.length > 1 && (
              <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {currentImageIndex + 1}/{product.images.length}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewReviews(product)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(product.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Reviews summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(reviewData.average)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {reviewData.average} ({reviewData.count} reviews)
              </span>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge>Stock: {product.stock}</Badge>
              {product.sizes.map(size => (
                <Badge key={size} variant="outline">{size}</Badge>
              ))}
            </div>
            
            <div className="mt-2 flex items-center gap-2">
              <span className="font-semibold">${product.discountedPrice || product.price}</span>
              {product.discountedPrice && (
                <>
                  <span className="text-sm line-through text-gray-500">${product.price}</span>
                  <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;