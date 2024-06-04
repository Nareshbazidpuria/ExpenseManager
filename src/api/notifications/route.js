import { Router } from "express";
import { notificationList, readNotification } from "./controller";
import { validate } from "express-validation";
import { alertListJoi, readAlertsJoi } from "./joi";

export const alertRouter = Router();

alertRouter
  .route("/")
  .get(validate(alertListJoi), notificationList)
  .put(validate(readAlertsJoi), readNotification);
alertRouter.route("/:id").patch(readNotification);
