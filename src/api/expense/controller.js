import moment from "moment";
import { addExpenseDB, expenseListDB, totalTeamDB } from "./query";
import { expenseTypes } from "../../../config/constant";
import { ObjectId } from "mongodb";

export const addExpense = async (req, res) => {
  try {
    if (req.body.purpose === "Write your own ...")
      req.body = { ...req.body, purpose: req.body.additional };
    if (await addExpenseDB({ ...req.body, user: req.headers.user }))
      return res.status(201).send({ message: "Data saved !" });
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
        $gt: new Date(moment(date).startOf("month")),
        $lte: new Date(moment(date).endOf("month")),
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

export const totalTeam = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    return res.status(200).send({
      data: (
        await totalTeamDB(
          {
            createdAt: {
              $gt: new Date(moment(date).startOf("month")),
              $lte: new Date(moment(date).endOf("month")),
            },
          },
          new ObjectId(req.headers.user)
        )
      )?.[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};
