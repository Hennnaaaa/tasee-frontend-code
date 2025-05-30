'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useCart } from '@/contexts/cartContext';
import { useAuth } from '@/contexts/authcontext';
import { GET_NAVIGATION_CATEGORIES } from '@/utils/routes/productManagementRoutes';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      // Using the imported route constant
      const response = await axios.get(GET_NAVIGATION_CATEGORIES);
      
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        console.error('Failed to fetch categories:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Handle specific error cases if needed
      if (error.response) {
        console.error('Response error:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownClick = (categoryId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveDropdown(activeDropdown === categoryId ? null : categoryId);
  };

  const handleCategoryClick = () => {
    setActiveDropdown(null);
  };

  const handleMobileCategoryClick = (categoryId) => {
    setActiveDropdown(activeDropdown === categoryId ? null : categoryId);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/customer/home" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Tasee
            </Link>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8" ref={dropdownRef}>
            <Link href="/customer/home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            
            {/* Dynamic Categories with Dropdowns */}
            {!loading && categories.map((category) => (
              <div key={category.id} className="relative">
                <div className="flex items-center">
                  <Link
                    href={`/customer/category/${category.slug}`}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    onClick={handleCategoryClick}
                  >
                    {category.name}
                  </Link>
                  
                  {/* Dropdown Arrow Button */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <button
                      onClick={(e) => handleDropdownClick(category.id, e)}
                      className="ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                    >
                      <svg
                        className={`w-4 h-4 transform transition-transform duration-200 ${
                          activeDropdown === category.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Enhanced Dropdown Menu */}
                {category.subcategories && 
                 category.subcategories.length > 0 && 
                 activeDropdown === category.id && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-3 z-50 animate-fadeIn">
                    {/* Dropdown Arrow */}
                    <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45"></div>
                    
                    <div className="px-3 py-2 border-b border-gray-100 mb-2">
                      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        {category.name}
                      </h3>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {category.subcategories.map((subcategory, index) => (
                        <Link
                          key={subcategory.id}
                          href={`/customer/category/${category.slug}/${subcategory.slug}`}
                          className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="flex-grow">
                            <div className="font-medium">{subcategory.name}</div>
                            {subcategory.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {subcategory.description}
                              </div>
                            )}
                          </div>
                          <svg 
                            className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                    
                    {/* View All Link */}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link
                        href={`/customer/category/${category.slug}`}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        View All {category.name}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Cart & User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button 
              className="text-gray-600 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors"
              aria-label="Search"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </button>
            
            {/* User Account with Enhanced Dropdown */}
            <div className="relative">
              <button
                className="text-gray-600 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors focus:outline-none"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Account"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </button>
              
              {/* Enhanced Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 py-2 bg-white rounded-lg shadow-xl border border-gray-100 z-20 animate-fadeIn">
                  {/* Dropdown Arrow */}
                  <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45"></div>
                  
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 text-sm font-medium text-gray-800 border-b border-gray-100 bg-gray-50">
                        <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
                        <div className="text-xs text-gray-500 mt-1">{user?.email}</div>
                      </div>
                      <Link 
                        href="/customer/profile" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Account
                      </Link>
                      <Link 
                        href="/orders" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        My Orders
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button 
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign In
                      </Link>
                      <Link 
                        href="/signup" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Enhanced Cart */}
            <Link 
              href="/cart" 
              className="text-gray-600 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors relative"
              aria-label="Shopping Cart"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
              
              {/* Enhanced Cart Item Count Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium shadow-md">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-600 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label={showMobileMenu ? 'Close Menu' : 'Open Menu'}
            >
              {showMobileMenu ? (
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              ) : (
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Enhanced Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col space-y-1">
              <Link 
                href="/customer/home" 
                className="text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-md transition-colors font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              
              {/* Mobile Categories */}
              {!loading && categories.map((category) => (
                <div key={category.id} className="px-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/customer/category/${category.slug}`}
                      className="text-gray-700 hover:text-blue-600 py-2 flex-grow font-medium transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {category.name}
                    </Link>
                    
                    {/* Expand/Collapse Button for Subcategories */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <button
                        onClick={() => handleMobileCategoryClick(category.id)}
                        className="text-gray-500 hover:text-blue-600 p-2 rounded-md hover:bg-white transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform duration-200 ${
                            activeDropdown === category.id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Mobile Subcategories */}
                  {category.subcategories && 
                   category.subcategories.length > 0 && 
                   activeDropdown === category.id && (
                    <div className="ml-4 mt-2 space-y-1 bg-white rounded-md p-2">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/customer/category/${category.slug}/${subcategory.slug}`}
                          className="block text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-md transition-colors"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;