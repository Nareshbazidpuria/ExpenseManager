import { Router } from "express";
import {
  addExpense,
  deleteExpense,
  editExpense,
  expenseList,
  individual,
  totalOwn,
  totalTeam,
} from "./controller";

export const expenseRouter = Router();

expenseRouter.route("/").post(addExpense).get(expenseList);
expenseRouter.route("/team").get(totalTeam);
expenseRouter.route("/own").get(totalOwn);
expenseRouter.route("/individual").get(individual);
expenseRouter.route("/:id").delete(deleteExpense).put(editExpense);
