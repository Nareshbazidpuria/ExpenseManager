require("@babel/register");
require("dotenv").config();
const { connectToDB } = require("../../../config/db");
const { Expense } = require("../../api/expense/model");
const { data } = require("./data");

const script = async () => {
  try {
    for (const expense of data) {
      await Expense.findOneAndUpdate(
        { _id: expense._id },
        { amount: expense.amount / 2 },
        { new: true }
      );
    }
    console.log("Done");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectToDB()
  .then(script)
  .catch((e) => console.log(e));
