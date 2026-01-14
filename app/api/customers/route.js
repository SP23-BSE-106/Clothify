import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET(req) {
  try {
    await dbConnect();

    const customers = await Customer.find({}).sort({ createdAt: -1 }).lean();

    return new Response(JSON.stringify({ customers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('customers GET error', err);
    return new Response(JSON.stringify({ error: 'Failed to load customers' }), { status: 500 });
  }
}
