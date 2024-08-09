import { Router } from "express";
import { pubRoutes } from "./public";
import { protectedRoutes } from "./protected";
import { ValidationError } from "express-validation";
import { authenticate } from "../middleware/authenticate";
import { res500, toMsg } from "../utils/common";
import { verifyReminder } from "../utils/cron";

export const mainRoutes = Router();

mainRoutes.get("/", (_, res) => res.send("Hello"));
mainRoutes.use("/pub", pubRoutes);
mainRoutes.use("/api", authenticate, protectedRoutes);

mainRoutes.use((err, req, res, next) => {
  if (err instanceof ValidationError) return toMsg(res, err);
  return res500(res);
});

verifyReminder();
