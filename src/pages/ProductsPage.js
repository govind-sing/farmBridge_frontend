// frontend/src/pages/ProductsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getProducts, addToCart, getCart, getUserInfo, updateCartQuantity, BASE_URL } from '../apiAxios';

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  sage: '#4a7c59', sageMid: '#6a9e78', sageLight: '#e8f0e9',
  leaf: '#2d5a3d', earth: '#7c5c3e', earthLight: '#f2ebe3',
  cream: '#faf8f4', bark: '#3d2e1e', harvest: '#c8863a',
  harvestLight: '#fdf0e0', mist: '#f5f7f3', stone: '#8a9180',
  pebble: '#d4d9ce', white: '#ffffff', red: '#c0392b', redLight: '#fdf0ee',
};
const font = {
  display: "'Fraunces', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
};

// ── Axios instance (auth header auto-injected) ───────────────────────────────
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
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.cream}; font-family: ${font.body}; color: ${T.bark}; -webkit-font-smoothing: antialiased; }

    @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes shimmer { 0%,100% { opacity:.4; } 50% { opacity:.9; } }
    @keyframes pulse   { 0%,100%{opacity:1;} 50%{opacity:.4;} }
    @keyframes popIn   { 0%{transform:scale(.5);opacity:0;} 70%{transform:scale(1.25);} 100%{transform:scale(1);opacity:1;} }

    .fade-up { animation: fadeUp .38s ease both; }
    .product-card { transition: transform .25s ease, box-shadow .25s ease; }
    .product-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(45,90,61,.12); }
    .btn-primary:hover { background: ${T.sage} !important; }
    .star-btn { transition: transform .15s ease, filter .15s; cursor: pointer; }
    .star-btn:hover { transform: scale(1.3); filter: drop-shadow(0 0 3px ${T.harvest}88); }
    .star-btn.active { animation: popIn .25s ease; }
    .search-input:focus  { outline:none; border-color:${T.sage}; box-shadow:0 0 0 3px ${T.sageLight}; }
    .qty-input:focus     { outline:none; border-color:${T.sage}; }
    .farmer-btn:hover    { background: #ede3d8 !important; }

    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
    input[type=number] { -moz-appearance:textfield; }

    .desktop-cart-inline { display: none; }
    .mobile-cart-toggle  { display: flex; }
    .products-layout     { display: block; }

    @media (min-width: 1024px) {
      .desktop-cart-inline { display: block; }
      .mobile-cart-toggle  { display: none !important; }
      .products-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 300px;
        gap: 24px;
        align-items: start;
      }
      .desktop-cart-sticky { position: sticky; top: 132px; width: 300px; }
    }
  `}</style>
);

// ════════════════════════════════════════════════════════════════════════════
// SMALL REUSABLE COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
const SectionLabel = ({ children }) => (
  <p style={{ fontSize: 11, color: T.stone, textTransform: 'uppercase', letterSpacing: '.8px', fontWeight: 500, marginBottom: 8 }}>
    {children}
  </p>
);

const ErrorBanner = ({ msg, onClose }) => (
  <div style={{ background: T.redLight, border: '1px solid #f5c6c2', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: T.red, animation: 'fadeUp .3s ease' }}>
    <svg width={16} height={16} fill={T.red} viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
    <span style={{ flex: 1 }}>{msg}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.stone, fontSize: 18, lineHeight: 1 }}>✕</button>
  </div>
);

const SkeletonCard = () => (
  <div style={{ background: T.white, borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.pebble}` }}>
    <div style={{ height: 180, background: `linear-gradient(90deg,${T.mist} 25%,${T.pebble}40 50%,${T.mist} 75%)`, animation: 'shimmer 1.4s infinite' }} />
    <div style={{ padding: 16 }}>
      {[80, 100, 60].map((w, i) => (
        <div key={i} style={{ height: 12, background: T.mist, borderRadius: 6, width: `${w}%`, marginBottom: 10, animation: 'shimmer 1.4s infinite', animationDelay: `${i * 0.15}s` }} />
      ))}
      <div style={{ height: 40, background: T.mist, borderRadius: 10, marginTop: 14, animation: 'shimmer 1.4s infinite' }} />
    </div>
  </div>
);

