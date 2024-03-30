import { expenseTypes } from "../../../config/constant";
import { Expense } from "./model";

export const addExpenseDB = (data) => Expense.create(data);

export const deleteExpenseDB = (filter) => Expense.findOneAndDelete(filter);

export const expenseListDB = (filter) =>
  Expense.aggregate([
    {
      $match: filter,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        let: {
          id: "$user",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
  ]);

export const totalTeamDB = (filter, auth) =>
  Expense.aggregate([
    {
      $match: {
        ...filter,
        to: expenseTypes.team,
      },
    },
    {
      $group: {
        _id: "$user",
        amount: {
          $sum: {
            $ifNull: ["$amount", 0],
          },
        },
      },
    },
    {
      $sort: {
        amount: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
            },
          },
        ],
        as: "name",
      },
    },
    {
      $unwind: "$name",
    },
    {
      $set: {
        name: "$name.name",
      },
    },
    {
      $group: {
        _id: null,
        members: {
          $push: "$$ROOT",
        },
        total: {
          $sum: "$amount",
        },
      },
    },
    {
      $set: {
        third: { $divide: ["$total", 3] },
        you: {
          $arrayElemAt: [
            {
              $ifNull: [
                {
                  $filter: {
                    input: "$members",
                    as: "you",
                    cond: { $eq: ["$$you._id", auth] },
                  },
                },
                [],
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $set: {
        you: { $ifNull: ["$you.amount", 0] },
        remaining: {
          $subtract: [
            { $ifNull: ["$you.amount", 0] },
            { $ifNull: ["$third", 0] },
          ],
        },
      },
    },
  ]);

export const totalOwnDB = (filter, auth) =>
  Expense.aggregate([
    {
      $match: {
        ...filter,
        user: auth,
        to: expenseTypes.own,
      },
    },
    {
      $group: {
        _id: "$purpose",
        amount: {
          $sum: {
            $ifNull: ["$amount", 0],
          },
        },
      },
    },
    {
      $sort: {
        amount: -1,
      },
    },
  ]);
