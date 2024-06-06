require("@babel/register");
require("dotenv").config();
const { connectToDB } = require("../../../config/db");
const { Expense } = require("../../api/expense/model");
const { Group } = require("../../api/group/model");
const { User } = require("../../api/user/model");
const { expenses, users, groups } = require("./data");

const mapping = {
  "6624237a9c422c0d5c0e6cda": "665c3d08fafaf19d3ffc632e",
  "662424e79c422c0d5c0e6ce2": "665c3d33fafaf19d3ffc6347",
  "662424fe9c422c0d5c0e6ce3": "665c3d57fafaf19d3ffc635d",
  "662425129c422c0d5c0e6ce4": "665c3d72fafaf19d3ffc6373",

  "65ff30a253714d1d6f8fc0bf": "665c3956c12a4546e6ddccd0",
  "6600068862f8970a49ec243e": "665c3acbfafaf19d3ffc628d",
  "662423699c422c0d5c0e6cd8": "665c3b2efafaf19d3ffc62ad",
  "6624234f9c422c0d5c0e6cd7": "665c3be2fafaf19d3ffc62c6",
};

const personals = [
  "65ff30a253714d1d6f8fc0bf", // me
  "6600068862f8970a49ec243e", // snjli
  "662423699c422c0d5c0e6cd8", // pompu
  "6624234f9c422c0d5c0e6cd7", // satto
];

const individuals = {
  "65ff30a253714d1d6f8fc0bf": {
    "6600068862f8970a49ec243e": "6661fdd01d35f30aad6c62f3",
    "662423699c422c0d5c0e6cd8": "6661fe0b1d35f30aad6c6306",
    "6624234f9c422c0d5c0e6cd7": "6661fe351d35f30aad6c6319",
  },
  "6600068862f8970a49ec243e": {
    "65ff30a253714d1d6f8fc0bf": "6661fdd01d35f30aad6c62f3",
    "6624234f9c422c0d5c0e6cd7": "6662006e22cbe2aae4ac91d7",
  },
  "662423699c422c0d5c0e6cd8": {
    "65ff30a253714d1d6f8fc0bf": "6661fe0b1d35f30aad6c6306",
    "6624234f9c422c0d5c0e6cd7": "6661ff611d35f30aad6c6343",
  },
  "6624234f9c422c0d5c0e6cd7": {
    "65ff30a253714d1d6f8fc0bf": "6661fe351d35f30aad6c6319",
    "6600068862f8970a49ec243e": "6662006e22cbe2aae4ac91d7",
    "662423699c422c0d5c0e6cd8": "6661ff611d35f30aad6c6343",
  },
};

const teams = [
  "662425129c422c0d5c0e6ce4",
  "662424fe9c422c0d5c0e6ce3",
  "662424e79c422c0d5c0e6ce2",
  "6624237a9c422c0d5c0e6cda",
];

const script = async () => {
  try {
    await User.insertMany(users);
    await Group.insertMany(groups);
    for (const expense of expenses) {
      if (teams.includes(expense?.to) || expense.to === "own")
        await Expense.create({
          ...expense,
          to: mapping[expense.to] || expense.to,
          user: mapping[expense.user],
        });
      else {
        // console.log(individuals[expense.user], expense.user);
        await Expense.create({
          ...expense,
          to: individuals[expense.user][expense.to],
          user: mapping[expense.user],
          amount: 2 * expense.amount,
        });
      }
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
