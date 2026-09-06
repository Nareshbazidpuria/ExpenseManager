import { Router } from "express";
import { topCards } from "./controller";

export const insightsRouter = Router();

insightsRouter.get("/top-cards", topCards);
