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
import { GripVertical, Star, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Import API routes
import { 
  CREATE_PRODUCT, 
  UPDATE_PRODUCT 
} from '@/utils/routes/productManagementRoutes';

// Import auth utility
import { getUserData } from '@/utils/auth';
import { useRouter } from 'next/navigation';

// Image Upload Component (same as before)
const ImageUpload = ({ onImagesChange, maxImages = 5, existingImages = [], onRemoveExistingImage, onReorderImages }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      const existingPreviews = existingImages
        .sort((a, b) => a.sortOrder - b.sortOrder)
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
      onRemoveExistingImage(imageToRemove.id);
      const newPreviews = previews.filter((_, i) => i !== index);
      const reorderedPreviews = newPreviews.map((preview, i) => ({
        ...preview,
        sortOrder: i,
        isPrimary: i === 0
      }));
      setPreviews(reorderedPreviews);
      
      if (onReorderImages) {
        const existingImagesOrder = reorderedPreviews
          .filter(p => p.isExisting)
          .map((p, i) => ({ id: p.id, sortOrder: i, isPrimary: p.isPrimary }));
        onReorderImages(existingImagesOrder);
      }
    } else {
      const newImageIndex = previews.slice(0, index).filter(p => !p.isExisting).length;
      const newImages = selectedImages.filter((_, i) => i !== newImageIndex);
      const newPreviews = previews.filter((_, i) => i !== index);
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
    
    if (onReorderImages) {
      const existingImagesOrder = newPreviews
        .filter(p => p.isExisting)
        .map((p, i) => ({ id: p.id, sortOrder: p.sortOrder, isPrimary: p.isPrimary }));
      onReorderImages(existingImagesOrder);
    }
  };

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
    newPreviews.splice(draggedIndex, 1);
    newPreviews.splice(index, 0, draggedItem);
    
    const reorderedPreviews = newPreviews.map((preview, i) => ({
      ...preview,
      sortOrder: i
    }));
    
    setPreviews(reorderedPreviews);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    
    if (onReorderImages) {
      const existingImagesOrder = previews
        .filter(p => p.isExisting)
        .map((p, i) => ({ id: p.id, sortOrder: i, isPrimary: p.isPrimary }));
      onReorderImages(existingImagesOrder);
    }
    
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
                <div className="absolute top-2 left-2 bg-white/80 rounded p-1 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>

                <img 
                  src={preview.url} 
                  alt={preview.alt || `Preview ${index}`} 
                  className="w-full h-32 object-cover rounded-lg"
                />
                
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
                
                {preview.isExisting && (
                  <span className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                    Existing
                  </span>
                )}

                <span className="absolute bottom-2 right-2 bg-gray-800/70 text-white px-2 py-1 text-xs rounded">
                  #{index + 1}
                </span>
              </div>
              
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
    </div>
  );
};

