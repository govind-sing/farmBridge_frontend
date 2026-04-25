// frontend/src/pages/CartPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, getUserInfo, BASE_URL } from '../apiAxios';

const T = {
  sage: '#4a7c59',
  sageLight: '#e8f0e9',
  leaf: '#2d5a3d',
  earth: '#7c5c3e',
  earthLight: '#f2ebe3',
  cream: '#faf8f4',
  bark: '#3d2e1e',
  mist: '#f5f7f3',
  stone: '#8a9180',
  pebble: '#d4d9ce',
  white: '#ffffff',
  red: '#c0392b',
  redLight: '#fdf0ee',
};

const font = {
  display: "'Fraunces', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.cream}; font-family: ${font.body}; color: ${T.bark}; -webkit-font-smoothing: antialiased; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px);} to { opacity: 1; transform: translateY(0);} }
    .fade-up { animation: fadeUp .35s ease both; }
    .btn-primary:hover { background: ${T.sage} !important; }
  `}</style>
);

const ErrorBanner = ({ msg, onClose }) => (
  <div
    style={{
      background: T.redLight,
      border: '1px solid #f5c6c2',
      borderRadius: 12,
      padding: '12px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 14,
      color: T.red,
    }}
  >
    <span style={{ flex: 1 }}>{msg}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.stone, fontSize: 18, lineHeight: 1 }}>
      ✕
    </button>
  </div>
);

function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your cart.');
          navigate('/auth');
          return;
        }

        const [cartRes, userRes] = await Promise.all([getCart(), getUserInfo()]);
        setCart(cartRes.data.products || []);
        setUserRole(userRes.data.role);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/auth');
        } else {
          setError(err.response?.data?.msg || 'Failed to load cart.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * (item.productId?.price || 0), 0);
  const deliveryCharge = cartTotal > 500 ? 0 : 50;
  const finalTotal = cartTotal + deliveryCharge;

  const handleCheckout = () => {
    if (cart.length === 0) {
      setError('Your cart is empty. Add items before checkout.');
      return;
    }
    navigate('/payment');
  };

  if (userRole === 'community') {
    return (
      <div style={{ minHeight: '100vh', background: T.cream, fontFamily: font.body, padding: '32px 24px' }}>
        <GlobalStyles />
        <div style={{ maxWidth: 920, margin: '0 auto', background: T.white, border: `1px solid ${T.pebble}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontFamily: font.display, marginBottom: 8 }}>Cart Not Available</h2>
          <p style={{ color: T.stone }}>Community users cannot access cart and checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.cream, fontFamily: font.body }}>
      <GlobalStyles />

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(250,248,244,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${T.pebble}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 600, color: T.bark, lineHeight: 1.1 }}>FarmBridge Cart</h1>
            <p style={{ fontSize: 11, color: T.stone, marginTop: 1 }}>Fresh from farm to table</p>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              border: `1.5px solid ${T.sage}`,
              borderRadius: 12,
              background: 'transparent',
              color: T.sage,
              padding: '9px 14px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: font.body,
            }}
          >
            Continue shopping
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 56px' }}>
        {error && <ErrorBanner msg={error} onClose={() => setError(null)} />}

        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>
          <div className="cart-layout-left fade-up" style={{ background: T.white, border: `1px solid ${T.pebble}`, borderRadius: 16, padding: 18 }}>
            <h2 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 600, color: T.bark, marginBottom: 8 }}>Your Items</h2>
            <p style={{ fontSize: 13, color: T.stone, marginBottom: 16 }}>
              Review items in your basket before checkout.
            </p>

            {loading ? (
              <p style={{ color: T.stone, fontSize: 13 }}>Loading cart...</p>
            ) : cart.length === 0 ? (
              <div style={{ background: T.mist, border: `1px dashed ${T.pebble}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
                <p style={{ fontSize: 14, color: T.stone }}>Your cart is empty</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {cart.map((item, idx) => (
                  <div
                    key={item.productId?._id || item._id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      border: `1px solid ${T.pebble}`,
                      background: T.mist,
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <img
                      src={`${BASE_URL}${item.productId?.image || '/Uploads/farm.jpg'}`}
                      alt={item.productId?.name || 'Product'}
                      style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, color: T.bark, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.productId?.name || 'Unnamed'}
                      </p>
                      <p style={{ fontSize: 11, color: T.stone, marginTop: 2 }}>
                        {item.quantity} kg × ₹{item.productId?.price || 0}
                      </p>
                    </div>
                    <p style={{ fontFamily: font.display, fontSize: 16, color: T.leaf, fontWeight: 600 }}>
                      ₹{(item.quantity * (item.productId?.price || 0)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="cart-layout-right fade-up" style={{ alignSelf: 'start' }}>
            <div
              style={{
                position: 'sticky',
                top: 90,
                background: T.white,
                borderRadius: 18,
                border: `1px solid ${T.pebble}`,
                padding: '20px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${T.pebble}` }}>
                <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.bark }}>Cart Summary</p>
                <span style={{ marginLeft: 'auto', background: T.sageLight, color: T.leaf, fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 20 }}>
                  {cart.length} items
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: T.stone }}>Subtotal</span>
                  <span style={{ fontWeight: 500, color: T.bark }}>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: T.stone }}>Delivery</span>
                  <span style={{ fontWeight: 500, color: deliveryCharge === 0 ? T.leaf : T.bark }}>
                    {deliveryCharge === 0 ? 'FREE ✓' : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 ? (
                  <p style={{ fontSize: 11, color: T.stone, textAlign: 'center', background: T.mist, borderRadius: 8, padding: '6px 8px' }}>
                    Add ₹{Math.max(0, 500 - cartTotal).toFixed(0)} more for free delivery
                  </p>
                ) : (
                  <p style={{ fontSize: 11, color: T.leaf, textAlign: 'center', background: T.sageLight, borderRadius: 8, padding: '6px 8px', fontWeight: 500 }}>
                    ✓ Free delivery on orders above ₹500
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.sageLight, borderRadius: 12, padding: '12px 14px', marginTop: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.bark }}>Total</span>
                  <span style={{ fontFamily: font.display, fontSize: 24, fontWeight: 600, color: T.leaf }}>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ background: T.earthLight, borderRadius: 10, padding: '10px 12px', marginBottom: 14, border: '1px solid #e0d5c8' }}>
                {['🔒 Secure checkout', '🌿 Fresh quality guarantee', '♻️ Eco-friendly packaging'].map((t) => (
                  <p key={t} style={{ fontSize: 11, color: T.earth, marginBottom: 4, fontWeight: 400 }}>
                    {t}
                  </p>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={handleCheckout}
                disabled={cart.length === 0}
                style={{
                  width: '100%',
                  padding: '13px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: cart.length === 0 ? T.pebble : T.leaf,
                  color: cart.length === 0 ? T.stone : T.white,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: font.body,
                  transition: 'background .2s',
                }}
              >
                Proceed to checkout
              </button>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .cart-layout-left { margin-right: 340px; }
          .cart-layout-right { position: fixed; right: 24px; top: 92px; width: 300px; }
        }
      `}</style>
    </div>
  );
}

export default CartPage;
