import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true
    },
    products: [{
        id: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        qnt: {
            type: Number,
            required: true
        }
    }],
    amount: {
      type: Number,
      required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid"
    },
    status: {
        type: String,
        enum: ["pending", "dispatched", "cancelled"],
        default: "pending"
    }
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", OrderSchema);
