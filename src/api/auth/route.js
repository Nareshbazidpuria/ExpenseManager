import { Router } from "express";
import { changePassword, logout, profile, updateProfile } from "./controller";
import { validate } from "express-validation";
import { changePwdJoi, editProfileJoi } from "./joi";

export const authRouter = Router();

authRouter
  .route("/profile")
  .get(profile)
  .put(validate(editProfileJoi), updateProfile);
authRouter.post("/change-password", validate(changePwdJoi), changePassword);
authRouter.post("/logout", logout);
