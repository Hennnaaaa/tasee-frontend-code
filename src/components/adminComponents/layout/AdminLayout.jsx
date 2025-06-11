'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, X, Clock, CheckCircle } from 'lucide-react';

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

// Import auth utility and notification hook
import { getUserData } from '@/utils/auth';
import { useNotifications } from '@/hooks/useNotifications';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentComponent, setCurrentComponent] = useState(null);
  const [pageTitle, setPageTitle] = useState('Admin Dashboard');
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Initialize notification system
  const {
    notifications,
    unreadCount,
    isPolling,
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
    getAllNotifications
  } = useNotifications();

  // Check authentication and start polling
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
      return;
    }

    // Start notification polling for admin users
    console.log('🔔 Admin authenticated, starting notification system');
    startPolling();

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [router, startPolling, stopPolling]);

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

  // Handle notification dropdown toggle
  const toggleNotificationDropdown = async () => {
    if (!notificationDropdownOpen) {
      // Load all notifications when opening dropdown
      setLoadingNotifications(true);
      try {
        const allNotifs = await getAllNotifications(1, 10); // Get latest 10
        // Sort notifications by createdAt DESC (newest first)
        const sortedNotifications = (allNotifs.notifications || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    }
    setNotificationDropdownOpen(!notificationDropdownOpen);
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    console.log("🔖 Notification clicked:", notification.id, "is_read:", notification.is_read);
    
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
        
        // Update local state immediately
        setAllNotifications(prev => 
          prev.map(notif => 
            notif.id === notification.id 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        
        console.log("✅ Notification marked as read successfully");
      } catch (error) {
        console.error("❌ Failed to mark notification as read:", error);
      }
    }
    
    // You can add navigation logic here if needed
    // For example: router.push(`/admin/orders/${notification.order_id}`);
  };

  // Format notification time - IMPROVED
  const formatNotificationTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (isNaN(diffInMinutes)) return 'Just now';
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
      
      // For older notifications, show actual date
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown';
    }
  };

  // Handle logout
  const handleLogout = () => {
    stopPolling();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
  };

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

      {/* Main Content */}
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
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {pageTitle}
                </h1>
               
              </div>
            </div>
            
            {/* Notification and profile */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-gray-100 rounded-full transition-colors"
                  onClick={toggleNotificationDropdown}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown - RESPONSIVE VERSION */}
                {notificationDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40 md:hidden" 
                      onClick={() => setNotificationDropdownOpen(false)}
                    />
                    
                    {/* Dropdown Panel - Responsive */}
                    <div className={`
                      absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 
                      w-80 sm:w-96 md:w-80 lg:w-96
                      max-w-[calc(100vw-2rem)] 
                      max-h-[70vh] sm:max-h-[80vh] md:max-h-[500px]
                      flex flex-col
                      transform transition-all duration-200 ease-out
                      ${notificationDropdownOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                    `}>
                      {/* Header - Enhanced */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {unreadCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAllAsRead();
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors"
                            >
                              Mark all read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotificationDropdownOpen(false);
                            }}
                            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Notification List - Enhanced Scrollable */}
                      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: 'calc(70vh - 120px)' }}>
                        {loadingNotifications ? (
                          <div className="p-8 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                            <p className="text-sm">Loading notifications...</p>
                          </div>
                        ) : allNotifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">No notifications yet</p>
                            <p className="text-xs text-gray-400">New order notifications will appear here</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {allNotifications.map((notification, index) => (
                              <div
                                key={notification.id}
                                className={`
                                  p-4 cursor-pointer transition-all duration-150 ease-in-out
                                  ${!notification.is_read 
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-l-4 border-blue-400' 
                                    : 'hover:bg-gray-50'
                                  }
                                  ${index === 0 ? 'rounded-t-none' : ''}
                                  ${index === allNotifications.length - 1 ? 'rounded-b-xl' : ''}
                                `}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  {/* Notification Icon */}
                                  <div className={`
                                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5
                                    ${!notification.is_read ? 'bg-blue-100' : 'bg-gray-100'}
                                  `}>
                                    {notification.type === 'new_order' && (
                                      <svg className={`w-4 h-4 ${!notification.is_read ? 'text-blue-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                      </svg>
                                    )}
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                      <h4 className="text-sm font-medium text-gray-900 truncate pr-2">
                                        {notification.title}
                                      </h4>
                                      {!notification.is_read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
                                      )}
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-2 break-words leading-relaxed">
                                      {notification.message}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        <span>{formatNotificationTime(notification.createdAt)}</span>
                                      </div>
                                      
                                      {notification.is_read && (
                                        <div className="flex items-center space-x-1 text-xs text-green-600">
                                          <CheckCircle className="h-3 w-3 flex-shrink-0" />
                                          <span className="hidden sm:inline">Read</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer - Only show if there are notifications and unread count */}
                      {allNotifications.length > 0 && unreadCount > 0 && (
                        <div className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                          <div className="text-center text-xs text-gray-500">
                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''} • 
                            Last updated {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {/* Profile Dropdown */}
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
                  <DropdownMenuItem 
                    className="text-red-500"
                    onClick={handleLogout}
                  >
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