import { Router } from "express";
import { createProduct, deleteProduct, fetchProductBySlug, fetchProducts, updateProduct } from "./products.controller";
import { AdminAccessMiddleware } from "../middleware/auth.middleware";
export const productRouter = Router()

productRouter.get("/", fetchProducts)
productRouter.get("/:slug", fetchProductBySlug)
productRouter.post("/", AdminAccessMiddleware, createProduct)
productRouter.put("/:id", AdminAccessMiddleware, updateProduct)
productRouter.delete("/:id", AdminAccessMiddleware, deleteProduct)