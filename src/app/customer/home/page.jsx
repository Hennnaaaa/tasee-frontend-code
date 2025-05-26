'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Newsletter from '@/components/Newsletter';
import { getAllProducts, getAllCategories } from '@/utils/routes/customerRoutes';
import ProductCard from '../components/products/ProductCard';
import CategoryFilter from '../components/products/CategoryFilter';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await getAllCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }
        
        // Fetch products with optional category filter
        const queryParams = {
          page: pagination.page,
          limit: pagination.limit,
          includeSizes: true,
        };
        
        if (selectedCategory) {
          queryParams.categoryId = selectedCategory;
        }
        
        const productsResponse = await getAllProducts(queryParams);
        
        if (productsResponse.success) {
          setProducts(productsResponse.data.products);
          setPagination(productsResponse.data.pagination);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCategory, pagination.page, pagination.limit]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on category change
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Discover Our Collection</h1>
      
      {/* Category Filter */}
      <div className="mb-8">
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange} 
        />
      </div>
      
      {loading && products.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-700">No products found</h3>
              <p className="text-gray-500 mt-2">
                {selectedCategory 
                  ? "No products available in this category." 
                  : "No products are currently available."}
              </p>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)} 
                  className="mt-4 text-blue-500 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded ${
                    pagination.page === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-4 py-2 rounded ${
                    pagination.page === pagination.totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}


           {/* Newsletter */}
          <Newsletter/>
        </>
      )}
    </div>
  );
}