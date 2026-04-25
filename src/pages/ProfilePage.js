import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCart, removeFromCart, getUserInfo, logout,
  updateCartQuantity, getOrders, getBuyerOrders,
  markOrderAsDone, listProduct, updateAddress,
  getSellerProducts, updateProduct, BASE_URL
} from '../apiAxios';

/* ─── design tokens ─────────────────────────────────────── */
const T = {
  sage:         '#4a7c59',
  sageMid:      '#6a9e78',
  sageLight:    '#e8f0e9',
  leaf:         '#2d5a3d',
  earth:        '#7c5c3e',
  earthLight:   '#f2ebe3',
  cream:        '#faf8f4',
  bark:         '#3d2e1e',
  harvest:      '#c8863a',
  harvestLight: '#fdf0e0',
  mist:         '#f5f7f3',
  stone:        '#8a9180',
  pebble:       '#d4d9ce',
  white:        '#ffffff',
  red:          '#c0392b',
  redLight:     '#fdf0ee',
};

const font = {
  display: "'Fraunces', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
};

/* ─── global style injection ─────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${T.cream};
      font-family: ${font.body};
      color: ${T.bark};
      -webkit-font-smoothing: antialiased;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    .fade-up { animation: fadeUp 0.4s ease both; }
    .fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
    .fade-up-2 { animation: fadeUp 0.4s 0.10s ease both; }
    .fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }
    .fade-up-4 { animation: fadeUp 0.4s 0.20s ease both; }
    .fade-up-5 { animation: fadeUp 0.4s 0.25s ease both; }
  `}</style>
);

/* ─── tiny helpers ───────────────────────────────────────── */
const fmt = (method) => ({ credit_card: 'Credit Card', cash: 'Cash', upi: 'UPI' }[method] || 'Unknown');

const StarRow = ({ rating = 4.2, count = 128, size = 14 }) => {
  const filled = Math.round(rating);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1,2,3,4,5].map(i => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24"
            fill={i <= filled ? T.harvest : T.pebble}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{rating}</span>
      <span style={{ fontSize: 13, color: T.stone }}>({count} reviews)</span>
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <p style={{
    fontSize: 11, color: T.stone, textTransform: 'uppercase',
    letterSpacing: '0.8px', fontWeight: 500, marginBottom: 10,
  }}>{children}</p>
);

const Divider = () => (
  <div style={{ height: 1, background: T.pebble, margin: '20px 0' }} />
);

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      border: `3px solid ${T.sageLight}`,
      borderTopColor: T.sage,
      animation: 'spin 0.8s linear infinite',
    }} />
  </div>
);

const ErrorBanner = ({ msg, onLogin }) => (
  <div style={{
    background: T.redLight, border: `1px solid #f5c6c2`,
    borderRadius: 12, padding: '12px 16px',
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 14, color: T.red, marginBottom: 16,
  }}>
    <svg width={16} height={16} fill={T.red} viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
    </svg>
    <span style={{ flex: 1 }}>{msg}</span>
    {msg?.includes('log in') && (
      <button onClick={onLogin} style={{
        background: 'none', border: 'none', color: T.sage,
        cursor: 'pointer', fontWeight: 500, fontSize: 13,
      }}>Login →</button>
    )}
  </div>
);

