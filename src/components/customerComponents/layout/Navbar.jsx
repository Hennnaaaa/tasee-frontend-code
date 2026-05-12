'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useCart } from '@/contexts/cartContext';
import { useAuth } from '@/contexts/authcontext';
import { useWishlist } from '@/contexts/wishlistContext';
import { useCurrency, CURRENCIES } from '@/contexts/currencyContext';
import { GET_NAVIGATION_CATEGORIES } from '@/utils/routes/productManagementRoutes';

const Navbar = () => {
  const { cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user, logout, isAuthenticated } = useAuth();
  const { selectedCurrency, setSelectedCurrency, currentCurrency } = useCurrency();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shopMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (isClient && isAuthenticated && user?.role === 'admin') {
      logout();
    }
  }, [isClient, isAuthenticated, user, logout]);

  useEffect(() => {
    if (isClient) fetchCategories();
  }, [isClient]);

  // Track scroll position for dynamic glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target)) {
        setShowShopMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(GET_NAVIGATION_CATEGORIES);
      if (response.data.success) setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setShowCurrencyMenu(false);
  };

  if (!isClient) {
    return (
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'rgba(200,196,190,0.35)',
          boxShadow: '0 1px 32px rgba(0,0,0,0.06)'
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/customer/home" className="flex items-center">
              <img src="/tasee_30x.png" alt="Tasee" className="h-7 w-auto object-contain" />
            </Link>
            <div className="hidden md:flex space-x-8">
              <span className="text-sm tracking-widest text-stone-700 uppercase">Home</span>
              <span className="text-sm tracking-widest text-stone-700 uppercase">Shop</span>
            </div>
            <div className="flex items-center space-x-5">
              <button className="text-stone-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <Link href="/customer/cart" className="text-stone-600 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.60)',
        backdropFilter: scrolled ? 'blur(32px) saturate(220%) brightness(1.05)' : 'blur(12px) saturate(160%)',
        WebkitBackdropFilter: scrolled ? 'blur(32px) saturate(220%) brightness(1.05)' : 'blur(12px) saturate(160%)',
        borderColor: scrolled ? 'rgba(200,196,190,0.45)' : 'rgba(255,255,255,0.15)',
        boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.12)' : '0 1px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`} className="flex items-center">
              <img src="/tasee_30x.png" alt="Tasee" className="h-7 w-auto object-contain" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`}
              className="text-xs tracking-widest text-stone-600 hover:text-stone-900 uppercase font-medium transition-colors duration-200"
            >
              Home
            </Link>

            {/* SHOP Dropdown */}
            <div ref={shopMenuRef} className="relative">
              <button
                onClick={() => setShowShopMenu(!showShopMenu)}
                className="flex items-center space-x-1 text-xs tracking-widest text-stone-600 hover:text-stone-900 uppercase font-medium transition-colors duration-200"
              >
                <span>Shop</span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${showShopMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showShopMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-stone-100 shadow-2xl z-50 min-w-[560px]">
                  <div className="p-6">
                    {/* All Products link */}
                    <Link
                      href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/catalog`}
                      className="block text-xs tracking-widest uppercase text-stone-900 font-semibold mb-5 hover:text-stone-600 transition-colors"
                      onClick={() => setShowShopMenu(false)}
                    >
                      All Products →
                    </Link>
                    <div className={`grid gap-x-8 gap-y-1 ${
                      categories.length > 3 ? 'grid-cols-3' : `grid-cols-${Math.max(categories.length, 1)}`
                    }`}>
                      {!loading && categories.map((category) => (
                        <div key={category.id} className="mb-4">
                          <Link
                            href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${category.slug}`}
                            className="block text-xs tracking-widest uppercase text-stone-900 font-medium mb-2 hover:text-stone-500 transition-colors"
                            onClick={() => setShowShopMenu(false)}
                          >
                            {category.name}
                          </Link>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <ul className="space-y-1">
                              {category.subcategories.map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${category.slug}/${sub.slug}`}
                                    className="block text-xs text-stone-500 hover:text-stone-900 tracking-wide transition-colors py-0.5"
                                    onClick={() => setShowShopMenu(false)}
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/catalog`}
              className="text-xs tracking-widest text-stone-600 hover:text-stone-900 uppercase font-medium transition-colors duration-200"
            >
              Catalog
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-5">
            {/* Currency Selector */}
            <div className="relative hidden sm:block">
              <button
                className="flex items-center space-x-1 text-stone-500 hover:text-stone-900 transition-colors"
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
              >
                <span className="text-sm">{currentCurrency.flag}</span>
                <span className="text-xs font-medium tracking-wide">{currentCurrency.code}</span>
                <svg className={`w-3 h-3 transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCurrencyMenu && (
                <div className="absolute right-0 mt-2 w-44 py-2 bg-white border border-stone-100 shadow-xl z-20">
                  {Object.values(CURRENCIES).map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code)}
                      className={`w-full text-left px-4 py-2 text-xs tracking-wide hover:bg-stone-50 flex items-center space-x-2 ${
                        selectedCurrency === currency.code ? 'text-stone-900 font-semibold' : 'text-stone-600'
                      }`}
                    >
                      <span>{currency.flag}</span>
                      <div>
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-stone-400">{currency.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/wishlist`}
                className="text-stone-500 hover:text-stone-900 relative transition-colors duration-200"
                aria-label="Wishlist"
              >
                <svg className="w-5 h-5" fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-stone-800 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Account */}
            <div ref={profileMenuRef} className="relative">
              <button
                className="text-stone-500 hover:text-stone-900 transition-colors duration-200"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Account"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white border border-stone-100 shadow-xl z-20">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 text-xs font-medium text-stone-500 border-b border-stone-100 tracking-wide uppercase">
                        {user?.firstName} {user?.lastName}
                      </div>
                      {[
                        { label: 'My Account', href: '/customer/profile' },
                        { label: 'My Orders', href: '/customer/orders' },
                        { label: 'My Reviews', href: '/customer/my-reviews' },
                      ].map(({ label, href }) => (
                        <Link
                          key={href}
                          href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}${href}`}
                          className="block px-4 py-2 text-xs tracking-wide text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          {label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { logout(); setShowProfileMenu(false); }}
                        className="block w-full text-left px-4 py-2 text-xs tracking-wide text-red-500 hover:bg-stone-50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`} className="block px-4 py-2 text-xs tracking-wide text-stone-700 hover:bg-stone-50" onClick={() => setShowProfileMenu(false)}>
                        Sign In
                      </Link>
                      <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/signup`} className="block px-4 py-2 text-xs tracking-wide text-stone-700 hover:bg-stone-50" onClick={() => setShowProfileMenu(false)}>
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/cart`}
              className="text-stone-500 hover:text-stone-900 relative transition-colors duration-200"
              aria-label="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-stone-800 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-stone-600 hover:text-stone-900"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label={showMobileMenu ? 'Close Menu' : 'Open Menu'}
            >
              {showMobileMenu ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-stone-100 bg-white">
            <div className="flex flex-col divide-y divide-stone-50">
              <Link href="/customer/home" className="px-5 py-4 text-xs tracking-widest uppercase text-stone-700 hover:text-stone-900 hover:bg-stone-50" onClick={() => setShowMobileMenu(false)}>
                Home
              </Link>

              <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/catalog`} className="px-5 py-4 text-xs tracking-widest uppercase text-stone-700 hover:text-stone-900 hover:bg-stone-50" onClick={() => setShowMobileMenu(false)}>
                All Products
              </Link>

              {/* Mobile Categories */}
              {!loading && categories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center justify-between px-5 py-4">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${category.slug}`}
                      className="text-xs tracking-widest uppercase text-stone-700 hover:text-stone-900 flex-grow"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {category.name}
                    </Link>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <button
                        onClick={() => setMobileExpandedCategory(mobileExpandedCategory === category.id ? null : category.id)}
                        className="text-stone-400 hover:text-stone-700 ml-2"
                      >
                        <svg className={`w-4 h-4 transition-transform ${mobileExpandedCategory === category.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {category.subcategories && category.subcategories.length > 0 && mobileExpandedCategory === category.id && (
                    <div className="bg-stone-50 px-8 pb-3">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${category.slug}/${sub.slug}`}
                          className="block py-2 text-xs tracking-wide text-stone-500 hover:text-stone-900"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Currency */}
              <div className="px-5 py-4">
                <button
                  onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                  className="flex items-center space-x-2 text-xs tracking-widest uppercase text-stone-600"
                >
                  <span>{currentCurrency.flag}</span>
                  <span>{currentCurrency.code}</span>
                  <svg className={`w-3 h-3 transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showCurrencyMenu && (
                  <div className="mt-3 space-y-1">
                    {Object.values(CURRENCIES).map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => handleCurrencyChange(currency.code)}
                        className={`w-full text-left py-2 flex items-center space-x-2 text-xs tracking-wide ${
                          selectedCurrency === currency.code ? 'text-stone-900 font-semibold' : 'text-stone-500'
                        }`}
                      >
                        <span>{currency.flag}</span>
                        <span>{currency.code} — {currency.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Auth */}
              {isAuthenticated ? (
                <>
                  <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/profile`} className="px-5 py-4 text-xs tracking-widest uppercase text-stone-700 hover:bg-stone-50" onClick={() => setShowMobileMenu(false)}>My Account</Link>
                  <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/wishlist`} className="px-5 py-4 text-xs tracking-widest uppercase text-stone-700 hover:bg-stone-50" onClick={() => setShowMobileMenu(false)}>Wishlist{wishlistCount > 0 && ` (${wishlistCount})`}</Link>
                  <button onClick={() => { logout(); setShowMobileMenu(false); }} className="px-5 py-4 text-xs tracking-widest uppercase text-red-500 text-left hover:bg-stone-50">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`} className="px-5 py-4 text-xs tracking-widest uppercase text-stone-700 hover:bg-stone-50" onClick={() => setShowMobileMenu(false)}>Sign In</Link>
                  <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/signup`} className="px-5 py-4 text-xs tracking-widest uppercase text-stone-700 hover:bg-stone-50" onClick={() => setShowMobileMenu(false)}>Create Account</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
