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
// import { sendNotification } from "../../utils/push";
// import { getExpoTokensDB, getUserDB } from "../user/query";

export const addExpense = async (req, res) => {
  try {
    if (req.body.purpose === "Write your own ...")
      req.body = { ...req.body, purpose: req.body.additional };
    if (
      !Object.values(expenseTypes).includes(req.body.to) &&
      !ObjectId.isValid(req.body.to)
    )
      req.body.to = (await getUserDB({ name: req.body.to }))?._id;
    if (await addExpenseDB({ ...req.body, user: req.headers.user })) {
      // if (req.body.to === expenseTypes.team) {
      //   const to = (await getExpoTokensDB(new ObjectId(req.headers.user)))?.[0]
      //       ?.tokens,
      //     by = await getUserDB({ _id: req.headers.user });
      //   if (to?.length && by)
      //     await sendNotification({
      //       to,
      //       title: by.name + " has added an item to the team expenses",
      //       body: `${req.body.purpose || req.body.additional}, ₹${
      //         req.body.amount
      //       }`,
      //       sound: "default",
      //     });
      // }
      return res.status(201).send({ message: "Expense Added" });
    }
    return res.status(400).send({ message: "Unable to save your data !" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const expenseList = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    const filter = {
      createdAt: {
        $gt: new Date(moment(date).tz("Asia/Kolkata").startOf("month")),
        $lte: new Date(moment(date).tz("Asia/Kolkata").endOf("month")),
      },
      to: req.query.to || expenseTypes.team,
    };
    if (filter.to === expenseTypes.own)
      filter.user = new ObjectId(req.headers.user);
    return res.status(200).send({
      data: await expenseListDB(filter),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    if (await deleteExpenseDB({ _id: req.params.id, user: req.headers.user }))
      return res.status(200).send({ message: "Expense Deleted" });
    return res.status(400).send({ message: "Unable to delete !" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const editExpense = async (req, res) => {
  try {
    if (req.body.purpose === "Write your own ...")
      req.body = { ...req.body, purpose: req.body.additional };
    if (!Object.values(expenseTypes).includes(req.body.to))
      req.body.to = (await getUserDB({ name: req.body.to }))?._id;
    if (
      await editExpenseDB(
        { _id: req.params.id },
        { ...req.body, user: req.headers?.user, edited: true }
      )
    )
      return res.status(201).send({ message: "Expense updated" });
    return res.status(400).send({ message: "Unable to save your data !" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const totalTeam = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    return res.status(200).send({
      data: (
        await totalTeamDB(date, new ObjectId(req.headers.user), req.query.to)
      )?.[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const totalOwn = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    return res.status(200).send({
      data: await totalOwnDB(date, new ObjectId(req.headers.user)),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const individual = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    return res.status(200).send({
      data: await individualDB(date, new ObjectId(req.headers.user)),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};
