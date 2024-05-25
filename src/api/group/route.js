import { Router } from "express";
import { groupList } from "./controller";

export const groupRouter = Router();

groupRouter.route("/").get(groupList);
