"use client";

// Simple cart helper that reads/writes to localStorage. Used by client components.
export const CART_KEY = 'clothify_cart_v1';

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { items: [] };
    return JSON.parse(raw);
  } catch (err) {
    return { items: [] };
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    // ignore
  }
}

export function addToCart(product, qty = 1, size = null) {
  const cart = getCart();
  const existing = cart.items.find(i => (i.product._id || i.product.id) === (product._id || product.id) && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ product, qty, size });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId, size = null) {
  const cart = getCart();
  cart.items = cart.items.filter(i => !((i.product._id || i.product.id) === productId && i.size === size));
  saveCart(cart);
  return cart;
}

export function clearCart() {
  const cart = { items: [] };
  saveCart(cart);
  return cart;
}

export function cartTotal(cart) {
  return cart.items.reduce((s, it) => s + (it.product.price || 0) * (it.qty || 1), 0);
}
