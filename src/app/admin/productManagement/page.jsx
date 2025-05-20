'use client'
import React, { useState, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
// Import all the separated components
import CategoriesManager from '@/components/adminComponents/ProductManagementComponents/CategoriesManager';
import ProductForm from '@/components/adminComponents/ProductManagementComponents/ProductForm';
import ProductList from '@/components/adminComponents/ProductManagementComponents/ProductList';
import SearchFilter from '@/components/adminComponents/ProductManagementComponents/SearchFilter';
import ProductReviews from '@/components/adminComponents/ProductManagementComponents/ProductReviews';
import { GET_ALL_CATEGORIES , CREATE_CATEGORY } from '@/utils/routes/category.routes';
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'New Arrivals', isActive: true },
    { id: 2, name: 'Bridals', isActive: true },
    { id: 3, name: 'Summer 2025', isActive: true }
  ]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showReviews, setShowReviews] = useState(false);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState(null);
  // Function to add product
  const handleAddProduct = useCallback((productData) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...productData, id: editingProduct.id }
          : p
      ));
    } else {
      setProducts(prev => [...prev, { ...productData, id: Date.now() }]);
    }
    setShowProductDialog(false);
    setEditingProduct(null);
  }, [editingProduct]);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setShowProductDialog(true);
  }, []);

  const handleDeleteProduct = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  }, []);
//  Function to add category in the database
  const handleAddCategory = useCallback(async (category) => {
    // try {
    //   const response = await axios.post(CREATE_CATEGORY, {
    //     name : category.name,
    //     isActive : true
    //   }, {
    //     headers : {
    //       'Content-Type' : 'application/json',
    //     }
    //   })

    //   console.log("Response of create Category : ", response.data);
      
    // } catch (error) {
    //   console.log("Error in Adding Category : ", error);
      
    // }
    setCategories(prev => [...prev, category]);
  }, []);

  const handleToggleCategory = useCallback((categoryId) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
  }, []);

  const handleViewReviews = useCallback((product) => {
    setSelectedProductForReviews(product);
    setShowReviews(true);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  // Only show active categories in forms and filters
  const activeCategories = useMemo(() => {
    return categories.filter(cat => cat.isActive);
  }, [categories]);

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-6">Product Management</h1>
          
          <CategoriesManager
            categories={categories}
            onAddCategory={handleAddCategory}
            onToggleCategory={handleToggleCategory}
          />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <CardTitle>Products</CardTitle>
              <Button onClick={() => setShowProductDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterCategory={filterCategory}
              onFilterChange={setFilterCategory}
              categories={activeCategories}
            />

            <ProductList
              products={filteredProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onViewReviews={handleViewReviews}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            categories={activeCategories}
            onSubmit={handleAddProduct}
            onCancel={() => {
              setShowProductDialog(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Reviews Dialog */}
      {showReviews && selectedProductForReviews && (
        <ProductReviews
          productId={selectedProductForReviews.id}
          productName={selectedProductForReviews.name}
          onClose={() => {
            setShowReviews(false);
            setSelectedProductForReviews(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductManagement;