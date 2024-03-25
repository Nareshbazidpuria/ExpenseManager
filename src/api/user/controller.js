import moment from "moment";
import { addExpenseDB, editUserDB, expenseListDB, getUserDB } from "./query";
import { expenseTypes } from "../../../config/constant";

export const login = async (req, res) => {
  try {
    if (req.body.changePass) {
      const user = await editUserDB(
        { name: req.body.name },
        { password: req.body.password }
      );
      return res.status(200).send({ user });
    }
    const user = await getUserDB(req.body);
    if (user)
      return res.status(200).send({
        user,
        changePass: ["sanjay", "dharam"].includes(req.body.password),
      });
    return res.status(400).send({ message: "Invalid credentials !" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const expenseList = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    return res.status(200).send({
      data: await expenseListDB({
        createdAt: {
          $gt: new Date(moment(date).startOf("month")),
          $lte: new Date(moment(date).endOf("month")),
        },
        to: req.query.to || expenseTypes.team,
      }),
    });
  } catch (error) {
    return res.status(500).send({ message: "Something went wrong" });
  }
};
