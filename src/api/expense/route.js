import { Router } from "express";
import {
  addExpense,
  deleteExpense,
  editExpense,
  expenseList,
  individual,
  totalOwn,
  totalTeam,
  verifyExpense,
} from "./controller";
import { verify } from "jsonwebtoken";

export const expenseRouter = Router();

expenseRouter.route("/").post(addExpense).get(expenseList);
expenseRouter.route("/team").get(totalTeam);
expenseRouter.route("/own").get(totalOwn);
expenseRouter.route("/individual").get(individual);
expenseRouter
  .route("/:id")
  .delete(deleteExpense)
  .put(editExpense)
  .patch(verifyExpense);
