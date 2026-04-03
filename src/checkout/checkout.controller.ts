import { Request, Response } from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import { Product } from "../products/products.schema";
import { AuthRequest } from "../middleware/auth.middleware";
import { v4 as uuid } from "uuid";
import { Order } from "../orders/order.schema";
import { Cart } from "../carts/cart.schema";
import { User } from "../users/users.schema";

const stripe = new Stripe(process.env.S_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ✅ Calculate total amount
function calculateAmount(items: any[]) {
  return items.reduce((total, item) => {
    const discountAmount = (item.price * item.discount) / 100;
    const finalPrice = item.price - discountAmount;
    return total + finalPrice * item.qnt;
  }, 0);
}

// ✅ CREATE CHECKOUT
export const createCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const payloadProducts = req.body.products;

    if (!payloadProducts || !payloadProducts.length) {
      return res.status(400).json({ message: "Products required" });
    }

    // ✅ Convert IDs properly
    const productIds = payloadProducts.map(
      (p: any) => new mongoose.Types.ObjectId(p.id)
    );

    // ✅ Fetch products from DB
    const dbProducts = await Product.find({
      _id: { $in: productIds },
    });

    if (dbProducts.length !== payloadProducts.length) {
      return res.status(400).json({ message: "Invalid product detected" });
    }

    // ✅ Attach quantity
    const productsWithQuantity = dbProducts.map((product) => {
      const match = payloadProducts.find(
        (p: any) => p.id === product._id.toString()
      );

      return {
        ...product.toObject(),
        qnt: match.qnt,
      };
    });

    const amount = Math.round(calculateAmount(productsWithQuantity));

    const name =
      productsWithQuantity.length === 1
        ? productsWithQuantity[0].title
        : `${productsWithQuantity.length} items purchase`;

    const sessionId = uuid();

    // ✅ Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        metadata: {
          userId: req.user?.id || "",
          sessionId,
          products: JSON.stringify(payloadProducts),
        },
      },
      success_url: process.env.PAYMENT_SUCCESS_URL!,
      cancel_url: process.env.PAYMENT_FAILED_URL!,
    });

    // ✅ 🔥 Fetch user for address
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ Format products for order
    const formattedProducts = payloadProducts.map((p: any) => ({
      id: new mongoose.Types.ObjectId(p.id),
      qnt: p.qnt,
    }));

    // ✅ 🔥 Create Order with shippingAddress
    await Order.create({
      sessionId,
      user: user._id,
      products: formattedProducts,
      amount,

      shippingAddress: {
        fullname: user.fullname,
        mobile: user.mobile,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country,
      },
    });

    res.json({ paymentLink: session.url });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Something went wrong",
    });
  }
};

// ✅ WEBHOOK
export const webhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.log("Webhook signature verification failed.");
    return res.status(400).send("Webhook Error");
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentIntentId = session.payment_intent as string;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      const metadata = paymentIntent.metadata;

      if (!metadata.products) {
        console.log("Products missing in metadata");
        return res.json({ received: true });
      }

      const products = JSON.parse(metadata.products);

      const ids = products.map(
        (item: any) => new mongoose.Types.ObjectId(item.id)
      );

      // ✅ Mark order as paid
      await Order.findOneAndUpdate(
        { sessionId: metadata.sessionId },
        { paymentStatus: "paid" },
        { new: true }
      );

      // ✅ Clear cart
      await Cart.deleteMany({
        user: metadata.userId,
        product: { $in: ids },
      });

      console.log("Cart cleared successfully");
    }

    res.json({ received: true });
  } catch (err) {
    console.log(err);
    res.status(500).send("Webhook processing error");
  }
};