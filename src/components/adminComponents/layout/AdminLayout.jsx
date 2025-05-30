'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell } from 'lucide-react';

// Import components
import Sidebar from '@/components/adminComponents/layout/Sidebar';
import UserManagement from '@/components/adminComponents/users/userManagement';

// Import UI components
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import auth utility
import { getUserData } from '@/utils/auth';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentComponent, setCurrentComponent] = useState(null);
  const [pageTitle, setPageTitle] = useState('Admin Dashboard');

  // Check authentication on component mount
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
      router.push('/login');
    }
  }, [router]);

  // Handle sidebar toggle
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle component navigation from sidebar
  const handleNavigateToComponent = (componentName) => {
    setCurrentComponent(componentName);
    
    // Update page title based on component
    switch (componentName) {
      case 'UserManagement':
        setPageTitle('Customer Management');
        break;
      default:
        setPageTitle('Admin Dashboard');
    }
    
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  // Clear component when navigating to regular pages
  useEffect(() => {
    // Clear component state when route changes (for regular pages)
    setCurrentComponent(null);
    setPageTitle('Admin Dashboard');
  }, [children]);

  // Render the appropriate component or children
  const renderMainContent = () => {
    switch (currentComponent) {
      case 'UserManagement':
        return <UserManagement />;
      default:
        return children;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          onToggle={handleSidebarToggle}
          onNavigateToComponent={handleNavigateToComponent}
        />
      </div>

      {/* Mobile Sidebar (Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <Sidebar 
              onToggle={handleSidebarToggle}
              onNavigateToComponent={handleNavigateToComponent}
            />
          </div>
        </div>
      )}

      {/* Main Content - NO MARGIN/PADDING BETWEEN SIDEBAR AND CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2" 
                onClick={toggleMobileMenu}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-800">
                {pageTitle}
              </h1>
            </div>
            
            {/* Notification and profile */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      A
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;