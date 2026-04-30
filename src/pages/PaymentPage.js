// Minimalist Payment Page Redesign
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkout, getCart } from '../apiAxios';

function PaymentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [skippedItems, setSkippedItems] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();
        setCart(response.data.products || []);
      } catch (err) {
        setError('Failed to load cart');
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
    setSkippedItems([]);

    if (method === 'credit_card' || method === 'upi') {
      setError('Payment method not supported yet');
      return;
    }

    setLoading(true);
    try {
      const response = await checkout(method);
      setOrderDetails(response.data);
      if (response.data.skippedItems) {
        setSkippedItems(response.data.skippedItems);
      }

      setTimeout(() => {
        setLoading(false);
        setPaymentStatus('success');
        setTimeout(() => {
          navigate('/', { state: { paymentSuccess: true } });
        }, 2000);
      }, 1200);

    } catch (err) {
      setError('Order failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6">

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Payment
        </h1>

        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              Order Summary
            </h2>

            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.productId._id} className="flex justify-between text-sm text-gray-700">
                  <span>{item.productId.name} × {item.quantity}</span>
                  <span>₹{(item.productId.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t mt-3 pt-3 flex justify-between font-medium text-gray-900">
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>
        )}

        {/* Amount */}
        {orderDetails && (
          <div className="mb-4 text-center text-sm text-gray-600">
            Payable: ₹{orderDetails.totalAmount.toFixed(2)}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          
          <button
            onClick={() => initiatePayment('credit_card')}
            disabled
            className="w-full border border-gray-300 text-gray-400 py-2 rounded-lg text-sm cursor-not-allowed"
          >
            Credit Card (coming soon)
          </button>

          <button
            onClick={() => initiatePayment('cash')}
            disabled={loading || cart.length === 0}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-40"
          >
            {loading ? 'Processing...' : 'Cash on Delivery'}
          </button>

          <button
            onClick={() => initiatePayment('upi')}
            disabled
            className="w-full border border-gray-300 text-gray-400 py-2 rounded-lg text-sm cursor-not-allowed"
          >
            UPI (coming soon)
          </button>

        </div>

        {/* Feedback */}
        {paymentStatus === 'success' && (
          <p className="mt-5 text-center text-green-600 text-sm">
            Order placed successfully
          </p>
        )}

        {error && (
          <p className="mt-5 text-center text-red-500 text-sm">
            {error}
          </p>
        )}

        {skippedItems.length > 0 && (
          <div className="mt-5 text-sm text-yellow-600">
            Some items were unavailable.
          </div>
        )}

      </div>
    </div>
  );
}

export default PaymentPage;