import { Router } from "express";
import { createGroup, groupList } from "./controller";
import { validate } from "express-validation";
import { createGroupJoi } from "./joi";

export const groupRouter = Router();

groupRouter
  .route("/")
  .post(validate(createGroupJoi), createGroup)
  .get(groupList);
