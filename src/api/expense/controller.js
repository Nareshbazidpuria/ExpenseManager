import moment from "moment-timezone";
import {
  addExpenseDB,
  deleteExpenseDB,
  editExpenseDB,
  expenseListDB,
  individualDB,
  totalOwnDB,
  totalTeamDB,
} from "./query";
import { expenseTypes } from "../../../config/constant";
import { ObjectId } from "mongodb";
import { getUserDB } from "../user/query";
import { badReq, handleExceptions, rm } from "../../utils/common";
// import { sendNotification } from "../../utils/push";
// import { getExpoTokensDB, getUserDB } from "../user/query";

export const addExpense = handleExceptions(async (req, res) => {
  const { additional, purpose } = req.body;
  if (purpose === "Write your own ...") req.body.purpose = additional;
  const added = await addExpenseDB({ ...req.body, user: req.auth._id });
  if (added) return rm(res, "Expense added", {}, 201);
  return badReq(res, "Unable to save your data !");
});

export const expenseList = handleExceptions(async (req, res) => {
  const date = req.query.date || new Date(),
    filter = {
      createdAt: {
        $gt: new Date(moment(date).tz("Asia/Kolkata").startOf("month")),
        $lte: new Date(moment(date).tz("Asia/Kolkata").endOf("month")),
      },
      to: req.query.to || expenseTypes.team,
    };
  if (filter.to === expenseTypes.own) filter.user = new ObjectId(req.auth._id);
  const list = await expenseListDB(filter);
  return rm(res, "", list);
});

export const deleteExpense = handleExceptions(async (req, res) => {
  if (await deleteExpenseDB({ _id: req.params.id, user: req.auth._id }))
    return res.status(200).send({ message: "Expense Deleted" });
  return res.status(400).send({ message: "Unable to delete !" });
});

export const editExpense = async (req, res) => {
  try {
    if (req.body.purpose === "Write your own ...")
      req.body = { ...req.body, purpose: req.body.additional };
    if (!Object.values(expenseTypes).includes(req.body.to))
      req.body.to = (await getUserDB({ name: req.body.to }))?._id;
    if (
      await editExpenseDB(
        { _id: req.params.id },
        { ...req.body, user: req.auth._id, edited: true }
      )
    )
      return res.status(201).send({ message: "Expense updated" });
    return res.status(400).send({ message: "Unable to save your data !" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const totalTeam = handleExceptions(async (req, res) => {
  const date = req.query.date || new Date(),
    list = await totalTeamDB(date, new ObjectId(req.auth._id), req.query.to);
  return rm(res, "", list?.[0]);
});

export const totalOwn = handleExceptions(async (req, res) => {
  const date = req.query.date || new Date(),
    list = await totalOwnDB(date, new ObjectId(req.auth._id));
  return rm(res, "", list);
});

export const individual = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    return res.status(200).send({
      data: await individualDB(date, new ObjectId(req.auth._id)),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};
