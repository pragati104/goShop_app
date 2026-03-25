import { Request, Response } from "express";
import { Cart } from "./cart.schema";
import { AuthRequest } from "../middleware/auth.middleware";

export const createCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
  return res.status(401).json({ message: "Unauthorized" });
}

    const existing = await Cart.findOne({
      user: req.user.id,
      product: req.body.product
    })

    if (existing) {
      existing.qnt = (existing.qnt || 1) + 1
      await existing.save()
      return res.json({ message: "Quantity increased" })
    }

    await Cart.create({
      user: req.user.id,
      product: req.body.product,
      qnt: 1
    })

    res.json({ message: "Product added to cart" })
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message })
  }
}


export const fetchCarts = async (req: AuthRequest, res: Response)=>{
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const carts = await Cart.find({ user: req.user.id }).populate("product");
    res.json(carts);

  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Server error"
    });
  }
}

export const updateCart = async (req: Request, res: Response) => {
  try {
    const { qnt } = req.body;

    if (qnt !== undefined && Number(qnt) < 1) {
      throw new Error("Minimum quantity is 1");
    }

    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!cart) {
      throw new Error("Cart not found");
    }

    res.json({ message: "Cart updated", cart });
    
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};


export const deleteCart = async (req: Request, res: Response)=>{
    try {
       const cart = await Cart.findByIdAndDelete(req.params.id)

       if(!cart)
        throw new Error("Cart not found")

       res.json({message: 'Product removed from cart'})
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}