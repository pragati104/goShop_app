import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // ✅ Reference to User (correct)
    user: {
      type: mongoose.Schema.Types.ObjectId, // ⚠️ FIX (not mongoose.Types.ObjectId)
      ref: "User",
      required: true,
    },

    // ✅ Products with reference
    products: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId, // ⚠️ FIX
          ref: "Product",
          required: true,
        },
        qnt: {
          type: Number,
          required: true,
        },
      },
    ],

    // ✅ Order total
    amount: {
      type: Number,
      required: true,
    },

    // ✅ Stripe session
    sessionId: {
      type: String,
      required: true,
    },

    // ✅ Payment status
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    // ✅ Order status
    status: {
      type: String,
      enum: ["pending", "dispatched", "cancelled"], // keep consistent spelling
      default: "pending",
    },

    // 🔥 NEW (VERY IMPORTANT) → store address snapshot
    shippingAddress: {
      fullname: String,
      mobile: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", OrderSchema);