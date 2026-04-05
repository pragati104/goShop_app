import { Request, Response } from "express";
import { Product } from "./products.schema";

// ✅ better slug generator
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")       // spaces → dash
    .replace(/[^\w-]+/g, "");   // remove special chars

// ✅ CREATE PRODUCT
export const createProduct = async (req: Request, res: Response) => {
  try {
    const slug =
      slugify(req.body.title) + "-" + Date.now(); // unique slug

    const product = await Product.create({
      ...req.body,
      slug,
    });

    res.json(product);
  } catch (err) {
    if (err instanceof Error)
      res.status(500).json({ message: err.message });
  }
};

// ✅ FETCH ALL
export const fetchProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    if (err instanceof Error)
      res.status(500).json({ message: err.message });
  }
};

// ✅ FETCH BY SLUG (FIXED)
export const fetchProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    });

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    if (err instanceof Error)
      res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE PRODUCT (also update slug if title changes)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updateData: any = { ...req.body };

    if (req.body.title) {
      updateData.slug =
        slugify(req.body.title) + "-" + Date.now();
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    if (err instanceof Error)
      res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE PRODUCT
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    if (err instanceof Error)
      res.status(500).json({ message: err.message });
  }
};