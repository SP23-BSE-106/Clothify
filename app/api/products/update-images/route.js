import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// Simple admin-protected endpoint to update product images based on product name.
// Protection: requires header 'x-admin-secret' matching process.env.ADMIN_SECRET (or 'dev-secret' by default).

const IMAGE_MAP = {
  'Classic White T-Shirt': 'https://images.unsplash.com/photo-1520975698518-7e4b7f6a3e6b?auto=format&fit=crop&w=1000&q=80',
  'Blue Denim Jacket': 'https://images.unsplash.com/photo-1562158070-9b1f3b1f8f8e?auto=format&fit=crop&w=1000&q=80',
  'Black Skinny Jeans': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80',
  'Red Summer Dress': 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1000&q=80'
};

export async function POST(req) {
  const adminSecret = process.env.ADMIN_SECRET || 'dev-secret';
  const provided = req.headers.get('x-admin-secret');
  if (provided !== adminSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    await dbConnect();

    const results = [];
    for (const [name, url] of Object.entries(IMAGE_MAP)) {
      const updated = await Product.findOneAndUpdate({ name }, { image: url }, { new: true }).lean();
      results.push({ name, updated: !!updated, id: updated ? updated._id : null });
    }

    // Also return count of products updated
    const updatedCount = results.filter(r => r.updated).length;

    return new Response(JSON.stringify({ message: 'Image update completed', updatedCount, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('update-images error', err);
    return new Response(JSON.stringify({ error: 'Failed to update images' }), { status: 500 });
  }
}

export const GET = () => new Response(JSON.stringify({ error: 'Use POST' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
