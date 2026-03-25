import mongoose, { model, Schema } from "mongoose";

const cartSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  qnt: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

export const Cart = model('Cart', cartSchema);
