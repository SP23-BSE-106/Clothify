import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    await dbConnect();

    const order = await Order.findById(id);
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ order }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('order GET error', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch order' }), { status: 500 });
  }
}
