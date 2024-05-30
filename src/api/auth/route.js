import { Router } from "express";
import { logout, profile } from "./controller";

export const authRouter = Router();

authRouter.post("/logout", logout);
authRouter.get("/profile", profile);
