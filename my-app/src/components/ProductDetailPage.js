import { useEffect } from 'react';
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Phone, MessageCircle, X } from 'lucide-react';
import LazyImage from './LazyImage';
import ProductCard from './ProductCard';
import { formatCurrency } from '../utils/formatCurrency';
import PropTypes from 'prop-types';


const ProductDetailPage = ({ products, vendors, categories }) => {
  const { productId } = useParams();
useEffect(() => {
  window.scrollTo(0, 0); // Instantly jumps to top
}, [productId]);


  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const product = products.find(p => p.id.toString() === productId);
  
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => 
      p.categoryId === product.categoryId && 
      p.id !== product.id
    ).slice(0, 200);
  }, [products, product]);

  // Calculate other products
  const otherProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => 
      p.categoryId !== product.categoryId
    ).slice(0, 600);
  }, [products, product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Product not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const handleContactVendor = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.mobile_number) {
      alert('Mobile number not available for this vendor');
      return;
    }
    
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
        if (productImage) {
          message += `\n\n*Product Image:* ${productImage}`;
        }
        
        let cleanNumber = product.mobile_number.replace(/[^\d+]/g, '');
        
        if (cleanNumber.startsWith('+255')) {
          cleanNumber = cleanNumber.substring(1);
        } else if (cleanNumber.startsWith('255')) {
          // Keep as is
        } else if (cleanNumber.startsWith('0')) {
          cleanNumber = '255' + cleanNumber.substring(1);
        } else {
          cleanNumber = '255' + cleanNumber;
        }
        
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
      } else if (type === 'call') {
        const callUrl = `tel:${product.mobile_number}`;
        window.location.href = callUrl;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[80%] mx-auto">
          {product.product_name}
        </h2>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Main Content */}
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8">
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
                {product.description || 'No description available'}
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Related Products</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                  viewMode="grid"
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Products */}
        {otherProducts.length > 0 && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">You Might Also Like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {otherProducts.map((otherProduct) => (
                <ProductCard
                  key={otherProduct.id}
                  product={otherProduct}
                  onClick={() => navigate(`/products/${otherProduct.id}`)}
                  viewMode="grid"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


ProductDetailPage.propTypes = {
  products: PropTypes.array.isRequired,
  vendors: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired
};

export default ProductDetailPage;
