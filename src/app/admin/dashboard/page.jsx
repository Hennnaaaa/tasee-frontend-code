'use client';
 
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  PackageOpen,
  Boxes,
  RefreshCw,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
 
// Import UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
 
// Import API routes
import { GET_INVENTORY_SUMMARY } from '@/utils/routes/productManagementRoutes';
 
// Import auth utility
import { getUserData } from '@/utils/auth';
 
// Import AdminLayout
import AdminLayout from '@/components/adminComponents/layout/AdminLayout';
 
// Import UserManagement component
import UserManagement from '@/components/adminComponents/users/userManagement';
 
export default function DashboardPage() {
  const router = useRouter();
  const [inventorySummary, setInventorySummary] = useState({
    totalProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
    totalInventoryCount: 0,
    inventoryBySize: [],
    inventoryByCategory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');
 
  // Check authentication on component mount
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
      router.push('/login');
      return;
    }
   
    fetchInventorySummary();
  }, [router]);
 
  // Fetch inventory summary with authentication
  const fetchInventorySummary = async () => {
    try {
      setLoading(true);
      setError(null);
 
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
 
      // Make authenticated request
      const response = await axios.get(GET_INVENTORY_SUMMARY, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
 
      if (response.data.success) {
        setInventorySummary({
          ...response.data.data.summary,
          inventoryBySize: response.data.data.inventoryBySize || [],
          inventoryByCategory: response.data.data.inventoryByCategory || []
        });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
     
      setError(err.response?.data?.message || 'Error fetching inventory summary');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  // Navigate to pages
  const navigateToProducts = () => router.push('/admin/products');
  const navigateToCategories = () => router.push('/admin/categories');
  const navigateToSizes = () => router.push('/admin/sizes');
  const navigateToUsers = () => setActiveTab('users');
 
  const dashboardContent = (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your inventory and store management
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchInventorySummary}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>
 
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

     
        
       
          {/* Inventory Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="flex items-center">
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Loading...
                    </div>
                  ) : (
                    inventorySummary.totalProducts
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total active products in inventory
                </p>
              </CardContent>
            </Card>
 
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
                <Boxes className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="flex items-center">
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Loading...
                    </div>
                  ) : (
                    inventorySummary.totalInventoryCount
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total units in stock across all products
                </p>
              </CardContent>
            </Card>
 
            <Card className="bg-yellow-50 border-yellow-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {loading ? (
                    <div className="flex items-center">
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Loading...
                    </div>
                  ) : (
                    inventorySummary.lowStockProducts
                  )}
                </div>
                <p className="text-xs text-yellow-800 mt-1">
                  Products with less than 5 units in stock
                </p>
                <Progress
                  value={loading ? 0 : (inventorySummary.lowStockProducts / inventorySummary.totalProducts) * 100}
                  className="h-2 mt-3 bg-yellow-200"
                />
              </CardContent>
            </Card>
 
            <Card className="bg-red-50 border-red-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock Products</CardTitle>
                <PackageOpen className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {loading ? (
                    <div className="flex items-center">
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Loading...
                    </div>
                  ) : (
                    inventorySummary.outOfStockProducts
                  )}
                </div>
                <p className="text-xs text-red-800 mt-1">
                  Products with zero inventory
                </p>
                <Progress
                  value={loading ? 0 : (inventorySummary.outOfStockProducts / inventorySummary.totalProducts) * 100}
                  className="h-2 mt-3 bg-red-200"
                />
              </CardContent>
            </Card>
          </div>
 
          {/* Quick action cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={navigateToProducts}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-indigo-500" />
                  Manage Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete products and manage product inventory and sizes.
                </p>
              </CardContent>
            </Card>
 
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={navigateToCategories}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Boxes className="h-5 w-5 mr-2 text-indigo-500" />
                  Manage Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create and organize product categories and subcategories.
                </p>
              </CardContent>
            </Card>
 
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={navigateToSizes}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-indigo-500" />
                  Manage Sizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set up size charts, create standard sizes, and manage size inventory.
                </p>
              </CardContent>
            </Card>
           
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-blue-50 border-blue-100" onClick={navigateToUsers}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage customer accounts, permissions and user data.
                </p>
              </CardContent>
            </Card>
          </div>
 
          {/* Inventory breakdown */}
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center items-center h-32">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="animate-spin h-6 w-6 mb-2" />
                    <span>Loading inventory data...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Inventory Breakdown</CardTitle>
                <CardDescription>Overview of inventory by category and size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Inventory by Category */}
                  <div>
                    <h3 className="text-md font-medium mb-4">Inventory by Category</h3>
                    {inventorySummary.inventoryByCategory && inventorySummary.inventoryByCategory.length > 0 ? (
                      <div className="space-y-4">
                        {inventorySummary.inventoryByCategory.map((item) => (
                          <div key={item.category.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="truncate">{item.category.name}</div>
                              <div className="text-right font-medium">{item.totalInventory}</div>
                            </div>
                            <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-500 h-full rounded-full"
                                style={{
                                  width: `${Math.min(
                                    (item.totalInventory / inventorySummary.totalInventoryCount) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No category data available</p>
                    )}
                  </div>
 
                  {/* Inventory by Size */}
                  <div>
                    <h3 className="text-md font-medium mb-4">Inventory by Size</h3>
                    {inventorySummary.inventoryBySize && inventorySummary.inventoryBySize.length > 0 ? (
                      <div className="space-y-4">
                        {inventorySummary.inventoryBySize.map((item) => (
                          <div key={item.size.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="truncate">
                                {item.size.name} ({item.size.code})
                              </div>
                              <div className="text-right font-medium">{item.totalInventory}</div>
                            </div>
                            <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-green-500 h-full rounded-full"
                                style={{
                                  width: `${Math.min(
                                    (item.totalInventory / inventorySummary.totalInventoryCount) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No size data available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        
        
       
      
    </div>
  );
 
  // Wrap in AdminLayout for final render
  return <AdminLayout>{dashboardContent}</AdminLayout>;
}