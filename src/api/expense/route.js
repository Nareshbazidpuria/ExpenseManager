import { Router } from "express";
import { addExpense, expenseList } from "./controller";

export const expenseRouter = Router();

expenseRouter.route("/").post(addExpense).get(expenseList);
