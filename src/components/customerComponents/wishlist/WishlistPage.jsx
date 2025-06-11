// components/WishlistPage.jsx

'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Eye, Trash2, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/contexts/wishlistContext';
import { useCurrency } from '@/contexts/currencyContext';
import { getUserData } from '@/utils/auth';

const WishlistPage = () => {
  const { 
    items, 
    loading, 
    error, 
    summary,
    removeFromWishlist, 
    clearWishlist, 
    removeMultipleItems,
    getFilteredItems
  } = useWishlist();
  
  const { formatPrice } = useCurrency();
  const router = useRouter();
  
  // Check authentication using localStorage
  const authData = getUserData();
  const isAuthenticated = !!(authData?.token);
  
  const [viewMode, setViewMode] = useState('list'); // Only list view now
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortBy, setSortBy] = useState('addedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filteredItems, setFilteredItems] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure this runs only on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate proper totals from actual items - only on client side
  const calculatedTotals = useMemo(() => {
    if (!isClient || !items || items.length === 0) {
      return {
        totalItems: 0,
        totalValue: 0,
        availableItems: 0
      };
    }

    let totalValue = 0;
    let availableItems = 0;

    items.forEach((item, index) => {
      if (item.productData) {
        let itemPrice = 0;
        
        // Check if item has size-specific pricing
        if (item.sizeId && item.productData.productSizes) {
          const sizeVariant = item.productData.productSizes.find(
            ps => ps.sizeId === item.sizeId || ps.id === item.sizeId
          );
          if (sizeVariant) {
            itemPrice = Number(sizeVariant.price) || 0;
            // Check if this size variant is available
            if (sizeVariant.inventory > 0) {
              availableItems++;
            }
          }
        } else {
          // Use product's main price (discounted if available)
          const discountedPrice = Number(item.productData.discountedPrice) || 0;
          const regularPrice = Number(item.productData.price) || 0;
          itemPrice = discountedPrice > 0 ? discountedPrice : regularPrice;
          
          // Check availability for regular products
          if (item.productData.productSizes && item.productData.productSizes.length > 0) {
            // For sized products without specific size, check if any size is available
            const hasAvailableSize = item.productData.productSizes.some(ps => ps.inventory > 0);
            if (hasAvailableSize) {
              availableItems++;
            }
          } else {
            // For regular products, check inventory
            if (item.productData.inventory && item.productData.inventory > 0) {
              availableItems++;
            }
          }
        }
        
        totalValue += itemPrice;
      }
    });

    return {
      totalItems: items.length,
      totalValue: totalValue,
      availableItems: availableItems
    };
  }, [items, isClient]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login` || '/login');
    }
  }, [isAuthenticated, router]);

  // Update filtered items when items or filters change
  useEffect(() => {
    if (isAuthenticated && isClient) {
      const filtered = getFilteredItems(searchTerm, sortBy, sortOrder);
      setFilteredItems(filtered);
    }
  }, [items, searchTerm, sortBy, sortOrder, isAuthenticated, isClient, getFilteredItems]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle item selection
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId, sizeId) => {
    await removeFromWishlist(productId, sizeId);
    // Remove from selected items if it was selected
    setSelectedItems(prev => prev.filter(id => {
      const item = filteredItems.find(i => i.id === id);
      return !(item && item.productId === productId && item.sizeId === sizeId);
    }));
  };

  // Handle remove multiple items
  const handleRemoveMultiple = async () => {
    if (selectedItems.length === 0) return;
    
    await removeMultipleItems(selectedItems);
    setSelectedItems([]);
  };

  // Handle clear wishlist
  const handleClearWishlist = async () => {
    await clearWishlist();
    setSelectedItems([]);
  };

  // Handle view product
  const handleViewProduct = (productId) => {
    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/products/${productId}`);
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          
          {/* Summary - Updated to use calculated totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{calculatedTotals.totalItems}</div>
              <div className="text-sm text-gray-600">Items</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{formatPrice(calculatedTotals.totalValue)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{calculatedTotals.availableItems}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding items you love to your wishlist!</p>
            <Link 
              href="/customer/products" 
              className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Controls - Removed price filters, kept only search and sorting */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search wishlist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <span className="text-sm text-gray-600">
                        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRemoveMultiple}
                        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Selected
                      </button>
                      <button
                        onClick={() => setSelectedItems([])}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Items List - Only list view now */}
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  isSelected={selectedItems.includes(item.id)}
                  onSelect={() => handleSelectItem(item.id)}
                  onRemove={() => handleRemoveItem(item.productId, item.sizeId)}
                  onViewProduct={() => handleViewProduct(item.productId)}
                  formatPrice={formatPrice}
                />
              ))}
            </div>

            {/* No results message */}
            {filteredItems.length === 0 && items.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No items match your search criteria.</p>
              </div>
            )}

            {/* Clear All Button */}
            {items.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleClearWishlist}
                  className="px-6 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear Entire Wishlist
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Individual wishlist item component - List view only
const WishlistItem = ({ item, isSelected, onSelect, onRemove, onViewProduct, formatPrice }) => {
  const { productData, sizeId, addedAt } = item;
  const [imageError, setImageError] = useState(false);
  
  // If no cached product data, show basic item
  if (!productData) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
          />
          <div className="flex-1">
            <p className="text-gray-600">Product data not available</p>
            <p className="text-xs text-gray-500">Added {new Date(addedAt).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onRemove}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Enhanced inventory check
  const hasInventory = (() => {
    if (productData.productSizes && productData.productSizes.length > 0) {
      if (sizeId) {
        const sizeVariant = productData.productSizes.find(ps => ps.sizeId === sizeId || ps.id === sizeId);
        return sizeVariant && sizeVariant.inventory > 0;
      }
      return productData.productSizes.some(ps => ps.inventory > 0);
    }
    return productData.inventory && productData.inventory > 0;
  })();

  // Get proper images - prioritize primary image
  const productImages = productData.images || [];
  const primaryImage = productImages.find(img => img.isPrimary) || productImages[0];
  const imageUrl = primaryImage?.url || productImages[0]?.url;

  // Get size info
  const sizeInfo = sizeId && productData.productSizes 
    ? productData.productSizes.find(ps => ps.sizeId === sizeId || ps.id === sizeId)
    : null;

  // Get price - consider size-specific pricing
  const price = sizeInfo ? sizeInfo.price : (productData.discountedPrice || productData.price);
  const originalPrice = sizeInfo ? sizeInfo.price : productData.price;
  const hasDiscount = productData.discountedPrice && productData.discountedPrice < productData.price;
  
  // Calculate discount percentage
  const discountPercentage = hasDiscount && productData.price && productData.discountedPrice
    ? Math.round(((productData.price - productData.discountedPrice) / productData.price) * 100)
    : 0;

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border-2 ${
      isSelected ? 'border-red-500' : 'border-transparent'
    } hover:shadow-md transition-all`}>
      <div className="flex items-center gap-6">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
        />
        
        {/* Enhanced Image Display */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={productData.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {(hasDiscount && discountPercentage > 50) && (
              <div className="absolute top-1 right-1 bg-red-600 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                SALE
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <Link href={`/customer/products/${item.productId}`} className="text-xl font-semibold text-gray-900 hover:text-red-500 transition-colors block">
            {productData.name}
          </Link>
          {sizeInfo && (
            <p className="text-base text-gray-600 mt-1">Size: {sizeInfo.size?.name || sizeInfo.sizeName}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xl font-bold text-gray-900">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-base text-gray-500 line-through">{formatPrice(originalPrice)}</span>
            )}
            {!hasInventory && (
              <span className="text-base text-red-500 font-medium">Out of Stock</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Added {new Date(addedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onViewProduct}
            className="px-6 py-3 bg-black text-white hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            View Product
          </button>
          <button
            onClick={onRemove}
            className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;