import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import LazyImage from './LazyImage';
import { formatCurrency } from '../utils/formatCurrency';

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

export default ProductCard;