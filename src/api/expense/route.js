import { Router } from "express";
import {
  addExpense,
  deleteExpense,
  editExpense,
  expenseList,
  getExpense,
  individual,
  settleDown,
  settlements,
  totalOwn,
  totalTeam,
  verifyExpense,
} from "./controller";
import { validate } from "express-validation";
import { addExpenseJoi, expenseListJoi, settleDownJoi, settlementsJoi } from "./joi";

export const expenseRouter = Router();

expenseRouter.route("/").post(validate(addExpenseJoi), addExpense).get(validate(expenseListJoi), expenseList);
expenseRouter.route("/team").get(totalTeam);
expenseRouter.route("/settlements").get(validate(settlementsJoi), settlements);
expenseRouter.route("/settle-down").post(validate(settleDownJoi), settleDown);
expenseRouter.route("/own").get(totalOwn);
expenseRouter.route("/individual").get(individual);
expenseRouter.route("/:id").get(getExpense).delete(deleteExpense).put(validate(addExpenseJoi), editExpense).patch(verifyExpense);