/* ─── icon set ───────────────────────────────────────────── */
const Icon = {
  back: (
    <svg width={18} height={18} fill="none" stroke={T.bark} strokeWidth={2} viewBox="0 0 24 24">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  share: (
    <svg width={16} height={16} fill="none" stroke={T.bark} strokeWidth={2} viewBox="0 0 24 24">
      <circle cx={18} cy={5} r={3}/><circle cx={6} cy={12} r={3}/><circle cx={18} cy={19} r={3}/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  menu: (
    <svg width={20} height={20} fill="none" stroke={T.bark} strokeWidth={2} viewBox="0 0 24 24">
      <circle cx={12} cy={5} r={1} fill={T.bark}/>
      <circle cx={12} cy={12} r={1} fill={T.bark}/>
      <circle cx={12} cy={19} r={1} fill={T.bark}/>
    </svg>
  ),
  location: (
    <svg width={11} height={11} fill="none" stroke={T.earth} strokeWidth={2} viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx={12} cy={10} r={3}/>
    </svg>
  ),
  verified: (
    <svg width={12} height={12} fill={T.leaf} viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
    </svg>
  ),
  shield: (
    <svg width={15} height={15} fill="none" stroke={T.leaf} strokeWidth={2} viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  sun: (
    <svg width={15} height={15} fill="none" stroke={T.earth} strokeWidth={2} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={5}/>
      <line x1={12} y1={1} x2={12} y2={3}/><line x1={12} y1={21} x2={12} y2={23}/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1={1} y1={12} x2={3} y2={12}/><line x1={21} y1={12} x2={23} y2={12}/>
    </svg>
  ),
  leaf: (
    <svg width={15} height={15} fill="none" stroke={T.leaf} strokeWidth={2} viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  heart: (
    <svg width={15} height={15} fill="none" stroke={T.earth} strokeWidth={2} viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  edit: (
    <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
};

/* ─── Hero SVG illustration ──────────────────────────────── */
const HeroIllustration = ({ imageUrl, productName }) => (
  <div style={{
    position: 'relative', height: 300, overflow: 'hidden',
    background: `linear-gradient(160deg, #c8e6c9 0%, #a5d6a7 100%)`,
  }}>
    {imageUrl ? (
      <img
        src={imageUrl}
        alt={productName}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <svg viewBox="0 0 430 300" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="bg" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#c8e6c9"/>
            <stop offset="100%" stopColor="#81c784"/>
          </radialGradient>
        </defs>
        <rect width={430} height={300} fill="url(#bg)"/>
        <ellipse cx={215} cy={290} rx={200} ry={40} fill="#5a8a5a" opacity={0.3}/>
        <ellipse cx={100} cy={280} rx={80} ry={20} fill="#7c5c3e" opacity={0.4}/>
        <ellipse cx={330} cy={285} rx={70} ry={18} fill="#7c5c3e" opacity={0.35}/>
        <g transform="translate(215,150)">
          <ellipse cx={0} cy={50} rx={50} ry={15} fill="#3d6b3d" opacity={0.5}/>
          <path d="M-20,40 Q-60,-20 -10,0 Q0,20 -20,40" fill="#2d7a3a"/>
          <path d="M20,40 Q60,-20 10,0 Q0,20 20,40" fill="#3d8a4a"/>
          <path d="M-5,35 Q-40,-30 5,-5 Q10,15 -5,35" fill="#48a358"/>
          <path d="M5,35 Q40,-30 -5,-5 Q-10,15 5,35" fill="#2d7a3a"/>
          <path d="M-15,25 Q-35,-10 0,5 Q5,15 -15,25" fill="#56b865"/>
          <path d="M15,25 Q35,-10 0,5 Q-5,15 15,25" fill="#3a9448"/>
        </g>
        <g transform="translate(100,200)">
          <path d="M-10,30 Q-30,-10 0,5 Q5,15 -10,30" fill="#2d7a3a"/>
          <path d="M10,30 Q30,-10 0,5 Q-5,15 10,30" fill="#3d8a4a"/>
        </g>
        <g transform="translate(330,195)">
          <path d="M-10,30 Q-30,-10 0,5 Q5,15 -10,30" fill="#48a358"/>
          <path d="M10,30 Q30,-10 0,5 Q-5,15 10,30" fill="#2d7a3a"/>
        </g>
        <circle cx={370} cy={50} r={40} fill="#fffde7" opacity={0.35}/>
        <circle cx={370} cy={50} r={25} fill="#fff9c4" opacity={0.45}/>
        <circle cx={200} cy={130} r={3} fill="rgba(255,255,255,0.7)"/>
        <circle cx={230} cy={115} r={2} fill="rgba(255,255,255,0.6)"/>
        <circle cx={185} cy={145} r={2.5} fill="rgba(255,255,255,0.65)"/>
      </svg>
    )}
  </div>
);

/* ─── Order Card ─────────────────────────────────────────── */
const OrderCard = ({ order, isSeller = false, onMarkAsDone, loadingButtons }) => {
  const sellerTotal = order.products.reduce((t, p) =>
    t + (p.productId?.price || 0) * (p.quantity || 0), 0).toFixed(2);

  return (
    <div style={{
      background: T.white, borderRadius: 16, padding: 16,
      border: `1px solid ${T.pebble}`, marginBottom: 12,
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <p style={{ fontSize: 12, color: T.stone, marginBottom: 2 }}>Order #{order._id.slice(-6)}</p>
          {isSeller && (
            <p style={{ fontSize: 13, fontWeight: 500, color: T.bark }}>{order.buyer?.name || 'Unknown buyer'}</p>
          )}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
          background: order.status === 'pending' ? '#fff8e1' : T.sageLight,
          color: order.status === 'pending' ? '#e65100' : T.leaf,
          border: `1px solid ${order.status === 'pending' ? '#ffe082' : '#b2dfb2'}`,
        }}>
          {order.status}
        </span>
      </div>

      {isSeller && order.buyerAddress && (
        <p style={{ fontSize: 12, color: T.stone, marginBottom: 6, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          {Icon.location} {order.buyerAddress}
        </p>
      )}

      <div style={{ marginBottom: 10 }}>
        {order.products.map((p, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 13, color: T.bark, padding: '3px 0',
            borderBottom: i < order.products.length - 1 ? `1px solid ${T.mist}` : 'none',
          }}>
            <span>{p.productId?.name || 'Unnamed'} × {p.quantity} kg</span>
            <span style={{ color: T.sage, fontWeight: 500 }}>₹{p.productId?.price || '—'}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 11, color: T.stone }}>{fmt(order.paymentMethod)} · {new Date(order.createdAt).toLocaleDateString()}</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: T.leaf, fontFamily: font.display }}>
            ₹{isSeller ? sellerTotal : order.totalAmount?.toFixed(2) || '—'}
          </p>
        </div>
        {isSeller && order.status === 'pending' && (
          <button
            onClick={() => onMarkAsDone(order._id)}
            disabled={loadingButtons[order._id]}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: loadingButtons[order._id] ? T.pebble : T.leaf,
              color: T.white, fontSize: 13, fontWeight: 500,
              cursor: loadingButtons[order._id] ? 'not-allowed' : 'pointer',
              fontFamily: font.body, transition: 'background 0.2s',
              animation: loadingButtons[order._id] ? 'pulse 1s infinite' : 'none',
            }}
          >
            {loadingButtons[order._id] ? 'Processing…' : 'Mark done'}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Cart Item ──────────────────────────────────────────── */
const CartItem = ({ item, onQtyChange, onRemove, loading }) => {
  const id = item.productId._id;
  const imgSrc = `${BASE_URL}${item.productId.image || '/Uploads/farm.jpg'}`;

  return (
    <div className="fade-up" style={{
      background: T.white, borderRadius: 16, padding: 14,
      border: `1px solid ${T.pebble}`, display: 'flex', gap: 14,
      alignItems: 'center', marginBottom: 10,
    }}>
      <img src={imgSrc} alt={item.productId.name}
        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: T.bark, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.productId.name}
        </p>
        <p style={{ fontSize: 13, color: T.sage, fontWeight: 500 }}>
          ₹{(item.productId.price * item.quantity).toFixed(2)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 6, background: T.mist, borderRadius: 8, width: 'fit-content', border: `1px solid ${T.pebble}` }}>
          {['-', item.quantity + ' kg', '+'].map((v, i) => (
            <button
              key={i}
              onClick={() => i !== 1 && onQtyChange(id, i === 0 ? -1 : 1)}
              disabled={loading[id]}
              style={{
                width: i === 1 ? 56 : 32, height: 32, background: 'transparent',
                border: 'none', fontSize: i === 1 ? 13 : 18, fontWeight: i === 1 ? 500 : 300,
                color: i === 1 ? T.bark : T.sage,
                cursor: i === 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: font.body,
              }}
            >{v}</button>
          ))}
        </div>
      </div>
      <button
        onClick={() => onRemove(id)}
        disabled={loading[id]}
        style={{
          width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.pebble}`,
          background: loading[id] ? T.mist : T.redLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s',
        }}
      >
        <svg width={14} height={14} fill="none" stroke={loading[id] ? T.stone : T.red} strokeWidth={2} viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  );
};

/* ─── Product Card (seller) ──────────────────────────────── */
const SellerProductCard = ({ product, editProduct, setEditProduct, editImageFile, setEditImageFile, onSave, loading }) => {
  const isEditing = editProduct?.id === product._id;
  const imgSrc = `${BASE_URL}${product.image || '/Uploads/farm.jpg'}`;

  return (
    <div className="fade-up" style={{
      background: T.white, borderRadius: 16, overflow: 'hidden',
      border: `1px solid ${T.pebble}`, marginBottom: 12,
    }}>
      <div style={{ position: 'relative', height: 140, background: T.sageLight }}>
        <img src={imgSrc} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        <span style={{
          position: 'absolute', top: 10, right: 10,
          background: T.leaf, color: T.white, fontSize: 11,
          padding: '3px 10px', borderRadius: 20, fontWeight: 500,
        }}>
          {product.quantity || 0} kg
        </span>
      </div>
      <div style={{ padding: '14px 14px 16px' }}>
        <p style={{ fontFamily: font.display, fontSize: 17, fontWeight: 600, color: T.bark, marginBottom: 4 }}>
          {product.name}
        </p>
        <p style={{ fontSize: 12, color: T.stone, marginBottom: 10, lineHeight: 1.5 }}>
          {product.description || 'No description provided'}
        </p>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { placeholder: 'Price (₹)', key: 'price', type: 'number', step: '0.01' },
              { placeholder: 'Quantity (kg)', key: 'quantity', type: 'number' },
            ].map(({ placeholder, key, type, step }) => (
              <input
                key={key}
                type={type}
                step={step}
                value={editProduct[key]}
                onChange={e => setEditProduct({ ...editProduct, [key]: e.target.value })}
                placeholder={placeholder}
                style={inputStyle}
              />
            ))}
            <input
              type="file"
              accept="image/*"
              onChange={e => setEditImageFile(e.target.files[0])}
              style={{ ...inputStyle, fontSize: 12, padding: '8px 12px' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={() => onSave(product._id)} disabled={loading} style={btnPrimary}>
                {loading ? 'Saving…' : 'Save changes'}
              </button>
              <button onClick={() => setEditProduct(null)} style={btnOutline}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.leaf }}>
              ₹{product.price}<span style={{ fontSize: 12, color: T.stone, fontFamily: font.body, fontWeight: 300 }}>/kg</span>
            </p>
            <button
              onClick={() => setEditProduct({ id: product._id, price: product.price, quantity: product.quantity })}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 10,
                border: `1.5px solid ${T.sage}`, background: 'transparent',
                color: T.sage, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: font.body,
              }}
            >
              {Icon.edit} Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── shared input / button styles ───────────────────────── */
const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: `1px solid ${T.pebble}`, background: T.mist,
  fontSize: 14, color: T.bark, fontFamily: 'inherit',
  outline: 'none',
};

const btnPrimary = {
  flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
  background: T.leaf, color: T.white,
  fontSize: 14, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'inherit', transition: 'background 0.2s',
};

const btnOutline = {
  flex: 1, padding: '11px 0', borderRadius: 12,
  border: `1.5px solid ${T.pebble}`, background: 'transparent',
  color: T.stone, fontSize: 14, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
};

/* ─── Address Modal ──────────────────────────────────────── */
const AddressModal = ({ address, setAddress, onSave, onClose, loading }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
  }}>
    <div style={{
      background: T.cream, borderRadius: '20px 20px 0 0',
      padding: '24px 20px 36px', width: '100%', maxWidth: 430,
      animation: 'fadeUp 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.bark }}>
          Update address
        </p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: T.stone }}>✕</button>
      </div>
      <textarea
        value={address}
        onChange={e => setAddress(e.target.value)}
        rows={3}
        placeholder="Enter your full delivery address"
        style={{ ...inputStyle, resize: 'none', lineHeight: 1.6, marginBottom: 14 }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={btnOutline}>Cancel</button>
        <button onClick={onSave} disabled={loading} style={btnPrimary}>
          {loading ? 'Saving…' : 'Save address'}
        </button>
      </div>
    </div>
  </div>
);

/* ─── Benefit Chip ───────────────────────────────────────── */
const BenefitChip = ({ icon, iconBg, text }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    background: T.mist, border: `1px solid ${T.pebble}`,
    borderRadius: 10, padding: '10px 12px',
  }}>
    <div style={{
      width: 28, height: 28, borderRadius: 8,
      background: iconBg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <span style={{ fontSize: 12, color: T.bark, lineHeight: 1.3 }}>{text}</span>
  </div>
);

/* ─── Review Card ────────────────────────────────────────── */
const ReviewCard = ({ name, rating, date, text, color }) => (
  <div style={{
    background: T.white, borderRadius: 12, padding: 14,
    border: `1px solid ${T.pebble}`, marginBottom: 10,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: color, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 13, fontWeight: 500, color: T.white,
        flexShrink: 0,
      }}>
        {name[0]}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: T.bark }}>{name}</p>
        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width={11} height={11} fill={i <= rating ? T.harvest : T.pebble} viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>
      </div>
      <span style={{ fontSize: 11, color: T.stone }}>{date}</span>
    </div>
    <p style={{ fontSize: 13, color: '#5a5a4a', lineHeight: 1.6, fontWeight: 300 }}>{text}</p>
  </div>
);

/* ─── Farmer Card ────────────────────────────────────────── */
const FarmerCard = ({ name, location, bio }) => (
  <div style={{
    background: T.earthLight, borderRadius: 16, padding: 16,
    display: 'flex', gap: 14, border: `1px solid #e0d5c8`,
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: T.sageLight, border: `2px solid ${T.sageMid}`,
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={36} height={36} viewBox="0 0 36 36" fill="none">
        <circle cx={18} cy={13} r={7} fill={T.sage}/>
        <path d="M4 34c0-7.732 6.268-14 14-14s14 6.268 14 14" fill={T.sageMid}/>
      </svg>
    </div>
    <div>
      <p style={{ fontFamily: font.display, fontSize: 16, fontWeight: 400, color: T.bark, marginBottom: 2 }}>
        {name}
      </p>
      <p style={{ fontSize: 12, color: T.earth, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        {Icon.location} {location}
      </p>
      <p style={{ fontSize: 12, color: '#7a6a5a', lineHeight: 1.6, fontWeight: 300 }}>{bio}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, color: T.leaf, fontWeight: 500 }}>
        {Icon.verified} Verified community seller
      </div>
    </div>
  </div>
);

/* ─── Delivery Chip ──────────────────────────────────────── */
const DeliveryChip = ({ emoji, title, sub }) => (
  <div style={{
    flex: 1, background: T.mist, borderRadius: 12,
    padding: 12, border: `1px solid ${T.pebble}`, textAlign: 'center',
  }}>
    <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
    <p style={{ fontSize: 12, fontWeight: 500, color: T.bark }}>{title}</p>
    <p style={{ fontSize: 11, color: T.stone, marginTop: 2 }}>{sub}</p>
  </div>
);

/* ─── Product Detail View (buyer) ────────────────────────── */
const ProductDetailView = ({ product, onAddToCart, onBuyNow, loadingButtons }) => {
  const [qty, setQty] = useState(1);
  const id = product._id;
  const imgSrc = product.image ? `${BASE_URL}${product.image}` : null;

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <HeroIllustration imageUrl={imgSrc} productName={product.name} />
        <span style={{
          position: 'absolute', bottom: 14, left: 14,
          background: T.leaf, color: T.white, fontSize: 11,
          padding: '5px 12px', borderRadius: 20, fontWeight: 500,
          letterSpacing: '0.4px', textTransform: 'uppercase',
        }}>Organic</span>
        <span style={{
          position: 'absolute', bottom: 14, left: 110,
          background: T.harvest, color: T.white, fontSize: 11,
          padding: '5px 12px', borderRadius: 20, fontWeight: 500,
          letterSpacing: '0.4px', textTransform: 'uppercase',
        }}>Pesticide-free</span>
      </div>

      <div style={{ padding: '20px 20px 120px' }}>
        <div className="fade-up" style={{ marginBottom: 12 }}>
          <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 600, color: T.bark, lineHeight: 1.2, marginBottom: 4 }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 14, color: T.stone, fontWeight: 300 }}>Freshly harvested · Farm to table</p>
        </div>

        <div className="fade-up-1" style={{ marginBottom: 14 }}>
          <StarRow rating={4.2} count={128} />
        </div>

        <div className="fade-up-2" style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
          <span style={{ fontFamily: font.display, fontSize: 32, fontWeight: 600, color: T.leaf }}>₹{product.price}</span>
          <span style={{ fontSize: 14, color: T.stone, fontWeight: 300 }}>/kg</span>
          {product.mrp && <span style={{ fontSize: 16, color: T.pebble, textDecoration: 'line-through' }}>₹{product.mrp}</span>}
        </div>

        <div className="fade-up-3">
          <SectionLabel>Quantity</SectionLabel>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: T.mist, borderRadius: 12, width: 'fit-content',
            border: `1px solid ${T.pebble}`, overflow: 'hidden', marginBottom: 20,
          }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              style={{ width: 42, height: 42, background: 'none', border: 'none', fontSize: 22, fontWeight: 300, color: T.sage, cursor: 'pointer' }}>−</button>
            <span style={{ width: 50, textAlign: 'center', fontSize: 16, fontWeight: 500, color: T.bark }}>{qty}</span>
            <span style={{ fontSize: 13, color: T.stone, paddingRight: 6 }}>kg</span>
            <button onClick={() => setQty(q => Math.min(product.quantity || 99, q + 1))}
              style={{ width: 42, height: 42, background: 'none', border: 'none', fontSize: 22, fontWeight: 300, color: T.sage, cursor: 'pointer' }}>+</button>
          </div>
        </div>

        <div className="fade-up-4">
          <SectionLabel>Why it's good</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <BenefitChip icon={Icon.shield} iconBg={T.sageLight} text="No chemicals or pesticides"/>
            <BenefitChip icon={Icon.sun} iconBg={T.harvestLight} text="Sun-grown, open air farming"/>
            <BenefitChip icon={Icon.leaf} iconBg={T.sageLight} text="Harvested same morning"/>
            <BenefitChip icon={Icon.heart} iconBg={T.harvestLight} text="Rich in iron & vitamins"/>
          </div>
        </div>

        <div className="fade-up-5" style={{ marginBottom: 20 }}>
          <SectionLabel>About this product</SectionLabel>
          <p style={{ fontSize: 14, color: '#5a5a4a', lineHeight: 1.7, fontWeight: 300 }}>
            {product.description || 'Tender, young leaves grown without any synthetic inputs. Our cooperative farms use traditional composting and natural irrigation to bring you the most nutrient-dense produce possible — picked at peak freshness and delivered to your door within hours.'}
          </p>
        </div>

        <Divider/>

        <div style={{ marginBottom: 20 }}>
          <SectionLabel>Your farmer</SectionLabel>
          <FarmerCard
            name="Ramesh Yadav"
            location="Barabanki, Uttar Pradesh"
            bio="3rd generation farmer with 22 years of organic practice. Member of the Green Cooperative since 2016."
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <SectionLabel>Delivery</SectionLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            <DeliveryChip emoji="🌿" title="Same day" sub="Order before 10am"/>
            <DeliveryChip emoji="📦" title="Eco packaging" sub="Biodegradable box"/>
            <DeliveryChip emoji="🔄" title="Easy returns" sub="If not fresh"/>
          </div>
        </div>

        <Divider/>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontFamily: font.display, fontSize: 18, fontWeight: 400, color: T.bark }}>Reviews</p>
            <span style={{ fontSize: 13, color: T.sage, fontWeight: 500 }}>See all →</span>
          </div>
          <ReviewCard name="Priya Sharma" rating={5} date="2 days ago" color={T.sage}
            text="Incredibly fresh! The leaves were crisp and clean. Could smell the earth on them. Will order weekly."/>
          <ReviewCard name="Anil Verma" rating={4} date="1 week ago" color={T.earth}
            text="Good quality. Packaging could be better — leaves were a bit loose. Taste is excellent though, clearly pesticide-free."/>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'rgba(250,248,244,0.95)', backdropFilter: 'blur(8px)',
        padding: '14px 20px 28px',
        borderTop: `1px solid ${T.pebble}`,
        display: 'flex', gap: 10, zIndex: 30,
      }}>
        <button
          onClick={() => onAddToCart(id, qty)}
          disabled={loadingButtons[id]}
          style={{
            flex: 1, padding: 14, borderRadius: 12,
            border: `1.5px solid ${T.sage}`, background: 'transparent',
            color: T.sage, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: font.body, transition: 'background 0.2s',
          }}
        >
          Add to Cart
        </button>
        <button
          onClick={() => onBuyNow(id, qty)}
          disabled={loadingButtons[id]}
          style={{
            flex: 2, padding: 14, borderRadius: 12, border: 'none',
            background: T.leaf, color: T.white,
            fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: font.body, transition: 'background 0.2s',
          }}
        >
          Buy Now · ₹{(product.price * qty).toFixed(2)}
        </button>
      </div>
    </div>
  );
};

