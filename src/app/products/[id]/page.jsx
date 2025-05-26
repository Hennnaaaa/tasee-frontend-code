'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/utils/routes/customerRoutes';
import { useCart } from '@/contexts/cartContext';

export default function ProductDetailsPage({ params }) {
  const router = useRouter();
  const { addToCart: addItemToCart, cartCount } = useCart();
  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Handle params unwrapping for Next.js 15
  useEffect(() => {
    const unwrapParams = async () => {
      try {
        // In Next.js 15, params might be a Promise
        const resolvedParams = await Promise.resolve(params);
        setProductId(resolvedParams.id);
      } catch (err) {
        console.error('Error resolving params:', err);
        setError('Invalid product URL');
        setLoading(false);
      }
    };
    
    unwrapParams();
  }, [params]);
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const response = await getProductById(productId, true);
        
        if (response.success) {
          setProduct(response.data);
          
          // Auto-select the first available size if any
          if (response.data.productSizes && response.data.productSizes.length > 0) {
            const availableSizes = response.data.productSizes.filter(
              size => size.inventory > 0 && size.isActive
            );
            
            if (availableSizes.length > 0) {
              setSelectedSize(availableSizes[0]);
            }
          }
        } else {
          setError('Failed to load product details');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);
  
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    
    // Reset quantity to 1 or max available if less than current quantity
    if (size.inventory < quantity) {
      setQuantity(Math.min(size.inventory, 1));
    }
  };
  
  const increaseQuantity = () => {
    if (selectedSize && quantity < selectedSize.inventory && quantity < 99) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };
  
  const handleAddToCart = async () => {
    if (!selectedSize) {
      showNotification('error', 'Please select a size');
      return;
    }

    // Validate quantity
    if (quantity < 1 || quantity > 99) {
      showNotification('error', 'Quantity must be between 1 and 99');
      return;
    }

    if (quantity > selectedSize.inventory) {
      showNotification('error', `Only ${selectedSize.inventory} items available`);
      return;
    }
    
    try {
      setAddingToCart(true);
      
      // Transform selectedSize to match expected format
      const sizeVariant = {
        sizeId: selectedSize.sizeId,
        price: selectedSize.price,
        inventory: selectedSize.inventory,
        size: selectedSize.size
      };
      
      // Add to cart using the cart context
      await addItemToCart(product, sizeVariant, quantity);
      
      showNotification('success', `Added ${quantity} item(s) to cart successfully!`);
      
      // Reset quantity to 1 after successful add
      setQuantity(1);
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      
      // Handle specific error cases
      if (err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('Session expired')) {
        showNotification('error', 'Session expired. Please refresh the page and try again.');
      } else if (err.message.includes('403') || err.message.includes('Access denied')) {
        showNotification('error', 'Access denied. Please refresh the page and try again.');
      } else if (err.message.includes('Insufficient inventory')) {
        showNotification('error', 'Sorry, there is not enough inventory for this item.');
      } else if (err.message.includes('Cart cannot contain more than')) {
        showNotification('error', 'Your cart is full. Please remove some items before adding more.');
      } else {
        showNotification('error', err.message || 'Failed to add to cart. Please try again.');
      }
    } finally {
      setAddingToCart(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
          {error || 'Product not found'}
        </div>
        <Link 
          href="/"
          className="text-blue-500 hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }
  
  // Calculate if product is in stock
  const hasInventory = product.productSizes && product.productSizes.some(
    size => size.inventory > 0 && size.isActive
  );
  
  // Calculate discount percentage
  const discountPercentage = product.discountedPrice && product.price
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cart Count Display */}
      {cartCount > 0 && (
        <div className="mb-4">
          <Link 
            href="/cart" 
            className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5-3M7 13l1.5 3M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
            </svg>
            Cart ({cartCount})
          </Link>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:text-blue-500">
              Home
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li>
            <Link 
              href={product.category ? `/categories/${product.category.id}` : "/"}
              className="hover:text-blue-500"
            >
              {product.category ? product.category.name : "All Products"}
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li className="font-medium text-gray-900">{String(product.name || '')}</li>
        </ol>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <svg 
              className="w-32 h-32 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{String(product.name || '')}</h1>
          
          {/* Category */}
          {product.category && (
            <div className="text-gray-600 mb-4">
              {String(product.category.name || '')}
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center mb-6">
            {product.discountedPrice ? (
              <>
                <span className="text-2xl font-bold text-gray-900">
                  ${Number(product.discountedPrice).toFixed(2)}
                </span>
                <span className="ml-3 text-lg text-gray-500 line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className="ml-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                  {discountPercentage}% OFF
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-gray-700">{String(product.description || '')}</p>
            </div>
          )}
          
          {/* Size Selection */}
          {product.productSizes && Array.isArray(product.productSizes) && product.productSizes.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Select Size</h2>
              <div className="flex flex-wrap gap-2">
                {product.productSizes
                  .filter(size => size.isActive)
                  .sort((a, b) => {
                    // Sort by the size's sortOrder if available
                    if (a.size?.sortOrder !== undefined && b.size?.sortOrder !== undefined) {
                      return a.size.sortOrder - b.size.sortOrder;
                    }
                    return 0;
                  })
                  .map(sizeVariant => (
                    <button
                      key={String(sizeVariant.id)}
                      onClick={() => handleSizeSelect(sizeVariant)}
                      className={`h-10 min-w-[40px] px-3 border rounded-md text-sm font-medium transition-colors ${
                        selectedSize?.id === sizeVariant.id 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      } ${
                        Number(sizeVariant.inventory) <= 0 
                          ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400' 
                          : ''
                      }`}
                      disabled={Number(sizeVariant.inventory) <= 0}
                    >
                      {String(sizeVariant.size?.name || sizeVariant.size?.code || 'Unknown')}
                      {Number(sizeVariant.inventory) <= 0 && ' - Sold Out'}
                    </button>
                  ))
                }
              </div>
              {selectedSize && (
                <div className="mt-2 text-sm text-gray-600">
                  Price: ${Number(selectedSize.price).toFixed(2)} | 
                  Stock: {Number(selectedSize.inventory)} available
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 text-yellow-600">
              No sizes available for this product.
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Quantity</h2>
            <div className="flex items-center">
              <button
                onClick={decreaseQuantity}
                className="h-10 w-10 border border-gray-300 rounded-l-md flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1 || !hasInventory || addingToCart}
              >
                -
              </button>
              <div className="h-10 px-4 border-t border-b border-gray-300 flex items-center justify-center min-w-[60px] bg-white">
                {quantity}
              </div>
              <button
                onClick={increaseQuantity}
                className="h-10 w-10 border border-gray-300 rounded-r-md flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedSize || quantity >= Number(selectedSize?.inventory || 0) || quantity >= 99 || addingToCart}
              >
                +
              </button>
              
              {selectedSize && (
                <div className="ml-4 text-sm text-gray-500">
                  {Number(selectedSize.inventory)} available (max 99 per order)
                </div>
              )}
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <div className="mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!hasInventory || !selectedSize || addingToCart}
              className={`w-full py-3 px-6 rounded-md font-medium text-white transition-colors ${
                !hasInventory || !selectedSize
                  ? 'bg-gray-300 cursor-not-allowed'
                  : addingToCart
                    ? 'bg-blue-400 cursor-wait'
                    : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {addingToCart 
                ? 'Adding to Cart...' 
                : !hasInventory 
                  ? 'Out of Stock' 
                  : !selectedSize 
                    ? 'Select a Size' 
                    : `Add ${quantity} to Cart`}
            </button>
          </div>
          
          {/* Stock Warning */}
          {selectedSize && selectedSize.inventory > 0 && selectedSize.inventory <= 5 && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-800">
                  Only {selectedSize.inventory} left in stock - order soon!
                </p>
              </div>
            </div>
          )}
          
          {/* Product Info */}
          <div>
            <h2 className="text-lg font-medium mb-2">Product Information</h2>
            <div className="border-t border-gray-200 pt-4">
              <dl>
                <div className="py-2 grid grid-cols-2">
                  <dt className="text-sm text-gray-500">SKU</dt>
                  <dd className="text-sm text-gray-900">{String(product.sku || '')}</dd>
                </div>
                {product.category && (
                  <div className="py-2 grid grid-cols-2">
                    <dt className="text-sm text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900">{String(product.category.name || '')}</dd>
                  </div>
                )}
                {product.weight && (
                  <div className="py-2 grid grid-cols-2">
                    <dt className="text-sm text-gray-500">Weight</dt>
                    <dd className="text-sm text-gray-900">{String(product.weight || '')} kg</dd>
                  </div>
                )}
                <div className="py-2 grid grid-cols-2">
                  <dt className="text-sm text-gray-500">Availability</dt>
                  <dd className="text-sm text-gray-900">
                    {hasInventory ? (
                      <span className="text-green-600">In Stock</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg max-w-md z-50 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}