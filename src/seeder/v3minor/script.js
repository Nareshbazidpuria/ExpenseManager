require("@babel/register");
require("dotenv").config();
const { connectToDB } = require("../../../config/db");
const { Expense } = require("../../api/expense/model");
const { Group } = require("../../api/group/model");
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
const verifyEScript = async () => {
  try {
    const groups = await Group.find();
    for (let group of groups) {
      await Expense.updateMany(
        { to: group._id },
        { verifiedBy: group.members }
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
  .then(verifyEScript)
  .catch((e) => console.log(e));
