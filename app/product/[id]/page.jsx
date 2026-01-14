"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/cart';

export default function ProductPage({ params }) {
  const { id } = React.use(params);
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      const found = (d.products || []).find(p => (p._id || p.id) === id);
      setProduct(found || null);
      if (found && found.sizes && found.sizes.length) setSize(found.sizes[0]);
    });
  }, [id]);

  if (!product) return <div className="page-container">Loading...</div>;

  function handleAdd() {
    addToCart(product, Number(qty), size);
    router.push('/cart');
  }

  const isOutOfStock = !product.stock || product.stock <= 0;

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '1rem auto' }}>
      <div style={{ display: 'flex', gap: 20 }}>
        <img src={product.image} alt={product.name} style={{ width: 420, height: 420, objectFit: 'cover', borderRadius: 8 }} />
        <div>
          <h1>{product.name}</h1>
          <p style={{ color: '#9ca3af' }}>{product.description}</p>
          <h2 style={{ marginTop: 12 }}>${product.price.toFixed(2)}</h2>
          <p style={{ marginTop: 8, color: isOutOfStock ? 'red' : 'green' }}>
            {isOutOfStock ? 'Out of Stock' : `In Stock: ${product.stock}`}
          </p>

          <div style={{ marginTop: 12 }}>
            <label>Size</label>
            <select value={size || ''} onChange={e => setSize(e.target.value)} className="form-select" style={{ marginLeft: 8 }}>
              {(product.sizes || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Quantity</label>
            <input type="number" min={1} max={product.stock || 1} value={qty} onChange={e => setQty(Math.min(Number(e.target.value) || 1, product.stock || 1))} className="form-input" style={{ width: 100, marginLeft: 8 }} />
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="auth-submit-button" onClick={handleAdd} disabled={isOutOfStock}>Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
