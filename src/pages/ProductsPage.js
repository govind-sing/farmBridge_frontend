// frontend/src/components/ProductsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, addToCart, getCart, getUserInfo, updateCartQuantity, BASE_URL } from '../apiAxios';

function ProductsPage() {
 const [products, setProducts] = useState([]);
 const [cart, setCart] = useState([]);
 const [userRole, setUserRole] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [loading, setLoading] = useState(true);
 const [loadingButtons, setLoadingButtons] = useState({});
 const [error, setError] = useState(null);
 const [quantities, setQuantities] = useState({});
 const navigate = useNavigate();

 useEffect(() => {
 const fetchData = async () => {
 try {
 setLoading(true);
 const token = localStorage.getItem('token');
 if (!token) {
 setError('Please log in to view products.');
 navigate('/auth');
 return;
 }

 const [productsRes, cartRes, userRes] = await Promise.all([
 getProducts(),
 getCart(),
 getUserInfo(),
 ]);
 setProducts(productsRes.data || []);
 setCart(cartRes.data.products || []);
 setUserRole(userRes.data.role);
 const initialQuantities = (productsRes.data || []).reduce((acc, product) => {
 acc[product._id] = 1;
 return acc;
 }, {});
 setQuantities(initialQuantities);
 setError(null);
 } catch (err) {
 const status = err.response?.status;
 if (status === 401) {
 setError('Session expired. Please log in again.');
 localStorage.removeItem('token');
 navigate('/auth');
 } else {
 setError(err.response?.data?.msg || 'Failed to load data. Please try again.');
 }
 console.error('Error fetching data:', err.response?.data || err);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, [navigate]);

 const handleQuantityChange = (productId, value, availableQuantity, cartQuantity) => {
 const sanitizedValue = value.replace(/[^0-9.]/g, '');
 let newValue;

 if (sanitizedValue === '' || sanitizedValue === '.') {
 newValue = '';
 } else {
 const parts = sanitizedValue.split('.');
 if (parts.length > 2) return;
 const parsedValue = parseFloat(sanitizedValue) || 0;
 const remainingStock = availableQuantity - (cartQuantity || 0);
 newValue = Math.max(0, Math.min(parsedValue, remainingStock));
 }

 setQuantities((prev) => ({
 ...prev,
 [productId]: newValue,
 }));
 };

 const handleAddToCart = async (productId) => {
 const quantity = parseFloat(quantities[productId]);
 const product = products.find((p) => p._id === productId);
 const availableQuantity = product?.quantity || 0;
 const cartItem = cart.find((item) => item.productId._id === productId);
 const cartQuantity = cartItem ? cartItem.quantity : 0;
 const newQuantity = cartQuantity + quantity;
 const remainingStock = availableQuantity - cartQuantity;

 if (isNaN(quantity) || quantity <= 0) {
 setError('Please enter a valid quantity greater than 0.');
 return;
 }
 if (quantity > remainingStock) {
 setError(`You cannot add more than the available quantity (${remainingStock} kg).`);
 return;
 }

 try {
 setLoadingButtons((prev) => ({ ...prev, [productId]: true }));
 if (cartItem) {
 await updateCartQuantity(productId, newQuantity);
 } else {
 await addToCart(productId, quantity);
 }
 const cartRes = await getCart();
 setCart(cartRes.data.products || []);
 setError(null);
 setQuantities((prev) => ({
 ...prev,
 [productId]: 1,
 }));
 } catch (err) {
 const status = err.response?.status;
 if (status === 401) {
 setError('Please log in to add items to cart.');
 navigate('/auth');
 } else {
 setError(err.response?.data?.msg || 'Failed to add to cart. Please try again.');
 }
 console.error('Error adding to cart:', err.response?.data || err);
 } finally {
 setLoadingButtons((prev) => ({ ...prev, [productId]: false }));
 }
 };

 const filteredProducts = products
 .filter((product) => product.quantity > 0)
 .filter((product) =>
 (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
 (product.seller?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
 );

 return (
 <div className="min-h-screen bg-gray-100 p-6">
 <h1 className="text-3xl font-bold text-gray-800 mb-6">Products</h1>

 {userRole !== 'community' && (
 <div className="mb-6">
 <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your Cart</h2>
 {cart.length === 0 ? (
 <p className="text-gray-600">Your cart is empty.</p>
 ) : (
 <ul className="list-disc pl-5">
 {cart.map((item) => (
 <li key={item.productId?._id || item._id} className="text-gray-600">
 <img
 src={`${BASE_URL}${item.productId?.image || '/Uploads/farm.jpg'}`}
 alt={item.productId.name}
 className="w-8 h-8 object-cover inline-block mr-2"
 />
 {item.productId?.name || 'Unnamed'} - {item.quantity} kg
 </li>
 ))}
 </ul>
 )}
 </div>
 )}

 <input
 type="text"
 placeholder="Search by product name or seller"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 disabled={loading}
 className="mb-6 p-2 border rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-green-500"
 />
 {loading && <p className="text-gray-600">Loading...</p>}
 {error && (
 <p className="text-red-500 mb-4 flex items-center gap-2">
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
 </svg>
 {error}
 </p>
 )}
 {!loading && !error && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredProducts.length > 0 ? (
 filteredProducts.map((product) => {
 const cartItem = cart.find((item) => item.productId._id === product._id);
 const cartQuantity = cartItem ? cartItem.quantity : 0;
 const remainingStock = product.quantity - cartQuantity;
 const inputQuantity = parseFloat(quantities[product._id]);
 const isQuantityValid = !isNaN(inputQuantity) && inputQuantity > 0 && inputQuantity <= remainingStock;

 return (
 <div
 key={product._id}
 className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 relative"
 >
 <img
 src={`${BASE_URL}${product.image || '/Uploads/farm.jpg'}`}
 alt={product.name}
 className="w-32 h-32 object-contain rounded-md float-right ml-4 mb-2"
 />
 <div className="overflow-hidden">
 <h3 className="text-xl font-semibold text-gray-700">
 {product.name || 'Unnamed Product'}
 </h3>
 <p className="text-gray-600">{product.description || 'No description available'}</p>
 <p className="text-gray-800 mt-2">
 Price: ₹{product.price || 'N/A'} | Available: {product.quantity} kg
 </p>
 <p className="text-gray-600">
 Seller: {product.seller?.name || 'Unknown'}
 </p>
 {cartQuantity > 0 && (
 <p className="text-gray-600 mt-1">
 In Cart: {cartQuantity} kg | Remaining: {remainingStock} kg
 </p>
 )}
 <div className="mt-2">
 <label htmlFor={`quantity-${product._id}`} className="text-gray-700">
 Quantity (kg):
 </label>
 <input
 type="number"
 id={`quantity-${product._id}`}
 value={quantities[product._id] || ''}
 onChange={(e) => handleQuantityChange(product._id, e.target.value, product.quantity, cartQuantity)}
 min="0"
 max={remainingStock}
 step="0.1"
 placeholder="Enter quantity"
 disabled={loading}
 className={`w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
 inputQuantity > remainingStock ? 'border-red-500' : ''
 }`}
 onKeyPress={(e) => {
 if (!/[0-9.]/.test(e.key)) {
 e.preventDefault();
 }
 }}
 />
 {inputQuantity > remainingStock && (
 <p className="text-red-500 text-sm mt-1">
 Quantity exceeds available stock ({remainingStock} kg).
 </p>
 )}
 </div>
 {userRole !== 'community' && (
 <button
 onClick={() => handleAddToCart(product._id)}
 disabled={loadingButtons[product._id] || !isQuantityValid}
 className={`mt-4 w-full p-2 rounded text-white ${
 loadingButtons[product._id]
 ? 'bg-blue-500 blink cursor-not-allowed'
 : !isQuantityValid
 ? 'bg-gray-400 cursor-not-allowed'
 : 'bg-blue-500 hover:bg-blue-600'
 } transition-colors duration-200`}
 >
 {loadingButtons[product._id] ? 'Adding...' : 'Add to Cart'}
 </button>
 )}
 </div>
 </div>
 );
 })
 ) : (
 <p className="text-gray-600">No products match your search.</p>
 )}
 </div>
 )}
 </div>
 );
}

export default ProductsPage;