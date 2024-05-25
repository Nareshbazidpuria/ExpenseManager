import { Router } from "express";
import { logout } from "./controller";
// import { validate } from "express-validation";
// import { changePwdJoi } from "./validation";

export const authRouter = Router();

authRouter.post("/logout", logout);
// authRouter.post("/change-password", validate(changePwdJoi), changePassword);
// authRouter.delete("/account", deleteAccount);
