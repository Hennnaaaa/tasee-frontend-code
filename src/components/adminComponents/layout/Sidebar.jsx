'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Menu
} from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

// Import auth utility
import { getUserData } from '@/utils/auth';

const Sidebar = ({ onToggle }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);

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
   
  ];

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
                  {userData?.name?.charAt(0) || 'A'}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{userData?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{userData?.email || 'admin@example.com'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
              {userData?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{userData?.name || 'Admin User'}</span>
              <span className="text-xs text-gray-500">{userData?.email || 'admin@example.com'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-grow py-4 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {navItems.map((item, index) => (
            <li key={index}>
              {collapsed ? (
                <TooltipProvider>
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
              ) : (
                <Link href={item.href}>
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
              )}
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
                <Button variant="ghost" size="icon" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;