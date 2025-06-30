import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, AlertCircle, Loader2, X } from 'lucide-react';
import ProductCard from './components/ProductCard';
import FilterModal from './components/FilterModal';
import PropTypes from 'prop-types';

const ECommerceApp = ({ products = [], vendors = [], categories = [] }) => {
  // State for UI controls (keep these)
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    vendors: [],
    priceRange: [0, 10000000],
    inStock: false
  });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllProducts, setShowAllProducts] = useState(false);
  
  const productsPerPage = 12;
  const navigate = useNavigate();

  const categoryImages = {
    Electronics: '/category-images/electronics.png',
    Shoes: '/category-images/shoes.webp',
    Clothing: '/category-images/clothing.png',
  };

  // Remove the entire useEffect for data fetching - it's no longer needed

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      if (searchQuery && !product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      if (filters.categories.length > 0 && !filters.categories.includes(product.categoryName)) {
        return false;
      }
      
      if (filters.vendors.length > 0 && !filters.vendors.includes(product.vendorId)) {
        return false;
      }
      
      const price = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
      
      if (filters.inStock && !product.isAvailable) {
        return false;
      }
      
      return true;
    });
    
    return filtered;
  }, [products, searchQuery, filters]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = showAllProducts 
    ? filteredProducts 
    : filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
      );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handlePageChange = (page) => {
    setShowAllProducts(false);
    setCurrentPage(page);
  };

  const handleSeeAll = () => {
    setShowAllProducts(true);
    setCurrentPage(1);
  };

  // Remove the loading and error states - they're handled in App.js now

 return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-2 sm:py-0">
            <div className="flex items-center mb-2 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bhaba MarketPlace</h1>
            </div>
            
            <div className="w-full sm:flex-1 sm:max-w-2xl mx-0 sm:mx-4 md:mx-8 mb-2 sm:mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Search products, vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="p-1 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Filters"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-1 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4 sm:h-5 sm:w-5" /> : <Grid className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Results Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* Active Filters */}
          {(filters.categories.length > 0 || filters.vendors.length > 0 || filters.inStock) && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Active filters:</span>
              {filters.categories.map(categoryId => {
                const category = categories.find(c => c.id === categoryId);
                return category ? (
                  <span key={categoryId} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs">
                    {category.category_name}
                    <button
                      onClick={() => {
                        setFilters({
                          ...filters,
                          categories: filters.categories.filter(id => id !== categoryId)
                        });
                      }}
                      className="hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
              {filters.vendors.map(vendorId => {
                const vendor = vendors.find(v => v.id === vendorId);
                return vendor ? (
                  <span key={vendorId} className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs">
                    {vendor.store_name}
                    <button
                      onClick={() => {
                        setFilters({
                          ...filters,
                          vendors: filters.vendors.filter(id => id !== vendorId)
                        });
                      }}
                      className="hover:text-green-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
              {filters.inStock && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs">
                  In Stock Only
                  <button
                    onClick={() => setFilters({ ...filters, inStock: false })}
                    className="hover:text-purple-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>



{/* Category Filter Chips */}
<div className="mb-4 sm:mb-6">
  <div className="flex flex-wrap gap-2">
    {categories.map((categoryName) => (
      <button
        key={categoryName}
        onClick={() => {
          const newCategories = filters.categories.includes(categoryName)
            ? filters.categories.filter(name => name !== categoryName)
            : [...filters.categories, categoryName];
          setFilters({ ...filters, categories: newCategories });
        }}
        className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
          filters.categories.includes(categoryName)
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
         {/* Image */}
        {categoryImages[categoryName] && (
          <img
            src={categoryImages[categoryName]}
            alt={categoryName}
           // className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover"
           className="w-10 h-10 rounded-full object-cover"
          />
        )}
        {/* Category Name */}
        {categoryName}
      </button>
    ))}
  </div>
</div>


        {/* Products Grid/List */}
        {currentProducts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No products found</h3>
            <p className="text-xs sm:text-sm text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
              : "space-y-4"
          }>
            {currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-6 sm:mt-8 gap-1 sm:gap-2">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1 || showAllProducts}
              className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {!showAllProducts && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                    currentPage === pageNumber
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages || showAllProducts}
              className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>

            {!showAllProducts ? (
              <button
                onClick={handleSeeAll}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                See All
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAllProducts(false);
                  handlePageChange(1);
                }}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Show Pages
              </button>
            )}
          </div>
        )}
      </main>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        categories={categories}
        vendors={vendors}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

ECommerceApp.propTypes = {
  products: PropTypes.array,
  vendors: PropTypes.array,
  categories: PropTypes.array
};

ECommerceApp.defaultProps = {
  products: [],
  vendors: [],
  categories: []
};

export default ECommerceApp;
