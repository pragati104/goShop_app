import { Router, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { Cart } from "../carts/cart.schema";
import { Order } from "../orders/order.schema";

import {
  AuthAccessMiddleware,
  AuthRequest
} from "../middleware/auth.middleware";

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

router.post(
  "/",
  AuthAccessMiddleware, // 🔐 protect route
  async (req: AuthRequest, res: Response) => {
    try {
      const message = req.body.message?.toLowerCase();

      if (!message) {
        return res.json({ reply: "Please type something 😅" });
      }

      // ✅ user from token
      if (!req.user) {
        return res.json({ reply: "Please login first 🔐" });
      }

      const userId = req.user.id;

      // =========================
      // 🛒 CART LOGIC
      // =========================
      if (
        message.includes("cart") ||
        message.includes("items") ||
        message.includes("bag")
      ) {
        const cartItems = await Cart.find({ user: userId }).populate("product");

        const totalQty = cartItems.reduce(
          (sum, item) => sum + item.qnt,
          0
        );

        if (totalQty === 0) {
          return res.json({
            reply: "🛒 Your cart is empty"
          });
        }

        return res.json({
          reply: `🛒 You have ${totalQty} items in your cart`
        });
      }

      // =========================
      // 📦 ORDER LOGIC
      // =========================
      if (
        message.includes("order") ||
        message.includes("delivery") ||
        message.includes("status")
      ) {
        const orders = await Order.find({ user: userId }).sort({
          createdAt: -1
        });

        if (!orders.length) {
          return res.json({
            reply: "📦 You have no orders yet"
          });
        }

        const latest = orders[0];

        return res.json({
          reply: `📦 Your latest order is currently: ${latest.status}`
        });
      }

      // =========================
      // 🤖 GEMINI AI RESPONSE
      // =========================
      const result = await model.generateContent(
        `You are a helpful assistant for an ecommerce app called GoShop.
         Keep answers short and helpful.
         User question: ${message}`
      );

      const text = result.response.text();

      return res.json({
        reply: text
      });

    } catch (error) {
      console.error("Chatbot error:", error);

      return res.json({
        reply: "Something went wrong 😅 Please try again."
      });
    }
  }
);

export { router as chatRouter };