const BenefitChip = ({ emoji, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: T.sageLight, borderRadius: 8, padding: '5px 8px', fontSize: 11, color: T.leaf, fontWeight: 500 }}>
    <span style={{ fontSize: 12 }}>{emoji}</span>{label}
  </div>
);

// ── Display-only stars (read-only) ───────────────────────────────────────────
const Stars = ({ rating = 0, size = 11 }) => (
  <span style={{ display: 'inline-flex', gap: 1 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i <= Math.round(rating) ? T.harvest : T.pebble}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </span>
);

// ════════════════════════════════════════════════════════════════════════════
// RATING WIDGET  — shown inside each product card for eligible buyers
// ════════════════════════════════════════════════════════════════════════════
const RatingWidget = ({ product, onRatingChange }) => {
  // eligibility: null=loading, { canRate, alreadyRated, myRating, ratingId, reason }
  const [eligibility, setEligibility] = useState(null);
  const [hovered,     setHovered]     = useState(0);
  const [submitting,  setSubmitting]  = useState(false);
  const [localRating, setLocalRating] = useState(null); // optimistic
  const [toast,       setToast]       = useState('');   // brief feedback

  // fetch eligibility once on mount
  useEffect(() => {
    let cancelled = false;
    authApi()
      .get(`/api/product/${product._id}/ratings/eligibility`)
      .then((res) => {
        if (cancelled) return;
        setEligibility(res.data);
        if (res.data.myRating) setLocalRating(res.data.myRating);
      })
      .catch(() => {
        if (!cancelled) setEligibility({ canRate: false, reason: 'error' });
      });
    return () => { cancelled = true; };
  }, [product._id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handleRate = async (star) => {
    if (submitting) return;
    setSubmitting(true);
    const prev = localRating;
    setLocalRating(star); // optimistic

    try {
      if (eligibility?.alreadyRated && eligibility?.ratingId) {
        // update existing
        const res = await authApi().put(
          `/api/product/${product._id}/ratings/${eligibility.ratingId}`,
          { rating: star }
        );
        onRatingChange(product._id, res.data.averageRating, res.data.totalRatings);
        setEligibility((e) => ({ ...e, myRating: star }));
        showToast('Rating updated ✓');
      } else {
        // new rating
        const res = await authApi().post(
          `/api/product/${product._id}/ratings`,
          { rating: star }
        );
        onRatingChange(product._id, res.data.averageRating, res.data.totalRatings);
        // refetch eligibility to get ratingId for future edits
        const elRes = await authApi().get(`/api/product/${product._id}/ratings/eligibility`);
        setEligibility(elRes.data);
        showToast('Thanks for your rating! ✓');
      }
    } catch (err) {
      setLocalRating(prev); // rollback
      showToast(err.response?.data?.msg || 'Could not save rating');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (!eligibility) {
    return (
      <div style={{ display: 'flex', gap: 3, padding: '6px 0' }}>
        {[1,2,3,4,5].map((i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: T.mist, animation: 'shimmer 1.4s infinite', animationDelay: `${i * .1}s` }} />
        ))}
      </div>
    );
  }

  const displayRating = localRating || product.averageRating || 0;
  const totalRatings  = product.totalRatings || 0;

  // ── Not eligible: show read-only stars + reason chip ──
  if (!eligibility.canRate && !eligibility.alreadyRated) {
    const reasonLabel = eligibility.reason === 'own_product'
      ? null  // seller sees nothing — handled in ProductCard
      : eligibility.reason === 'not_purchased'
        ? { emoji: '🛒', text: 'Buy to rate', color: T.stone }
        : null;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Stars rating={displayRating} size={13} />
        {displayRating > 0
          ? <span style={{ fontSize: 12, fontWeight: 600, color: T.bark }}>{displayRating.toFixed(1)}</span>
          : null
        }
        <span style={{ fontSize: 11, color: T.stone }}>
          {totalRatings > 0 ? `(${totalRatings})` : 'No ratings yet'}
        </span>
        {reasonLabel && (
          <span style={{ marginLeft: 'auto', fontSize: 10, color: reasonLabel.color, background: T.mist, padding: '2px 7px', borderRadius: 20, border: `1px solid ${T.pebble}`, whiteSpace: 'nowrap' }}>
            {reasonLabel.emoji} {reasonLabel.text}
          </span>
        )}
      </div>
    );
  }

  // ── Eligible or already rated: interactive stars ──
  const activeRating = hovered || localRating || 0;
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {/* Interactive stars */}
        <div style={{ display: 'flex', gap: 3 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`star-btn ${localRating === star ? 'active' : ''}`}
              width={20} height={20} viewBox="0 0 24 24"
              fill={activeRating >= star ? T.harvest : T.pebble}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleRate(star)}
              style={{ cursor: submitting ? 'wait' : 'pointer' }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        {/* Label */}
        <span style={{ fontSize: 11, color: hovered ? T.harvest : T.stone, fontWeight: hovered ? 500 : 400, minWidth: 56 }}>
          {hovered ? labels[hovered] : localRating ? `Your: ${labels[localRating]}` : 'Tap to rate'}
        </span>

        {/* Spinner */}
        {submitting && (
          <div style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${T.pebble}`, borderTopColor: T.harvest, animation: 'spin .7s linear infinite', marginLeft: 2 }} />
        )}

        {/* Global avg */}
        {totalRatings > 0 && !hovered && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: T.stone }}>
            avg {displayRating.toFixed(1)} ({totalRatings})
          </span>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <p style={{ fontSize: 11, marginTop: 5, color: toast.includes('Could not') ? T.red : T.leaf, fontWeight: 500, animation: 'fadeUp .2s ease' }}>
          {toast}
        </p>
      )}

      {/* Edit hint */}
      {eligibility.alreadyRated && !toast && (
        <p style={{ fontSize: 10, color: T.stone, marginTop: 4 }}>Click any star to update your rating</p>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// CART SIDEBAR
// ════════════════════════════════════════════════════════════════════════════
const CartSidebar = ({ cart, cartTotal, deliveryCharge, finalTotal, onCheckout }) => (
  <div style={{ background: T.white, borderRadius: 18, border: `1px solid ${T.pebble}`, padding: '20px 18px', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${T.pebble}` }}>
      <svg width={18} height={18} fill="none" stroke={T.leaf} strokeWidth={2} viewBox="0 0 24 24">
        <circle cx={9} cy={21} r={1} /><circle cx={20} cy={21} r={1} />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <p style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: T.bark }}>Your cart</p>
      <span style={{ marginLeft: 'auto', background: T.sageLight, color: T.leaf, fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 20 }}>{cart.length} items</span>
    </div>

    {cart.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
        <p style={{ color: T.stone, fontSize: 13 }}>Your cart is empty</p>
        <p style={{ color: T.pebble, fontSize: 11, marginTop: 4 }}>Add products to get started</p>
      </div>
    ) : (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {cart.map((item) => (
            <div key={item.productId?._id || item._id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: T.mist, borderRadius: 12, padding: '10px', border: `1px solid ${T.pebble}` }}>
              <img src={`${BASE_URL}${item.productId?.image || '/Uploads/farm.jpg'}`} alt={item.productId?.name} style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 9, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: T.bark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productId?.name || 'Unnamed'}</p>
                <p style={{ fontSize: 11, color: T.stone, marginTop: 2 }}>{item.quantity} kg × ₹{item.productId?.price || 0}</p>
              </div>
              <p style={{ fontFamily: font.display, fontSize: 14, fontWeight: 600, color: T.leaf, flexShrink: 0 }}>₹{(item.quantity * (item.productId?.price || 0)).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: T.pebble, margin: '14px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[['Subtotal', `₹${cartTotal}`, T.bark], ['Delivery', deliveryCharge === 0 ? 'FREE ✓' : `₹${deliveryCharge}`, deliveryCharge === 0 ? T.leaf : T.bark]].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: T.stone }}>{l}</span>
              <span style={{ fontWeight: 500, color: c }}>{v}</span>
            </div>
          ))}
          {deliveryCharge > 0
            ? <p style={{ fontSize: 11, color: T.stone, textAlign: 'center', background: T.mist, borderRadius: 8, padding: '6px 8px' }}>Add ₹{(500 - parseFloat(cartTotal)).toFixed(0)} more for free delivery</p>
            : <p style={{ fontSize: 11, color: T.leaf, textAlign: 'center', background: T.sageLight, borderRadius: 8, padding: '6px 8px', fontWeight: 500 }}>✓ Free delivery on orders above ₹500</p>
          }
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.sageLight, borderRadius: 12, padding: '12px 14px', marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.bark }}>Total</span>
            <span style={{ fontFamily: font.display, fontSize: 24, fontWeight: 600, color: T.leaf }}>₹{finalTotal}</span>
          </div>
        </div>

        <div style={{ background: T.earthLight, borderRadius: 10, padding: '10px 12px', marginBottom: 14, border: '1px solid #e0d5c8' }}>
          {['🔒 Secure checkout', '🌿 Fresh quality guarantee', '♻️ Eco-friendly packaging'].map((t) => (
            <p key={t} style={{ fontSize: 11, color: T.earth, marginBottom: 4 }}>{t}</p>
          ))}
        </div>

        <button className="btn-primary" onClick={onCheckout}
          style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', background: T.leaf, color: T.white, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: font.body, transition: 'background .2s' }}>
          Proceed to checkout
        </button>
      </>
    )}
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// PRODUCT CARD
// ════════════════════════════════════════════════════════════════════════════
const ProductCard = ({ product, cart, quantities, loadingButtons, userRole, onQtyChange, onIncrement, onDecrement, onAddToCart, onRatingChange, onFarmerClick, delay = 0 }) => {
  const cartItem  = cart.find((i) => i.productId._id === product._id);
  const cartQty   = cartItem ? cartItem.quantity : 0;
  const remaining = product.quantity - cartQty;
  const inputQty  = parseFloat(quantities[product._id]);
  const isValid   = !isNaN(inputQty) && inputQty > 0 && inputQty <= remaining;
  const isLoading = loadingButtons[product._id];
  const isLowStock = remaining <= 5 && remaining > 0;
  const imgSrc    = `${BASE_URL}${product.image || '/Uploads/farm.jpg'}`;
  const isBuyer   = userRole === 'buyer';

  return (
    <div className="product-card fade-up" style={{ animationDelay: `${delay}s`, background: T.white, borderRadius: 18, overflow: 'hidden', border: `1px solid ${T.pebble}` }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 190, overflow: 'hidden', background: T.sageLight }}>
        <img src={imgSrc} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
        <span style={{ position: 'absolute', top: 12, left: 12, background: T.leaf, color: T.white, fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>Organic</span>
        {isLowStock && (
          <span style={{ position: 'absolute', bottom: 12, left: 12, background: T.harvest, color: T.white, fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>
            Only {remaining} kg left
          </span>
        )}
        {cartQty > 0 && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: T.white, color: T.leaf, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: `1px solid ${T.pebble}` }}>
            {cartQty} kg in cart
          </span>
        )}
      </div>

      <div style={{ padding: '16px 16px 18px' }}>
        {/* Name */}
        <h3 style={{ fontFamily: font.display, fontSize: 17, fontWeight: 600, color: T.bark, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name || 'Unnamed'}
        </h3>

        {/* ── Rating widget ── */}
        <div style={{ background: T.mist, borderRadius: 10, padding: '8px 10px', marginBottom: 10, border: `1px solid ${T.pebble}` }}>
          {isBuyer ? (
            <RatingWidget product={product} onRatingChange={onRatingChange} />
          ) : (
            // Non-buyers: display-only
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stars rating={product.averageRating || 0} size={13} />
              {product.averageRating > 0
                ? <span style={{ fontSize: 12, fontWeight: 600, color: T.bark }}>{product.averageRating.toFixed(1)}</span>
                : null
              }
              <span style={{ fontSize: 11, color: T.stone }}>
                {product.totalRatings > 0 ? `(${product.totalRatings} ratings)` : 'No ratings yet'}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p style={{ fontSize: 12, color: T.stone, lineHeight: 1.55, marginBottom: 12, fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description || 'Fresh farm produce, harvested with care and delivered to your door.'}
        </p>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
          <span style={{ fontFamily: font.display, fontSize: 24, fontWeight: 600, color: T.leaf }}>₹{product.price}</span>
          <span style={{ fontSize: 12, color: T.stone, fontWeight: 300 }}>/kg</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: T.stone }}>{remaining} kg available</span>
        </div>

        {/* Benefit chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          <BenefitChip emoji="🌱" label="Organic" />
          <BenefitChip emoji="☀️" label="Sun-grown" />
          <BenefitChip emoji="🏡" label="Farm-fresh" />
          <BenefitChip emoji="♻️" label="Eco-pack" />
        </div>

        {/* Farmer row — clickable → farmer profile */}
        <button
          onClick={() => product.seller?._id && onFarmerClick(product.seller._id)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: T.earthLight, borderRadius: 10, padding: '8px 10px', marginBottom: 12, border: '1px solid #e0d5c8', cursor: product.seller?._id ? 'pointer' : 'default', fontFamily: font.body, textAlign: 'left', transition: 'background .18s' }}
          onMouseEnter={e => { if (product.seller?._id) e.currentTarget.style.background = '#ede3d8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.earthLight; }}
        >
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.sageLight, border: `1.5px solid ${T.sageMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>👨‍🌾</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: T.stone, marginBottom: 1 }}>Direct from farmer</p>
            <p style={{ fontSize: 12, fontWeight: 500, color: T.earth, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {product.seller?.name || 'Local cooperative'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.leaf, fontWeight: 500, flexShrink: 0 }}>
            <svg width={11} height={11} fill={T.leaf} viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
            View →
          </div>
        </button>

        {/* Delivery chips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
          {[['⚡','Express'],['❄️','Cold chain'],['✅','Guarantee']].map(([e,l]) => (
            <div key={l} style={{ background: T.mist, borderRadius: 8, padding: '6px 4px', textAlign: 'center', border: `1px solid ${T.pebble}` }}>
              <div style={{ fontSize: 14 }}>{e}</div>
              <div style={{ fontSize: 10, color: T.stone, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* In-cart notice */}
        {cartQty > 0 && (
          <div style={{ background: T.harvestLight, borderRadius: 8, padding: '6px 10px', fontSize: 12, color: T.earth, fontWeight: 500, marginBottom: 10, border: '1px solid #edd9b0' }}>
            🛒 {cartQty} kg in cart · {remaining} kg remaining
          </div>
        )}

        {/* Add-to-cart controls — hidden for community role */}
        {userRole !== 'community' && (
          <>
            <SectionLabel>Quantity (kg)</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <button onClick={() => onDecrement(product._id)}
                style={{ width: 36, height: 36, borderRadius: 9, background: T.mist, border: `1px solid ${T.pebble}`, fontSize: 18, fontWeight: 300, color: T.sage, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.sageLight; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.mist; }}>−</button>
              <input className="qty-input" type="number"
                value={quantities[product._id] || ''} min="0" max={remaining} step="0.1" placeholder="0.0"
                onChange={(e) => onQtyChange(product._id, e.target.value, product.quantity, cartQty)}
                style={{ flex: 1, padding: '7px 10px', borderRadius: 9, border: `1px solid ${T.pebble}`, background: T.mist, fontSize: 14, fontWeight: 500, color: T.bark, textAlign: 'center', fontFamily: font.body, transition: 'border-color .2s' }} />
              <button onClick={() => onIncrement(product._id, product.quantity, cartQty)}
                style={{ width: 36, height: 36, borderRadius: 9, background: T.mist, border: `1px solid ${T.pebble}`, fontSize: 18, fontWeight: 300, color: T.sage, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.sageLight; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.mist; }}>+</button>
            </div>

            {!isNaN(inputQty) && inputQty > remaining && (
              <p style={{ fontSize: 11, color: T.red, marginBottom: 8, background: T.redLight, padding: '4px 8px', borderRadius: 6 }}>Exceeds available stock ({remaining} kg)</p>
            )}

            <button className="btn-primary" onClick={() => onAddToCart(product._id)} disabled={isLoading || !isValid}
              style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: isLoading || !isValid ? T.pebble : T.leaf, color: isLoading || !isValid ? T.stone : T.white, fontSize: 14, fontWeight: 500, cursor: isLoading || !isValid ? 'not-allowed' : 'pointer', fontFamily: font.body, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .2s', animation: isLoading ? 'pulse 1s infinite' : 'none' }}>
              {isLoading
                ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${T.stone}`, borderTopColor: T.white, animation: 'spin .7s linear infinite' }} />Adding…</>
                : <><svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx={9} cy={21} r={1} /><circle cx={20} cy={21} r={1} /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>Add to cart</>
              }
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
function ProductsPage() {
  const [products,       setProducts]       = useState([]);
  const [cart,           setCart]           = useState([]);
  const [userRole,       setUserRole]       = useState(null);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [loading,        setLoading]        = useState(true);
  const [loadingButtons, setLoadingButtons] = useState({});
  const [error,          setError]          = useState(null);
  const [quantities,     setQuantities]     = useState({});
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { setError('Please log in to view products.'); navigate('/auth'); return; }

        const [productsRes, cartRes, userRes] = await Promise.all([getProducts(), getCart(), getUserInfo()]);
        setProducts(productsRes.data || []);
        setCart(cartRes.data.products || []);
        setUserRole(userRes.data.role);
        const initQty = (productsRes.data || []).reduce((acc, p) => { acc[p._id] = 1; return acc; }, {});
        setQuantities(initQty);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/auth');
        } else {
          setError(err.response?.data?.msg || 'Failed to load data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // Called by RatingWidget after a successful submit — patches just the one product in state
  const handleRatingChange = useCallback((productId, averageRating, totalRatings) => {
    setProducts((prev) =>
      prev.map((p) => p._id === productId ? { ...p, averageRating, totalRatings } : p)
    );
  }, []);

  const handleQuantityChange = (productId, value, available, cartQty) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    if (sanitized === '' || sanitized === '.') { setQuantities((p) => ({ ...p, [productId]: '' })); return; }
    if ((sanitized.match(/\./g) || []).length > 1) return;
    const parsed    = parseFloat(sanitized) || 0;
    const remaining = available - cartQty;
    setQuantities((p) => ({ ...p, [productId]: Math.max(0, Math.min(parsed, remaining)) }));
  };

  const handleIncrement = (productId, available, cartQty) => {
    const cur       = parseFloat(quantities[productId]) || 0;
    const remaining = available - cartQty;
    if (cur < remaining)
      setQuantities((p) => ({ ...p, [productId]: parseFloat(Math.min(cur + 0.1, remaining).toFixed(1)) }));
  };

  const handleDecrement = (productId) => {
    const cur = parseFloat(quantities[productId]) || 0;
    if (cur > 0) setQuantities((p) => ({ ...p, [productId]: parseFloat((cur - 0.1).toFixed(1)) }));
  };

  const handleAddToCart = async (productId) => {
    const qty      = parseFloat(quantities[productId]);
    const product  = products.find((p) => p._id === productId);
    const cartItem = cart.find((i) => i.productId._id === productId);
    const cartQty  = cartItem ? cartItem.quantity : 0;
    const remaining = (product?.quantity || 0) - cartQty;

    if (isNaN(qty) || qty <= 0)  { setError('Please enter a valid quantity greater than 0.'); return; }
    if (qty > remaining)         { setError(`Cannot add more than available stock (${remaining} kg).`); return; }

    try {
      setLoadingButtons((p) => ({ ...p, [productId]: true }));
      if (cartItem) await updateCartQuantity(productId, cartQty + qty);
      else          await addToCart(productId, qty);
      const cartRes = await getCart();
      setCart(cartRes.data.products || []);
      setQuantities((p) => ({ ...p, [productId]: 1 }));
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) { setError('Please log in to add items to cart.'); navigate('/auth'); }
      else setError(err.response?.data?.msg || 'Failed to add to cart.');
    } finally {
      setLoadingButtons((p) => ({ ...p, [productId]: false }));
    }
  };

  const filteredProducts = products
    .filter((p) => p.quantity > 0)
    .filter((p) =>
      (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.seller?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

  const cartTotal      = cart.reduce((t, i) => t + i.quantity * (i.productId?.price || 0), 0).toFixed(2);
  const deliveryCharge = parseFloat(cartTotal) > 500 ? 0 : 50;
  const finalTotal     = (parseFloat(cartTotal) + deliveryCharge).toFixed(2);

  const handleCheckout = () => {
    if (cart.length === 0) { setError('Your cart is empty. Add items before checkout.'); return; }
    navigate('/payment');
  };

  return (
    <div style={{ background: T.cream, minHeight: '100vh', fontFamily: font.body }}>
      <GlobalStyles />

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(250,248,244,0.92)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${T.pebble}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 600, color: T.bark, lineHeight: 1.1 }}>FarmBridge</h1>
            <p style={{ fontSize: 11, color: T.stone, marginTop: 1 }}>Fresh from farm to table</p>
          </div>
          <div style={{ flex: 1, maxWidth: 460, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg style={{ position: 'absolute', left: 12 }} width={15} height={15} fill="none" stroke={T.stone} strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2="16.65" y2="16.65" />
            </svg>
            <input className="search-input" type="text" placeholder="Search products or farmers…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={loading}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 12, border: `1px solid ${T.pebble}`, background: T.white, fontSize: 13, color: T.bark, fontFamily: font.body, transition: 'border-color .2s, box-shadow .2s' }} />
          </div>
          {userRole !== 'community' && (
            <button className="mobile-cart-toggle" onClick={() => setMobileCartOpen((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 12, border: `1.5px solid ${T.sage}`, background: mobileCartOpen ? T.sageLight : 'transparent', color: T.sage, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: font.body }}>
              <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={9} cy={21} r={1} /><circle cx={20} cy={21} r={1} />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Cart ({cart.length})
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 60px' }}>
        {error && <ErrorBanner msg={error} onClose={() => setError(null)} />}

        {userRole !== 'community' && mobileCartOpen && (
          <div style={{ marginBottom: 20 }}>
            <CartSidebar cart={cart} cartTotal={cartTotal} deliveryCharge={deliveryCharge} finalTotal={finalTotal} onCheckout={handleCheckout} />
          </div>
        )}

        <div className="products-layout">
          <div>
            <div style={{ height: 'calc(100vh)', overflowY: 'auto', paddingRight: 8 }}>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
                  {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
                  {filteredProducts.map((product, i) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      cart={cart}
                      quantities={quantities}
                      loadingButtons={loadingButtons}
                      userRole={userRole}
                      onQtyChange={handleQuantityChange}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                      onAddToCart={handleAddToCart}
                      onRatingChange={handleRatingChange}
                      onFarmerClick={(farmerId) => navigate(`/farmer/${farmerId}`)}
                      delay={Math.min(i * 0.05, 0.3)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: T.white, borderRadius: 18, border: `1.5px dashed ${T.pebble}` }}>
                  <div style={{ fontSize: 42, marginBottom: 10 }}>🌾</div>
                  <p style={{ fontFamily: font.display, fontSize: 18, color: T.bark, marginBottom: 6 }}>No products found</p>
                  <p style={{ fontSize: 13, color: T.stone }}>Try a different search or check back later</p>
                </div>
              )}
            </div>
          </div>

          {userRole !== 'community' && (
            <div className="desktop-cart-inline">
              <div className="desktop-cart-sticky">
                <CartSidebar cart={cart} cartTotal={cartTotal} deliveryCharge={deliveryCharge} finalTotal={finalTotal} onCheckout={handleCheckout} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;