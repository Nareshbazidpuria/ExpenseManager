import { Router } from "express";
import { login } from "./controller";

export const userRouter = Router();

userRouter.route("/").post(login);
