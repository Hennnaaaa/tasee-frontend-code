'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  PlusCircle, 
  RefreshCw,
  Search,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Import API routes
import { 
  GET_ALL_PRODUCTS, 
  GET_INVENTORY_SUMMARY,
  GET_ALL_CATEGORIES,
  DELETE_PRODUCT
} from '@/utils/routes/productManagementRoutes';

// Import components
import ProductModal from '@/components/adminComponents/products/ProductModal';
import ConfirmationDialog from '@/components/adminComponents/products/ConfirmationDialog';
import ProductSizesModal from '@/components/adminComponents/products/ProductSizesModal';
import AdminLayout from '@/components/adminComponents/layout/AdminLayout';

// Import authentication utility
import { getUserData } from '@/utils/auth';

export default function ProductsPage() {
  const router = useRouter();
  
  // State for products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // State for inventory summary
  const [inventorySummary, setInventorySummary] = useState({
    totalProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
    totalInventoryCount: 0
  });
  
  // State for modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [sizesModalOpen, setSizesModalOpen] = useState(false);
  const [selectedProductForSizes, setSelectedProductForSizes] = useState(null);
  
  // Check authentication on component mount
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
      router.push('/login');
      return;
    }
  }, [router]);
  
  // Fetch data on component mount and when filters change
  useEffect(() => {
    const auth = getUserData();
    if (auth && auth.token) {
      fetchProducts();
      fetchCategories();
      fetchInventorySummary();
    }
  }, [pagination.page, search, categoryId, isActive]);
  
  // Fetch products with authentication
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        isActive: isActive,
        includeSizes: true
      };
      
      if (search) params.search = search;
      if (categoryId && categoryId !== 'all') params.categoryId = categoryId;
      
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      // Make authenticated request
      const response = await axios.get(GET_ALL_PRODUCTS, { 
        params,
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      if (response.data.success) {
        setProducts(response.data.data.products);
        setPagination({
          ...pagination,
          total: response.data.data.pagination.total,
          totalPages: response.data.data.pagination.totalPages
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
      
      setError(err.response?.data?.message || 'Error fetching products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch categories with authentication
  const fetchCategories = async () => {
    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      // Make authenticated request
      const response = await axios.get(GET_ALL_CATEGORIES, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      console.error('Error fetching categories:', err);
    }
  };
  
  // Fetch inventory summary with authentication
  const fetchInventorySummary = async () => {
    try {
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
        setInventorySummary(response.data.data.summary);
      }
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      console.error('Error fetching inventory summary:', err);
    }
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
  };
  
  // Handle product edit
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setProductModalOpen(true);
  };
  
  // Handle product delete
  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  // Handle product sizes
  const handleManageSizes = (product) => {
    setSelectedProductForSizes(product);
    setSizesModalOpen(true);
  };
  
  // Handle add new product
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setProductModalOpen(true);
  };
  
  // Handle product created/updated
  const handleProductSaved = () => {
    fetchProducts();
    fetchInventorySummary();
  };
  
  // Handle filter reset
  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('all');
    setPagination({ ...pagination, page: 1 });
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      // Make authenticated request
      await axios.delete(DELETE_PRODUCT(productToDelete.id), {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      setDeleteDialogOpen(false);
      fetchProducts();
      fetchInventorySummary();
    } catch (error) {
      // Handle unauthorized error
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      console.error('Error deleting product:', error);
    }
  };

  // Component for rendering product image
  const ProductImageCell = ({ product }) => {
    const [imageError, setImageError] = useState(false);
    
    // Get product images
    const productImages = product.images || [];
    const primaryImage = productImages.find(img => img.isPrimary) || productImages[0];
    
    const handleImageError = () => {
      setImageError(true);
    };

    return (
      <div className="flex items-center justify-center">
        {productImages.length > 0 && !imageError && primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="w-12 h-12 object-cover rounded-md border border-gray-200 shadow-sm"
            onError={handleImageError}
          />
        ) : (
          /* Placeholder for no image */
          <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>
    );
  };
  
  const productsContent = (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your products, inventory, and sizes
          </p>
        </div>
        <Button onClick={handleAddProduct}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      {/* Dashboard cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary.totalInventoryCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary.outOfStockProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary.lowStockProducts}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={isActive.toString()} 
                onValueChange={(val) => setIsActive(val === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex items-end">
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-6 w-6 mb-2" />
                <span>Loading products...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Inventory</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <ProductImageCell product={product} />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="max-w-[200px] truncate" title={product.name}>
                            {product.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{product.sku}</span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                            {product.category?.name || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                            {product.discountedPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${parseFloat(product.discountedPrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {(() => {
                            const baseInventory = product.inventory || 0;
                            const sizeInventory = product.productSizes?.reduce(
                              (sum, size) => sum + (size.inventory || 0),
                              0
                            ) || 0;
                            const totalInventory =  sizeInventory;

                            const textColor =
                              totalInventory <= 0
                                ? 'text-red-500'
                                : totalInventory < 5
                                ? 'text-yellow-500'
                                : 'text-green-500';

                            return (
                              <div className="flex flex-col items-end">
                                <span className={`font-semibold ${textColor}`}>
                                  {totalInventory}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {totalInventory <= 0 ? 'Out of stock' : 
                                   totalInventory < 5 ? 'Low stock' : 'In stock'}
                                </span>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleManageSizes(product)}
                              title="Manage Sizes"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditProduct(product)}
                              title="Edit Product"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                              onClick={() => handleDeleteProduct(product)}
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Modals & Dialogs */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        product={currentProduct}
        onSaved={handleProductSaved}
        categories={categories}
      />
      
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
      
      <ProductSizesModal
        isOpen={sizesModalOpen}
        onClose={() => setSizesModalOpen(false)}
        product={selectedProductForSizes}
        onSaved={() => {
          fetchProducts();
          fetchInventorySummary();
        }}
      />
    </div>
  );
  
  // Wrap the content with AdminLayout
  return <AdminLayout>{productsContent}</AdminLayout>;
}