/* ─── Main ProfilePage ───────────────────────────────────── */
function ProfilePage() {
  const [cart, setCart]                   = useState([]);
  const [userInfo, setUserInfo]           = useState(null);
  const [loading, setLoading]             = useState(true);
  const [loadingButtons, setLoadingButtons] = useState({});
  const [error, setError]                 = useState(null);
  const [orders, setOrders]               = useState([]);
  const [buyerOrders, setBuyerOrders]     = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [newProduct, setNewProduct]       = useState({ name: '', price: '', quantity: '', description: '' });
  const [imageFile, setImageFile]         = useState(null);
  const [editProduct, setEditProduct]     = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [address, setAddress]             = useState('');
  const [showMenu, setShowMenu]           = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showFulfilledOrders, setShowFulfilledOrders] = useState(false);
  const [showBuyingHistory, setShowBuyingHistory]     = useState(false);
  const [selectedProduct, setSelectedProduct]         = useState(null);
  const [refreshing, setRefreshing]       = useState(false);
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
        } catch (err) { console.error('Refresh error:', err); }
        setTimeout(() => setRefreshing(false), 1000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [navigate, userInfo?.role]);

  /* ── handlers ─────────────────────────────────────────── */
  const handleLogout = async () => {
    try { setLoading(true); await logout(); localStorage.removeItem('token'); navigate('/auth'); }
    catch { setError('Error logging out. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleQtyChange = async (productId, delta) => {
    const item = cart.find(i => i.productId._id === productId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    try {
      setLoadingButtons(p => ({ ...p, [productId]: true }));
      const res = await updateCartQuantity(productId, newQty);
      setCart(res.data.products || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update quantity.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoadingButtons(p => ({ ...p, [productId]: false }));
    }
  };

  const handleRemove = async (productId) => {
    try {
      setLoadingButtons(p => ({ ...p, [productId]: true }));
      const res = await removeFromCart(productId);
      setCart(res.data.products || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to remove item.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoadingButtons(p => ({ ...p, [productId]: false }));
    }
  };

  const handleMarkAsDone = async (orderId) => {
    try {
      setLoadingButtons(p => ({ ...p, [orderId]: true }));
      await markOrderAsDone(orderId);
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'completed' } : o));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to mark order as done.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoadingButtons(p => ({ ...p, [orderId]: false }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('name', newProduct.name);
      fd.append('price', parseFloat(newProduct.price));
      fd.append('quantity', parseInt(newProduct.quantity, 10));
      fd.append('description', newProduct.description);
      if (imageFile) fd.append('image', imageFile);
      const res = await listProduct(fd);
      setSellerProducts([...sellerProducts, res.data.product]);
      setNewProduct({ name: '', price: '', quantity: '', description: '' });
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add product.');
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      setLoading(true);
      await updateAddress(address);
      setUserInfo({ ...userInfo, address });
      setShowAddressModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update address.');
      if (err.response?.status === 401) navigate('/auth');
    } finally { setLoading(false); }
  };

  const handleUpdateProduct = async (productId) => {
    try {
      setLoading(true);
      const fd = new FormData();
      if (editProduct.price !== undefined) fd.append('price', parseFloat(editProduct.price));
      if (editProduct.quantity !== undefined) fd.append('quantity', parseInt(editProduct.quantity, 10));
      if (editImageFile) fd.append('image', editImageFile);
      const res = await updateProduct(productId, fd);
      setSellerProducts(sellerProducts.map(p => p._id === productId ? res.data.product : p));
      setEditProduct(null); setEditImageFile(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update product.');
      if (err.response?.status === 401) navigate('/auth');
    } finally { setLoading(false); }
  };

  const cartTotal = () => cart.reduce((t, i) => t + (i.productId.price || 0) * (i.quantity || 0), 0).toFixed(2);
  const unfulfilledOrders = orders.filter(o => o.status === 'pending');
  const fulfilledOrders = orders.filter(o => o.status === 'completed').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,10);
  const last10BuyerOrders = [...buyerOrders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,10);

  /* ── product detail page ──────────────────────────────── */
  if (selectedProduct) {
    return (
      <div style={{ maxWidth: 430, margin: '0 auto', background: T.cream, minHeight: '100vh', position: 'relative' }}>
        <GlobalStyles/>
        <button
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed', top: 16, left: 16, zIndex: 40,
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', border: `1px solid ${T.pebble}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {Icon.back}
        </button>
        <ProductDetailView
          product={selectedProduct}
          onAddToCart={(id, qty) => { setSelectedProduct(null); }}
          onBuyNow={() => navigate('/payment')}
          loadingButtons={loadingButtons}
        />
      </div>
    );
  }

  /* ── main page ────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: T.cream, minHeight: '100vh', fontFamily: font.body }}>
      <GlobalStyles/>

      {/* Header */}
      <div style={{
        padding: '20px 20px 0',
        background: `linear-gradient(180deg, ${T.sageLight} 0%, ${T.cream} 100%)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: T.stone, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2 }}>
              {userInfo?.role === 'community' ? 'Seller dashboard' : 'My profile'}
            </p>
            <h1 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 600, color: T.bark }}>
              {userInfo?.name || 'Welcome'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {userInfo?.role === 'community' && (
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: refreshing ? T.sage : T.pebble,
                animation: refreshing ? 'pulse 1s infinite' : 'none',
              }} title="Auto-refreshing orders"/>
            )}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: T.white, border: `1px solid ${T.pebble}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {Icon.menu}
              </button>
              {showMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: 46,
                  background: T.white, borderRadius: 14,
                  border: `1px solid ${T.pebble}`, overflow: 'hidden',
                  zIndex: 20, minWidth: 190,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  animation: 'fadeUp 0.2s ease',
                }}>
                  {[
                    { label: 'Change address', action: () => { setShowAddressModal(true); setShowMenu(false); } },
                    userInfo?.role === 'community' && {
                      label: showFulfilledOrders ? 'Hide fulfilled orders' : 'View fulfilled orders',
                      action: () => { setShowFulfilledOrders(!showFulfilledOrders); setShowMenu(false); }
                    },
                    userInfo?.role === 'buyer' && {
                      label: showBuyingHistory ? 'Hide buying history' : 'View buying history',
                      action: () => { setShowBuyingHistory(!showBuyingHistory); setShowMenu(false); }
                    },
                    { label: 'Logout', action: handleLogout, danger: true },
                  ].filter(Boolean).map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '12px 16px', background: 'none', border: 'none',
                        fontSize: 14, color: item.danger ? T.red : T.bark,
                        cursor: 'pointer', fontFamily: font.body,
                        borderTop: i > 0 ? `1px solid ${T.mist}` : 'none',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 40px' }}>
        {loading && <Spinner/>}
        {error && <ErrorBanner msg={error} onLogin={() => navigate('/auth')}/>}

        {!loading && !error && userInfo && (
          <>
            {/* ── BUYER VIEW ─────────────────────────────── */}
            {userInfo.role === 'buyer' && (
              <div>
                {/* Cart */}
                <section style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.bark }}>Your cart</p>
                    <span style={{
                      background: T.sageLight, color: T.leaf,
                      fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
                    }}>
                      {cart.length} items
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '40px 20px',
                      background: T.mist, borderRadius: 16,
                      border: `1px dashed ${T.pebble}`,
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
                      <p style={{ color: T.stone, fontSize: 14 }}>Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      {cart.map(item => (
                        <CartItem
                          key={item.productId._id}
                          item={item}
                          onQtyChange={handleQtyChange}
                          onRemove={handleRemove}
                          loading={loadingButtons}
                        />
                      ))}
                      <div style={{
                        background: T.white, borderRadius: 16, padding: 16,
                        border: `1px solid ${T.pebble}`, marginTop: 8,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <span style={{ fontSize: 14, color: T.stone }}>Subtotal ({cart.length} items)</span>
                          <span style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.leaf }}>₹{cartTotal()}</span>
                        </div>
                        <button
                          onClick={() => navigate('/payment')}
                          style={{ ...btnPrimary, flex: 'none', width: '100%', fontSize: 15 }}
                        >
                          Proceed to checkout →
                        </button>
                      </div>
                    </>
                  )}
                </section>

                {/* Buying History */}
                {showBuyingHistory && (
                  <section style={{ marginBottom: 24 }}>
                    <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.bark, marginBottom: 14 }}>
                      Buying history
                    </p>
                    {last10BuyerOrders.length === 0 ? (
                      <p style={{ color: T.stone, textAlign: 'center', padding: '20px 0' }}>No past orders.</p>
                    ) : last10BuyerOrders.map(order => (
                      <OrderCard key={order._id} order={order} loadingButtons={loadingButtons}/>
                    ))}
                  </section>
                )}
              </div>
            )}

            {/* ── SELLER VIEW ────────────────────────────── */}
            {userInfo.role === 'community' && (
              <div>
                {/* My Products */}
                <section style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.bark }}>Your products</p>
                    <span style={{
                      background: T.sageLight, color: T.leaf,
                      fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
                    }}>
                      {sellerProducts.length} listed
                    </span>
                  </div>
                  {sellerProducts.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '40px 20px',
                      background: T.mist, borderRadius: 16,
                      border: `1px dashed ${T.pebble}`,
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🌱</div>
                      <p style={{ color: T.stone, fontSize: 14 }}>No products listed yet</p>
                    </div>
                  ) : sellerProducts.map(p => (
                    <SellerProductCard
                      key={p._id}
                      product={p}
                      editProduct={editProduct}
                      setEditProduct={setEditProduct}
                      editImageFile={editImageFile}
                      setEditImageFile={setEditImageFile}
                      onSave={handleUpdateProduct}
                      loading={loading}
                    />
                  ))}
                </section>

                {/* Orders to Fulfill */}
                <section style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.bark }}>Orders to fulfill</p>
                    {unfulfilledOrders.length > 0 && (
                      <span style={{
                        background: '#fff8e1', color: '#e65100',
                        fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
                        border: '1px solid #ffe082',
                      }}>
                        {unfulfilledOrders.length} pending
                      </span>
                    )}
                  </div>
                  {unfulfilledOrders.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '40px 20px',
                      background: T.mist, borderRadius: 16, border: `1px dashed ${T.pebble}`,
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                      <p style={{ color: T.stone, fontSize: 14 }}>All caught up!</p>
                    </div>
                  ) : unfulfilledOrders.map(order => (
                    <OrderCard
                      key={order._id} order={order} isSeller
                      onMarkAsDone={handleMarkAsDone} loadingButtons={loadingButtons}
                    />
                  ))}
                </section>

                {/* Fulfilled Orders */}
                {showFulfilledOrders && (
                  <section style={{ marginBottom: 24 }}>
                    <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.bark, marginBottom: 14 }}>
                      Fulfilled orders (last 10)
                    </p>
                    {fulfilledOrders.length === 0 ? (
                      <p style={{ color: T.stone, textAlign: 'center', padding: '20px 0' }}>No fulfilled orders yet.</p>
                    ) : fulfilledOrders.map(order => (
                      <OrderCard key={order._id} order={order} isSeller loadingButtons={loadingButtons}/>
                    ))}
                  </section>
                )}

                {/* Add New Product */}
                <section style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: T.bark, marginBottom: 14 }}>
                    Add new product
                  </p>
                  <div style={{
                    background: T.white, borderRadius: 16, padding: 20,
                    border: `1px solid ${T.pebble}`,
                  }}>
                    <form onSubmit={handleAddProduct}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          { key: 'name', placeholder: 'Product name', type: 'text' },
                          { key: 'price', placeholder: 'Price per kg (₹)', type: 'number', step: '0.01' },
                          { key: 'quantity', placeholder: 'Available quantity (kg)', type: 'number' },
                        ].map(({ key, placeholder, type, step }) => (
                          <input
                            key={key}
                            type={type}
                            step={step}
                            value={newProduct[key]}
                            onChange={e => setNewProduct({ ...newProduct, [key]: e.target.value })}
                            placeholder={placeholder}
                            required
                            style={inputStyle}
                          />
                        ))}
                        <textarea
                          value={newProduct.description}
                          onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Description (optional)"
                          rows={3}
                          style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setImageFile(e.target.files[0])}
                          style={{ ...inputStyle, fontSize: 13, padding: '9px 12px' }}
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          style={{ ...btnPrimary, flex: 'none', marginTop: 4 }}
                        >
                          {loading ? 'Adding product…' : '+ Add product'}
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </div>

      {showAddressModal && (
        <AddressModal
          address={address}
          setAddress={setAddress}
          onSave={handleUpdateAddress}
          onClose={() => setShowAddressModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

export default ProfilePage;