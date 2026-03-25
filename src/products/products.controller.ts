import { Request, Response } from "express"
import { Product } from "./products.schema"

export const createProduct = async (req: Request, res: Response)=>{
    try {
        const product = await Product.create(req.body)
        res.json(product)
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}

export const fetchProducts = async (req: Request, res: Response)=>{
    try {
        const products = await Product.find().sort({createdAt: -1})
        res.json(products)
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}

export const fetchProductBySlug = async (req: Request, res: Response)=>{
    try {
        // Replacing hyphen with space
        const title = req.params.slug.split("-").join(" ")

        const product = await Product.findOne({title})
        
        if(!product)
            throw new Error("Product not found")

        res.json(product)
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}

export const updateProduct = async (req: Request, res: Response)=>{
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body)

        if(!product)
            throw new Error("Product not found")

        res.json({message: "Product updated"})
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}

export const deleteProduct = async (req: Request, res: Response)=>{
    try {
        const product = await Product.findByIdAndDelete(req.params.id)

        if(!product)
            throw new Error("Product not found")

        res.json({message: "Product deleted"})
    }
    catch(err)
    {
        if(err instanceof Error)
            res.status(500).json({message: err.message})
    }
}