// ✅ NEW: Price Variants Manager Component
const PriceVariantsManager = ({ variants, onChange }) => {
  const [localVariants, setLocalVariants] = useState(variants || []);

  useEffect(() => {
    setLocalVariants(variants || []);
  }, [variants]);

  const addVariant = () => {
    const newVariant = {
      id: `temp_${Date.now()}`,
      name: '',
      description: '',
      price: '',
      isDefault: localVariants.length === 0,
      isActive: true,
      isNew: true
    };
    const updated = [...localVariants, newVariant];
    setLocalVariants(updated);
    onChange(updated);
  };

  const updateVariant = (index, field, value) => {
    const updated = localVariants.map((variant, i) => {
      if (i === index) {
        if (field === 'isDefault' && value === true) {
          // Only one can be default
          return { ...variant, [field]: value };
        }
        return { ...variant, [field]: value };
      }
      // If setting this as default, unset others
      if (field === 'isDefault' && value === true) {
        return { ...variant, isDefault: false };
      }
      return variant;
    });
    setLocalVariants(updated);
    onChange(updated);
  };

  const removeVariant = (index) => {
    const updated = localVariants.filter((_, i) => i !== index);
    // If we removed the default, make the first one default
    if (updated.length > 0 && !updated.some(v => v.isDefault)) {
      updated[0].isDefault = true;
    }
    setLocalVariants(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Price Variants</h3>
          <p className="text-sm text-muted-foreground">
            Create different pricing options (e.g., Standard, Premium, Deluxe)
          </p>
        </div>
        <Button type="button" onClick={addVariant} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {localVariants.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No price variants</p>
          <p className="text-sm text-gray-400 mt-1">Add variants to offer different pricing tiers</p>
        </div>
      ) : (
        <div className="space-y-3">
          {localVariants.map((variant, index) => (
            <div key={variant.id || index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Variant Name *</Label>
                      <Input
                        placeholder="e.g., Premium Stitching"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          className="pl-7"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe what makes this variant unique"
                      value={variant.description}
                      onChange={(e) => updateVariant(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={variant.isDefault}
                        onCheckedChange={(checked) => updateVariant(index, 'isDefault', checked)}
                      />
                      <Label>Default/Popular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={variant.isActive}
                        onCheckedChange={(checked) => updateVariant(index, 'isActive', checked)}
                      />
                      <Label>Active</Label>
                    </div>
                    {variant.isDefault && (
                      <Badge className="bg-blue-500">Popular</Badge>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariant(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Price variants let customers choose between different quality levels or service options.
          Mark one as "Default/Popular" to auto-select it.
        </AlertDescription>
      </Alert>
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
  const [imageOrder, setImageOrder] = useState([]);
  const [priceVariants, setPriceVariants] = useState([]); // ✅ NEW
  
  useEffect(() => {
    const auth = getUserData();
    if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
      onClose();
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
      return;
    }
  }, [isOpen, router, onClose]);
  
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
      
      if (product.images && product.images.length > 0) {
        setExistingImages(product.images);
      } else {
        setExistingImages([]);
      }

      // ✅ NEW: Load existing price variants
      if (product.priceVariants?.variants && product.priceVariants.variants.length > 0) {
        setPriceVariants(product.priceVariants.variants);
      } else {
        setPriceVariants([]);
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
      setPriceVariants([]);
    }
  }, [product, isOpen]);
  
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

  const handleImagesChange = (images) => {
    setSelectedImages(images);
  };

  const handleRemoveExistingImage = (imageId) => {
    setRemovedImageIds(prev => [...prev, imageId]);
  };

  const handleReorderImages = (newOrder) => {
    setImageOrder(newOrder);
  };

  // ✅ NEW: Handle price variants changes
  const handlePriceVariantsChange = (variants) => {
    setPriceVariants(variants);
  };
  
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

    // ✅ NEW: Validate price variants
    if (priceVariants.length > 0) {
      const hasInvalidVariant = priceVariants.some(v => !v.name.trim() || !v.price || parseFloat(v.price) < 0);
      if (hasInvalidVariant) {
        newErrors.priceVariants = 'All price variants must have a name and valid price';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
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
      
      if (product && removedImageIds.length > 0) {
        formDataToSend.append('removeImageIds', JSON.stringify(removedImageIds));
      }

      if (product && imageOrder.length > 0) {
        formDataToSend.append('imageOrder', JSON.stringify(imageOrder));
      }

      // ✅ NEW: Append price variants
      if (priceVariants.length > 0) {
        formDataToSend.append('priceVariants', JSON.stringify(priceVariants));
      }
      
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="variants">Price Variants</TabsTrigger>
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
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Base Price <span className="text-red-500">*</span>
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
                  <p className="text-xs text-muted-foreground">This is the base price (used if no price variants)</p>
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
            </TabsContent>

            {/* ✅ NEW: Price Variants Tab */}
            <TabsContent value="variants" className="space-y-4 pt-4">
              <PriceVariantsManager
                variants={priceVariants}
                onChange={handlePriceVariantsChange}
              />
              {errors.priceVariants && (
                <p className="text-red-500 text-sm">{errors.priceVariants}</p>
              )}
            </TabsContent>

            <TabsContent value="images" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Product Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 5 images. Drag to reorder. Click star to set primary.
                  </p>
                </div>
                
                <ImageUpload 
                  onImagesChange={handleImagesChange}
                  existingImages={existingImages}
                  onRemoveExistingImage={handleRemoveExistingImage}
                  onReorderImages={handleReorderImages}
                  maxImages={5}
                />
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