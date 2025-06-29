import React from 'react';
import { X } from 'lucide-react'; // Must include this
// Filter Modal Component (Responsive)
const FilterModal = ({ isOpen, onClose, categories, vendors, filters, onFiltersChange }) => {
  if (!isOpen) return null;

  const handleCategoryChange = (categoryId) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleVendorChange = (vendorId) => {
    const newVendors = filters.vendors.includes(vendorId)
      ? filters.vendors.filter(id => id !== vendorId)
      : [...filters.vendors, vendorId];
    
    onFiltersChange({ ...filters, vendors: newVendors });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      vendors: [],
      priceRange: [0, 10000000],
      inStock: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3">Categories</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">{category.category_name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Vendors */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3">Vendors</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {vendors.map((vendor) => (
                <label key={vendor.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.vendors.includes(vendor.id)}
                    onChange={() => handleVendorChange(vendor.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">{vendor.store_name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3">Price Range</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0]}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]]
                  })}
                  className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1]}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    priceRange: [filters.priceRange[0], parseInt(e.target.value) || 10000000]
                  })}
                  className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Stock Status */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFiltersChange({ ...filters, inStock: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs sm:text-sm text-gray-700">In Stock Only</span>
            </label>
          </div>
          
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              onClick={clearFilters}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-3 sm:px-4 rounded-md hover:bg-gray-300 transition-colors text-xs sm:text-sm"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-blue-500 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-blue-600 transition-colors text-xs sm:text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default FilterModal;