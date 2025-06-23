//VERSION 2

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Phone, MessageCircle, ChevronLeft, ChevronRight, Loader2, AlertCircle, Grid, List, X } from 'lucide-react';
import { 
  fetchAllProducts, 
  fetchVendors 
} from './api';

// Utility function for formatting currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Lazy Image Component with loading states
const LazyImage = ({ src, alt, className, fallback }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Image not available</p>
        </div>
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
};


// Modified Product Card Component
const ProductCard = ({ product, onClick, viewMode = 'grid' }) => {
  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

   const handleContactVendor = (e, type) => {
    e.stopPropagation();
    
    // Create a more detailed message with product info
    const productImage = product.product_images?.[0] || '';
    const originalPrice = formatCurrency(product.price);
    const finalPrice = formatCurrency(discountedPrice);
    const discountText = product.discount > 0 ? ` (${product.discount}% OFF)` : '';
    
    let message = `Hi, I'm interested in your product:\n\n`;
    message += `*Product Name:* ${product.product_name}\n`;
    message += `*Price:* ${finalPrice}${discountText}\n`;
    if (product.discount > 0) {
      message += `*Original Price:* ${originalPrice}\n`;
    }
    message += `*Category:* ${product.categoryName}\n`;
    if (product.description) {
      message += `\n*Description:* ${product.description}\n`;
    }
    message += `\nPlease let me know more about this product.`;
    
    if (type === 'whatsapp') {
              // If there's an image, we'll first send the image URL as text
      // Note: WhatsApp Web doesn't support sending images via URL in the initial message
      // So we include it as text that the vendor can click
      if (productImage) {
        message += `\n\n*Product Image:* ${productImage}`;
      }
      window.open(`https://wa.me/255${product.mobile_number.substring(1)}?text=${encodeURIComponent(message)}`, '_blank');
    } else if (type === 'call') {
      window.open(`tel:${product.mobile_number}`, '_self');
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-300 cursor-pointer flex gap-4"
        onClick={() => onClick(product)}
      >
        <div className="w-24 h-24 flex-shrink-0">
          <LazyImage
            src={product.product_images?.[0] || '/placeholder-image.jpg'}
            alt={product.product_name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.product_name}</h3>
          <p className="text-xs text-gray-600 mb-2">{product.vendorName}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-blue-600">{formatCurrency(discountedPrice)}</span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => handleContactVendor(e, 'whatsapp')}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => handleContactVendor(e, 'call')}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="Call"
              >
                <Phone className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => onClick(product)}
    >
      <div className="relative">
        <LazyImage
          src={product.product_images?.[0] || '/placeholder-image.jpg'}
          alt={product.product_name}
          className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            -{product.discount}%
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.product_name}</h3>
        <p className="text-xs text-gray-600 mb-2">{product.vendorName}</p>
        <p className="text-xs text-blue-600 mb-3">{product.categoryName}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-blue-600">{formatCurrency(discountedPrice)}</span>
            {product.discount > 0 && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={(e) => handleContactVendor(e, 'whatsapp')}
            className="flex-1 bg-green-500 text-white py-1 sm:py-2 px-2 sm:px-3 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">WhatsApp</span>
          </button>
          <button
            onClick={(e) => handleContactVendor(e, 'call')}
            className="flex-1 bg-blue-500 text-white py-1 sm:py-2 px-2 sm:px-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};


const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!isOpen || !product) return null;

  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const handleContactVendor = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Button clicked:', type); // Debug log
    console.log('Product mobile:', product.mobile_number); // Debug log
    
    // Validate mobile number exists
    if (!product.mobile_number) {
      alert('Mobile number not available for this vendor');
      return;
    }
    
    // Create a more detailed message with product info
    const productImage = product.product_images?.[0] || '';
    const originalPrice = formatCurrency(product.price);
    const finalPrice = formatCurrency(discountedPrice);
    const discountText = product.discount > 0 ? ` (${product.discount}% OFF)` : '';
    
    let message = `Hi, I'm interested in your product:\n\n`;
    message += `*Product Name:* ${product.product_name}\n`;
    message += `*Price:* ${finalPrice}${discountText}\n`;
    if (product.discount > 0) {
      message += `*Original Price:* ${originalPrice}\n`;
    }
    message += `*Category:* ${product.categoryName}\n`;
    if (product.description) {
      message += `\n*Description:* ${product.description}\n`;
    }
    message += `\nPlease let me know more about this product.`;
    
    try {
      if (type === 'whatsapp') {
        // If there's an image, we'll first send the image URL as text
        if (productImage) {
          message += `\n\n*Product Image:* ${productImage}`;
        }
        
        // Clean the mobile number - remove any non-digits except the leading +
        let cleanNumber = product.mobile_number.replace(/[^\d+]/g, '');
        
        // Handle different number formats
        if (cleanNumber.startsWith('+255')) {
          // Already has country code
          cleanNumber = cleanNumber.substring(1); // Remove the +
        } else if (cleanNumber.startsWith('255')) {
          // Has country code without +
          // Keep as is
        } else if (cleanNumber.startsWith('0')) {
          // Local format, convert to international
          cleanNumber = '255' + cleanNumber.substring(1);
        } else {
          // Assume it needs 255 prefix
          cleanNumber = '255' + cleanNumber;
        }
        
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
        console.log('WhatsApp URL:', whatsappUrl); // Debug log
        
        window.open(whatsappUrl, '_blank');
        
      } else if (type === 'call') {
        const callUrl = `tel:${product.mobile_number}`;
        console.log('Call URL:', callUrl); // Debug log
        
        window.location.href = callUrl; // Use location.href instead of window.open for tel links
      }
    } catch (error) {
      console.error('Error handling contact:', error);
      alert('Unable to open contact method. Please try again.');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.product_images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.product_images.length - 1 : prev - 1
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[80%]">{product.product_name}</h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Image Gallery */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <LazyImage
                  src={product.product_images?.[currentImageIndex] || '/placeholder-image.jpg'}
                  alt={product.product_name}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
                />
                {product.product_images && product.product_images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </>
                )}
              </div>
              
              {product.product_images && product.product_images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.product_images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <LazyImage
                        src={image}
                        alt={`${product.product_name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    {product.categoryName}
                  </span>
                  {!product.isAvailable && (
                    <span className="text-xs sm:text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md">
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{formatCurrency(discountedPrice)}</span>
                    {product.discount > 0 && (
                      <span className="text-sm sm:text-lg text-gray-500 line-through ml-2">{formatCurrency(product.price)}</span>
                    )}
                  </div>
                  {product.discount > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs sm:text-sm font-semibold">
                      -{product.discount}% OFF
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">Description</h3>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
              
              {product.details && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">Details</h3>
                  <p className="text-gray-700 text-xs sm:text-sm">{product.details}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">Vendor</h3>
                <p className="text-gray-700 text-xs sm:text-sm">{product.vendorName}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Contact: {product.mobile_number}</p>
              </div>
              
              {product.moq > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">Minimum Order Quantity</h3>
                  <p className="text-gray-700 text-xs sm:text-sm">{product.moq} units</p>
                </div>
              )}
              
              <div className="flex gap-2 sm:gap-4 pt-2 sm:pt-4">
                <button
                  onClick={(e) => handleContactVendor(e, 'whatsapp')}
                  className="flex-1 bg-green-500 text-white py-2 sm:py-3 px-3 sm:px-6 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold"
                  type="button"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  WhatsApp
                </button>
                <button
                  onClick={(e) => handleContactVendor(e, 'call')}
                  className="flex-1 bg-blue-500 text-white py-2 sm:py-3 px-3 sm:px-6 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold"
                  type="button"
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                  Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

// Main App Component (Responsive)
const ECommerceApp = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    vendors: [],
    priceRange: [0, 10000000],
    inStock: false
  });
  
  // UI States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [showAllProducts, setShowAllProducts] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, vendorsData] = await Promise.all([
          fetchAllProducts(),
          fetchVendors()
        ]);
        
        setProducts(productsData);
        setVendors(vendorsData);
        
        // Extract unique categories from products
        const uniqueCategories = [];
        const categoryMap = new Map();
        productsData.forEach(product => {
          if (!categoryMap.has(product.categoryId)) {
            categoryMap.set(product.categoryId, {
              id: product.categoryId,
              category_name: product.categoryName
            });
          }
        });
        setCategories(Array.from(categoryMap.values()));
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search query
      if (searchQuery && !product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.categoryId)) {
        return false;
      }
      
      // Vendor filter
      if (filters.vendors.length > 0 && !filters.vendors.includes(product.vendorId)) {
        return false;
      }
      
      // Price range filter
      const price = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
      
      // Stock filter
      if (filters.inStock && !product.isAvailable) {
        return false;
      }
      
      return true;
    });
    
    return filtered;
  }, [products, searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  // const currentProducts = filteredProducts.slice(
  //   (currentPage - 1) * productsPerPage,
  //   currentPage * productsPerPage
  // );

// Update the currentProducts calculation:
const currentProducts = showAllProducts 
  ? filteredProducts 
  : filteredProducts.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    );
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const closeProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const handleSeeAll = () => {
  setShowAllProducts(true);
  setCurrentPage(1); // Reset to first page
};

const handlePageChange = (page) => {
  setShowAllProducts(false); // When changing pages, disable "See All" mode
  setCurrentPage(page);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-2 sm:py-0">
            <div className="flex items-center mb-2 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bhaba MarketPlace</h1>
            </div>
            
            {/* Search Bar - Responsive */}
            <div className="w-full sm:flex-1 sm:max-w-2xl sm:mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Search products, vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            
            {/* Action Buttons - Responsive */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
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

      {/* Main Content - Responsive */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 md:py-8">
        {/* Results Info - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* Active Filters - Responsive */}
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

        {/* Products Grid/List - Responsive */}
        {currentProducts.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No products found</h3>
            <p className="text-xs sm:text-sm text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
              : "space-y-3 sm:space-y-4"
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

        // {/* Pagination - Responsive */}
        // {totalPages > 1 && (
        //   <div className="flex items-center justify-center mt-6 sm:mt-8 gap-1 sm:gap-2">
        //     <button
        //       onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        //       disabled={currentPage === 1}
        //       className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        //     >
        //       Previous
        //     </button>
            
        //     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        //       let pageNumber;
        //       if (totalPages <= 5) {
        //         pageNumber = i + 1;
        //       } else if (currentPage <= 3) {
        //         pageNumber = i + 1;
        //       } else if (currentPage >= totalPages - 2) {
        //         pageNumber = totalPages - 4 + i;
        //       } else {
        //         pageNumber = currentPage - 2 + i;
        //       }
              
        //       return (
        //         <button
        //           key={pageNumber}
        //           onClick={() => setCurrentPage(pageNumber)}
        //           className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
        //             currentPage === pageNumber
        //               ? 'bg-blue-500 text-white'
        //               : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
        //           }`}
        //         >
        //           {pageNumber}
        //         </button>
        //       );
        //     })}
            
        //     <button
        //       onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        //       disabled={currentPage === totalPages}
        //       className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        //     >
        //       Next
        //     </button>
        //   </div>
        // )}

          {/* Pagination - Responsive */}
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

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductDetail}
        onClose={closeProductDetail}
      />

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

export default ECommerceApp;
