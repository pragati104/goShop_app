import dotenv from 'dotenv'
dotenv.config()

import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import cors from 'cors'

// 🔌 Controllers
import { webhook } from "./checkout/checkout.controller"

// 🔌 Routers
import { userRouter } from './users/users.router'
import { productRouter } from './products/products.router'
import { cartRouter } from './carts/cart.router'
import { orderRouter } from './orders/order.router'
import { checkoutRouter } from './checkout/checkout.router'
import { settingsRouter } from "./settings/settings.router"
import { chatRouter } from './chat/chat.router'

const ENV = process.env

// ❌ Fail fast if env missing
if (!ENV.MONGO_URL) {
  throw new Error("❌ MONGO URL is missing in environment variables")
}

// ✅ DB Connection
mongoose.connect(ENV.MONGO_URL)
  .then(() => console.log(`✅ Databases connected`))
  .catch((err) => {
    console.log(`❌ Database connection failed`, err.message)
  })

const app = express()

// ✅ Stripe webhook (must be before express.json)
app.post(
  "/checkout/webhook",
  express.raw({ type: "application/json" }),
  webhook
)

// ✅ CORS (local + production)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://go-shop-xi.vercel.app"
  ],
  credentials: true
}))

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// ✅ Routes
app.get("/", (req: Request, res: Response) => {
  res.send("API Running 🚀")
})

app.use("/auth", userRouter)
app.use("/products", productRouter)
app.use("/cart", cartRouter)
app.use("/checkout", checkoutRouter)
app.use("/orders", orderRouter)
app.use("/settings", settingsRouter)
app.use("/chat", chatRouter)

// ✅ 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `${req.url} not found` })
})

// ✅ PORT FIX (IMPORTANT)
const PORT = ENV.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

// ⚠️ Don't log secrets in production
if (ENV.NODE_ENV !== "production") {
  console.log("Stripe key:", ENV.S_KEY)
}