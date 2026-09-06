import { Router } from "express";
import { settlementList } from "./controller";

export const settlementRouter = Router();

settlementRouter.route("/").get(settlementList);
