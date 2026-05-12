'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { GET_ALL_PRODUCTS, GET_ALL_CATEGORIES } from '@/utils/routes/customerRoutes';
import ProductCard from '@/components/customerComponents/products/ProductCard';

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState('desktop');
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) setScreenSize('mobile');
      else if (window.innerWidth < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    check();
    let t;
    const onResize = () => { clearTimeout(t); t = setTimeout(check, 150); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
  }, []);
  return screenSize;
};

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const screenSize = useScreenSize();

  const parentCategories = categories.filter(c => !c.parentId && c.isActive);

  const fetchProducts = useCallback(async (categoryId, page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: pagination.limit, includeSizes: true });
      if (categoryId) params.set('categoryId', categoryId);
      const res = await fetch(`${GET_ALL_PRODUCTS}?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Initial load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${GET_ALL_CATEGORIES}?includeInactive=false`);
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
    fetchProducts(null, 1);
  }, []);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts(catId, 1);
    setShowFilters(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchProducts(selectedCategory, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCategoryName = parentCategories.find(c => c.id === selectedCategory)?.name;

  return (
    <div className="min-h-screen bg-white">

      {/* Page Header */}
      <div className="border-b border-stone-100 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-2">Tasee</p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-[0.15em] uppercase text-stone-900">
                {selectedCategoryName || 'All Products'}
              </h1>
              {!loading && (
                <p className="text-xs text-stone-400 tracking-wide mt-1">
                  {pagination.total} {pagination.total === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center space-x-2 border border-stone-200 px-4 py-2 text-xs tracking-widest uppercase text-stone-700 self-start"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
              {selectedCategory && <span className="bg-stone-800 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">1</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex gap-8 py-8">

          {/* Sidebar Filters — Desktop */}
          <aside className="hidden sm:block w-52 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs tracking-[0.25em] uppercase text-stone-500 font-semibold mb-4">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full text-left py-2 text-xs tracking-wide transition-colors ${
                      selectedCategory === null
                        ? 'text-stone-900 font-semibold'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    All Products
                    {selectedCategory === null && <span className="ml-2 text-stone-300">—</span>}
                  </button>
                </li>
                {parentCategories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left py-2 text-xs tracking-wide transition-colors ${
                        selectedCategory === cat.id
                          ? 'text-stone-900 font-semibold'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      {cat.name}
                    </button>
                    {/* Subcategories */}
                    {selectedCategory === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                      <ul className="ml-3 mt-1 space-y-0.5 border-l border-stone-100 pl-3">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${cat.slug}/${sub.slug}`}
                              className="block py-1 text-xs text-stone-400 hover:text-stone-700 tracking-wide transition-colors"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="sm:hidden fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
              <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs tracking-[0.25em] uppercase text-stone-900 font-semibold">Filter</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-4 h-4 text-stone-500" />
                  </button>
                </div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">Categories</p>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className={`w-full text-left py-2.5 text-xs tracking-wide ${selectedCategory === null ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}
                    >
                      All Products
                    </button>
                  </li>
                  {parentCategories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full text-left py-2.5 text-xs tracking-wide ${selectedCategory === cat.id ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter pill */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs text-stone-500 tracking-wide">Filtering by:</span>
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="flex items-center gap-1.5 bg-stone-100 text-stone-700 px-3 py-1 text-xs tracking-wide hover:bg-stone-200 transition-colors"
                >
                  {selectedCategoryName}
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {loading ? (
              <div className={`grid gap-2 sm:gap-4 ${
                screenSize === 'mobile' ? 'grid-cols-2' : screenSize === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
              }`}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-stone-100 animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-2 sm:gap-4 ${
                  screenSize === 'mobile' ? 'grid-cols-2' : screenSize === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
                }`}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 sm:mt-16">
                    <button
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                      className={`p-2 border transition-colors ${
                        pagination.page === 1
                          ? 'border-stone-100 text-stone-300 cursor-not-allowed'
                          : 'border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                      let page;
                      const total = pagination.totalPages;
                      const current = pagination.page;
                      if (total <= 7) {
                        page = i + 1;
                      } else if (current <= 4) {
                        page = i < 6 ? i + 1 : total;
                      } else if (current >= total - 3) {
                        page = i === 0 ? 1 : total - 5 + i;
                      } else {
                        const map = [1, current - 1, current, current + 1, total];
                        page = [1, current - 1, current, current + 1, total][Math.min(i, 4)];
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 text-xs tracking-wide transition-colors ${
                            pagination.page === page
                              ? 'bg-stone-900 text-white'
                              : 'border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                      disabled={pagination.page === pagination.totalPages}
                      className={`p-2 border transition-colors ${
                        pagination.page === pagination.totalPages
                          ? 'border-stone-100 text-stone-300 cursor-not-allowed'
                          : 'border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <p className="text-stone-400 text-sm tracking-wide mb-6">No products found in this category.</p>
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="border border-stone-900 text-stone-900 px-8 py-3 text-xs tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-all duration-200"
                >
                  View All Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
