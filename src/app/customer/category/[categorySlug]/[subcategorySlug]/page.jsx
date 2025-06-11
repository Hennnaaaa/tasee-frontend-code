'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/app/customer/components/products/ProductCard';

const SubcategoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const { categorySlug, subcategorySlug } = params || {};

  const [products, setProducts] = useState([]);
  const [subcategoryInfo, setSubcategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    if (categorySlug && subcategorySlug) {
      fetchProducts();
    }
  }, [categorySlug, subcategorySlug, currentPage, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Construct API URL
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories/subcategory/${categorySlug}/${subcategorySlug}`;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder
      });

      const response = await fetch(`${apiUrl}?${params}`, {
        // Add cache busting to ensure fresh data
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const data = await response.json();

      if (data.success) {
        const products = data.data.products || [];
        setProducts(products);
        setTotalPages(data.data.totalPages || data.data.pagination?.totalPages || 1);
        setSubcategoryInfo(data.data.subcategory);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="px-8 py-20">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="px-8 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="w-8 h-8 bg-stone-600 rounded-full"></div>
            </div>
            <h2 className="text-2xl font-light text-stone-800 mb-4 tracking-wide">Something went wrong</h2>
            <p className="text-stone-600 mb-8 font-light">{error}</p>
            <button 
              onClick={() => fetchProducts()}
              className="bg-stone-800 text-white px-8 py-3 font-light tracking-wide hover:bg-stone-900 transition-colors duration-300"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-light text-stone-800 mb-4 tracking-widest uppercase">
            {subcategoryInfo?.name || subcategorySlug?.replace(/-/g, ' ')}
          </h1>
          <div className="w-24 h-px bg-stone-400 mx-auto mb-8"></div>
          {subcategoryInfo?.description && (
            <p className="text-lg text-stone-600 font-light max-w-2xl mx-auto tracking-wide mb-8">
              {subcategoryInfo.description}
            </p>
          )}
          <p className="text-sm text-stone-500 font-light tracking-wider">
            {products.length} {products.length === 1 ? 'PRODUCT' : 'PRODUCTS'} FOUND
          </p>
          
        </div>

    
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 mb-16">
              {products.map((product) => (
                <div key={product.id} className="w-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination - Minimalist Style */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`font-light tracking-widest text-sm transition-colors ${
                    currentPage === 1
                      ? 'text-stone-400 cursor-not-allowed'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  PREVIOUS
                </button>
                
                <div className="flex items-center text-stone-700 font-light text-sm tracking-wide">
                  <span className="text-stone-900 font-normal text-base">{currentPage}</span>
                  <span className="mx-6 text-stone-400">of</span>
                  <span className="text-base">{totalPages}</span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`font-light tracking-widest text-sm transition-colors ${
                    currentPage === totalPages
                      ? 'text-stone-400 cursor-not-allowed'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  NEXT
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg 
                className="w-12 h-12 text-stone-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1" 
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-light text-stone-800 mb-4 tracking-wide">NO PRODUCTS FOUND</h3>
            <p className="text-stone-600 mb-8 font-light max-w-md mx-auto tracking-wide">
              We couldn't find any products in this category at the moment. Please check back soon or explore other categories.
            </p>
            <Link 
              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`}
              className="inline-block bg-stone-800 text-white px-12 py-4 font-light tracking-widest hover:bg-stone-900 transition-colors duration-300"
            >
              EXPLORE ALL COLLECTIONS
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryPage;