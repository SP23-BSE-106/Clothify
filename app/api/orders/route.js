import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET(req) {
  try {
    await dbConnect();

    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('items.product', 'name price').lean();

    // Debug: log number of orders returned and IDs (helps debugging missing records)
    try {
      console.log(`orders GET: found ${orders.length} orders`);
      console.log('orders IDs:', orders.map(o => o._id));
    } catch (e) {
      // ignore logging errors
    }

    return new Response(JSON.stringify({ orders }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('orders GET error', err);
    return new Response(JSON.stringify({ error: 'Failed to load orders' }), { status: 500 });
  }
}

// Simulate payment gateway (non-blocking, asynchronous)
async function simulatePayment(amount) {
  // Simulate network delay (non-blocking I/O)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // 1-3 seconds
  // Random success/failure for demonstration
  return Math.random() > 0.1; // 90% success rate
}

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const { name, address, items, total } = body;
    if (!name || !address || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid order data' }), { status: 400 });
    }

    // Validate stock for all items (prevent overselling)
    for (const item of items) {
      const product = await Product.findById(item.product._id || item.product.id);
      if (!product) {
        return new Response(JSON.stringify({ error: `Product ${item.product.name} not found` }), { status: 400 });
      }
      if (product.stock < item.qty) {
        return new Response(JSON.stringify({ error: `Insufficient stock for ${item.product.name}. Available: ${product.stock}` }), { status: 400 });
      }
    }

    // Decrement stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product._id || item.product.id,
        { $inc: { stock: -item.qty } }
      );
    }

    // Create order
    const orderItems = items.map(item => ({
      product: item.product._id || item.product.id,
      qty: item.qty,
      size: item.size
    }));
    const order = await Order.create({ name, address, items: orderItems, total, status: 'pending' });

    // Event-driven payment processing (non-blocking)
    // Simulate payment asynchronously without blocking the response
    simulatePayment(total).then(async (success) => {
      const status = success ? 'paid' : 'failed';
      await Order.findByIdAndUpdate(order._id, { status });
      console.log(`Payment ${status} for order ${order._id}`);
    }).catch(err => {
      console.error('Payment simulation error:', err);
      Order.findByIdAndUpdate(order._id, { status: 'failed' });
    });

    return new Response(JSON.stringify({ order, message: 'Order placed, payment processing...' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('order POST error', err);
    return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'Order ID and status are required' }), { status: 400 });
    }

    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('items.product', 'name price');

    if (!updatedOrder) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ order: updatedOrder }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('order PUT error', err);
    return new Response(JSON.stringify({ error: 'Failed to update order' }), { status: 500 });
  }
}
