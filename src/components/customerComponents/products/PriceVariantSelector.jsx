// COMPLETE UPDATED PriceVariantSelector with DESELECTION
// File: src/components/customerComponents/products/PriceVariantSelector.jsx

'use client';

export default function PriceVariantSelector({ 
  variants = [], 
  selectedVariant, 
  onSelectVariant,
  formatPrice 
}) {
  const activeVariants = variants.filter(v => v.isActive !== false);

  if (!activeVariants || activeVariants.length === 0) {
    return null;
  }

  // ✅ NEW: Toggle selection - Click selected variant to deselect
  const handleVariantClick = (variant) => {
    if (selectedVariant?.id === variant.id) {
      // Clicking the already-selected variant = deselect it
      onSelectVariant(null);
    } else {
      // Clicking an unselected variant = select it
      onSelectVariant(variant);
    }
  };

  return (
    <div className="mb-6">
      {/* ✅ Header with Clear Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">
          Select Style <span className="text-sm text-gray-500 font-normal">(Optional)</span>
        </h2>
        
        {/* ✅ NEW: Clear Selection Button (only shows when variant selected) */}
        {selectedVariant && (
          <button
            onClick={() => onSelectVariant(null)}
            className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeVariants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isDefault = variant.isDefault === true;
          const isNew = variant.isNew === true;
          
          return (
            <button
              key={variant.id}
              onClick={() => handleVariantClick(variant)} // ✅ CHANGED: Use toggle function
              className={`relative p-4 border-2 rounded-xl transition-all duration-200 text-left ${
                isSelected
                  ? 'border-black bg-black text-white shadow-lg scale-[1.02]'
                  : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-2">
                {isNew && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isSelected 
                      ? 'bg-white text-black' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    🆕 New
                  </span>
                )}
                {isDefault && !isNew && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isSelected 
                      ? 'bg-white text-black' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    ⭐ Popular
                  </span>
                )}
              </div>

              {/* Variant Name */}
              <div className={`font-semibold text-lg mb-1 ${
                isSelected ? 'text-white' : 'text-gray-900'
              }`}>
                {variant.name}
              </div>

              {/* Description */}
              {variant.description && (
                <div className={`text-sm mb-2 ${
                  isSelected ? 'text-gray-200' : 'text-gray-600'
                }`}>
                  {variant.description}
                </div>
              )}

              {/* Price */}
              <div className={`text-2xl font-light ${
                isSelected ? 'text-white' : 'text-gray-900'
              }`}>
                {formatPrice(parseFloat(variant.price))}
              </div>

              {/* ✅ UPDATED: Selected indicator with deselect hint */}
              {isSelected ? (
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] text-gray-300 leading-tight">Click to deselect</span>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ✅ UPDATED: Helper text with remove option */}
      {!selectedVariant ? (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 flex items-start">
            <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              💡 Select a style option to customize your item, or add it as-is at the base price
            </span>
          </p>
        </div>
      ) : (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                ✓ <strong>{selectedVariant.name}</strong> selected ({formatPrice(parseFloat(selectedVariant.price))})
              </span>
            </p>
            {/* ✅ NEW: Inline remove button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelectVariant(null);
              }}
              className="text-sm text-gray-600 hover:text-red-600 underline transition-colors ml-2"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================
   ✅ DESELECTION FEATURE - HOW IT WORKS
   ========================================================================
   
   USER CAN DESELECT IN 3 WAYS:
   
   1. Click the selected variant card again
      → Toggles off (onSelectVariant(null))
   
   2. Click "Clear Selection" button in header
      → Only visible when variant is selected
   
   3. Click "Remove" link in confirmation message
      → Shows below variant cards when selected
   
   VISUAL FEEDBACK:
   - "Click to deselect" hint appears on selected card
   - Clear Selection button appears in header
   - Remove link appears in confirmation
   
   ======================================================================== */