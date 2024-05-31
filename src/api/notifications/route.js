import { Router } from "express";
import { notificationList } from "./controller";

export const alertRouter = Router();

alertRouter.route("/").get(notificationList);
