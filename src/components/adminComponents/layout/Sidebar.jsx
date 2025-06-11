'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  Boxes,
  ShoppingBag,
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Newspaper,
  User2Icon,
  LucideListOrdered,
  ListOrderedIcon,
  FileEditIcon,
  Edit3Icon,
  DollarSignIcon
} from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/authcontext';

// Import auth utility
import { getUserData } from '@/utils/auth';

const Sidebar = ({ onToggle, onNavigateToComponent }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  // Get user data on component mount
  useEffect(() => {
    const auth = getUserData();
    if (auth && auth.userData) {
      setUserData(auth.userData);
    }
  }, []);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (onToggle) {
      onToggle(!collapsed);
    }
  };

  // Handle component navigation
  const handleComponentNavigation = (componentName) => {
    if (onNavigateToComponent) {
      onNavigateToComponent(componentName);
    }
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Call logout from auth context
      await logout();
      
      // Redirect to login page
      router.push('/login');
      
      // Optional: Show success message
      console.log('✅ Logout successful');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, still redirect to login for security
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      href: '/admin/dashboard',
      active: pathname === '/admin/dashboard',
    },
    {
      title: 'Products',
      icon: <Package size={20} />,
      href: '/admin/products',
      active: pathname === '/admin/products',
    },
    {
      title: 'Categories',
      icon: <Boxes size={20} />,
      href: '/admin/categories',
      active: pathname === '/admin/categories',
    },
    {
      title: 'Sizes',
      icon: <ShoppingBag size={20} />,
      href: '/admin/sizes',
      active: pathname === '/admin/sizes',
    },
    {
      title: 'Newsletters',
      icon: <Newspaper size={20} />,
      href: '/admin/NewsletterSubscriber',
      active: pathname === '/admin/NewsletterSubscriber',
    },
    {
      title: 'Customers',
      icon: <User2Icon size={20} />,
      isComponent: true,
      componentName: 'UserManagement',
      active: pathname === '/admin/customers', // This will be managed by parent
    },
    {
      title: 'Orders',
      icon: <ListOrderedIcon size={20} />,
      href: '/admin/OrderManagement',
      active: pathname === '/admin/OrderManagement',
    },
    {
      title: 'Reviews',
      icon: <Edit3Icon size={20} />,
      href: '/admin/reviews',
      active: pathname === '/admin/reviews',  
    },
    {
      title: 'Transactions',
      icon: <DollarSignIcon size={20} />,
      href: '/admin/transactions',
      active: pathname === '/admin/transactions',  
    }
  ];

  // Render navigation item
  const renderNavItem = (item, index) => {
    // Handle component-based navigation items
    if (item.isComponent) {
      if (collapsed) {
        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={item.active ? 'default' : 'ghost'}
                  size="icon"
                  className={`w-full ${
                    item.active ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : ''
                  }`}
                  onClick={() => handleComponentNavigation(item.componentName)}
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } else {
        return (
          <Button
            key={index}
            variant={item.active ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              item.active ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : ''
            }`}
            onClick={() => handleComponentNavigation(item.componentName)}
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </div>
          </Button>
        );
      }
    }

    // Handle regular link items
    if (collapsed) {
      return (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={item.href}>
                <Button
                  variant={item.active ? 'default' : 'ghost'}
                  size="icon"
                  className={`w-full ${
                    item.active ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : ''
                  }`}
                >
                  {item.icon}
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              {item.title}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else {
      return (
        <Link key={index} href={item.href}>
          <Button
            variant={item.active ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              item.active ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : ''
            }`}
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </div>
          </Button>
        </Link>
      );
    }
  };

  return (
    <div
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={collapsed ? 'mx-auto' : ''}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* User Profile Section */}
      <div className={`p-4 border-b ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {userData?.name?.charAt(0) || user?.firstName?.charAt(0) || 'A'}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{userData?.name || user?.firstName || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{userData?.email || user?.email || 'admin@example.com'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
              {userData?.name?.charAt(0) || user?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{userData?.name || user?.firstName || 'Admin User'}</span>
              <span className="text-xs text-gray-500">{userData?.email || user?.email || 'admin@example.com'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-grow py-4 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {navItems.map((item, index) => (
            <li key={index}>
              {renderNavItem(item, index)}
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={20} />
            <span className="ml-3">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;