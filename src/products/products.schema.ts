import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0, // percentage or fixed amount
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
  type: String,
  required: true,
  unique: true,
},
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", ProductSchema);
