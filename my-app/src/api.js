const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : '/api';

export const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.message || 'Network response was not ok');
    } else {
      const text = await response.text();
      throw new Error(text || 'Network response was not ok');
    }
  }

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

export const fetchProductById = async (id) => {
  const allProducts = await fetchAllProducts();
  return allProducts.find(p => p.id === id);
};

export const fetchVendors = async () => {
  const response = await fetch(`${API_BASE}/vendors`);
  return handleResponse(response);
};

export const fetchVendor = async (vendorId) => {
  const response = await fetch(`${API_BASE}/vendors/${vendorId}`);
  return handleResponse(response);
};

export const fetchVendorCategories = async (vendorId) => {
  const response = await fetch(`${API_BASE}/vendors/${vendorId}/categories`);
  return handleResponse(response);
};

export const fetchVendorProducts = async (vendorId) => {
  const response = await fetch(`${API_BASE}/vendors/${vendorId}/products`);
  return handleResponse(response);
};

export const fetchCategoryProducts = async (vendorId, categoryId) => {
  const response = await fetch(
    `${API_BASE}/vendors/${vendorId}/categories/${categoryId}/products`
  );
  return handleResponse(response);
};

export const fetchAllProducts = async () => {
  const response = await fetch(`${API_BASE}/products`);
  return handleResponse(response);
};