'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import API routes
import { CREATE_SIZE, UPDATE_SIZE } from '@/utils/routes/productManagementRoutes';

// Import auth utility
import { getUserData } from '@/utils/auth';

export default function SizeModal({
  isOpen,
  onClose,
  size,
  onSaved,
}) {
  const router = useRouter();
  
  // Form state
  const initialState = {
    name: '',
    code: '',
    numericSize: '',
    category: 'TOPS',
    bust: '',
    waist: '',
    hips: '',
    sortOrder: 0,
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
  
  // Initialize form data when size changes
  useEffect(() => {
    if (size) {
      setFormData({
        name: size.name || '',
        code: size.code || '',
        numericSize: size.numericSize || '',
        category: size.category || 'TOPS',
        bust: size.bust || '',
        waist: size.waist || '',
        hips: size.hips || '',
        sortOrder: size.sortOrder || 0,
        isActive: size.isActive !== undefined ? size.isActive : true,
      });
      setErrors({});
      setApiError('');
    } else {
      setFormData(initialState);
    }
  }, [size, isOpen]);
  
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
    
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Validate sortOrder is a number
    if (isNaN(Number(formData.sortOrder))) {
      newErrors.sortOrder = 'Sort order must be a number';
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
        sortOrder: Number(formData.sortOrder),
      };
      
      let response;
      
      if (size) {
        // Update existing size with authentication
        response = await axios.put(UPDATE_SIZE(size.id), payload, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
      } else {
        // Create new size with authentication
        response = await axios.post(CREATE_SIZE, payload, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
      }
      
      if (response.data.success) {
        onSaved();
        onClose();
      } else {
        setApiError(response.data.message || 'Error saving size');
      }
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }
      
      setApiError(err.response?.data?.message || 'Error saving size');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{size ? 'Edit Size' : 'Add New Size'}</DialogTitle>
          <DialogDescription>
            {size ? 'Update the size details below.' : 'Fill in the size details to add a new size.'}
          </DialogDescription>
        </DialogHeader>
        
        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Size Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Small, Medium, Large"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">
                Size Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g. S, M, L"
                value={formData.code}
                onChange={handleChange}
              />
              {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
              <p className="text-muted-foreground text-xs">Short code used in SKUs</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TOPS">Tops</SelectItem>
                  <SelectItem value="DRESSES">Dresses</SelectItem>
                  <SelectItem value="BOTTOMS">Bottoms</SelectItem>
                  <SelectItem value="OUTERWEAR">Outerwear</SelectItem>
                  <SelectItem value="INTIMATES">Intimates</SelectItem>
                  <SelectItem value="SWIMWEAR">Swimwear</SelectItem>
                  <SelectItem value="ACTIVEWEAR">Activewear</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numericSize">Numeric Size</Label>
              <Input
                id="numericSize"
                name="numericSize"
                placeholder="e.g. 4-6, 8-10"
                value={formData.numericSize}
                onChange={handleChange}
              />
              <p className="text-muted-foreground text-xs">Numeric size equivalents</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bust">Bust Measurement</Label>
              <Input
                id="bust"
                name="bust"
                placeholder="e.g. 32-34"
                value={formData.bust}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waist">Waist Measurement</Label>
              <Input
                id="waist"
                name="waist"
                placeholder="e.g. 24-26"
                value={formData.waist}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hips">Hips Measurement</Label>
              <Input
                id="hips"
                name="hips"
                placeholder="e.g. 34-36"
                value={formData.hips}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min="0"
                placeholder="0"
                value={formData.sortOrder}
                onChange={handleChange}
              />
              {errors.sortOrder && <p className="text-red-500 text-sm">{errors.sortOrder}</p>}
              <p className="text-muted-foreground text-xs">Used for ordering sizes (lower numbers first)</p>
            </div>
            
            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSelectChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : size ? 'Update Size' : 'Create Size'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}