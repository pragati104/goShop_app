import { Router } from "express";
import { createCart, deleteCart, fetchCarts, updateCart } from "./cart.controller";
import { AuthAccessMiddleware } from "../middleware/auth.middleware";

export const cartRouter = Router();


cartRouter.post("/", AuthAccessMiddleware, createCart);
cartRouter.get("/", AuthAccessMiddleware, fetchCarts);
cartRouter.put("/:id", AuthAccessMiddleware, updateCart);
cartRouter.delete("/:id", AuthAccessMiddleware, deleteCart);