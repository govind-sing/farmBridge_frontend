// frontend/src/pages/FarmerProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {  BASE_URL } from '../apiAxios';

// ── Design tokens (shared with rest of app) ──────────────────────────────────
const T = {
  sage: '#4a7c59', sageMid: '#6a9e78', sageLight: '#e8f0e9',
  leaf: '#2d5a3d', earth: '#7c5c3e', earthLight: '#f2ebe3',
  cream: '#faf8f4', bark: '#3d2e1e', harvest: '#c8863a',
  harvestLight: '#fdf0e0', mist: '#f5f7f3', stone: '#8a9180',
  pebble: '#d4d9ce', white: '#ffffff', red: '#c0392b', redLight: '#fdf0ee',
  // Profile page extras
  heroTop: '#1a3326',
  heroBotom: '#2d5a3d',
};
const font = {
  display: "'Fraunces', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
};

// ── Axios instance ────────────────────────────────────────────────────────────
const authApi = () =>
  axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

// ════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ════════════════════════════════════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.cream}; font-family: ${font.body}; color: ${T.bark}; -webkit-font-smoothing: antialiased; }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes shimmer  { 0%,100%{opacity:.35;} 50%{opacity:.75;} }
    @keyframes pulse    { 0%,100%{opacity:1;} 50%{opacity:.45;} }
    @keyframes heroSlide { from { transform: translateY(-6px); opacity:.7; } to { transform: translateY(0); opacity:1; } }
    @keyframes avatarPop { 0%{transform:scale(.85);opacity:0;} 60%{transform:scale(1.04);} 100%{transform:scale(1);opacity:1;} }
    @keyframes badgeFade { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }

    .fu  { animation: fadeUp  .42s ease both; }
    .fu1 { animation: fadeUp  .42s .08s ease both; }
    .fu2 { animation: fadeUp  .42s .16s ease both; }
    .fu3 { animation: fadeUp  .42s .24s ease both; }
    .fu4 { animation: fadeUp  .42s .32s ease both; }

    .product-card { transition: transform .22s ease, box-shadow .22s ease; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(45,90,61,.13); }

    .add-btn { transition: background .18s, transform .12s; }
    .add-btn:hover:not(:disabled) { background: ${T.sage} !important; transform: scale(1.02); }
    .add-btn:active:not(:disabled) { transform: scale(.98); }

    .back-btn:hover { background: rgba(255,255,255,.18) !important; }
    .filter-chip { transition: background .15s, color .15s, border-color .15s; cursor: pointer; }
    .filter-chip:hover { border-color: ${T.sageMid} !important; }
    .filter-chip.active { background: ${T.leaf} !important; color: ${T.white} !important; border-color: ${T.leaf} !important; }

    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
    input[type=number] { -moz-appearance:textfield; }

    .qty-btn:hover { background: ${T.sageLight} !important; }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${T.pebble}; border-radius: 10px; }
  `}</style>
);

// ════════════════════════════════════════════════════════════════════════════
// SMALL ATOMS
// ════════════════════════════════════════════════════════════════════════════
const Stars = ({ rating = 0, size = 11 }) => (
  <span style={{ display: 'inline-flex', gap: 1 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i <= Math.round(rating) ? T.harvest : T.pebble}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </span>
);

const Skeleton = ({ h = 16, w = '100%', r = 8, mb = 0 }) => (
  <div style={{ height: h, width: w, borderRadius: r, background: T.mist, animation: 'shimmer 1.4s infinite', marginBottom: mb }} />
);

const StatPill = ({ label, value, accent }) => (
  <div style={{ textAlign: 'center', padding: '12px 18px', background: 'rgba(255,255,255,.1)', borderRadius: 14, border: '1px solid rgba(255,255,255,.15)', backdropFilter: 'blur(6px)' }}>
    <p style={{ fontFamily: font.display, fontSize: 22, fontWeight: 600, color: T.white, lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 4, letterSpacing: '.4px' }}>{label}</p>
  </div>
);

// ── Quantity stepper ─────────────────────────────────────────────────────────
const QtyStepper = ({ value, onChange, max }) => (
  <div style={{ display: 'flex', alignItems: 'center', background: T.mist, borderRadius: 9, border: `1px solid ${T.pebble}`, overflow: 'hidden', height: 34 }}>
    <button className="qty-btn"
      onClick={() => onChange(Math.max(0.1, parseFloat((value - 0.1).toFixed(1))))}
      style={{ width: 30, height: '100%', background: 'transparent', border: 'none', fontSize: 17, fontWeight: 300, color: T.sage, cursor: 'pointer', transition: 'background .15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
    <input type="number" value={value} min="0.1" max={max} step="0.1"
      onChange={e => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v) && v > 0 && v <= max) onChange(parseFloat(v.toFixed(1)));
      }}
      style={{ width: 52, height: '100%', background: 'transparent', border: 'none', textAlign: 'center', fontSize: 13, fontWeight: 500, color: T.bark, fontFamily: font.body }} />
    <span style={{ fontSize: 11, color: T.stone, paddingRight: 4 }}>kg</span>
    <button className="qty-btn"
      onClick={() => onChange(Math.min(max, parseFloat((value + 0.1).toFixed(1))))}
      style={{ width: 30, height: '100%', background: 'transparent', border: 'none', fontSize: 17, fontWeight: 300, color: T.sage, cursor: 'pointer', transition: 'background .15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// PRODUCT CARD (farmer profile variant)
// ════════════════════════════════════════════════════════════════════════════
const FarmerProductCard = ({ product, cart, userRole, onAddToCart, loadingButtons, delay = 0 }) => {
  const cartItem  = cart.find(i => i.productId._id === product._id);
  const cartQty   = cartItem ? cartItem.quantity : 0;
  const remaining = product.quantity - cartQty;
  const [qty, setQty] = useState(1);
  const isLoading = loadingButtons[product._id];
  const outOfStock = remaining <= 0;
  const isLowStock = remaining > 0 && remaining <= 5;
  const imgSrc = `${BASE_URL}${product.image || '/Uploads/farm.jpg'}`;
  const canCart = userRole !== 'community' && !outOfStock;

  return (
    <div className="product-card fu" style={{
      animationDelay: `${delay}s`,
      background: T.white, borderRadius: 18,
      overflow: 'hidden', border: `1px solid ${T.pebble}`,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: T.sageLight, flexShrink: 0 }}>
        <img src={imgSrc} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* badges */}
        <span style={{ position: 'absolute', top: 10, left: 10, background: T.leaf, color: T.white, fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 20 }}>
          Organic
        </span>
        {outOfStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(61,46,30,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: T.bark, color: T.white, fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 20 }}>Out of stock</span>
          </div>
        )}
        {isLowStock && !outOfStock && (
          <span style={{ position: 'absolute', bottom: 10, left: 10, background: T.harvest, color: T.white, fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 20 }}>
            Only {remaining} kg left
          </span>
        )}
        {cartQty > 0 && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: T.white, color: T.leaf, fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, border: `1px solid ${T.pebble}` }}>
            {cartQty} kg in cart
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <h3 style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: T.bark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
            {product.name}
          </h3>
          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Stars rating={product.averageRating || 0} size={11} />
            {product.averageRating > 0
              ? <span style={{ fontSize: 11, fontWeight: 600, color: T.bark }}>{product.averageRating.toFixed(1)}</span>
              : null
            }
            <span style={{ fontSize: 11, color: T.stone }}>
              {product.totalRatings > 0 ? `(${product.totalRatings})` : 'No ratings yet'}
            </span>
          </div>
        </div>

        {product.description && (
          <p style={{ fontSize: 12, color: T.stone, lineHeight: 1.55, fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: font.display, fontSize: 22, fontWeight: 600, color: T.leaf }}>₹{product.price}</span>
          <span style={{ fontSize: 11, color: T.stone }}>/kg</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: outOfStock ? T.red : T.stone }}>
            {outOfStock ? 'Sold out' : `${remaining} kg avail.`}
          </span>
        </div>

        {/* Add to cart section */}
        {canCart && (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <QtyStepper value={qty} onChange={setQty} max={remaining} />
            <button className="add-btn"
              onClick={() => onAddToCart(product._id, product._id, qty)}
              disabled={isLoading}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 11, border: 'none',
                background: isLoading ? T.pebble : T.leaf,
                color: isLoading ? T.stone : T.white,
                fontSize: 13, fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: font.body, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                animation: isLoading ? 'pulse 1s infinite' : 'none',
              }}>
              {isLoading
                ? <><div style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${T.stone}`, borderTopColor: T.white, animation: 'spin .7s linear infinite' }} /> Adding…</>
                : <><svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx={9} cy={21} r={1}/><circle cx={20} cy={21} r={1}/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Add to cart</>
              }
            </button>
          </div>
        )}

        {outOfStock && (
          <div style={{ marginTop: 'auto', padding: '8px 0', textAlign: 'center', fontSize: 12, color: T.stone }}>
            Currently unavailable
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// CART DRAWER  (right panel on desktop, bottom sheet on mobile)
// ════════════════════════════════════════════════════════════════════════════
const CartPanel = ({ cart, onCheckout }) => {
  const subtotal      = cart.reduce((t, i) => t + i.quantity * (i.productId?.price || 0), 0);
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const total         = subtotal + deliveryCharge;

  return (
    <div style={{ background: T.white, borderRadius: 18, border: `1px solid ${T.pebble}`, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 14px', borderBottom: `1px solid ${T.pebble}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width={17} height={17} fill="none" stroke={T.leaf} strokeWidth={2} viewBox="0 0 24 24">
          <circle cx={9} cy={21} r={1}/><circle cx={20} cy={21} r={1}/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p style={{ fontFamily: font.display, fontSize: 17, fontWeight: 600, color: T.bark }}>Cart</p>
        <span style={{ marginLeft: 'auto', background: T.sageLight, color: T.leaf, fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 20 }}>
          {cart.length} items
        </span>
      </div>

      {cart.length === 0 ? (
        <div style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🛒</div>
          <p style={{ color: T.stone, fontSize: 13 }}>Your cart is empty</p>
        </div>
      ) : (
        <div style={{ padding: '14px 16px', maxHeight: 380, overflowY: 'auto' }}>
          {cart.map(item => (
            <div key={item.productId?._id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, background: T.mist, borderRadius: 12, padding: '9px 10px', border: `1px solid ${T.pebble}` }}>
              <img src={`${BASE_URL}${item.productId?.image || '/Uploads/farm.jpg'}`} alt={item.productId?.name}
                style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: T.bark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productId?.name}</p>
                <p style={{ fontSize: 11, color: T.stone, marginTop: 1 }}>{item.quantity} kg × ₹{item.productId?.price}</p>
              </div>
              <p style={{ fontFamily: font.display, fontSize: 13, fontWeight: 600, color: T.leaf, flexShrink: 0 }}>
                ₹{(item.quantity * (item.productId?.price || 0)).toFixed(2)}
              </p>
            </div>
          ))}

          {/* Totals */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              ['Subtotal', `₹${subtotal.toFixed(2)}`, T.bark],
              ['Delivery', deliveryCharge === 0 ? 'FREE ✓' : `₹${deliveryCharge}`, deliveryCharge === 0 ? T.leaf : T.bark],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: T.stone }}>{l}</span>
                <span style={{ fontWeight: 500, color: c }}>{v}</span>
              </div>
            ))}
            {deliveryCharge > 0 && (
              <p style={{ fontSize: 10, color: T.stone, background: T.mist, padding: '5px 8px', borderRadius: 7, textAlign: 'center' }}>
                Add ₹{(500 - subtotal).toFixed(0)} more for free delivery
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.sageLight, borderRadius: 11, padding: '11px 13px', marginTop: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Total</span>
              <span style={{ fontFamily: font.display, fontSize: 22, fontWeight: 600, color: T.leaf }}>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={onCheckout}
            style={{ width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 11, border: 'none', background: T.leaf, color: T.white, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: font.body, transition: 'background .2s' }}>
            Proceed to checkout
          </button>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// FARMER PROFILE PAGE
// ════════════════════════════════════════════════════════════════════════════
function FarmerProfilePage() {
  const { farmerId } = useParams();      // Route: /farmer/:farmerId
  const navigate     = useNavigate();

  const [farmer,        setFarmer]        = useState(null);
  const [products,      setProducts]      = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [inStockCount,  setInStockCount]  = useState(0);
  const [cart,          setCart]          = useState([]);
  const [userRole,      setUserRole]      = useState(null);
  const [loadingPage,   setLoadingPage]   = useState(true);
  const [loadingButtons, setLoadingButtons] = useState({});
  const [error,         setError]         = useState(null);
  const [filter,        setFilter]        = useState('all');   // 'all' | 'instock' | 'rated'
  const [cartVisible,   setCartVisible]   = useState(false);   // mobile cart toggle

  // ── Fetch farmer profile + cart + user ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoadingPage(true);
        const token = localStorage.getItem('token');
        if (!token) { navigate('/auth'); return; }

        const [profileRes, cartRes, userRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/auth/${farmerId}/profile`),
          authApi().get('/api/cart'),
          authApi().get('/api/auth/me'),
        ]);

        setFarmer(profileRes.data.farmer);
        setProducts(profileRes.data.products);
        setTotalProducts(profileRes.data.totalProducts);
        setInStockCount(profileRes.data.productsInStock);
        setCart(cartRes.data.products || []);
        setUserRole(userRes.data.role);
      } catch (err) {
        if (err.response?.status === 401) { navigate('/auth'); }
        else if (err.response?.status === 404) { setError("This farmer's profile could not be found."); }
        else { setError('Could not load farmer profile. Please try again.'); }
      } finally {
        setLoadingPage(false);
      }
    })();
  }, [farmerId, navigate]);

  // ── Add to cart ──────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(async (_, productId, qty) => {
    const product  = products.find(p => p._id === productId);
    const cartItem = cart.find(i => i.productId._id === productId);
    const cartQty  = cartItem ? cartItem.quantity : 0;
    const remaining = (product?.quantity || 0) - cartQty;

    if (qty > remaining) return;

    try {
      setLoadingButtons(p => ({ ...p, [productId]: true }));
      if (cartItem) await authApi().put('/api/cart/update', { productId, quantity: cartQty + qty });
      else          await authApi().post('/api/cart/add', { productId, quantity: qty });
      const cartRes = await authApi().get('/api/cart');
      setCart(cartRes.data.products || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoadingButtons(p => ({ ...p, [productId]: false }));
    }
  }, [products, cart, navigate]);

  // ── Filtered products ────────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    if (filter === 'instock') return p.quantity > 0;
    if (filter === 'rated')   return (p.totalRatings || 0) > 0;
    return true;
  });

  const cartCount = cart.length;
  const memberSince = farmer?.memberSince
    ? new Date(farmer.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  // ── Avatar initials ──────────────────────────────────────────────────────
  const initials = farmer?.name
    ? farmer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '🌾';

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: T.cream, minHeight: '100vh', fontFamily: font.body }}>
      <GlobalStyles />

      {/* ── Hero section ── */}
      <div style={{
        background: `linear-gradient(160deg, ${T.heroTop} 0%, ${T.heroBotom} 100%)`,
        position: 'relative', overflow: 'hidden',
        animation: 'heroSlide .5s ease both',
      }}>
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

        {/* Top nav bar */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="back-btn"
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: T.white, fontSize: 13, fontWeight: 500, fontFamily: font.body, transition: 'background .18s' }}>
            <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>

          {/* Mobile cart button */}
          <button
            onClick={() => setCartVisible(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: T.white, fontSize: 13, fontWeight: 500, fontFamily: font.body }}>
            <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={9} cy={21} r={1}/><circle cx={20} cy={21} r={1}/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 ? `Cart (${cartCount})` : 'Cart'}
          </button>
        </div>

        {/* Profile info */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 24px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0 }}>
          {/* Avatar */}
          <div style={{ animation: 'avatarPop .5s .1s ease both', marginBottom: 16 }}>
            {farmer?.profilePicture ? (
              <img src={`${BASE_URL}${farmer.profilePicture}`} alt={farmer.name}
                style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,.4)', boxShadow: '0 8px 28px rgba(0,0,0,.22)' }} />
            ) : (
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6a9e78, #2d5a3d)',
                border: '3px solid rgba(255,255,255,.35)',
                boxShadow: '0 8px 28px rgba(0,0,0,.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: font.display, fontSize: 32, fontWeight: 600, color: T.white,
              }}>
                {loadingPage ? '🌾' : initials}
              </div>
            )}
          </div>

          {/* Name & badges */}
          {loadingPage ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 220 }}>
              <Skeleton h={28} w={180} r={10} />
              <Skeleton h={14} w={140} r={8} />
            </div>
          ) : farmer ? (
            <>
              <h1 className="fu" style={{ fontFamily: font.display, fontSize: 28, fontWeight: 600, color: T.white, lineHeight: 1.15, marginBottom: 6 }}>
                {farmer.name}
              </h1>
              <div className="fu1" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 }}>
                {farmer.location && (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx={12} cy={10} r={3}/>
                    </svg>
                    {farmer.location}
                  </span>
                )}
                <span style={{ animation: 'badgeFade .4s .3s ease both', opacity: 0, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,.9)', fontWeight: 500 }}>
                  <svg width={10} height={10} fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                  Verified Farmer
                </span>
                {memberSince && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>Member since {memberSince}</span>
                )}
              </div>
              {farmer.bio && (
                <p className="fu2" style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', maxWidth: 540, lineHeight: 1.65, fontWeight: 300, fontStyle: 'italic', marginBottom: 20 }}>
                  "{farmer.bio}"
                </p>
              )}
            </>
          ) : null}

          {/* Stats row */}
          {!loadingPage && farmer && (
            <div className="fu3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <StatPill label="Products listed" value={totalProducts} />
              <StatPill label="In stock" value={inStockCount} />
              {products.filter(p => p.totalRatings > 0).length > 0 && (
                <StatPill label="Avg rating" value={
                  (products.reduce((s, p) => s + (p.averageRating || 0), 0) / products.filter(p => p.totalRatings > 0).length).toFixed(1) + ' ★'
                } />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 60px' }}>
        {error && (
          <div style={{ background: T.redLight, border: '1px solid #f5c6c2', borderRadius: 12, padding: '14px 18px', color: T.red, fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width={16} height={16} fill={T.red} viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="profile-layout">
          <style>{`
            @media (min-width: 1024px) {
              .profile-layout { grid-template-columns: minmax(0,1fr) 290px !important; }
              .mobile-cart-section { display: none !important; }
              .desktop-cart-section { display: block !important; }
            }
            @media (max-width: 1023px) {
              .desktop-cart-section { display: none !important; }
            }
          `}</style>

          {/* Left — products */}
          <div>
            {/* Filter bar */}
            {!loadingPage && products.length > 0 && (
              <div className="fu4" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.bark, marginRight: 6 }}>
                  Products
                </p>
                {[
                  { key: 'all',     label: `All (${products.length})` },
                  { key: 'instock', label: `In stock (${inStockCount})` },
                  { key: 'rated',   label: 'Rated' },
                ].map(f => (
                  <button key={f.key}
                    className={`filter-chip ${filter === f.key ? 'active' : ''}`}
                    onClick={() => setFilter(f.key)}
                    style={{
                      padding: '5px 13px', borderRadius: 20, border: `1px solid ${T.pebble}`,
                      background: filter === f.key ? T.leaf : T.white,
                      color: filter === f.key ? T.white : T.stone,
                      fontSize: 12, fontWeight: 500, fontFamily: font.body,
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Mobile cart toggle section */}
            {cartVisible && (
              <div className="mobile-cart-section" style={{ marginBottom: 20 }}>
                <CartPanel cart={cart} onCheckout={() => navigate('/payment')} />
              </div>
            )}

            {/* Product grid */}
            {loadingPage ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ background: T.white, borderRadius: 18, overflow: 'hidden', border: `1px solid ${T.pebble}` }}>
                    <div style={{ height: 180, animation: 'shimmer 1.4s infinite', background: T.mist }} />
                    <div style={{ padding: 16 }}>
                      <Skeleton h={14} w="70%" mb={10} />
                      <Skeleton h={11} w="90%" mb={8} />
                      <Skeleton h={11} w="55%" mb={14} />
                      <Skeleton h={38} r={10} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 20px', background: T.white, borderRadius: 18, border: `1.5px dashed ${T.pebble}` }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🌾</div>
                <p style={{ fontFamily: font.display, fontSize: 18, color: T.bark, marginBottom: 6 }}>
                  {filter === 'instock' ? 'No products in stock right now' : 'No products found'}
                </p>
                <p style={{ fontSize: 13, color: T.stone }}>Check back soon!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
                {filteredProducts.map((product, i) => (
                  <FarmerProductCard
                    key={product._id}
                    product={product}
                    cart={cart}
                    userRole={userRole}
                    onAddToCart={handleAddToCart}
                    loadingButtons={loadingButtons}
                    delay={Math.min(i * 0.05, 0.25)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — sticky cart (desktop) */}
          <div className="desktop-cart-section" style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
            <CartPanel cart={cart} onCheckout={() => navigate('/payment')} />

            {/* Farmer quick-info card */}
            {!loadingPage && farmer && (
              <div style={{ marginTop: 16, background: T.white, borderRadius: 16, border: `1px solid ${T.pebble}`, padding: '16px 18px' }}>
                <p style={{ fontSize: 11, color: T.stone, textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 12 }}>About the farmer</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${T.sageMid}, ${T.leaf})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: T.white, fontFamily: font.display, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: T.bark }}>{farmer.name}</p>
                    {farmer.location && <p style={{ fontSize: 11, color: T.stone }}>{farmer.location}</p>}
                  </div>
                </div>
                {farmer.bio && (
                  <p style={{ fontSize: 12, color: T.stone, lineHeight: 1.6, fontWeight: 300 }}>{farmer.bio}</p>
                )}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.leaf, fontWeight: 500 }}>
                  <svg width={11} height={11} fill={T.leaf} viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                  Verified community seller
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerProfilePage;