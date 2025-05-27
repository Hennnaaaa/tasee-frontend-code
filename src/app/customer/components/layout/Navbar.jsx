'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/cartContext';
import { useAuth } from '@/contexts/authcontext';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/customer/home" className="text-xl font-bold text-blue-600">
              Tasee
            </Link>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/customer/home" className="text-gray-700 hover:text-blue-500">
              Home
            </Link>
            <Link href="/customer/categories" className="text-gray-700 hover:text-blue-500">
              Categories
            </Link>
            <Link href="/customer/new-arrivals" className="text-gray-700 hover:text-blue-500">
              New Arrivals
            </Link>
            <Link href="/customer/sale" className="text-gray-700 hover:text-blue-500">
              Sale
            </Link>
          </div>
          
          {/* Cart & User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button 
              className="text-gray-600 hover:text-blue-500"
              aria-label="Search"
            >
              <svg 
                className="w-6 h-6" 
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
            
            {/* User Account with Dropdown */}
            <div className="relative">
              <button
                className="text-gray-600 hover:text-blue-500 focus:outline-none"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Account"
              >
                <svg 
                  className="w-6 h-6" 
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
              
              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <Link 
                        href="/customer/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        My Account
                      </Link>
                      <Link 
                        href="/orders" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        My Orders
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/signup" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Cart */}
            <Link 
              href="/cart" 
              className="text-gray-600 hover:text-blue-500 relative"
              aria-label="Shopping Cart"
            >
              <svg 
                className="w-6 h-6" 
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
              
              {/* Cart Item Count Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-600 hover:text-blue-500"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label={showMobileMenu ? 'Close Menu' : 'Open Menu'}
            >
              {showMobileMenu ? (
                <svg 
                  className="w-6 h-6" 
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
                  className="w-6 h-6" 
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
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/customer/home" 
                className="text-gray-700 hover:text-blue-500 px-2 py-1"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link 
                href="/customer/categories" 
                className="text-gray-700 hover:text-blue-500 px-2 py-1"
                onClick={() => setShowMobileMenu(false)}
              >
                Categories
              </Link>
              <Link 
                href="/customer/new-arrivals" 
                className="text-gray-700 hover:text-blue-500 px-2 py-1"
                onClick={() => setShowMobileMenu(false)}
              >
                New Arrivals
              </Link>
              <Link 
                href="/customer/sale" 
                className="text-gray-700 hover:text-blue-500 px-2 py-1"
                onClick={() => setShowMobileMenu(false)}
              >
                Sale
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;