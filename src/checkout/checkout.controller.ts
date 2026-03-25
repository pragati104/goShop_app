import { Request, Response } from "express"
import Stripe from "stripe"
import mongoose from "mongoose"
import { Product } from "../products/products.schema"
import { AuthRequest } from "../middleware/auth.middleware"
import { v4 as uuid } from "uuid"
import { Order } from "../orders/order.schema"
import { Cart } from "../carts/cart.schema"

const stripe = new Stripe(process.env.S_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

function calculateAmount(items: any[]) {
  return items.reduce((total, item) => {
    const discountAmount = (item.price * item.discount) / 100
    const finalPrice = item.price - discountAmount
    return total + finalPrice * item.qnt
  }, 0)
}

export const createCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const payloadProducts = req.body.products

    if (!payloadProducts || !payloadProducts.length)
      return res.status(400).json({ message: "Products required" })

    const productIds = payloadProducts.map((p: any) =>
      mongoose.Types.ObjectId.createFromHexString(p.id)
    )

    const dbProducts = await Product.find({
      _id: { $in: productIds }
    })

    if (dbProducts.length !== payloadProducts.length)
      return res.status(400).json({ message: "Invalid product detected" })

    const productsWithQuantity = dbProducts.map(product => {
      const match = payloadProducts.find(
        (p: any) => p.id === product._id.toString()
      )

      return {
        ...product.toObject(),
        qnt: match.qnt
      }
    })

    const amount = Math.round(calculateAmount(productsWithQuantity))

    const name =
      productsWithQuantity.length === 1
        ? productsWithQuantity[0].title
        : `${productsWithQuantity.length} items purchase`

    const sessionId = uuid()
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name },
            unit_amount: amount * 100
          },
          quantity: 1
        }
      ],
      payment_intent_data: {
          metadata : {
            userId: req.user?.id || "",
            sessionId,
            products: JSON.stringify(payloadProducts)
          }
      },
      success_url: process.env.PAYMENT_SUCCESS_URL!,
      cancel_url: process.env.PAYMENT_FAILED_URL!
    })

    await Order.create({
        sessionId,
        user: req.user?.id,
        products: payloadProducts,
        amount
    })

    res.json({ paymentLink: session.url })
    
  } 
  catch (err) {
    if (err instanceof Error)
      res.status(500).json({ message: err.message })
  }
}

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
    return res.status(400).send(`Webhook Error`);
  }

  try {

    if (event.type === "checkout.session.completed") {

  const session = event.data.object as Stripe.Checkout.Session;

  const paymentIntentId = session.payment_intent as string;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const metadata = paymentIntent.metadata;

  if (!metadata.products) {
    console.log("Products missing in metadata");
    return res.json({ received: true });
  }

  const products = JSON.parse(metadata.products);

  const ids = products.map((item: any) =>
    mongoose.Types.ObjectId.createFromHexString(item.id)
  );

  await Order.findOneAndUpdate(
    { sessionId: metadata.sessionId },
    { paymentStatus: "paid" }
  );

  await Cart.deleteMany({
    user: metadata.userId,
    product: { $in: ids }
  });

  console.log("Cart cleared successfully");
}

    res.json({ received: true });

  } catch (err) {
    console.log(err);
    res.status(500).send("Webhook processing error");
  }
};