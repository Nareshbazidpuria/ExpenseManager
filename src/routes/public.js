import { Router } from "express";
import { login, signUp } from "../api/auth/controller";
import { validate } from "express-validation";
import { loginJoi, signUpJoi } from "../api/auth/joi";

export const pubRoutes = Router();

pubRoutes.route("/signup").post(validate(signUpJoi), signUp);
pubRoutes.route("/login").post(validate(loginJoi), login);
