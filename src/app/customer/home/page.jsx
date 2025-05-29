'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Newsletter from '@/components/Newsletter';
import { getAllProducts, getAllCategories } from '@/utils/routes/customerRoutes';
import ProductCard from '../components/products/ProductCard';
import CategoryFilter from '../components/products/CategoryFilter';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  //Hero images - Replace these URLs with your actual image addresses
  const heroImages = [
    {
      url: "/HeroSectionImages/HS1.png",
      alt: "Summer Collection 2024"
    },
    {
      url: "/HeroSectionImages/HS2.png",
      alt: "Elegant Evening Wear"
    },
    {
      url: "/HeroSectionImages/HS3.png",
      alt: "Casual Chic Styles"
    },
    {
      url: "/HeroSectionImages/HS4.png",
      alt: "Professional Wardrobe"
    }
  ];

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

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
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % heroImages.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    );
  };

  const scrollToProducts = () => {
    document.getElementById('products-section').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Full Background Images */}
      <section className="relative overflow-hidden h-screen flex items-center">
        {/* Background Image Carousel */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentImageIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
            style={{
              backgroundImage: `url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Subtle overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
          </div>
        ))}
        
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-amber-900 to-rose-900 -z-10"></div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-6xl mx-auto">
            {/* Brand Logo/Name */}
            <div className="text-center mb-8">
              <h1 className="text-6xl lg:text-8xl font-light text-white tracking-widest mb-4">
                TASEE
              </h1>
              <div className="w-32 h-px bg-white/60 mx-auto mb-6"></div>
              <p className="text-lg lg:text-xl text-white/90 font-light tracking-wide">
                LUXURY FASHION COLLECTION
              </p>
            </div>
            
            {/* Collection Info */}
            <div className="text-center">
              <p className="text-2xl lg:text-3xl text-white font-light mb-8 tracking-wide">
                {heroImages[currentImageIndex]?.alt}
              </p>
              
              <Button 
                onClick={scrollToProducts}
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-light py-4 px-12 rounded-none text-lg tracking-widest hover:bg-white/20 transition-all duration-300"
              >
                EXPLORE COLLECTION
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-4 flex items-center z-30">
          <button
            onClick={prevImage}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 p-3 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="absolute inset-y-0 right-4 flex items-center z-30">
          <button
            onClick={nextImage}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 p-3 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4 z-30">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'w-12 h-px bg-white' 
                  : 'w-8 h-px bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce cursor-pointer" onClick={scrollToProducts}>
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-20 bg-stone-50">
        <div className="px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light text-stone-800 mb-2 tracking-widest">
              COLLECTIONS
            </h2>
            <div className="w-24 h-px bg-stone-400 mx-auto mb-8"></div>
            <p className="text-lg text-stone-600 font-light max-w-2xl mx-auto tracking-wide">
              Discover our carefully curated selection of premium fashion pieces
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="mb-16">
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onCategoryChange={handleCategoryChange} 
            />
          </div>
          
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 w-full">
                  {products.map((product) => (
                    <div key={product.id} className="w-full">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-2xl font-light text-stone-800 mb-2 tracking-wide">No products found</h3>
                  <p className="text-stone-600 mb-8 max-w-md mx-auto">
                    {selectedCategory 
                      ? "We couldn't find any products in this category. Try browsing other categories." 
                      : "Our collection is being updated. Please check back soon."}
                  </p>
                  {selectedCategory && (
                    <Button 
                      onClick={() => setSelectedCategory(null)} 
                      className="bg-stone-800 hover:bg-stone-900 text-white px-8 py-3 font-light tracking-wide transition-all duration-300"
                    >
                      VIEW ALL PRODUCTS
                    </Button>
                  )}
                </div>
              )}
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-16">
                  <div className="flex items-center space-x-8">
                    <Button
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                      variant="ghost"
                      className={`font-light tracking-wide ${
                        pagination.page === 1
                          ? 'text-stone-400 cursor-not-allowed'
                          : 'text-stone-700 hover:text-stone-900'
                      }`}
                    >
                      PREVIOUS
                    </Button>
                    
                    <div className="flex items-center text-stone-700 font-light">
                      <span className="text-stone-900 font-normal">{pagination.page}</span>
                      <span className="mx-4">of</span>
                      <span>{pagination.totalPages}</span>
                    </div>
                    
                    <Button
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                      disabled={pagination.page === pagination.totalPages}
                      variant="ghost"
                      className={`font-light tracking-wide ${
                        pagination.page === pagination.totalPages
                          ? 'text-stone-400 cursor-not-allowed'
                          : 'text-stone-700 hover:text-stone-900'
                      }`}
                    >
                      NEXT
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Newsletter/>
        </div>
      </section>
    </div>
  );
}