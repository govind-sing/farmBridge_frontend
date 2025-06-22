// frontend/src/apiAxios.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

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
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    console.error('API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getProducts = () => api.get('/product');
export const addToCart = (productId, quantity) => api.post('/cart/add', { productId, quantity });
export const getCart = () => api.get('/cart');
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const getUserInfo = () => api.get('/auth/me');
export const listProduct = (data) => api.post('/product/', data);
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
export const getOrders = () => api.get('/order/seller'); // For seller orders
export const getBuyerOrders = () => api.get('/order/myorders'); // For buyer orders
export const markOrderAsDone = (orderId) => api.put(`/order/mark-done/${orderId}`);
export const updateAddress = (address) => api.put('/auth/update-address', { address });
export const getSellerProducts = () => api.get('/product/seller');
export const updateProduct = (productId, productData) => api.put(`/product/${productId}`, productData);

export default api;