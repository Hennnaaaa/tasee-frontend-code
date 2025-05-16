// src/components/layout/Navbar.jsx
"use client"

import React, { useState } from 'react';
import { ShoppingCart, Search, Menu, X, User, Heart } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/authcontext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-serif text-pink-800 cursor-pointer">tasee</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/new-arrivals" className="text-gray-700 hover:text-pink-800 transition-colors">
              New Arrivals
            </Link>
            <Link href="/dresses" className="text-gray-700 hover:text-pink-800 transition-colors">
              Dresses
            </Link>
            <Link href="/tops" className="text-gray-700 hover:text-pink-800 transition-colors">
              Tops
            </Link>
            <Link href="/bottoms" className="text-gray-700 hover:text-pink-800 transition-colors">
              Bottoms
            </Link>
            <Link href="/accessories" className="text-gray-700 hover:text-pink-800 transition-colors">
              Accessories
            </Link>
            <Link href="/sale" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
              Sale
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist">My Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup">Create Account</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="w-5 h-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" />
                {cartItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                    {cartItems}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/new-arrivals" className="block px-3 py-2 text-gray-700 hover:text-pink-800">
                New Arrivals
              </Link>
              <Link href="/dresses" className="block px-3 py-2 text-gray-700 hover:text-pink-800">
                Dresses
              </Link>
              <Link href="/tops" className="block px-3 py-2 text-gray-700 hover:text-pink-800">
                Tops
              </Link>
              <Link href="/bottoms" className="block px-3 py-2 text-gray-700 hover:text-pink-800">
                Bottoms
              </Link>
              <Link href="/accessories" className="block px-3 py-2 text-gray-700 hover:text-pink-800">
                Accessories
              </Link>
              <Link href="/sale" className="block px-3 py-2 text-red-600 font-semibold">
                Sale
              </Link>
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center justify-around px-4">
                <Button variant="ghost" size="icon">
                  <Search className="w-5 h-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    {isAuthenticated ? (
                      <>
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-medium">{user?.firstName}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile">My Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/orders">My Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                          Sign Out
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/login">Sign In</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/signup">Create Account</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/wishlist">
                    <Heart className="w-5 h-5" />
                  </Link>
                </Button>
                
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="w-5 h-5" />
                    {cartItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                        {cartItems}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;