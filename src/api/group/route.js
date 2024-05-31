import { Router } from "express";
import { createGroup, editGroup, groupDetails, groupList } from "./controller";
import { validate } from "express-validation";
import { createGroupJoi, editGroupJoi } from "./joi";

export const groupRouter = Router();

groupRouter
  .route("/")
  .post(validate(createGroupJoi), createGroup)
  .get(groupList);
groupRouter
  .route("/:id")
  .get(groupDetails)
  .put(validate(editGroupJoi), editGroup);
