import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Order } from "./order.schema";

export const fetchOrders = async (req: AuthRequest, res: Response) => {
  try {
    const isUser = req.user?.role === "user";

    const query = isUser
      ? { user: req.user?.id, paymentStatus: "paid" }
      : { paymentStatus: "paid" };

    const orders = await Order.find(query)
      .populate("user", "-password") // ✅ always populate user
      .populate("products.id") // ✅ populate product
      .sort({ createdAt: -1 }); // ✅ newest first

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Something went wrong",
    });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // ✅ IMPORTANT FIX
    );

    if (!order) throw new Error("Order not found");

    res.json({
      message: "Order updated",
      order, // ✅ return updated order (useful for UI)
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Something went wrong",
    });
  }
};