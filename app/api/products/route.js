import productsSeed from './_products.json';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req) {
  try {
    await dbConnect();

    // If DB empty, seed some products
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(productsSeed);
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    const filter = q
      ? { $or: [ { name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } } ] }
      : {};

    const result = await Product.find(filter).sort({ createdAt: -1 }).lean();

    return new Response(JSON.stringify({ products: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('products GET error', err);
    return new Response(JSON.stringify({ error: 'Failed to load products' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { name, description, price, image, sizes, stock } = await req.json();

    if (!name || !price) {
      return new Response(JSON.stringify({ error: 'Name and price are required' }), { status: 400 });
    }

    const product = await Product.create({
      name,
      description: description || '',
      price,
      image: image || '',
      sizes: sizes || [],
      stock: stock || 0
    });

    return new Response(JSON.stringify({ product }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('products POST error', err);
    return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
  }
}
