"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function doSearch(e) {
    e.preventDefault();
    const res = await fetch('/api/products?q=' + encodeURIComponent(q));
    const data = await res.json();
    setProducts(data.products || []);
  }

  return (
    <div className="page-container shop-page">
      <section className="hero-section">
        <h1 className="hero-title">Clothify</h1>
        <p className="hero-subtitle">Hand-picked clothes for every season.</p>
      </section>

      <section className="search-bar" style={{ maxWidth: 800, margin: '1rem auto' }}>
        <form onSubmit={doSearch} style={{ display: 'flex', gap: 8 }}>
          <input value={q} onChange={e => setQ(e.target.value)} className="form-input" placeholder="Search products..." />
          <button className="auth-submit-button" type="submit">Search</button>
        </form>
      </section>

      <section className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px,1fr))', gap: 16, maxWidth: 1100, margin: '1rem auto' }}>
        {products.map(p => {
          const isOutOfStock = !p.stock || p.stock <= 0;
          return (
          <div key={p._id || p.id || p.name} className="info-card" style={{ display: 'flex', gap: '1rem', padding: 12, opacity: isOutOfStock ? 0.6 : 1 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginTop: 0 }}>{p.name}</h3>
              <p style={{ color: '#9ca3af', margin: '0.5rem 0' }}>{p.description}</p>
              <p style={{ color: isOutOfStock ? 'red' : 'green', fontSize: '0.9rem' }}>
                {isOutOfStock ? 'Out of Stock' : `Stock: ${p.stock}`}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <strong>${p.price.toFixed(2)}</strong>
                <Link href={`/product/${p._id || p.id}`} className="auth-submit-button" style={{ padding: '6px 10px', pointerEvents: isOutOfStock ? 'none' : 'auto', opacity: isOutOfStock ? 0.5 : 1 }}>View</Link>
              </div>
            </div>
            <img src={p.image} alt={p.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: 8 }} />
          </div>
        )})}
      </section>
    </div>
  );
}
