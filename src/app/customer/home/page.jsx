'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Newsletter from '@/components/Newsletter';
import { GET_ALL_PRODUCTS, GET_ALL_CATEGORIES } from '@/utils/routes/customerRoutes';
import ProductCard from '@/components/customerComponents/products/ProductCard';
import CategoryFilter from '@/components/customerComponents/products/CategoryFilter';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Custom hook for responsive screen detection
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState('desktop');
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    // Check on mount
    checkScreenSize();
    // Add event listener with throttling for better performance
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);
  return screenSize;
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const screenSize = useScreenSize();
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Helper function for API calls
  const apiCall = async (url, options = {}) => {
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  };

  // Simplified API functions
  const getAllProducts = async (queryParams = {}) => {
    try {
      // Convert query params to URL string
      const queryString = Object.keys(queryParams)
        .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
        .join("&");

      const url = queryString ? `${GET_ALL_PRODUCTS}?${queryString}` : GET_ALL_PRODUCTS;
      
      return await apiCall(url);
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

  const getAllCategories = async (includeInactive = false) => {
    try {
      const url = `${GET_ALL_CATEGORIES}?includeInactive=${includeInactive}`;
      
      return await apiCall(url);
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };

  // Enhanced hero images - optimized for PNG files with proper compression
  const heroImages = [
    {
      desktop: "/HeroSectionImages/HS6.png",
      tablet: "/HeroSectionImages/HS6.png", // Same image, CSS will handle responsiveness
      mobile: "/HeroSectionImages/HS6.png",
      alt: "Summer Collection 2024",
      title: "SUMMER ELEGANCE",
      subtitle: "Discover our latest summer collection featuring breathable fabrics and vibrant colors"
    },
    {
      desktop: "/HeroSectionImages/HS2.png",
      tablet: "/HeroSectionImages/HS2.png",
      mobile: "/HeroSectionImages/HS2.png",
      alt: "Elegant Evening Wear",
      title: "EVENING SOPHISTICATION",
      subtitle: "Exquisite evening wear designed for unforgettable moments"
    },
    {
      desktop: "/HeroSectionImages/HS3.png",
      tablet: "/HeroSectionImages/HS3.png",
      mobile: "/HeroSectionImages/HS3.png",
      alt: "Casual Chic Styles",
      title: "CASUAL LUXURY",
      subtitle: "Effortlessly chic pieces for your everyday wardrobe"
    },
    {
      desktop: "/HeroSectionImages/HS4.png",
      tablet: "/HeroSectionImages/HS4.png",
      mobile: "/HeroSectionImages/HS4.png",
      alt: "Professional Wardrobe",
      title: "PROFESSIONAL POWER",
      subtitle: "Sophisticated styles for the modern professional"
    }
  ];

  // Get current image source based on screen size
  const getCurrentImageSrc = (imageSet) => {
    return imageSet[screenSize] || imageSet.desktop;
  };

  // Preload images for current screen size (only for desktop)
  useEffect(() => {
    if (screenSize === 'desktop') {
      const preloadImages = async () => {
        const loadPromises = heroImages.map((imageSet, index) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = getCurrentImageSrc(imageSet);
            img.onload = () => {
              setImagesLoaded(prev => ({
                ...prev,
                [`${index}_${screenSize}`]: true
              }));
              resolve();
            };
            img.onerror = () => {
              console.warn(`Failed to load image: ${getCurrentImageSrc(imageSet)}`);
              resolve();
            };
          });
        });
        await Promise.all(loadPromises);
      };
      preloadImages();
    }
  }, [screenSize]);

  // Auto-rotate images every 6 seconds with smooth transitions (only for desktop)
  useEffect(() => {
    if (screenSize === 'desktop') {
      const interval = setInterval(() => {
        if (!isTransitioning) {
          nextImage();
        }
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [currentImageIndex, isTransitioning, screenSize]);

  // Enhanced image navigation with transition control
  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % heroImages.length
    );
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const goToImage = (index) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  // Fetch data effect
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

  const scrollToProducts = () => {
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Keyboard navigation for accessibility (only for desktop)
  useEffect(() => {
    if (screenSize === 'desktop') {
      const handleKeyDown = (event) => {
        if (event.key === 'ArrowLeft') {
          prevImage();
        } else if (event.key === 'ArrowRight') {
          nextImage();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [screenSize]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full"></div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-medium py-2.5 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fully Responsive Hero Section - ALL SCREEN SIZES */}
      <section className={`relative overflow-hidden ${
        screenSize === 'desktop' ? 'flex items-center' : 'flex items-center'
      } ${
        screenSize === 'mobile' 
          ? 'h-[25vh] min-h-[200px]' // Much smaller on mobile - no text overlay
          : screenSize === 'tablet'
          ? 'h-[30vh] min-h-[250px]' // Compact on tablet - no text overlay
          : 'h-[60vh] lg:h-[65vh] xl:h-[70vh] min-h-[500px]' // Full size on desktop with text
      }`}>
        {/* Background Image Carousel - Responsive Scaling */}
        {heroImages.map((imageSet, index) => (
          <div
            key={`${index}_${screenSize}`}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentImageIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            {/* Responsive background - scales down proportionally */}
            <div 
              className="absolute inset-0 transition-all duration-1000"
              style={{
                backgroundImage: `url(${getCurrentImageSrc(imageSet)})`,
                backgroundSize: screenSize === 'desktop' ? 'cover' : 'contain', // Cover for desktop, contain for mobile/tablet
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'scroll',
                imageRendering: 'high-quality',
                filter: 'contrast(1.05) saturate(1.05)',
              }}
            >
            {/* Responsive overlay - removed for mobile/tablet */}
            <div className={`absolute inset-0 transition-all duration-1000 ${
              screenSize === 'desktop' 
                ? 'bg-gradient-to-t from-black/10 via-transparent to-transparent'
                : 'bg-transparent' // No overlay on mobile/tablet for cleaner image display
            }`}></div>
            </div>

            {/* Fallback image element */}
            <picture className="absolute inset-0 w-full h-full opacity-0 pointer-events-none">
              <source 
                media="(max-width: 767px)" 
                srcSet={imageSet.mobile} 
              />
              <source 
                media="(min-width: 768px) and (max-width: 1023px)" 
                srcSet={imageSet.tablet} 
              />
              <img 
                src={imageSet.desktop}
                alt={imageSet.alt}
                className={`w-full h-full ${screenSize === 'desktop' ? 'object-cover' : 'object-contain'}`} // Cover for desktop, contain for mobile/tablet
                loading={index === 0 ? "eager" : "lazy"}
              />
            </picture>
          </div>
        ))}
        
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-amber-900 to-rose-900 -z-10"></div>

        {/* Progress bar for auto-rotation */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30">
          <div 
            className="h-full bg-white/60 transition-all ease-linear"
            style={{
              width: `${((currentImageIndex + 1) / heroImages.length) * 100}%`,
              transitionDuration: '6000ms'
            }}
          />
        </div>
      </section>

      {/* Enhanced Products Section */}
      <section 
        id="products-section" 
        className="py-8 sm:py-12 md:py-16 lg:py-20 bg-stone-50"
      >
        <div className={`${
          screenSize === 'mobile' 
            ? 'px-0' 
            : 'px-4 sm:px-6 lg:px-8'
        }`}>
          <div className="text-center mb-12 sm:mb-14 md:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-stone-800 mb-4 sm:mb-6 tracking-[0.2em]"
            style={{
              fontFamily: "'Oswald', 'Bebas Neue', 'Anton', sans-serif",
              background: 'linear-gradient(135deg, #1c1917 0%, #44403c 50%, #78716c 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              COLLECTIONS
            </h2>
            <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-0.5 bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-6 sm:mb-8"></div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-stone-600 font-medium max-w-3xl mx-auto tracking-wide px-4 leading-relaxed"
            style={{
              fontFamily: "'Inter', 'Roboto', sans-serif",
              fontWeight: '500'
            }}>
              Discover our carefully curated selection of premium fashion pieces, crafted with attention to detail and timeless elegance
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="mb-12 sm:mb-14 md:mb-16 lg:mb-20">
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onCategoryChange={handleCategoryChange} 
            />
          </div>
          
          {loading && products.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 sm:h-56 md:h-64 lg:h-72">
              <div className="relative mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-stone-500 font-light tracking-wide">Loading collections...</p>
            </div>
          ) : (
            <>
              {/* Products Grid - Enlarged Cards with Better Space Utilization */}
              {products.length > 0 ? (
                <div className={`grid w-full mx-auto ${
                  screenSize === 'mobile' 
                    ? 'grid-cols-1 gap-4 px-3 max-w-sm' // Single column on mobile for larger cards
                    : screenSize === 'tablet'
                    ? 'grid-cols-2 gap-6 px-2 max-w-6xl' // Increased gap and max-width
                    : 'grid-cols-4 gap-8 px-4 max-w-full' // 4 columns for desktop, increased gap, full width
                }`}>
                  {products.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="w-full"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 sm:py-20 lg:py-24 px-4">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-400 rounded-full"></div>
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-stone-800 mb-4 tracking-wide">No products found</h3>
                    <p className="text-sm sm:text-base lg:text-lg text-stone-600 mb-8 sm:mb-10 leading-relaxed">
                      {selectedCategory 
                        ? "We couldn't find any products in this category. Try browsing other categories or check back soon for new arrivals." 
                        : "Our collection is being updated with exciting new pieces. Please check back soon for the latest fashion trends."}
                    </p>
                    {selectedCategory && (
                      <Button 
                        onClick={() => setSelectedCategory(null)} 
                        className="bg-stone-800 hover:bg-stone-900 text-white px-8 sm:px-10 py-3 sm:py-4 font-light tracking-wide transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                      >
                        VIEW ALL PRODUCTS
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Enhanced Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12 sm:mt-14 md:mt-16 lg:mt-20">
                  <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8 bg-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl shadow-lg">
                    <Button
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                      variant="ghost"
                      className={`font-light tracking-wide text-sm sm:text-base transition-all duration-300 ${
                        pagination.page === 1
                          ? 'text-stone-400 cursor-not-allowed'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">PREVIOUS</span>
                      <span className="sm:hidden">PREV</span>
                    </Button>
                    
                    <div className="flex items-center text-stone-700 font-light text-sm sm:text-base">
                      <span className="text-stone-900 font-normal text-base sm:text-lg">{pagination.page}</span>
                      <span className="mx-3 sm:mx-4 text-stone-500">of</span>
                      <span className="text-base sm:text-lg">{pagination.totalPages}</span>
                    </div>
                    
                    <Button
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                      disabled={pagination.page === pagination.totalPages}
                      variant="ghost"
                      className={`font-light tracking-wide text-sm sm:text-base transition-all duration-300 ${
                        pagination.page === pagination.totalPages
                          ? 'text-stone-400 cursor-not-allowed'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      <span className="hidden sm:inline">NEXT</span>
                      <span className="sm:hidden">NEXT</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Newsletter/>
        </div>
      </section>
    </div>
  );
}