"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function OrderConfirmation() {
  const search = useSearchParams();
  const orderId = search.get('orderId');
  const [order, setOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!orderId) return;
    try {
      const raw = localStorage.getItem('clothify_orders_v1');
      const orders = raw ? JSON.parse(raw) : [];
      const found = orders.find(o => o.id === orderId);
      if (found) {
        setOrder(found);
      } else {
        // If not found in localStorage, try to fetch from API
        fetch(`/api/orders/${orderId}`)
          .then(r => r.json())
          .then(data => {
            if (data.order) {
              setOrder(data.order);
            } else {
              setOrder(null);
            }
          })
          .catch(err => {
            console.error('Failed to fetch order from API:', err);
            setOrder(null);
          });
      }
    } catch (err) {
      setOrder(null);
    }
  }, [orderId]);

  if (!order) return (
    <div className="page-container" style={{ padding: 40 }}>
      <h2>Order not found</h2>
      <p><button className="auth-submit-button" onClick={() => router.push('/shop')}>Back to shop</button></p>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '1rem auto' }}>
      <h1>Thank you for your order</h1>
      <p>Order #{order.id || order._id} placed on {new Date(order.createdAt).toLocaleString()}</p>

      <div className="info-card" style={{ marginTop: 12 }}>
        <h3>Shipping to</h3>
        <div>{order.name}</div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{order.address}</div>
      </div>

      <div className="info-card" style={{ marginTop: 12 }}>
        <h3>Items</h3>
        {order.items.map((it) => {
          const key = `${it.product._id || it.product.id || it.product.name}-${it.size || 'ns'}`;
          return (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <div>{it.product.name} {it.size ? `(${it.size})` : ''} x {it.qty}</div>
            <div>${(it.product.price * it.qty).toFixed(2)}</div>
          </div>
        )})}
        <div style={{ textAlign: 'right', marginTop: 8 }}>Total: <strong>${order.total.toFixed(2)}</strong></div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="auth-submit-button" onClick={() => router.push('/shop')}>Continue shopping</button>
      </div>
    </div>
  );
}
