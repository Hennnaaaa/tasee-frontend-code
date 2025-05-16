'use client'
import React, { useState } from 'react';
import { Plus, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const CategoriesManager = ({ categories, onAddCategory, onToggleCategory }) => {
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onAddCategory({
        name: newCategory.trim(),
        isActive: true,
        id: Date.now()
      });
      setNewCategory('');
      setShowCategoryDialog(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    if (activeFilter === 'active') return category.isActive;
    if (activeFilter === 'inactive') return !category.isActive;
    return true;
  });

  const activeCount = categories.filter(c => c.isActive).length;
  const inactiveCount = categories.filter(c => !c.isActive).length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Button size="sm" onClick={() => setShowCategoryDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
            >
              All ({categories.length})
            </Button>
            <Button
              variant={activeFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('active')}
            >
              Active ({activeCount})
            </Button>
            <Button
              variant={activeFilter === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('inactive')}
            >
              Inactive ({inactiveCount})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Inactive categories won't be shown to users but can be reactivated anytime.
            </AlertDescription>
          </Alert>

          <ScrollArea className="h-64">
            <div className="space-y-3">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${category.isActive
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${category.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                    />
                    <span
                      className={`font-medium ${!category.isActive ? 'text-gray-500' : ''
                        }`}
                    >
                      {category.name}
                    </span>
                    {!category.isActive && (
                      <span className="text-xs text-gray-500">(Inactive)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </span>
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={() => onToggleCategory(category.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoriesManager;