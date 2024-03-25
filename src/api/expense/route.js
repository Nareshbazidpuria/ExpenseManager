import { Router } from "express";
import { addExpense, expenseList, totalTeam } from "./controller";

export const expenseRouter = Router();

expenseRouter.route("/").post(addExpense).get(expenseList);
expenseRouter.route("/team").get(totalTeam);
