import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkout, getCart } from '../apiAxios';

function PaymentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // For processing state
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // For success message
  const [cart, setCart] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [skippedItems, setSkippedItems] = useState([]); // To display skipped items

  // Fetch cart data on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();
        setCart(response.data.products || []);
      } catch (err) {
        setError('Failed to load cart. Please try again.');
        console.error('Error fetching cart:', err);
      }
    };
    fetchCart();
  }, []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.productId?.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0).toFixed(2);
  };

  const initiatePayment = async (method) => {
    setError(null);
    setSkippedItems([]); // Reset skipped items

    // Check if the payment method is supported
    if (method === 'credit_card' || method === 'upi') {
      setError('Payment method not yet supported');
      return;
    }

    // Proceed with Cash on Delivery
    setLoading(true); // Start processing state
    try {
      const response = await checkout(method);
      setOrderDetails(response.data);
      if (response.data.skippedItems) {
        setSkippedItems(response.data.skippedItems); // Set skipped items if any
      }

      // Simulate processing delay for Cash on Delivery
      setTimeout(() => {
        setLoading(false);
        setPaymentStatus('success'); // Show success message
        // Redirect after showing success message
        setTimeout(() => {
          navigate('/profile', { state: { paymentSuccess: true } });
        }, 2000); // Show success message for 2 seconds
      }, 1500); // 1.5-second processing delay
    } catch (err) {
      setError(err.response?.data?.msg || 'Order placement failed. Please try again.');
      setLoading(false);
      console.error('Error during checkout:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Payment</h1>

        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Summary</h2>
            <ul className="space-y-2">
              {cart.map((item) => (
                <li key={item.productId._id} className="flex justify-between text-gray-600">
                  <span>
                    {item.productId.name} ({item.quantity} kg)
                  </span>
                  <span>₹{(item.productId.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-gray-800 font-bold text-right">
              Total: ₹{calculateTotal()}
            </p>
          </div>
        )}

        {/* Display Total Amount from orderDetails after initiating payment */}
        {orderDetails && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-gray-700 font-semibold">
              Amount to Pay: ₹{orderDetails.totalAmount.toFixed(2)}
            </p>
          </div>
        )}

        {/* Payment Methods */}
        <div className="space-y-4">
          <button
            onClick={() => initiatePayment('credit_card')}
            disabled={cart.length === 0}
            className={`w-full bg-blue-500 text-white p-3 rounded-lg font-semibold ${
              cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            } transition-colors duration-200`}
          >
            Credit Card
          </button>
          <button
            onClick={() => initiatePayment('cash')}
            disabled={loading || cart.length === 0}
            className={`w-full bg-blue-500 text-white p-3 rounded-lg font-semibold ${
              loading || cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            } transition-colors duration-200`}
          >
            {loading ? 'Processing...' : 'Cash on Delivery'}
          </button>
          <button
            onClick={() => initiatePayment('upi')}
            disabled={cart.length === 0}
            className={`w-full bg-blue-500 text-white p-3 rounded-lg font-semibold ${
              cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            } transition-colors duration-200`}
          >
            Pay with UPI
          </button>
        </div>

        {/* Processing Feedback */}
        {loading && (
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-2 text-gray-600">Processing your order...</p>
          </div>
        )}

        {/* Success Feedback */}
        {paymentStatus === 'success' && (
          <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg text-center">
            Order successful! Redirecting to profile...
          </div>
        )}

        {/* Skipped Items Warning (if any) */}
        {skippedItems.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
            <p className="font-semibold">Some items were skipped due to stock issues:</p>
            <ul className="list-disc pl-5 mt-2">
              {skippedItems.map((item, index) => (
                <li key={index}>
                  {item.name}: {item.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
            {error.includes('Insufficient stock') && (
              <button
                onClick={() => navigate('/cart')}
                className="ml-2 text-blue-600 hover:underline"
              >
                Adjust Cart
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;