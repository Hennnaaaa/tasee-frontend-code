'use client';

import { usePathname } from "next/navigation";
import Navbar from "../app/customer/components/layout/Navbar";
import Footer from "../app/customer/components/layout/Footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  
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

  // For customer routes, return with navbar and footer
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}