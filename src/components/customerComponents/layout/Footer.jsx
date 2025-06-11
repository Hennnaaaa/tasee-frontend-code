'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { GET_NAVIGATION_CATEGORIES } from '@/utils/routes/productManagementRoutes';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(GET_NAVIGATION_CATEGORIES);
     
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        console.error('Failed to fetch categories:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-1">
           <img 
                  src="/tasee_30x_white.png" 
                  alt="Tasee" 
                  className="h-10 w-auto object-contain"
                /><br></br>
            <p className="text-gray-400 mb-4">
              Premium women's fashion for every occasion. Discover the latest trends and timeless classics.
            </p>
            <div className="flex space-x-4">
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/taseeofficial?igsh=MW9ubHFpODRvZ251bw==" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              
              {/* Email */}
              <a 
                href="mailto:Hina@absinthesoftware.com" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span className="sr-only">Email</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Dynamic Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              {loading ? (
                <li className="text-gray-400">Loading...</li>
              ) : (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${category.slug}`} 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
          
          {/* Account Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/profile`} className="text-gray-400 hover:text-white transition-colors duration-200">
                  My Account
                </Link>
              </li>
              <li>
                <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/orders`} className="text-gray-400 hover:text-white transition-colors duration-200">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/wishlist`} className="text-gray-400 hover:text-white transition-colors duration-200">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/cart`} className="text-gray-400 hover:text-white transition-colors duration-200">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal & Policies */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/privacy-policy`} className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/terms-conditions`} className="text-gray-400 hover:text-white transition-colors duration-200">
                  Terms & Conditions
                </Link>
              </li>
              
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Tasee. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/privacy-policy`} className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy
              </Link>
              <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/terms-conditions`} className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms
              </Link>
              <a href="mailto:Hina@absinthesoftware.com" className="text-gray-400 hover:text-white transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;