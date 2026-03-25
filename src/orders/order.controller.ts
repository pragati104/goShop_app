import { Request, Response } from "express"
import { AuthRequest } from "../middleware/auth.middleware";
import { Order } from "./order.schema";

export const fetchOrders = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.user?.role === "user" ? {user: req.user.id, paymentStatus: "paid"} : {paymentStatus: "paid"}
    let orders = null

    if(req.user?.role === "user")
    {
      orders = await Order.find(query).populate("products.id")
    }
    else 
    {
      orders = await Order.find(query).populate("user", "-password").populate("products.id")
    }
    res.json(orders)
  } 
  catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message })
  }
}

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body)
    
    if(!order)
      throw new Error("Order not found")
    
    res.json({message: "Order updated"})
  } 
  catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message })
  }
}