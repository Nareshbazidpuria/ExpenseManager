import { Router } from "express";
import { getMember } from "./controller";
import { validate } from "express-validation";
import { getMemberJoi } from "./joi";

export const userRouter = Router();

userRouter.route("/").get(validate(getMemberJoi), getMember);
