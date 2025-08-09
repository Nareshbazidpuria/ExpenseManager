import { Router } from "express";
import {
  addExpense,
  deleteExpense,
  editExpense,
  expenseList,
  getExpense,
  individual,
  totalOwn,
  totalTeam,
  verifyExpense,
} from "./controller";
import { validate } from "express-validation";
import { expenseListJoi } from "./joi";

export const expenseRouter = Router();

expenseRouter.route("/").post(addExpense).get(validate(expenseListJoi), expenseList);
expenseRouter.route("/team").get(totalTeam);
expenseRouter.route("/own").get(totalOwn);
expenseRouter.route("/individual").get(individual);
expenseRouter.route("/:id").get(getExpense).delete(deleteExpense).put(editExpense).patch(verifyExpense);
