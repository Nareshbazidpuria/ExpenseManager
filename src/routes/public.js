import { Router } from "express";
import {
  forgotPassword,
  login,
  setPassword,
  signUp,
} from "../api/auth/controller";
import { validate } from "express-validation";
import { forgotPwdJoi, loginJoi, setPwdJoi, signUpJoi } from "../api/auth/joi";

export const pubRoutes = Router();

pubRoutes.route("/signup").post(validate(signUpJoi), signUp);
pubRoutes.route("/login").post(validate(loginJoi), login);
pubRoutes.post("/forgot-password", validate(forgotPwdJoi), forgotPassword);
pubRoutes.post("/set-password", validate(setPwdJoi), setPassword);
