import momentTz from "moment-timezone";
import { expenseTypes } from "../../../config/constant";
import { Expense } from "./model";
import { ObjectId } from "mongodb";

export const addExpenseDB = (data) => Expense.create(data);
export const getExpenseDB = (filter) => Expense.findOne(filter);

export const editExpenseDB = (filter, data) =>
  Expense.findOneAndUpdate(filter, data, { new: true });

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

export const totalTeamDB = (date, auth, to) =>
  Expense.aggregate([
    {
      $match: {
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
        to,
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
      $lookup: {
        from: "groups",
        pipeline: [
          {
            $match: {
              _id: new ObjectId(to),
            },
          },
        ],
        as: "divideBy",
      },
    },
    {
      $unwind: "$divideBy",
    },
    {
      $set: {
        third: {
          $divide: ["$total", { $ifNull: [{ $size: "$divideBy.members" }, 3] }],
        },
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

export const totalPersonalDB = (date, auth, to) =>
  Expense.aggregate([
    {
      $match: {
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
        to,
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
    // {
    //   $lookup: {
    //     from: "groups",
    //     pipeline: [
    //       {
    //         $match: {
    //           _id: new ObjectId(to),
    //         },
    //       },
    //     ],
    //     as: "divideBy",
    //   },
    // },
    // {
    //   $unwind: "$divideBy",
    // },
    {
      $set: {
        // third: {
        //   $divide: ["$total", { $ifNull: [{ $size: "$divideBy.members" }, 3] }],
        // },
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
            {
              $subtract: [
                { $ifNull: ["$total", 0] },
                { $ifNull: ["$you.amount", 0] },
              ],
            },
          ],
        },
      },
    },
  ]);

export const totalOwnDB = (date, auth) =>
  Expense.aggregate([
    {
      $match: {
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
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

export const individualDB = (date, auth) =>
  Expense.aggregate([
    {
      $match: {
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
        $or: [{ user: auth }, { to: auth?.toString() }],
        to: { $nin: [expenseTypes.team, expenseTypes.own] },
      },
    },
    {
      $group: {
        _id: {
          $cond: [
            {
              $eq: ["$user", auth],
            },
            {
              user: {
                $toString: "$user",
              },
              to: "$to",
            },
            {
              user: "$to",
              to: {
                $toString: "$user",
              },
            },
          ],
        },
        me: {
          $push: {
            $cond: [
              {
                $eq: ["$user", auth],
              },
              {
                purpose: "$purpose",
                _id: "$_id",
                edited: "$edited",
                createdAt: "$createdAt",
                amount: {
                  $ifNull: ["$amount", 0],
                },
              },
              "$$REMOVE",
            ],
          },
        },
        you: {
          $push: {
            $cond: [
              {
                $ne: ["$user", auth],
              },
              {
                createdAt: "$createdAt",
                _id: "$_id",
                edited: "$edited",
                purpose: "$purpose",
                amount: {
                  $ifNull: ["$amount", 0],
                },
              },
              "$$REMOVE",
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { id: "$_id.to" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $toString: "$_id",
                  },
                  "$$id",
                ],
              },
            },
          },
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: "to",
      },
    },
    {
      $unwind: "$to",
    },
    {
      $project: {
        _id: 0,
        to: 1,
        me: 1,
        you: 1,
        total: {
          $subtract: [
            {
              $reduce: {
                input: "$me.amount",
                initialValue: 0,
                in: { $sum: ["$$value", "$$this"] },
              },
            },
            {
              $reduce: {
                input: "$you.amount",
                initialValue: 0,
                in: { $sum: ["$$value", "$$this"] },
              },
            },
          ],
        },
      },
    },
  ]);

export const totalExpensesDB = (date, user) =>
  Expense.aggregate([
    {
      $match: {
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
        user,
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: {
            $ifNull: ["$amount", 0],
          },
        },
      },
    },
  ]);
