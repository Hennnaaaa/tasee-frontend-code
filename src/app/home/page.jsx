"use client"

import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/heroSection';
import SearchBar from '@/components/common/searchBar';
import ProductCard from '@/components/products/productCard';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const categories = [
    { name: 'Dresses', description: 'Elegant & Casual', image: '/api/placeholder/300/400' },
    { name: 'Tops', description: 'Blouses & T-shirts', image: '/api/placeholder/300/400' },
    { name: 'Bottoms', description: 'Pants & Skirts', image: '/api/placeholder/300/400' },
    { name: 'Accessories', description: 'Bags & Jewelry', image: '/api/placeholder/300/400' }
  ];

  const products = [
    { id: 1, name: 'Floral Summer Dress', category: 'Dresses', price: 79, originalPrice: 99, sale: true },
    { id: 2, name: 'Silk Blouse', category: 'Tops', price: 59, isNew: true },
    { id: 3, name: 'High-Waist Jeans', category: 'Bottoms', price: 89 },
    { id: 4, name: 'Leather Handbag', category: 'Accessories', price: 129 },
    { id: 5, name: 'Wrap Maxi Dress', category: 'Dresses', price: 119, originalPrice: 149, sale: true },
    { id: 6, name: 'Cotton T-Shirt', category: 'Tops', price: 29 },
    { id: 7, name: 'Pleated Skirt', category: 'Bottoms', price: 69, isNew: true },
    { id: 8, name: 'Statement Necklace', category: 'Accessories', price: 49 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <HeroSection />
        <SearchBar />
        
        {/* Shop by Category */}
        <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif text-gray-900 mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={`/category/${category.name.toLowerCase()}`}>
                <div className="group cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="mt-4 font-medium text-gray-900">{category.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
          <h2 className="text-2xl font-serif text-gray-900 mb-8">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="bg-pink-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-serif text-gray-900 mb-4">Stay in Style</h2>
            <p className="text-gray-600 mb-6">Subscribe to our newsletter for exclusive offers and new arrivals</p>
            <div className="max-w-md mx-auto flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button className="bg-pink-600 hover:bg-pink-700">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}