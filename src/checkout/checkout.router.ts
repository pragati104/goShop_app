import { Router } from "express";
import { createCheckout, webhook } from "./checkout.controller";
import { UserAccessMiddleware } from "../middleware/auth.middleware";
import express from "express";

export const checkoutRouter = Router()


checkoutRouter.post("/", UserAccessMiddleware, createCheckout)
