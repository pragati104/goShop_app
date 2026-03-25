import { Router } from "express";
import { fetchOrders, updateOrder } from "./order.controller";
import { AuthAccessMiddleware } from "../middleware/auth.middleware";
export const orderRouter = Router()

orderRouter.get("/", AuthAccessMiddleware, fetchOrders)
orderRouter.put("/:id", AuthAccessMiddleware, updateOrder)