import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true },
  size: { type: String }
});

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'paid', 'failed'] },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
