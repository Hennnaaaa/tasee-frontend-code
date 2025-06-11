'use client';
 
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FolderTree,
  Box,
  Save,
  AlertTriangle,
  RefreshCw,
  Check,
  Info,
  Ruler,
  Shirt,
  BookOpen,
  LayoutGrid
} from 'lucide-react';
import { useRouter } from 'next/navigation';
 
// Import UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
 
// Import API routes
import { CREATE_CATEGORY, UPDATE_CATEGORY } from '@/utils/routes/productManagementRoutes';
 
// Import auth utility
import { getUserData } from '@/utils/auth';
 
export default function CategoryModal({
  isOpen,
  onClose,
  category,
  categories = [],
  onSaved,
}) {
  const router = useRouter();
 
  // Form state
  const initialState = {
    name: '',
    description: '',
    parentId: 'none',
    clothingType: 'none',
    sizeChartType: 'STANDARD',
    isActive: true,
  };
 
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
 
  // Check authentication when modal opens
  useEffect(() => {
    if (isOpen) {
      const auth = getUserData();
      if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
        onClose();
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }
    }
  }, [isOpen, router, onClose]);
 
  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentId: category.parentId || 'none',
        clothingType: category.clothingType || 'none',
        sizeChartType: category.sizeChartType || 'STANDARD',
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
      setErrors({});
      setApiError('');
    } else {
      setFormData(initialState);
    }
  }, [category, isOpen]);
 
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
   
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
 
  // Handle select change
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
   
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
 
  // Validate form
  const validateForm = () => {
    const newErrors = {};
   
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
   
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!validateForm()) {
      return;
    }
   
    // Get authentication data
    const auth = getUserData();
    if (!auth || !auth.token) {
      setApiError('Authentication required');
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
      return;
    }
   
    setLoading(true);
    setApiError('');
   
    try {
      const payload = {
        ...formData,
        // Convert 'none' values back to null or empty string as needed by your API
        parentId: formData.parentId === 'none' ? null : formData.parentId,
        clothingType: formData.clothingType === 'none' ? '' : formData.clothingType,
      };
     
      let response;
     
      if (category) {
        // Update existing category with authentication
        response = await axios.put(UPDATE_CATEGORY(category.id), payload, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
      } else {
        // Create new category with authentication
        response = await axios.post(CREATE_CATEGORY, payload, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
      }
     
      if (response.data.success) {
        onSaved();
        onClose();
      } else {
        setApiError(response.data.message);
      }
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }
     
      setApiError(err.response?.data?.message || 'Error saving category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  // Filter out current category and its subcategories from parent category options
  const filterParentOptions = (categoryList, currentId) => {
    if (!currentId) return categoryList;
   
    const childIds = new Set();
   
    // Function to find all descendants
    const findDescendants = (parentId) => {
      categoryList.forEach((cat) => {
        if (cat.parentId === parentId) {
          childIds.add(cat.id);
          findDescendants(cat.id);
        }
      });
    };
   
    // Find all descendants of current category
    findDescendants(currentId);
   
    // Filter out current category and its descendants
    return categoryList.filter((cat) => cat.id !== currentId && !childIds.has(cat.id));
  };
 
  // Available parent options
  const parentOptions = filterParentOptions(categories, category?.id);
 
  // Helper to get description for clothing type
  const getClothingTypeDescription = (type) => {
    switch (type) {
      case 'TOPS':
        return 'Shirts, t-shirts, blouses, etc.';
      case 'DRESSES':
        return 'All types of dresses';
      case 'BOTTOMS':
        return 'Pants, shorts, skirts, etc.';
      case 'OUTERWEAR':
        return 'Jackets, coats, etc.';
      case 'INTIMATES':
        return 'Underwear, lingerie, etc.';
      case 'SWIMWEAR':
        return 'Swimsuits, bikinis, etc.';
      case 'ACTIVEWEAR':
        return 'Workout clothes, athletic wear';
      case 'ACCESSORIES':
        return 'Hats, scarves, belts, etc.';
      case 'SHOES':
        return 'All types of footwear';
      default:
        return 'No specific clothing type';
    }
  };
 
  // Helper to get info for size chart types
  const getSizeChartTypeInfo = (type) => {
    switch (type) {
      case 'STANDARD':
        return {
          description: 'Letter sizes (S, M, L, XL)',
          icon: <Shirt className="mr-2 h-4 w-4" />
        };
      case 'NUMERIC':
        return {
          description: 'Numeric sizes (2, 4, 6, 8)',
          icon: <Ruler className="mr-2 h-4 w-4" />
        };
      case 'WAIST':
        return {
          description: 'Waist measurements (28, 30, 32)',
          icon: <Ruler className="mr-2 h-4 w-4" />
        };
      case 'FREE':
        return {
          description: 'One size fits all',
          icon: <Box className="mr-2 h-4 w-4" />
        };
      default:
        return {
          description: 'Standard size chart',
          icon: <Shirt className="mr-2 h-4 w-4" />
        };
    }
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] max-h-[95vh] flex flex-col p-0">
        {/* Fixed Header */}
        <DialogHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl flex items-center">
            <FolderTree className="mr-2 h-5 w-5 text-indigo-500" />
            {category ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {category ? 'Update the category details below.' : 'Fill in the category details to add a new category.'}
          </DialogDescription>
        </DialogHeader>
       
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
         
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
             
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  A brief description of this category for internal reference
                </p>
              </div>
             
              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parentId" className="text-sm font-medium">Parent Category</Label>
                <Select
                  name="parentId"
                  value={formData.parentId}
                  onValueChange={(value) => handleSelectChange('parentId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Top-level category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="flex items-center">
                      <Box className="mr-2 h-4 w-4" />
                      <span>None (Top-level category)</span>
                    </SelectItem>
                    {parentOptions.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Organize categories hierarchically by selecting a parent
                </p>
              </div>
            </div>
 
            {/* Size Settings Card */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Shirt className="mr-2 h-4 w-4 text-indigo-500" />
                  Size Settings
                </CardTitle>
                <CardDescription>
                  Configure how sizes work for this category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Clothing Type */}
                <div className="space-y-2">
                  <Label htmlFor="clothingType" className="text-sm font-medium">Clothing Type</Label>
                  <Select
                    name="clothingType"
                    value={formData.clothingType}
                    onValueChange={(value) => handleSelectChange('clothingType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select clothing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center">
                          <LayoutGrid className="mr-2 h-4 w-4" />
                          <span>None</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="TOPS">
                        <div className="flex items-center">
                          <Shirt className="mr-2 h-4 w-4" />
                          <span>Tops</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="DRESSES">Dresses</SelectItem>
                      <SelectItem value="BOTTOMS">Bottoms</SelectItem>
                      <SelectItem value="OUTERWEAR">Outerwear</SelectItem>
                      <SelectItem value="INTIMATES">Intimates</SelectItem>
                      <SelectItem value="SWIMWEAR">Swimwear</SelectItem>
                      <SelectItem value="ACTIVEWEAR">Activewear</SelectItem>
                      <SelectItem value="ACCESSORIES">Accessories</SelectItem>
                      <SelectItem value="SHOES">Shoes</SelectItem>
                    </SelectContent>
                  </Select>
                 
                  {formData.clothingType !== 'none' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getClothingTypeDescription(formData.clothingType)}
                    </p>
                  )}
                 
                  <p className="text-xs text-muted-foreground mt-1">
                    Determines which sizes will be available for products in this category
                  </p>
                </div>
               
                {/* Size Chart Type */}
                <div className="space-y-2">
                  <Label htmlFor="sizeChartType" className="text-sm font-medium">Size Chart Type</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['STANDARD', 'NUMERIC', 'WAIST', 'FREE'].map((type) => {
                      const info = getSizeChartTypeInfo(type);
                      const isSelected = formData.sizeChartType === type;
                     
                      return (
                        <div
                          key={type}
                          className={`border rounded-md p-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSelectChange('sizeChartType', type)}
                        >
                          <div className="flex items-center">
                            {info.icon}
                            <span className="font-medium text-sm">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                            {isSelected && (
                              <Check className="ml-auto h-4 w-4 text-indigo-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {info.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
           
            {/* Active Toggle */}
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleSelectChange('isActive', checked)}
              />
              <div>
                <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive categories won't be visible to customers
                </p>
              </div>
            </div>
          </form>
        </div>
       
        {/* Fixed Footer */}
        <DialogFooter className="px-4 sm:px-6 py-4 border-t flex-shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {category ? 'Update Category' : 'Create Category'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
 