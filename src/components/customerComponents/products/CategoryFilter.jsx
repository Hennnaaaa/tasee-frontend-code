'use client';

import { useState } from 'react';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Filter out top-level categories (those without a parentId)
  const parentCategories = categories.filter(cat => !cat.parentId && cat.isActive);
  
  // Display only the first 6 categories initially, or all if showAll is true
  const displayCategories = showAll ? parentCategories : parentCategories.slice(0, 6);
  
  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-center gap-1">
        {/* All Products Button */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-6 py-3 text-sm font-light tracking-widest uppercase transition-all duration-300 ${
            selectedCategory === null
              ? 'bg-stone-800 text-white'
              : 'bg-stone-200 hover:bg-stone-300 text-stone-700 hover:text-stone-900'
          }`}
        >
          All Products
        </button>
        
        {/* Category Buttons */}
        {displayCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-6 py-3 text-sm font-light tracking-widest uppercase transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-stone-800 text-white'
                : 'bg-stone-200 hover:bg-stone-300 text-stone-700 hover:text-stone-900'
            }`}
          >
            {category.name}
          </button>
        ))}
        
        {/* Show More/Less Button */}
        {parentCategories.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 text-sm font-light tracking-widest uppercase bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-all duration-300"
          >
            {showAll ? 'Show Less' : `Show More (${parentCategories.length - 6})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;