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
import { GripVertical, Star } from 'lucide-react';

// Import API routes
import { 
  CREATE_PRODUCT, 
  UPDATE_PRODUCT 
} from '@/utils/routes/productManagementRoutes';

// Import auth utility
import { getUserData } from '@/utils/auth';
import { useRouter } from 'next/navigation';

// ENHANCED Image Upload Component with Drag & Drop Reordering
const ImageUpload = ({ onImagesChange, maxImages = 5, existingImages = [], onRemoveExistingImage, onReorderImages }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Initialize with existing images
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      const existingPreviews = existingImages
        .sort((a, b) => a.sortOrder - b.sortOrder) // Sort by sortOrder
        .map(img => ({
          url: img.url,
          id: img.id,
          isPrimary: img.isPrimary,
          alt: img.alt,
          sortOrder: img.sortOrder,
          isExisting: true
        }));
      setPreviews(existingPreviews);
    } else {
      setPreviews([]);
    }
  }, [existingImages]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    const totalImages = selectedImages.length + existingImages.length;
    if (files.length + totalImages > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);
    
    // Create previews for new files
    const newPreviews = [...previews];
    let loadedCount = 0;
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          url: e.target.result,
          file: file,
          sortOrder: previews.length + index,
          isPrimary: previews.length === 0 && index === 0,
          isExisting: false
        });
        
        loadedCount++;
        if (loadedCount === files.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    onImagesChange(newImages);
  };

  const removeImage = (index) => {
    const imageToRemove = previews[index];
    
    if (imageToRemove.isExisting) {
      // Handle removal of existing images
      onRemoveExistingImage(imageToRemove.id);
      const newPreviews = previews.filter((_, i) => i !== index);
      
      // Recalculate sortOrder for remaining images
      const reorderedPreviews = newPreviews.map((preview, i) => ({
        ...preview,
        sortOrder: i,
        isPrimary: i === 0 // First image becomes primary if we removed the primary
      }));
      
      setPreviews(reorderedPreviews);
      
      // Notify parent of order change
      if (onReorderImages) {
        const existingImagesOrder = reorderedPreviews
          .filter(p => p.isExisting)
          .map((p, i) => ({ id: p.id, sortOrder: i, isPrimary: p.isPrimary }));
        onReorderImages(existingImagesOrder);
      }
    } else {
      // Handle removal of newly selected images
      const newImageIndex = previews.slice(0, index).filter(p => !p.isExisting).length;
      const newImages = selectedImages.filter((_, i) => i !== newImageIndex);
      const newPreviews = previews.filter((_, i) => i !== index);
      
      // Recalculate sortOrder
      const reorderedPreviews = newPreviews.map((preview, i) => ({
        ...preview,
        sortOrder: i,
        isPrimary: i === 0
      }));
      
      setSelectedImages(newImages);
      setPreviews(reorderedPreviews);
      onImagesChange(newImages);
    }
  };

  const setPrimaryImage = (index) => {
    const newPreviews = previews.map((preview, i) => ({
      ...preview,
      isPrimary: i === index
    }));
    setPreviews(newPreviews);
    
    // Notify parent of primary change
    if (onReorderImages) {
      const existingImagesOrder = newPreviews
        .filter(p => p.isExisting)
        .map((p, i) => ({ id: p.id, sortOrder: p.sortOrder, isPrimary: p.isPrimary }));
      onReorderImages(existingImagesOrder);
    }
  };

  // DRAG AND DROP HANDLERS
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newPreviews = [...previews];
    const draggedItem = newPreviews[draggedIndex];
    
    // Remove from old position
    newPreviews.splice(draggedIndex, 1);
    // Insert at new position
    newPreviews.splice(index, 0, draggedItem);
    
    // Update sortOrder for all images
    const reorderedPreviews = newPreviews.map((preview, i) => ({
      ...preview,
      sortOrder: i
    }));
    
    setPreviews(reorderedPreviews);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    
    // Notify parent of order change
    if (onReorderImages) {
      const existingImagesOrder = previews
        .filter(p => p.isExisting)
        .map((p, i) => ({ id: p.id, sortOrder: i, isPrimary: p.isPrimary }));
      onReorderImages(existingImagesOrder);
    }
    
    // Update new images order
    const newImagesInOrder = previews
      .filter(p => !p.isExisting)
      .map(p => p.file);
    setSelectedImages(newImagesInOrder);
    onImagesChange(newImagesInOrder);
  };

  return (
    <div className="space-y-4">
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
        
        <span className="text-sm text-gray-500">
          Drag to reorder • Click star to set primary
        </span>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div 
              key={preview.id || index} 
              className="relative group cursor-move"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div 
                className={`relative rounded-lg border-2 transition-all ${
                  preview.isPrimary ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 bg-white/80 rounded p-1 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>

                <img 
                  src={preview.url} 
                  alt={preview.alt || `Preview ${index}`} 
                  className="w-full h-32 object-cover rounded-lg"
                />
                
                {/* Primary Star Button */}
                <button
                  type="button"
                  onClick={() => setPrimaryImage(index)}
                  className={`absolute top-2 right-10 p-1.5 rounded-full transition-all ${
                    preview.isPrimary 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/80 text-gray-400 hover:text-yellow-500 hover:bg-white'
                  }`}
                  title="Set as primary image"
                >
                  <Star className="w-4 h-4" fill={preview.isPrimary ? 'currentColor' : 'none'} />
                </button>
                
                {/* Existing Badge */}
                {preview.isExisting && (
                  <span className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                    Existing
                  </span>
                )}

                {/* Sort Order Badge */}
                <span className="absolute bottom-2 right-2 bg-gray-800/70 text-white px-2 py-1 text-xs rounded">
                  #{index + 1}
                </span>
              </div>
              
              {/* Delete Button */}
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          💡 Images will be displayed in this exact order on the customer side. 
          The first image (marked with ⭐) will be shown on product listings.
        </p>
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
  const [imageOrder, setImageOrder] = useState([]); // NEW: Track image order changes
  
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
      
      // Set existing images - FIXED to use 'images' alias
      if (product.images && product.images.length > 0) {
        setExistingImages(product.images);
      } else {
        setExistingImages([]);
      }
      
      setErrors({});
      setApiError('');
      setSelectedImages([]);
      setRemovedImageIds([]);
      setImageOrder([]);
    } else {
      setFormData(initialState);
      setExistingImages([]);
      setSelectedImages([]);
      setRemovedImageIds([]);
      setImageOrder([]);
    }
  }, [product, isOpen]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
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
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle image selection
  const handleImagesChange = (images) => {
    setSelectedImages(images);
  };

  // Handle existing image removal
  const handleRemoveExistingImage = (imageId) => {
    setRemovedImageIds(prev => [...prev, imageId]);
  };

  // NEW: Handle image reordering
  const handleReorderImages = (newOrder) => {
    setImageOrder(newOrder);
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
    
    const auth = getUserData();
    if (!auth || !auth.token) {
      setApiError('Authentication required');
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
      return;
    }
    
    setLoading(true);
    setApiError('');
    
    try {
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

      // NEW: Append image order for existing images
      if (product && imageOrder.length > 0) {
        formDataToSend.append('imageOrder', JSON.stringify(imageOrder));
      }
      
      // Append new images in order
      selectedImages.forEach((image) => {
        formDataToSend.append('images', image);
      });
      
      let response;
      
      if (product) {
        response = await axios.put(UPDATE_PRODUCT(product.id), formDataToSend, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
              <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
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
                    error={errors.name}
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
                
                <div className="space-y-2">
                  <Label htmlFor="color">Color <span className="text-red-500">*</span></Label>
                  <Input
                    id="color"
                    name="color"
                    placeholder="Enter product color"
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
                    placeholder="Enter product fabric"
                    value={formData.fabric}
                    onChange={handleChange}
                  />
                  {errors.fabric && <p className="text-red-500 text-sm">{errors.fabric}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workDetails">Work Details <span className="text-red-500">*</span></Label>
                  <Input
                    id="workDetails"
                    name="workDetails"
                    placeholder="Enter work details (e.g. Embroidered And Embellished)"
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
                    name="categoryId"
                    value={formData.categoryId}
                    onValueChange={(value) => handleSelectChange('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="Enter SKU (leave blank to auto-generate)"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                  <p className="text-muted-foreground text-xs">Leave blank to auto-generate</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleSelectChange('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <p className="text-muted-foreground text-xs">Inactive products won't be visible to customers</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      className="pl-7"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">Discounted Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="discountedPrice"
                      name="discountedPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.discountedPrice}
                      onChange={handleChange}
                      className="pl-7"
                    />
                  </div>
                  {errors.discountedPrice && <p className="text-red-500 text-sm">{errors.discountedPrice}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                  {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Note: If you need to manage size-specific inventory, save the product first, then use the "Manage Sizes" option.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Product Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 5 images. Drag to reorder. Click the star to set primary image.
                  </p>
                </div>
                
                <ImageUpload 
                  onImagesChange={handleImagesChange}
                  existingImages={existingImages}
                  onRemoveExistingImage={handleRemoveExistingImage}
                  onReorderImages={handleReorderImages}
                  maxImages={5}
                />
                
                {existingImages.length === 0 && selectedImages.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No images uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">Upload some images to showcase your product</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose} type="button">
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