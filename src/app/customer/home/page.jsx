
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Newsletter from '@/components/Newsletter';
import { getAllProducts, getAllCategories } from '@/utils/routes/customerRoutes';
import ProductCard from '../components/products/ProductCard';
import CategoryFilter from '../components/products/CategoryFilter';
import { ChevronDown, Star, TrendingUp, Shield, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

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
      url: "/HeroSectionImages/HS1.png", // Replace with your first image
      alt: "Summer Collection 2024"
    },
    {
      url: "/HeroSectionImages/HS2.png", // Replace with your second image
      alt: "Elegant Evening Wear"
    },
    {
      url: "/HeroSectionImages/HS3.png", // Replace with your third image
      alt: "Casual Chic Styles"
    },
    {
      url: "/HeroSectionImages/HS4.png", // Replace with your fourth image
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
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section with Full Background Images */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
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
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
          </div>
        ))}
        
        {/* Fallback gradient background (shown if images don't load) */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900 via-pink-900 to-purple-800 -z-10"></div>
        
        {/* Custom animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Content */}
            <div className="text-white space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-6 py-3 text-sm font-medium border border-white/30">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  Premium Women's Fashion Collection
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Elevate Your
                  <span className="block bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
                    Fashion Story
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
                  Discover our exclusive collection of women's fashion designed to make you feel confident, beautiful, and uniquely you.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={scrollToProducts}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold py-4 px-10 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-pink-400/30"
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-4 flex items-center z-30">
          <button
            onClick={prevImage}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-4 transition-all duration-300 group border border-white/30"
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
        
        <div className="absolute inset-y-0 right-4 flex items-center z-30">
          <button
            onClick={nextImage}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-4 transition-all duration-300 group border border-white/30"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentImageIndex 
                  ? 'w-12 h-3 bg-white' 
                  : 'w-3 h-3 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Current Collection Name */}
        <div className="absolute bottom-20 left-8 z-30">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30">
            <h3 className="text-white font-semibold text-lg mb-1">
              {heroImages[currentImageIndex]?.alt}
            </h3>
            <p className="text-white/80 text-sm">
              Latest Collection 2024
            </p>
          </div>
        </div>

        {/* Floating Fashion Elements */}
        <div className="absolute top-20 right-20 z-20">
          <div className="bg-gradient-to-br from-pink-400/80 to-rose-500/80 backdrop-blur-sm rounded-2xl p-4 animate-float shadow-2xl border border-white/20">
            <div className="text-white text-2xl">👗</div>
          </div>
        </div>
        <div className="absolute bottom-32 right-12 z-20">
          <div className="bg-gradient-to-br from-purple-400/80 to-pink-500/80 backdrop-blur-sm rounded-2xl p-4 animate-bounce shadow-2xl border border-white/20">
            <div className="text-white text-2xl">✨</div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce cursor-pointer" onClick={scrollToProducts}>
          <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free delivery on orders over $100</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Your payment information is safe</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">Carefully curated products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Our Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover handpicked products that combine style, quality, and innovation
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="mb-12">
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onCategoryChange={handleCategoryChange} 
            />
          </div>
          
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500 rounded-full animate-spin animate-reverse"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <div key={product.id} className="group">
                      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                        <ProductCard product={product} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <div className="text-4xl">🔍</div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {selectedCategory 
                      ? "We couldn't find any products in this category. Try browsing other categories or check back later." 
                      : "Our collection is being updated. Please check back soon for amazing products!"}
                  </p>
                  {selectedCategory && (
                    <Button 
                      onClick={() => setSelectedCategory(null)} 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      View All Products
                    </Button>
                  )}
                </div>
              )}
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-16">
                  <div className="flex items-center space-x-2 bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
                    <Button
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                      variant="ghost"
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        pagination.page === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                      }`}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center px-6 py-3 text-gray-700 font-medium">
                      <span className="text-blue-600 font-semibold">{pagination.page}</span>
                      <span className="mx-2">of</span>
                      <span>{pagination.totalPages}</span>
                    </div>
                    
                    <Button
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                      disabled={pagination.page === pagination.totalPages}
                      variant="ghost"
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        pagination.page === pagination.totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                      }`}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <Newsletter/>
        </div>
      </section>
    </div>
  );
}