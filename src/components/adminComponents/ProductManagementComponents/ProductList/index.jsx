import React from 'react';
import { Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProductCard from '../ProductCard';

const ProductList = ({ products, onEdit, onDelete, onViewReviews }) => {
  if (products.length === 0) {
    return (
      <Alert>
        <Package className="w-4 h-4" />
        <AlertDescription>
          No products found. Add your first product to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewReviews={onViewReviews}
        />
      ))}
    </div>
  );
};

export default ProductList;