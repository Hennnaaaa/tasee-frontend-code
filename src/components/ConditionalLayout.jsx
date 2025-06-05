'use client';

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Dynamically import components to prevent SSR issues
const Navbar = dynamic(() => import("../app/customer/components/layout/Navbar"), {
  ssr: false,
  loading: () => (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <span className="text-xl font-bold text-blue-600">Tasee</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </nav>
  )
});

const Footer = dynamic(() => import("../app/customer/components/layout/Footer"), {
  ssr: false,
  loading: () => (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-20 h-6 bg-gray-600 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="w-64 h-4 bg-gray-600 rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    </footer>
  )
});

const Support = dynamic(() => import("./Support"), {
  ssr: false,
  loading: () => null
});

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Ensure we're mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);
     
  // Check if current route is admin-related
  const isAdminRoute = pathname?.startsWith('/admin');
     
  // Check if current route is auth-related (login, signup, etc.)
  const isAuthRoute = pathname?.includes('/login') ||
                      pathname?.includes('/signup') ||
                      pathname?.includes('/verify-otp') ||
                      pathname?.includes('/forgot-password');
   
  // For admin routes, return children without customer layout
  if (isAdminRoute) {
    return children;
  }
   
  // For auth routes, return children without navbar/footer
  if (isAuthRoute) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  // For customer routes, only render layout components after mounting
  return (
    <div className="flex flex-col min-h-screen">
      {mounted && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {mounted && <Footer />}
      {mounted && <Support />}
    </div>
  );
}