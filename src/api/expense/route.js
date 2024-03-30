import { Router } from "express";
import {
  addExpense,
  deleteExpense,
  expenseList,
  totalOwn,
  totalTeam,
} from "./controller";

export const expenseRouter = Router();

expenseRouter.route("/").post(addExpense).get(expenseList).put(deleteExpense);
expenseRouter.route("/team").get(totalTeam);
expenseRouter.route("/own").get(totalOwn);
