'use client';

import { useState } from 'react';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Filter out top-level categories (those without a parentId)
  const parentCategories = categories.filter(cat => !cat.parentId && cat.isActive);
  
  // Display only the first 6 categories initially, or all if showAll is true
  const displayCategories = showAll ? parentCategories : parentCategories.slice(0, 6);
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      
      <div className="flex flex-wrap gap-2">
        {/* All Products Button */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            selectedCategory === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          All Products
        </button>
        
        {/* Category Buttons */}
        {displayCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {category.name}
          </button>
        ))}
        
        {/* Show More/Less Button */}
        {parentCategories.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 rounded-full text-sm bg-white border border-gray-300 hover:bg-gray-100 text-gray-800"
          >
            {showAll ? 'Show Less' : `Show More (${parentCategories.length - 6})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;