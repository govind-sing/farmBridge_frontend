import axios from 'axios';

// Set base URL using env or fallback for dev
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token & clean headers for multipart/form-data
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ---------- API METHODS ----------

export const getProducts = () => api.get('/product');
export const addToCart = (productId, quantity) => api.post('/cart/add', { productId, quantity });
export const getCart = () => api.get('/cart');
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const getUserInfo = () => api.get('/auth/me');
export const listProduct = (data) => api.post('/product', data);
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const identifyPlant = (formData) =>
  api.post('/plant/identify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const detectDisease = (formData) =>
  api.post('/plant/disease', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getFoodInfo = (query) => api.post('/food/info', { query });
export const updateCartQuantity = (productId, quantity) =>
  api.put('/cart/update', { productId, quantity });
export const checkout = (paymentMethod) => api.post('/order/checkout', { paymentMethod });
export const getOrders = () => api.get('/order/seller');
export const getBuyerOrders = () => api.get('/order/myorders');
export const markOrderAsDone = (orderId) => api.put(`/order/mark-done/${orderId}`);
export const updateAddress = (address) => api.put('/auth/update-address', { address });
export const getSellerProducts = () => api.get('/product/seller');
export const updateProduct = (productId, productData) =>
  api.put(`/product/${productId}`, productData);

// Export baseURL if you need it elsewhere (e.g., images)
export { BASE_URL };
export default api;
