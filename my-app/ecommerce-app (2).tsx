import React, { useState, useEffect, createContext, useContext, useReducer } from 'react';
import { Search, ShoppingCart, Heart, User, Menu, X, Star, Filter, Plus, Minus, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Package, Truck, CheckCircle, Clock, Eye, Edit, Trash2, BarChart3, Users, Settings, Home, Grid3X3, Tag, Bell } from 'lucide-react';

// Context for Global State Management
const AppContext = createContext();

// Auth Context
const AuthContext = createContext();

// Cart Context  
const CartContext = createContext();

// Initial States
const initialCartState = {
  items: [],
  total: 0,
  itemCount: 0
};

const initialAuthState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false
};

// Reducers
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          total: state.total + action.payload.price,
          itemCount: state.itemCount + 1
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        total: state.total + action.payload.price,
        itemCount: state.itemCount + 1
      };
    
    case 'REMOVE_ITEM':
      const itemToRemove = state.items.find(item => item.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (itemToRemove.price * itemToRemove.quantity),
        itemCount: state.itemCount - itemToRemove.quantity
      };
    
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount
      };
    
    case 'CLEAR_CART':
      return initialCartState;
    
    default:
      return state;
  }
};

// Sample Data
const sampleProducts = [
  {
    id: 1,
    name: "DISPOSABLE VAPE PUFFS 3000",
    price: 12000,
    originalPrice: 15000,
    discount: 20,
    category: "Smokeables",
    image: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=400",
    images: ["https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=400"],
    description: "Disposable Vape ni kifaa cha kuvuta sigara za umeme kinachotumika mara moja na kutupwa baada ya kumalizika",
    rating: 4.5,
    reviews: 89,
    stock: 50,
    isAvailable: true,
    tierPricing: [
      { range: "1-9", price: 5000 },
      { range: "10-49", price: 4000 },
      { range: "50-99", price: 3500 }
    ]
  },
  {
    id: 2,
    name: "HOOKAH CHARCOAL HOLDER",
    price: 12000,
    category: "Smokeables",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"],
    description: "Holder wa Makaa ya Hookah ni kifaa kinachotumika kushikilia makaa wakati wa kuvuta hookah",
    rating: 4.2,
    reviews: 45,
    stock: 30,
    isAvailable: true
  },
  {
    id: 3,
    name: "Premium Sneakers",
    price: 85000,
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"],
    description: "High-quality sneakers with premium materials and comfort design",
    rating: 4.8,
    reviews: 156,
    stock: 25,
    isAvailable: true
  },
  {
    id: 4,
    name: "Smart Coffee Maker",
    price: 150000,
    category: "Home Appliances",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"],
    description: "WiFi enabled coffee maker with app control and multiple brewing options",
    rating: 4.6,
    reviews: 89,
    stock: 15,
    isAvailable: true
  }
];

const categories = ["All", "Smokeables", "Shoes", "Home Appliances", "Electronics", "Fashion", "Sports"];

// Utility Functions
const formatPrice = (price) => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0
  }).format(price);
};

const calculateDiscount = (original, current) => {
  return Math.round(((original - current) / original) * 100);
};

// Custom Hooks
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage?.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage?.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

// Components

// Header Component
const Header = ({ currentPage, setCurrentPage, user, setUser }) => {
  const { state: cartState } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 
              onClick={() => setCurrentPage('home')}
              className="text-2xl font-bold text-blue-600 cursor-pointer"
            >
              BhabaStore
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage('wishlist')}
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <Heart size={24} />
            </button>
            
            <button
              onClick={() => setCurrentPage('cart')}
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <ShoppingCart size={24} />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hi, {user.name}</span>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <User size={24} />
                </button>
                {user.isAdmin && (
                  <button
                    onClick={() => setCurrentPage('admin')}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => setUser(null)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage('login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <nav className="space-y-2">
              <button onClick={() => {setCurrentPage('home'); setIsMenuOpen(false);}} className="block w-full text-left py-2 hover:bg-gray-100 rounded">Home</button>
              <button onClick={() => {setCurrentPage('products'); setIsMenuOpen(false);}} className="block w-full text-left py-2 hover:bg-gray-100 rounded">Products</button>
              <button onClick={() => {setCurrentPage('categories'); setIsMenuOpen(false);}} className="block w-full text-left py-2 hover:bg-gray-100 rounded">Categories</button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{product.discount}%
          </span>
        )}
        <button
          onClick={() => onAddToWishlist(product)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
        >
          <Heart size={16} className="text-gray-600 hover:text-red-500" />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{product.stock} left</span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Filter Sidebar Component
const FilterSidebar = ({ filters, setFilters, categories }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        <Filter size={20} className="mr-2" />
        Filters
      </h3>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="mr-2"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Price Range (TZS)</h4>
        <div className="space-y-3">
          <div>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min}
              onChange={(e) => setFilters({
                ...filters,
                priceRange: {...filters.priceRange, min: e.target.value}
              })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max}
              onChange={(e) => setFilters({
                ...filters,
                priceRange: {...filters.priceRange, max: e.target.value}
              })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.rating.includes(rating)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters({...filters, rating: [...filters.rating, rating]});
                  } else {
                    setFilters({...filters, rating: filters.rating.filter(r => r !== rating)});
                  }
                }}
                className="mr-2"
              />
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                  />
                ))}
                <span className="text-sm ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Cart Component
