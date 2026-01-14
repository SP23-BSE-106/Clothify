"use client";

import { useState } from 'react';
import { getCart, clearCart, cartTotal } from '@/lib/cart';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  function loadCart() {
    return getCart();
  }

  async function handlePay(e) {
    e.preventDefault();
    setProcessing(true);
    const cart = loadCart();

    // Validate stock before proceeding (client-side check)
    for (const item of cart.items) {
      if (item.product.stock < item.qty) {
        alert(`Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`);
        setProcessing(false);
        return;
      }
    }

    // Send order to backend API (server will handle atomic stock decrement)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, items: cart.items, total: cartTotal(cart) })
      });

      const data = await res.json();
      console.log( 'order api response', data);
      if (!res.ok) {
        console.error('order api error', data);
        setProcessing(false);
        alert(data.error || 'Failed to place order');
        return;
      }

      clearCart();
      setProcessing(false);
      alert(data.message || 'Order placed successfully!');
      router.push(`/order/confirmation?orderId=${data.order._id}`);
    } catch (err) {
      console.error(err);
      setProcessing(false);
      alert('Failed to place order');
    }
  }

  const cart = loadCart();

  if (!cart.items.length) return (
    <div className="page-container" style={{ padding: 40, textAlign: 'center' }}>
      <h2>Your cart is empty</h2>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 700, margin: '1rem auto' }}>
      <h1>Checkout</h1>
      <div className="info-card">
        <h3>Order Summary</h3>
        {cart.items.map((it) => {
          const key = `${it.product._id || it.product.id || it.product.name}-${it.size || 'ns'}`;
          return (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <div>{it.product.name} x {it.qty}</div>
            <div>${(it.product.price * it.qty).toFixed(2)}</div>
          </div>
        )})}
        <div style={{ textAlign: 'right', marginTop: 8 }}>Total: <strong>${cartTotal(cart).toFixed(2)}</strong></div>
      </div>

      <form onSubmit={handlePay} className="info-card" style={{ marginTop: 12 }}>
        <div className="form-group">
          <label className="form-label">Full name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Shipping address</label>
          <textarea className="form-input" value={address} onChange={e => setAddress(e.target.value)} required />
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="auth-submit-button" type="submit" disabled={processing}>{processing ? 'Processing...' : `Pay $${cartTotal(cart).toFixed(2)}`}</button>
        </div>
      </form>
    </div>
  );
}
