'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  Edit,
  Ruler,
  Filter,
  LayoutGrid
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import API routes
import { 
  GET_ALL_SIZES, 
  DELETE_SIZE, 
  CREATE_STANDARD_SIZES 
} from '@/utils/routes/api';

// Import components
import SizeModal from '@/components/sizes/SizeModal';
import ConfirmationDialog from '@/components/products/ConfirmationDialog';

// Import auth utility
import { getUserData } from '@/utils/auth';

export default function SizesPage() {
  const router = useRouter();
  
  // State for sizes
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // State for filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [includeInactive, setIncludeInactive] = useState(false);
  
  // State for modals
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [currentSize, setCurrentSize] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState(null);
  const [creatingStandardSizes, setCreatingStandardSizes] = useState(false);
  
  // Check authentication on component mount
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
      router.push('/login');
      return;
    }
    
    fetchSizes();
  }, [router, categoryFilter, includeInactive]);
  
  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Fetch sizes with authentication
  const fetchSizes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      const params = {
        includeInactive,
      };
      
      if (categoryFilter && categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      
      // Make authenticated request
      const response = await axios.get(GET_ALL_SIZES, { 
        params,
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      if (response.data.success) {
        setSizes(response.data.data);
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
      
      setError(err.response?.data?.message || 'Error fetching sizes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle size edit
  const handleEditSize = (size) => {
    setCurrentSize(size);
    setSizeModalOpen(true);
  };
  
  // Handle size delete
  const handleDeleteSize = (size) => {
    setSizeToDelete(size);
    setDeleteDialogOpen(true);
  };
  
  // Handle add new size
  const handleAddSize = () => {
    setCurrentSize(null);
    setSizeModalOpen(true);
  };
  
  // Handle size created/updated
  const handleSizeSaved = () => {
    fetchSizes();
    setSuccessMessage('Size saved successfully');
  };
  
  // Handle delete confirmation with authentication
  const handleConfirmDelete = async () => {
    if (!sizeToDelete) return;
    
    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      // Make authenticated request
      const response = await axios.delete(DELETE_SIZE(sizeToDelete.id), {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      if (response.data.success) {
        fetchSizes();
        setSuccessMessage('Size deleted successfully');
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
      
      setError(err.response?.data?.message || 'Error deleting size');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  // Handle create standard sizes with authentication
  const handleCreateStandardSizes = async () => {
    try {
      setCreatingStandardSizes(true);
      setError(null);
      
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      // Make authenticated request
      const response = await axios.post(CREATE_STANDARD_SIZES, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      if (response.data.success) {
        fetchSizes();
        setSuccessMessage(response.data.message || 'Standard sizes created successfully');
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
      
      setError(err.response?.data?.message || 'Error creating standard sizes');
      console.error(err);
    } finally {
      setCreatingStandardSizes(false);
    }
  };
  
  // Filter sizes based on search
  const filteredSizes = sizes.filter((size) => {
    return (
      size.name.toLowerCase().includes(search.toLowerCase()) ||
      size.code.toLowerCase().includes(search.toLowerCase()) ||
      (size.numericSize && size.numericSize.toLowerCase().includes(search.toLowerCase()))
    );
  });
  
  // Get unique categories for filter
  const uniqueCategories = [...new Set(sizes.map((size) => size.category))].sort();
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sizes</h1>
          <p className="text-muted-foreground">
            Manage product sizes and size charts
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCreateStandardSizes} disabled={creatingStandardSizes}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            {creatingStandardSizes ? 'Creating...' : 'Create Standard Sizes'}
          </Button>
          <Button onClick={handleAddSize}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Size
          </Button>
        </div>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
                  placeholder="Search by name or code"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Button variant="outline" onClick={fetchSizes} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sizes Table */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="animate-spin h-6 w-6 mb-2" />
                    <span>Loading sizes...</span>
                  </div>
                </div>
              ) : filteredSizes.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No sizes found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Numeric Size</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Measurements</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSizes.map((size) => (
                        <TableRow key={size.id}>
                          <TableCell className="font-medium">{size.name}</TableCell>
                          <TableCell>{size.code}</TableCell>
                          <TableCell>{size.numericSize || 'N/A'}</TableCell>
                          <TableCell>{size.category}</TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              {size.bust && <div>Bust: {size.bust}</div>}
                              {size.waist && <div>Waist: {size.waist}</div>}
                              {size.hips && <div>Hips: {size.hips}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {size.isActive ? (
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
                                onClick={() => handleEditSize(size)}
                                title="Edit Size"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteSize(size)}
                                title="Delete Size"
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
        </TabsContent>
        
        <TabsContent value="grid">
          <Card>
            <CardHeader>
              <CardTitle>Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="animate-spin h-6 w-6 mb-2" />
                    <span>Loading sizes...</span>
                  </div>
                </div>
              ) : filteredSizes.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No sizes found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredSizes.map((size) => (
                    <Card key={size.id} className="overflow-hidden">
                      <div className={`p-2 text-center ${size.isActive ? 'bg-green-50' : 'bg-red-50'}`}>
                        <Badge className="absolute top-2 right-2" variant={size.isActive ? 'outline' : 'destructive'}>
                          {size.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <h3 className="text-xl font-bold">{size.code}</h3>
                        <p className="text-sm">{size.name}</p>
                      </div>
                      <CardContent className="p-4">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-medium">{size.category}</span>
                          </div>
                          {size.numericSize && (
                            <div className="flex justify-between">
                              <span>Numeric:</span>
                              <span className="font-medium">{size.numericSize}</span>
                            </div>
                          )}
                          {size.bust && (
                            <div className="flex justify-between">
                              <span>Bust:</span>
                              <span className="font-medium">{size.bust}</span>
                            </div>
                          )}
                          {size.waist && (
                            <div className="flex justify-between">
                              <span>Waist:</span>
                              <span className="font-medium">{size.waist}</span>
                            </div>
                          )}
                          {size.hips && (
                            <div className="flex justify-between">
                              <span>Hips:</span>
                              <span className="font-medium">{size.hips}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSize(size)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteSize(size)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modals */}
      <SizeModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        size={currentSize}
        onSaved={handleSizeSaved}
      />
      
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Size"
        description={`Are you sure you want to delete "${sizeToDelete?.name} (${sizeToDelete?.code})"? This action cannot be undone, and any products using this size may be affected.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}