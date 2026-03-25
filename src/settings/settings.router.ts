import { Router } from "express";
import { getSettings, updateSettings } from "./settings.controller";

export const settingsRouter = Router();

settingsRouter.get("/", getSettings);
settingsRouter.put("/", updateSettings);