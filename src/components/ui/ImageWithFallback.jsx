// components/ui/ImageWithFallback.jsx
'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = "", 
  fallbackClassName = "",
  showIcon = true,
  ...props 
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (imageError || !src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${fallbackClassName || className}`} {...props}>
        {showIcon && (
          <div className="text-gray-400 text-center">
            <Package className="w-8 h-8 mx-auto mb-1" />
            <span className="text-xs">No Image</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {imageLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
    </>
  );
}