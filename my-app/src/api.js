const API_BASE ='https://bhaba-web.onrender.com';



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
  const data = await handleResponse(response);

  if (!Array.isArray(data)) {
    console.warn("Expected an array, but got:", data);
    return []; // fallback to empty array
  }

  return data;
};

export const fetchAllCategories = async () => {
  const response = await fetch(`${API_BASE}/categories`);
  return handleResponse(response);
};


export const searchProducts = async (params) => {
  const queryParams = new URLSearchParams();
  
  if (params.q) queryParams.append('q', params.q);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);
  if (params.category) queryParams.append('category', params.category);
  if (params.vendor) queryParams.append('vendor', params.vendor);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice);
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
  if (params.inStock) queryParams.append('inStock', params.inStock);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  
  const response = await fetch(`${API_BASE}/search?${queryParams.toString()}`);
  return handleResponse(response);
};