const CartPage = ({ setCurrentPage }) => {
  const { state: cartState, dispatch } = useContext(CartContext);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    }
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  if (cartState.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartState.items.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cartState.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cartState.total)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('checkout')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Checkout Component
const CheckoutPage = ({ setCurrentPage }) => {
  const { state: cartState, dispatch } = useContext(CartContext);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    phone: '',
    paymentMethod: 'mpesa'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate order placement
    alert('Order placed successfully!');
    dispatch({ type: 'CLEAR_CART' });
    setCurrentPage('orders');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="mpesa"
                    checked={formData.paymentMethod === 'mpesa'}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="mr-3"
                  />
                  <span>M-Pesa</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="airtel"
                    checked={formData.paymentMethod === 'airtel'}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="mr-3"
                  />
                  <span>Airtel Money</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="mr-3"
                  />
                  <span>Credit/Debit Card</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-lg"
            >
              Place Order - {formatPrice(cartState.total)}
            </button>
          </form>
        </div>

        <div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {cartState.items.map(item => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(cartState.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const AdminOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Sales</p>
              <p className="text-2xl font-bold">TZS 2.4M</p>
            </div>
            <BarChart3 className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Orders</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <Package className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Products</p>
              <p className="text-2xl font-bold">456</p>
            </div>
            <Grid3X3 className="text-purple-600" size={32} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Customers</p>
              <p className="text-2xl font-bold">892</p>
            </div>
            <Users className="text-orange-600" size={32} />
          </div>
        </div>
      </div>
    </div>
  );

  const AdminProducts = () => {
    const [products, setProducts] = useState(sampleProducts);
    const [showAddForm, setShowAddForm] = useState(false);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products Management</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                    <button className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const AdminOrders = () => {
    const orders = [
      { id: '001', customer: 'John Doe', total: 45000, status: 'pending', date: '2024-06-06' },
      { id: '002', customer: 'Jane Smith', total: 89000, status: 'shipped', date: '2024-06-05' },
      { id: '003', customer: 'Bob Wilson', total: 23000, status: 'delivered', date: '2024-06-04' }
    ];

    const getStatusColor = (status) => {
      switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'shipped': return 'bg-blue-100 text-blue-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-800"><Eye size={16} /></button>
                    <button className="text-green-600 hover:text-green-800"><Truck size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'products', label: 'Products', icon: Grid3X3 },
                { id: 'orders', label: 'Orders', icon: Package },
                { id: 'customers', label: 'Customers', icon: Users },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'customers' && (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Customer Management</h3>
              <p className="text-gray-600">Customer management features coming soon</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <Settings size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Settings</h3>
              <p className="text-gray-600">Settings panel coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Login Component
const LoginPage = ({ setUser, setCurrentPage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock authentication
    const mockUser = {
      id: 1,
      name: formData.name || 'John Doe',
      email: formData.email,
      isAdmin: formData.email === 'admin@bhaba.com'
    };
    
    setUser(mockUser);
    setCurrentPage('home');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Demo: Use admin@bhaba.com for admin access
          </p>
        </div>
      </div>
    </div>
  );
};

// Home Page Component
const HomePage = ({ setCurrentPage }) => {
  const { dispatch } = useContext(CartContext);
  const [wishlist, setWishlist] = useLocalStorage('wishlist', []);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const addToWishlist = (product) => {
    if (!wishlist.find(item => item.id === product.id)) {
      setWishlist([...wishlist, product]);
    }
  };

  const featuredProducts = sampleProducts.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to BhabaStore</h1>
          <p className="text-xl mb-8">Discover amazing products at unbeatable prices</p>
          <button
            onClick={() => setCurrentPage('products')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(1).map(category => (
              <div
                key={category}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center"
                onClick={() => setCurrentPage('products')}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Products Page Component
const ProductsPage = () => {
  const { dispatch } = useContext(CartContext);
  const [products] = useState(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [wishlist, setWishlist] = useLocalStorage('wishlist', []);
  const [filters, setFilters] = useState({
    category: 'All',
    priceRange: { min: '', max: '' },
    rating: [],
    sortBy: 'name'
  });

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (filters.category !== 'All') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Filter by price range
    if (filters.priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseInt(filters.priceRange.min));
    }
    if (filters.priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseInt(filters.priceRange.max));
    }

    // Filter by rating
    if (filters.rating.length > 0) {
      filtered = filtered.filter(product =>
        filters.rating.some(rating => product.rating >= rating)
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        default: return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const addToWishlist = (product) => {
    if (!wishlist.find(item => item.id === product.id)) {
      setWishlist([...wishlist, product]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            categories={categories}
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Products ({filteredProducts.length})</h1>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Order Tracking Component
const OrderTrackingPage = () => {
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-06-05',
      total: 45000,
      status: 'shipped',
      items: 2,
      trackingNumber: 'TK123456789',
      estimatedDelivery: '2024-06-08'
    },
    {
      id: 'ORD-002',
      date: '2024-06-03',
      total: 12000,
      status: 'delivered',
      items: 1,
      trackingNumber: 'TK987654321',
      deliveredDate: '2024-06-06'
    }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="text-yellow-500" />;
      case 'shipped': return <Truck className="text-blue-500" />;
      case 'delivered': return <CheckCircle className="text-green-500" />;
      default: return <Package className="text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>
      
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{order.id}</h3>
                <p className="text-gray-600">Ordered on {order.date}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className="capitalize font-medium">{order.status}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="font-semibold">{formatPrice(order.total)}</p>
              </div>
              <div>
                <p className="text-gray-600">Items</p>
                <p className="font-semibold">{order.items} item(s)</p>
              </div>
              <div>
                <p className="text-gray-600">
                  {order.status === 'delivered' ? 'Delivered' : 'Expected Delivery'}
                </p>
                <p className="font-semibold">
                  {order.deliveredDate || order.estimatedDelivery}
                </p>
              </div>
            </div>
            
            {order.trackingNumber && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-mono font-semibold">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BhabaStore</h3>
            <p className="text-gray-400 mb-4">Your trusted eCommerce partner in Tanzania</p>
            <div className="flex space-x-4">
              <Facebook size={20} className="hover:text-blue-400 cursor-pointer" />
              <Twitter size={20} className="hover:text-blue-400 cursor-pointer" />
              <Instagram size={20} className="hover:text-pink-400 cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Electronics</a></li>
              <li><a href="#" className="hover:text-white">Fashion</a></li>
              <li><a href="#" className="hover:text-white">Home & Garden</a></li>
              <li><a href="#" className="hover:text-white">Sports</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <MapPin size={16} className="mr-2" />
                <span>Arusha, Tanzania</span>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span>+255 657 305 278</span>
              </div>
              <div className="flex items-center">
                <Mail size={16} className="mr-2" />
                <span>info@bhabastore.com</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BhabaStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useLocalStorage('user', null);
  const [cartState, cartDispatch] = useReducer(cartReducer, initialCartState);

  return (
    <CartContext.Provider value={{ state: cartState, dispatch: cartDispatch }}>
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          user={user}
          setUser={setUser}
        />
        
        <main>
          {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
          {currentPage === 'products' && <ProductsPage />}
          {currentPage === 'cart' && <CartPage setCurrentPage={setCurrentPage} />}
          {currentPage === 'checkout' && <CheckoutPage setCurrentPage={setCurrentPage} />}
          {currentPage === 'orders' && <OrderTrackingPage />}
          {currentPage === 'login' && <LoginPage setUser={setUser} setCurrentPage={setCurrentPage} />}
          {currentPage === 'admin' && user?.isAdmin && <AdminDashboard />}
          {currentPage === 'wishlist' && (
            <div className="container mx-auto px-4 py-8">
              <div className="text-center py-16">
                <Heart size={64} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your wishlist is empty</h2>
                <button
                  onClick={() => setCurrentPage('products')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Browse Products
                </button>
              </div>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </CartContext.Provider>
  );
};

export default App;