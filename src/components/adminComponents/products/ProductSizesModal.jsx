'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlusCircle,
  Trash2,
  X,
  Check,
  RefreshCw,
  PlusIcon,
  Tag,
  Boxes,
  PackageCheck,
  Info,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

// Import API routes
import {
  GET_PRODUCT_SIZES,
  ASSIGN_SIZES_TO_PRODUCT,
  UPDATE_PRODUCT_SIZE_INVENTORY,
  GET_ALL_SIZES,
} from '@/utils/routes/productManagementRoutes';

// Import auth utility
import { getUserData } from '@/utils/auth';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function ProductSizesModal({ isOpen, onClose, product, onSaved }) {
  const router = useRouter();
  const [productSizes, setProductSizes] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Added success message state
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [totalInventory, setTotalInventory] = useState(0);
  const [productData, setProductData] = useState(null);
  const [showEmptySizes, setShowEmptySizes] = useState(false);

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

  // Fetch product sizes and available sizes when product changes
  useEffect(() => {
    if (isOpen && product) {
      fetchProductSizes();
      fetchAvailableSizes();
    }
  }, [isOpen, product]);

  // Calculate total inventory when product sizes change
  useEffect(() => {
    if (productSizes.length > 0) {
      const total = productSizes.reduce((sum, size) => sum + (size.inventory || 0), 0);
      setTotalInventory(total);
    } else {
      setTotalInventory(0);
    }
  }, [productSizes]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch product sizes with authentication
  const fetchProductSizes = async () => {
    if (!product) return;

    setLoading(true);
    setError('');

    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }

      // Make authenticated request
      const response = await axios.get(GET_PRODUCT_SIZES(product.id), {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (response.data.success) {
        // Store original inventory values for comparison
        const sizesWithOriginal = (response.data.data.productSizes || []).map(size => ({
          ...size,
          originalInventory: size.inventory, // Store original inventory
          isEditedSize: false // Reset edit flag
        }));

        setProductSizes(sizesWithOriginal);
        setProductData(response.data.data.product);
        // If there are recommended sizes, add them to available sizes
        if (response.data.data.recommendedSizes) {
          setAvailableSizes(response.data.data.recommendedSizes);
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }

      setError(err.response?.data?.message || 'Error fetching product sizes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available sizes with authentication
  const fetchAvailableSizes = async () => {
    if (!product) return;

    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }

      // Make authenticated request
      const categoryResponse = await axios.get(GET_ALL_SIZES, {
        params: {
          category: product.category?.clothingType || 'TOPS',
          includeInactive: false,
        },
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (categoryResponse.data.success) {
        // Filter out sizes that are already assigned to the product
        const currentSizeIds = new Set(productSizes.map((ps) => ps.sizeId));
        const filteredSizes = categoryResponse.data.data.filter(
          (size) => !currentSizeIds.has(size.id)
        );

        setAvailableSizes(filteredSizes);
      }
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }

      console.error('Error fetching available sizes:', err);
    }
  };

  // Handle adding a size to selected sizes
  const handleAddSize = (size) => {
    if (!selectedSizes.some((s) => s.id === size.id)) {
      setSelectedSizes([
        ...selectedSizes,
        {
          id: size.id,
          name: size.name,
          code: size.code,
          inventory: 0,
          isActive: true,
        },
      ]);

      // Remove from available sizes
      setAvailableSizes(availableSizes.filter((s) => s.id !== size.id));
    }
  };

  // Handle removing a size from selected sizes
  const handleRemoveSize = (sizeId) => {
    const removedSize = selectedSizes.find((s) => s.id === sizeId);
    if (removedSize) {
      setSelectedSizes(selectedSizes.filter((s) => s.id !== sizeId));

      // Add back to available sizes
      setAvailableSizes([...availableSizes, removedSize]);
    }
  };

  // Handle inventory change for a size
  const handleInventoryChange = (sizeId, inventory) => {
    setProductSizes(
      productSizes.map((size) => {
        if (size.sizeId === sizeId) {
          return { ...size, inventory: parseInt(inventory) || 0, isEditedSize: true };
        }
        return size;
      })
    );
  };

  // Handle inventory increment/decrement
  const handleInventoryAdjust = (sizeId, amount) => {
    setProductSizes(
      productSizes.map((size) => {
        if (size.sizeId === sizeId) {
          // Ensure inventory doesn't go below zero
          const newValue = Math.max(0, (size.inventory || 0) + amount);
          return { ...size, inventory: newValue, isEditedSize: true };
        }
        return size;
      })
    );
  };

  // Handle inventory change for a selected size
  const handleSelectedInventoryChange = (sizeId, inventory) => {
    setSelectedSizes(
      selectedSizes.map((size) => {
        if (size.id === sizeId) {
          return { ...size, inventory: parseInt(inventory) || 0 };
        }
        return size;
      })
    );
  };

  // Save size changes with authentication
  const handleSaveSizes = async () => {
    if (!product) return;

    setSavingInventory(true);
    setError('');
    setSuccessMessage(''); // Clear previous success message

    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }

      // Prepare existing sizes data with ORIGINAL inventory for comparison
      const existingSizes = productSizes.map((ps) => ({
        sizeId: ps.sizeId,
        inventory: ps.inventory,
        originalInventory: ps.originalInventory || ps.inventory, // Add original inventory
        isActive: ps.isActive,
        isSizeNewlyAdded: false,
        isEditedSize: ps.isEditedSize || false // Track if inventory was edited
      }));

      // Prepare new sizes data
      const newSizes = selectedSizes.map((size) => ({
        sizeId: size.id,
        inventory: size.inventory,
        originalInventory: 0, // New sizes start with 0 original inventory
        isActive: true,
        isSizeNewlyAdded: true,
        isEditedSize: false
      }));
      // Combine existing and new sizes
      const sizesPayload = [...existingSizes, ...newSizes];

      // Send API request with authentication
      const response = await axios.post(
        ASSIGN_SIZES_TO_PRODUCT(product.id),
        { sizes: sizesPayload },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      );

      if (response.data.success) {
        // Refetch product sizes
        await fetchProductSizes();
        setSelectedSizes([]);

        // Set success message
        setSuccessMessage('Sizes and inventory updated successfully');

        // Call onSaved callback
        if (onSaved) {
          onSaved();
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return;
      }

      setError(err.response?.data?.message || 'Error saving sizes');
      console.error(err);
    } finally {
      setSavingInventory(false);
    }
  };

  // Toggle size active status
  const handleToggleActive = (sizeId, isActive) => {
    setProductSizes(
      productSizes.map((size) => {
        if (size.sizeId === sizeId) {
          return { ...size, isActive: !isActive };
        }
        return size;
      })
    );
  };

  if (!product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pb-6 border-b">
          <DialogTitle className="text-xl font-semibold">Product Sizes & Inventory</DialogTitle>
          <DialogDescription>
            Manage sizes and inventory for <span className="font-medium text-foreground">{product.name}</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4 mt-4 mx-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message Alert */}
        {successMessage && (
          <Alert variant="success" className="mb-4 mt-4 mx-6 bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-6 w-6 mb-2 text-indigo-500" />
                <span>Loading sizes...</span>
              </div>
            </div>
          ) : (
            <motion.div
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {/* Product info card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="font-medium">{productData?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">SKU</p>
                      <p className="font-medium">{productData?.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p className="font-medium">{productData?.category?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Inventory</p>
                      <div className="font-semibold text-lg">
                        <Badge className={`
                          ${totalInventory <= 0
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : totalInventory < 5
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'}
                            rounded-md px-3 py-0.5 text-sm
                        `}>
                          {totalInventory} units
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current sizes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Current Sizes</h3>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Switch
                        id="showEmptySizes"
                        checked={showEmptySizes}
                        onCheckedChange={setShowEmptySizes}
                        className="mr-2"
                      />
                      <Label htmlFor="showEmptySizes">Show zero inventory sizes</Label>
                    </div>
                  </div>
                </div>

                {productSizes.length === 0 ? (
                  <div className="bg-muted/30 border rounded-lg p-6 text-center">
                    <Boxes className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <div className="text-muted-foreground">No sizes assigned to this product yet.</div>
                    <div className="text-muted-foreground text-sm mt-1">Add sizes below to get started.</div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead>Size</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-center">Inventory</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {productSizes
                            .filter(productSize => showEmptySizes || productSize.inventory > 0)
                            .map((productSize) => (
                              <motion.tr
                                key={productSize.id}
                                className="group"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <TableCell>
                                  <div className="font-medium">{productSize.size.name}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono">
                                    {productSize.size.code}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">
                                  {productSize.sku}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleInventoryAdjust(productSize.sizeId, -1)}
                                            disabled={productSize.inventory <= 0}
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Decrease</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <Input
                                      type="number"
                                      min="0"
                                      value={productSize.inventory || 0}
                                      onChange={(e) =>
                                        handleInventoryChange(productSize.sizeId, e.target.value)
                                      }
                                      className="w-20 text-center"
                                    />

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleInventoryAdjust(productSize.sizeId, 1)}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Increase</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={productSize.isActive}
                                    onCheckedChange={() =>
                                      handleToggleActive(productSize.sizeId, productSize.isActive)
                                    }
                                  />
                                </TableCell>
                              </motion.tr>
                            ))}
                        </AnimatePresence>

                        {/* Empty state for filtered sizes */}
                        {productSizes.length > 0 &&
                          productSizes.filter(productSize => showEmptySizes || productSize.inventory > 0).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                No sizes with inventory. Toggle "Show zero inventory sizes" to view all.
                              </TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Add new sizes */}
              <div>
                <h3 className="text-lg font-medium mb-3">Add New Sizes</h3>
                {availableSizes.length === 0 ? (
                  <div className="bg-muted/30 border rounded-lg p-4 text-center">
                    <div className="text-muted-foreground">All available sizes have been added to this product.</div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {availableSizes.map((size) => (
                        <motion.div
                          key={size.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-accent px-3 py-1.5 text-sm"
                            onClick={() => handleAddSize(size)}
                          >
                            {size.name} ({size.code})
                            <PlusIcon className="ml-1 h-3 w-3" />
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected sizes */}
                {selectedSizes.length > 0 && (
                  <motion.div
                    className="mt-6 border rounded-md bg-muted/30 p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">Sizes to Add</h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead>Size</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="text-center">Inventory</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {selectedSizes.map((size) => (
                              <motion.tr
                                key={size.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <TableCell className="font-medium">{size.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono">
                                    {size.code}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleSelectedInventoryChange(size.id, Math.max(0, (size.inventory || 0) - 1))}
                                            disabled={size.inventory <= 0}
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Decrease</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <Input
                                      type="number"
                                      min="0"
                                      value={size.inventory || 0}
                                      onChange={(e) =>
                                        handleSelectedInventoryChange(size.id, e.target.value)
                                      }
                                      className="w-16 text-center"
                                    />

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleSelectedInventoryChange(size.id, (size.inventory || 0) + 1)}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Increase</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSize(size.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={savingInventory}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSizes}
            disabled={savingInventory}
            className={savingInventory ? "opacity-80" : ""}
          >
            {savingInventory ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <PackageCheck className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}