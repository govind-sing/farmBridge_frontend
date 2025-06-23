import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, getUserInfo, logout, updateCartQuantity, getOrders, getBuyerOrders, markOrderAsDone, listProduct, updateAddress, getSellerProducts, updateProduct, BASE_URL } from '../apiAxios';

const OrderCard = ({ order, formatPaymentMethod, isSeller = false, onMarkAsDone, loadingButtons }) => {
  const sellerAmount = order.products.reduce((total, product) => {
    const price = product.productId?.price || 0;
    const quantity = product.quantity || 0;
    return total + price * quantity;
  }, 0).toFixed(2);

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-xl transition-all">
      <h3 className="text-lg font-semibold text-gray-800">Order ID: {order._id.slice(-6)}</h3>
      {isSeller && (
        <>
          <p className="text-gray-600">Buyer: {order.buyer?.name || 'Unknown'}</p>
          <p className="text-gray-600">Address: {order.buyerAddress || 'Not provided'}</p>
        </>
      )}
      <p className="text-gray-600">Total: ₹{isSeller ? sellerAmount : order.totalAmount?.toFixed(2) || 'N/A'}</p>
      <p className="text-gray-600">
        Status: <span className={`font-medium ${order.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>{order.status}</span>
      </p>
      <p className="text-gray-600">Payment: {formatPaymentMethod(order.paymentMethod)}</p>
      <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
      <div className="mt-2">
        <h4 className="text-sm font-semibold text-gray-700">Items:</h4>
        <ul className="list-disc pl-5 text-gray-600">
          {order.products.map((product, index) => (
            <li key={index}>
              {product.productId?.name || 'Unnamed'} - {product.quantity} kg - ₹{product.productId?.price || 'N/A'}
            </li>
          ))}
        </ul>
      </div>
      {isSeller && order.status === 'pending' && (
        <button
          onClick={() => onMarkAsDone(order._id)}
          disabled={loadingButtons[order._id]}
          className={`mt-2 w-full px-3 py-1 bg-blue-500 text-white rounded ${loadingButtons[order._id] ? 'blink opacity-50' : 'hover:bg-blue-600'} transition-colors`}
        >
          {loadingButtons[order._id] ? 'Processing...' : 'Mark as Done'}
        </button>
      )}
    </div>
  );
};

function ProfilePage() {
  const [cart, setCart] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // For initial page load and non-cart operations
  const [loadingButtons, setLoadingButtons] = useState({}); // For per-button loading
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [address, setAddress] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showFulfilledOrders, setShowFulfilledOrders] = useState(false);
  const [showBuyingHistory, setShowBuyingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Please log in to view your profile.');

        const [cartRes, userRes] = await Promise.all([getCart(), getUserInfo()]);
        setCart(cartRes.data.products || []);
        setUserInfo(userRes.data);
        setAddress(userRes.data.address || '');

        if (userRes.data.role === 'community') {
          const [ordersRes, productsRes] = await Promise.all([getOrders(), getSellerProducts()]);
          setOrders(ordersRes.data || []);
          setSellerProducts(productsRes.data || []);
        } else if (userRes.data.role === 'buyer') {
          const buyerOrdersRes = await getBuyerOrders();
          setBuyerOrders(buyerOrdersRes.data || []);
        }

        setError(null);
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.msg || err.message || 'Failed to load profile data.';
        if (status === 401 || message === 'Please log in to view your profile.') {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/auth');
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(async () => {
      if (userInfo?.role === 'community') {
        setRefreshing(true);
        try {
          const [ordersRes, productsRes] = await Promise.all([getOrders(), getSellerProducts()]);
          setOrders(ordersRes.data || []);
          setSellerProducts(productsRes.data || []);
        } catch (err) {
          console.error('Error refreshing orders:', err);
        }
        setTimeout(() => setRefreshing(false), 1000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate, userInfo?.role]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      localStorage.removeItem('token');
      navigate('/auth');
    } catch (err) {
      setError('Error logging out. Please try again.');
      console.error('Error logging out:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, delta) => {
    const item = cart.find((item) => item.productId._id === productId);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + delta);
    try {
      setLoadingButtons((prev) => ({ ...prev, [productId]: true }));
      const response = await updateCartQuantity(productId, newQuantity);
      setCart(response.data.products || []);
      setError(null);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.msg || 'Failed to update quantity.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleCheckout = () => navigate('/payment');

  const handleRemoveFromCart = async (productId) => {
    try {
      setLoadingButtons((prev) => ({ ...prev, [productId]: true }));
      const response = await removeFromCart(productId);
      setCart(response.data.products || []);
      setError(null);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.msg || 'Failed to remove item.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleMarkAsDone = async (orderId) => {
    try {
      setLoadingButtons((prev) => ({ ...prev, [orderId]: true }));
      await markOrderAsDone(orderId);
      setOrders(orders.map((order) =>
        order._id === orderId ? { ...order, status: 'completed' } : order
      ));
      setError(null);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.msg || 'Failed to mark order as done.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', parseFloat(newProduct.price));
      formData.append('quantity', parseInt(newProduct.quantity, 10));
      formData.append('description', newProduct.description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await listProduct(formData);
      setSellerProducts([...sellerProducts, response.data.product]);
      setNewProduct({ name: '', price: '', quantity: '', description: '' });
      setImageFile(null);
      setError(null);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.msg || 'Failed to add product.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateAddress(address);
      setUserInfo({ ...userInfo, address });
      setError(null);
      setShowAddressModal(false);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.msg || 'Failed to update address.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct({ id: product._id, price: product.price, quantity: product.quantity });
  };

  const handleUpdateProduct = async (productId) => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (editProduct.price !== undefined) {
        formData.append('price', parseFloat(editProduct.price));
      }
      if (editProduct.quantity !== undefined) {
        formData.append('quantity', parseInt(editProduct.quantity, 10));
      }
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      const response = await updateProduct(productId, formData);
      setSellerProducts(sellerProducts.map((p) =>
        p._id === productId ? response.data.product : p
      ));
      setEditProduct(null);
      setEditImageFile(null);
      setError(null);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.msg || 'Failed to update product.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.productId.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0).toFixed(2);
  };

  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'cash': return 'Cash';
      case 'upi': return 'UPI';
      default: return 'Unknown';
    }
  };

  const unfulfilledOrders = orders.filter((order) => order.status === 'pending');
  const fulfilledOrders = orders
    .filter((order) => order.status === 'completed')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
  const last10BuyerOrders = buyerOrders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-4 md:p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
          Welcome, {userInfo?.name || 'User'}
        </h1>
        <div className="relative flex items-center gap-2">
          {userInfo?.role === 'community' && (
            <span
              className={`w-2 h-2 rounded-full ${refreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
              title="Checking for new orders"
            />
          )}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v.01M12 12v.01M12 18v.01" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-200 animate-in fade-in duration-200">
              <button
                onClick={() => { setShowAddressModal(true); setShowMenu(false); }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Change Address
              </button>
              {userInfo?.role === 'community' && (
                <button
                  onClick={() => { setShowFulfilledOrders(!showFulfilledOrders); setShowMenu(false); }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {showFulfilledOrders ? 'Hide Fulfilled Orders' : 'View Fulfilled Orders'}
                </button>
              )}
              {userInfo?.role === 'buyer' && (
                <button
                  onClick={() => { setShowBuyingHistory(!showBuyingHistory); setShowMenu(false); }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {showBuyingHistory ? 'Hide Buying History' : 'View Buying History'}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-95 animate-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Update Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleUpdateAddress}>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter your full address"
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400 blink' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                >
                  {loading ? 'Updating...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error} {error.includes('log in') && (
              <button onClick={() => navigate('/auth')} className="text-blue-600 hover:underline">Login here</button>
            )}
          </div>
        )}

        {!loading && !error && userInfo && (
          <>
            <button
              onClick={handleLogout}
              disabled={loading}
              className={`w-full md:w-auto px-6 py-2 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400 blink' : 'bg-red-600 hover:bg-red-700'} transition-colors shadow-md`}
            >
              {loading ? 'Processing...' : 'Logout'}
            </button>

            {userInfo.role === 'buyer' && (
              <div className="space-y-6">
                <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Your Cart</h2>
                  {cart.length === 0 ? (
                    <p className="text-gray-600 text-center">Your cart is empty.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cart.map((item) => (
                        <div key={item.productId._id} className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-xl transition-all">
                          <img
                            src={`${BASE_URL}${item.productId.image || '/Uploads/farm.jpg'}`}
                            alt={item.productId.name}
                            className="w-24 h-24 object-cover rounded-md mb-2"
                          />
                          <h3 className="text-lg font-semibold text-gray-800">{item.productId.name || 'Unnamed'}</h3>
                          <p className="text-gray-600">Price: ₹{item.productId.price || 'N/A'}</p>
                          <p className="text-gray-600">Subtotal: ₹{(item.productId.price * item.quantity).toFixed(2)}</p>
                          <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleQuantityChange(item.productId._id, -1)}
                                disabled={loadingButtons[item.productId._id]}
                                className={`px-3 py-1 bg-gray-200 rounded-l-md ${loadingButtons[item.productId._id] ? 'blink opacity-50' : 'hover:bg-gray-300'} transition-colors`}
                              >
                                -
                              </button>
                              <span className="px-4 py-1 bg-gray-100 rounded">{item.quantity} kg</span>
                              <button
                                onClick={() => handleQuantityChange(item.productId._id, 1)}
                                disabled={loadingButtons[item.productId._id]}
                                className={`px-3 py-1 bg-gray-200 rounded-r-md ${loadingButtons[item.productId._id] ? 'blink opacity-50' : 'hover:bg-gray-300'} transition-colors`}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item.productId._id)}
                              disabled={loadingButtons[item.productId._id]}
                              className={`w-full sm:w-auto px-3 py-1 bg-red-500 text-white rounded ${loadingButtons[item.productId._id] ? 'blink opacity-50' : 'hover:bg-red-600'} transition-colors`}
                            >
                              {loadingButtons[item.productId._id] ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {cart.length > 0 && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md">
                      <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>
                      <p className="text-gray-600">Total Items: {cart.length}</p>
                      <p className="text-gray-800 font-bold">Total: ₹{calculateTotal()}</p>
                      <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className={`mt-4 w-full px-6 py-2 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400 blink' : 'bg-green-600 hover:bg-green-700'} transition-colors`}
                      >
                        {loading ? 'Processing...' : 'Checkout'}
                      </button>
                    </div>
                  )}
                </section>

                {showBuyingHistory && (
                  <section id="buying-history" className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Buying History (Last 10)</h2>
                    {last10BuyerOrders.length === 0 ? (
                      <p className="text-gray-600 text-center">No past orders.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {last10BuyerOrders.map((order) => (
                          <OrderCard
                            key={order._id}
                            order={order}
                            formatPaymentMethod={formatPaymentMethod}
                            loadingButtons={loadingButtons}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}

            {userInfo.role === 'community' && (
              <div className="space-y-6">
                <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Your Products</h2>
                  {sellerProducts.length === 0 ? (
                    <p className="text-gray-600 text-center">No products listed.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sellerProducts.map((product) => (
                        <div key={product._id} className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-xl transition-all">
                          <img
                            src={`${BASE_URL}${product.image || '/Uploads/farm.jpg'}`}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-md mb-2"
                          />
                          <h3 className="text-lg font-semibold text-gray-800">{product.name || 'Unnamed'}</h3>
                          <p className="text-gray-600">{product.description || 'No description'}</p>
                          {editProduct && editProduct.id === product._id ? (
                            <div className="mt-2 space-y-2">
                              <input
                                type="number"
                                value={editProduct.price}
                                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                                placeholder="Price (₹)"
                              />
                              <input
                                type="number"
                                value={editProduct.quantity}
                                onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                placeholder="Quantity (kg)"
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditImageFile(e.target.files[0])}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateProduct(product._id)}
                                  disabled={loading}
                                  className={`flex-1 px-3 py-1 bg-blue-500 text-white rounded ${loading ? 'blink opacity-50' : 'hover:bg-blue-600'} transition-colors`}
                                >
                                  {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditProduct(null)}
                                  disabled={loading}
                                  className={`flex-1 px-3 py-1 bg-gray-300 rounded ${loading ? 'blink opacity-50' : 'hover:bg-gray-400'} transition-colors`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <p className="text-gray-600">Price: ₹{product.price || 'N/A'}</p>
                              <p className="text-gray-600">Quantity: {product.quantity || 0} kg</p>
                              <button
                                onClick={() => handleEditProduct(product)}
                                disabled={loading}
                                className={`mt-2 w-full px-3 py-1 bg-green-500 text-white rounded ${loading ? 'blink opacity-50' : 'hover:bg-green-600'} transition-colors`}
                              >
                                {loading ? 'Processing...' : 'Edit'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Orders to Fulfill</h2>
                  {unfulfilledOrders.length === 0 ? (
                    <p className="text-gray-600 text-center">No orders to fulfill.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unfulfilledOrders.map((order) => (
                        <OrderCard
                          key={order._id}
                          order={order}
                          formatPaymentMethod={formatPaymentMethod}
                          isSeller={true}
                          onMarkAsDone={handleMarkAsDone}
                          loadingButtons={loadingButtons}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {showFulfilledOrders && (
                  <section id="fulfilled-orders" className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Fulfilled Orders (Last 10)</h2>
                    {fulfilledOrders.length === 0 ? (
                      <p className="text-gray-600 text-center">No fulfilled orders.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fulfilledOrders.map((order) => (
                          <OrderCard
                            key={order._id}
                            order={order}
                            formatPaymentMethod={formatPaymentMethod}
                            isSeller={true}
                            loadingButtons={loadingButtons}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Add New Product</h2>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Product Name"
                      required
                    />
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Price (₹)"
                      min="0"
                      step="0.01"
                      required
                    />
                    <input
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Quantity (kg)"
                      min="1"
                      required
                    />
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description (Optional)"
                      rows="3"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full px-6 py-2 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400 blink' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                    >
                      {loading ? 'Adding...' : 'Add Product'}
                    </button>
                  </form>
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;