"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCart, removeFromCart, cartTotal } from '@/lib/cart';

export default function CartPage() {
  const [cart, setCart] = useState({ items: [] });

  useEffect(() => {
    setCart(getCart());
  }, []);

  function handleRemove(pId, size) {
    console.log('removing from cart', pId, size);
    const updated = removeFromCart(pId, size);
    setCart(updated);
    
  }

  if (!cart || !cart.items.length) return (
    <div className="page-container" style={{ textAlign: 'center', padding: 40 }}>
      <h2>Your cart is empty</h2>
      <p><Link href="/shop" className="auth-submit-button">Go to shop</Link></p>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '1rem auto' }}>
      <h1>Your Cart</h1>
      <div>
        {cart.items.map(it => (
          <div key={`${it.product._id || it.product.id || it.product.name}-${it.size || 'ns'}`} className="info-card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <img src={it.product.image} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} />
            <div style={{ flex: 1 }}>
              <strong>{it.product.name}</strong>
              <div style={{ color: '#9ca3af' }}>{it.size ? `Size: ${it.size}` : ''}</div>
            </div>
            <div>${(it.product.price * it.qty).toFixed(2)}</div>
            <button className="auth-submit-button" onClick={() => handleRemove(it.product._id || it.product.id, it.size)}>Remove</button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <h3>Total: ${cartTotal(cart).toFixed(2)}</h3>
        <Link href="/checkout" className="auth-submit-button" style={{ marginTop: 8 }}>Proceed to checkout</Link>
      </div>
    </div>
  );
}
