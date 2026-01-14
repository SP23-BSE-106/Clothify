import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  sizes: { type: [String], default: [] },
  stock: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
