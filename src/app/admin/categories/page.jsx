'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  Edit,
  ChevronRight,
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Import API routes
import { GET_ALL_CATEGORIES, DELETE_CATEGORY } from '@/utils/routes/productManagementRoutes';

// Import components
import CategoryModal from '@/components/adminComponents/categories/CategoryModal';
import ConfirmationDialog from '@/components/adminComponents/products/ConfirmationDialog';
import AdminLayout from '@/components/adminComponents/layout/AdminLayout';

// Import auth utility
import { getUserData } from '@/utils/auth';

export default function CategoriesPage() {
  const router = useRouter();
  
  // State for categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  
  // State for modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Check authentication on component mount
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
      router.push('/login');
      return;
    }
    
    fetchCategories();
  }, [router, includeInactive]);
  
  // Fetch categories with authentication
  const fetchCategories = async () => {
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
      const response = await axios.get(GET_ALL_CATEGORIES, {
        params: {
          includeInactive,
        },
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      if (response.data.success) {
        setCategories(response.data.data);
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
      
      setError(err.response?.data?.message || 'Error fetching categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle category edit
  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setCategoryModalOpen(true);
  };
  
  // Handle category delete
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  // Handle add new category
  const handleAddCategory = () => {
    setCurrentCategory(null);
    setCategoryModalOpen(true);
  };
  
  // Handle category created/updated
  const handleCategorySaved = () => {
    fetchCategories();
  };
  
  // Handle delete confirmation with authentication
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      // Make authenticated request
      const response = await axios.delete(DELETE_CATEGORY(categoryToDelete.id), {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      if (response.data.success) {
        fetchCategories();
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
      
      setError(err.response?.data?.message || 'Error deleting category');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  // Filter categories based on search
  const filteredCategories = categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
    );
  });
  
  const categoriesContent = (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories and subcategories
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2 flex items-end">
              <Button
                variant="outline"
                onClick={() => setIncludeInactive(!includeInactive)}
                className="w-full"
              >
                {includeInactive ? 'Hide Inactive' : 'Show Inactive'}
              </Button>
            </div>
            
            <div className="space-y-2 flex items-end">
              <Button variant="outline" onClick={fetchCategories} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-6 w-6 mb-2" />
                <span>Loading categories...</span>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Clothing Type</TableHead>
                    <TableHead>Size Chart Type</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.clothingType || 'N/A'}</TableCell>
                      <TableCell>{category.sizeChartType || 'STANDARD'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories && category.subcategories.length > 0 ? (
                            category.subcategories.map((sub) => (
                              <Badge key={sub.id} variant="outline">
                                {sub.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {category.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            title="Edit Category"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteCategory(category)}
                            title="Delete Category"
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
          )}
        </CardContent>
      </Card>
      
      {/* Modals */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        category={currentCategory}
        categories={categories}
        onSaved={handleCategorySaved}
      />
      
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone, and any products assigned to this category may be affected.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
  
  // Wrap the content with AdminLayout
  return <AdminLayout>{categoriesContent}</AdminLayout>;
}