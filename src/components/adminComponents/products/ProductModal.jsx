'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import API routes
import { 
  CREATE_PRODUCT, 
  UPDATE_PRODUCT 
} from '@/utils/routes/productManagementRoutes';

// Import auth utility
import { getUserData } from '@/utils/auth';
import { useRouter } from 'next/navigation';

// FIXED Image Upload Component with Working Drag-and-Drop
const ImageUpload = ({ onImagesChange, maxImages = 5, existingImages = [], onRemoveExistingImage }) => {
  const [previews, setPreviews] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Initialize with existing images - SORTED by sortOrder
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      const existingPreviews = existingImages
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((img, index) => ({
          url: img.url,
          id: img.id,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder || index,
          alt: img.alt,
          isExisting: true,
          file: null
        }));
      setPreviews(existingPreviews);
    } else {
      setPreviews([]);
    }
  }, [existingImages]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    const totalImages = previews.filter(p => !p.isExisting).length + existingImages.length;
    if (files.length + totalImages > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Process all files and create previews
    let loadedCount = 0;
    const newPreviews = [];

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          url: e.target.result,
          file: file,
          isExisting: false,
          sortOrder: previews.length + index
        });
        
        loadedCount++;
        
        // When all files are loaded, update state
        if (loadedCount === files.length) {
          const updatedPreviews = [...previews, ...newPreviews];
          setPreviews(updatedPreviews);
          
          // Extract files in current order and send to parent
          const orderedFiles = updatedPreviews
            .filter(p => !p.isExisting && p.file)
            .map(p => p.file);
          onImagesChange(orderedFiles);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const imageToRemove = previews[index];
    
    if (imageToRemove.isExisting) {
      // Handle removal of existing images
      onRemoveExistingImage(imageToRemove.id);
    }
    
    // Remove from previews
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    
    // Update parent with new file order
    const orderedFiles = newPreviews
      .filter(p => !p.isExisting && p.file)
      .map(p => p.file);
    onImagesChange(orderedFiles);
  };

  // FIXED: Move image up or down
  const moveImage = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= previews.length) return;
    
    const newPreviews = [...previews];
    // Swap elements
    [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];
    
    setPreviews(newPreviews);
    
    // Update parent with new file order
    const orderedFiles = newPreviews
      .filter(p => !p.isExisting && p.file)
      .map(p => p.file);
    onImagesChange(orderedFiles);
  };

  // FIXED: Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newPreviews = [...previews];
    const draggedItem = newPreviews[draggedIndex];
    
    // Remove from old position
    newPreviews.splice(draggedIndex, 1);
    // Insert at new position
    newPreviews.splice(dropIndex, 0, draggedItem);
    
    setPreviews(newPreviews);
    setDraggedIndex(null);
    
    // Update parent with new file order
    const orderedFiles = newPreviews
      .filter(p => !p.isExisting && p.file)
      .map(p => p.file);
    onImagesChange(orderedFiles);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
          />
          
          <label 
            htmlFor="image-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            Upload Images ({previews.length}/{maxImages})
          </label>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800 font-medium">📌 Image Ordering:</p>
          <ul className="text-xs text-blue-700 mt-1 space-y-1">
            <li>• <strong>Drag & Drop</strong> images to reorder them</li>
            <li>• Use <strong>↑↓ arrows</strong> to move images up/down</li>
            <li>• <strong>First image</strong> will be the main/primary image</li>
            <li>• Customers will see images in this <strong>exact order</strong></li>
          </ul>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Current Order (Drag to reorder):
          </p>
          <div className="grid grid-cols-1 gap-3">
            {previews.map((preview, index) => (
              <div 
                key={`${preview.id || index}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group flex items-center gap-3 p-3 bg-white border-2 rounded-lg transition-all ${
                  draggedIndex === index 
                    ? 'opacity-50 border-blue-400 scale-95' 
                    : index === 0 
                      ? 'border-blue-500 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                } cursor-move`}
              >
                {/* Drag Handle Visual Indicator */}
                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                  <div className="flex flex-col gap-0.5">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                </div>

                {/* Order Number Badge */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* Image Preview */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={preview.url} 
                    alt={preview.alt || `Image ${index + 1}`} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  {index === 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded-full font-semibold shadow-lg">
                      PRIMARY
                    </span>
                  )}
                  {preview.isExisting && (
                    <span className="absolute -bottom-2 -left-2 bg-green-500 text-white px-2 py-1 text-xs rounded-full">
                      Saved
                    </span>
                  )}
                </div>

                {/* Image Info */}
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {index === 0 ? '⭐ Main Product Image' : `Image ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preview.isExisting ? 'Already uploaded' : 'New image - will be uploaded'}
                  </p>
                  {index === 0 && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      This appears first on product page & homepage
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex flex-col gap-1">
                  {/* Move Up */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, 'up');
                    }}
                    disabled={index === 0}
                    className={`px-2 py-1 rounded text-sm font-bold ${
                      index === 0 
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                    }`}
                    title="Move up"
                  >
                    ↑
                  </button>
                  
                  {/* Move Down */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, 'down');
                    }}
                    disabled={index === previews.length - 1}
                    className={`px-2 py-1 rounded text-sm font-bold ${
                      index === previews.length - 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                    }`}
                    title="Move down"
                  >
                    ↓
                  </button>
                  
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:bg-red-700 text-sm font-bold"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onSaved,
  categories = []
}) {
  const router = useRouter();
  
  // Form state
  const initialState = {
    name: '',
    color: '',
    fabric: '',
    workDetails: '',
    description: '',
    price: '',
    discountedPrice: '',
    categoryId: '',
    sku: '',
    weight: '',
    isActive: true,
  };
  
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  
  // Check authentication when modal opens
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
      onClose();
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
      return;
    }
  }, [isOpen, router, onClose]);
  
  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        color: product.color || '',
        fabric: product.fabric || '',
        workDetails: product.workDetails || '',
        description: product.description || '',
        price: product.price ? parseFloat(product.price).toString() : '',
        discountedPrice: product.discountedPrice ? parseFloat(product.discountedPrice).toString() : '',
        categoryId: product.categoryId || '',
        sku: product.sku || '',
        weight: product.weight ? product.weight.toString() : '',
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
      
      // Set existing images - sorted by sortOrder
      if (product.images && product.images.length > 0) {
        const sortedImages = [...product.images].sort((a, b) => 
          (a.sortOrder || 0) - (b.sortOrder || 0)
        );
        setExistingImages(sortedImages);
      } else {
        setExistingImages([]);
      }
      
      setErrors({});
      setApiError('');
      setSelectedImages([]);
      setRemovedImageIds([]);
    } else {
      setFormData(initialState);
      setExistingImages([]);
      setSelectedImages([]);
      setRemovedImageIds([]);
    }
  }, [product, isOpen]);
  
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

  // Handle image selection
  const handleImagesChange = (images) => {
    console.log('Images changed:', images.length);
    setSelectedImages(images);
  };

  // Handle existing image removal
  const handleRemoveExistingImage = (imageId) => {
    setRemovedImageIds(prev => [...prev, imageId]);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (!formData.fabric.trim()) {
      newErrors.fabric = 'Fabric is required';
    }

    if (!formData.workDetails.trim()) {
      newErrors.workDetails = 'Work Details are required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    
    if (formData.discountedPrice && (isNaN(parseFloat(formData.discountedPrice)) || parseFloat(formData.discountedPrice) < 0)) {
      newErrors.discountedPrice = 'Discounted price must be a valid positive number';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    if (formData.weight && (isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) < 0)) {
      newErrors.weight = 'Weight must be a valid positive number';
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
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('fabric', formData.fabric);
      formDataToSend.append('workDetails', formData.workDetails);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price));
      if (formData.discountedPrice) {
        formDataToSend.append('discountedPrice', parseFloat(formData.discountedPrice));
      }
      formDataToSend.append('categoryId', formData.categoryId);
      if (formData.sku) {
        formDataToSend.append('sku', formData.sku);
      }
      if (formData.weight) {
        formDataToSend.append('weight', parseFloat(formData.weight));
      }
      formDataToSend.append('isActive', formData.isActive);
      
      // Append removed image IDs for updates
      if (product && removedImageIds.length > 0) {
        formDataToSend.append('removeImageIds', JSON.stringify(removedImageIds));
      }
      
      // Append new images IN THE EXACT ORDER they appear in the UI
      console.log('Uploading images in order:', selectedImages.length);
      selectedImages.forEach((image, index) => {
        console.log(`Image ${index + 1}:`, image.name);
        formDataToSend.append('images', image);
      });
      
      let response;
      
      if (product) {
        // Update existing product
        response = await axios.put(UPDATE_PRODUCT(product.id), formDataToSend, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new product
        response = await axios.post(CREATE_PRODUCT, formDataToSend, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      if (response.data.success) {
        onSaved();
        onClose();
      } else {
        setApiError(response.data.message || 'Error saving product');
      }
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }
      
      setApiError(err.response?.data?.message || 'Error saving product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update the product details below.' : 'Fill in the product details to add a new product.'}
          </DialogDescription>
        </DialogHeader>
        
        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color <span className="text-red-500">*</span></Label>
                    <Input
                      id="color"
                      name="color"
                      placeholder="Enter color"
                      value={formData.color}
                      onChange={handleChange}
                    />
                    {errors.color && <p className="text-red-500 text-sm">{errors.color}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fabric">Fabric <span className="text-red-500">*</span></Label>
                    <Input
                      id="fabric"
                      name="fabric"
                      placeholder="Enter fabric type"
                      value={formData.fabric}
                      onChange={handleChange}
                    />
                    {errors.fabric && <p className="text-red-500 text-sm">{errors.fabric}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workDetails">Work Details <span className="text-red-500">*</span></Label>
                  <Input
                    id="workDetails"
                    name="workDetails"
                    placeholder="Enter work details"
                    value={formData.workDetails}
                    onChange={handleChange}
                  />
                  {errors.workDetails && <p className="text-red-500 text-sm">{errors.workDetails}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoryId">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => handleSelectChange('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId}</p>}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                  />
                  {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">Discounted Price</Label>
                  <Input
                    id="discountedPrice"
                    name="discountedPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.discountedPrice}
                    onChange={handleChange}
                  />
                  {errors.discountedPrice && <p className="text-red-500 text-sm">{errors.discountedPrice}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="Auto-generated if empty"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                  {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSelectChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4 pt-4">
              <ImageUpload 
                onImagesChange={handleImagesChange}
                existingImages={existingImages.filter(img => !removedImageIds.includes(img.id))}
                onRemoveExistingImage={handleRemoveExistingImage}
                maxImages={5}
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
