import moment from "moment-timezone";
import {
  addExpenseDB,
  deleteExpenseDB,
  editExpenseDB,
  expenseListDB,
  getExpenseDB,
  individualDB,
  totalExpensesDB,
  totalOwnDB,
  totalPersonalDB,
  totalTeamDB,
} from "./query";
import { expenseTypes } from "../../../config/constant";
import { ObjectId } from "mongodb";
import { getUserDB } from "../user/query";
import { badReq, handleExceptions, rm } from "../../utils/common";
import { addNotificationDB } from "../notifications/query";
import { getGroupDB } from "../group/query";
// import { sendNotification } from "../../utils/push";
// import { getExpoTokensDB, getUserDB } from "../user/query";

export const addExpense = handleExceptions(async (req, res) => {
  const { additional, purpose } = req.body,
    { _id, monthlyLimit } = req.auth;
  if (purpose === "Write your own ...") req.body.purpose = additional;
  const added = await addExpenseDB({ ...req.body, user: _id });
  if (added) {
    const data = {};
    if (monthlyLimit) {
      const totalExpenses =
        (await totalExpensesDB(new Date(), _id))?.[0]?.amount || 0;
      if (totalExpenses > monthlyLimit)
        data.message =
          "You have crossed your monthly expense limit, spend carefully";
    }
    return rm(res, "Expense added", data, 201);
  }
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
    const prev = await getExpenseDB({ _id: req.params.id }),
      edited = await editExpenseDB(
        { _id: req.params.id },
        { ...req.body, user: req.auth._id, edited: true }
      );
    if (edited) {
      await addNotificationDB({
        user: req.auth._id,
        group: edited.to,
        amount: edited.amount,
        purpose: edited.purpose,
        prevAmount: prev.amount,
        prevPurpose: prev.purpose,
      });
      return res.status(201).send({ message: "Expense updated" });
    }
    return res.status(400).send({ message: "Unable to save your data !" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const totalTeam = handleExceptions(async (req, res) => {
  const { date = new Date(), to } = req.query;
  const group = ObjectId.isValid(to) ? await getGroupDB({ _id: to }) : null;
  const list =
    group?.members?.length === 2
      ? await totalPersonalDB(date, new ObjectId(req.auth._id), to)
      : await totalTeamDB(date, new ObjectId(req.auth._id), to);
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
