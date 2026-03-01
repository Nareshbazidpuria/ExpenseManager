import { Expense } from "../expense/model";
import { Insights } from "./model";
import momentTz from "moment-timezone";
import { expenseTypes } from "../../../config/constant";

export const monthlyInsightsQuery = (filter) => Insights.findOne(filter);

export const monthlyExpensesQuery = (date, user) =>
  Expense.aggregate([
    // {
    //   $sort: {
    //     createdAt: 1,
    //   },
    // },
    {
      $match: {
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
      },
    },
    {
      $facet: {
        personal: [
          {
            $match: {
              user,
              expenseType: expenseTypes.own,
            },
          },
          {
            $group: {
              _id: "$purpose",
              // firstDay: { $first: "$createdAt" },
              amount: {
                $sum: {
                  $ifNull: ["$amount", 0],
                },
              },
              transactions: {
                $sum: 1,
              },
            },
          },
          {
            $group: {
              _id: null,
              // firstDay: { $min: "$firstDay" },
              amount: {
                $sum: "$amount",
              },
              transactions: {
                $sum: "$transactions",
              },
              topCategories: {
                $push: {
                  category: "$_id",
                  amount: "$amount",
                  transactions: "$transactions",
                },
              },
            },
          },
        ],
        friends: [
          {
            $match: {
              $or: [{ user }, { to: user?.toString() }],
              expenseType: expenseTypes.friend,
            },
          },
          {
            $group: {
              _id: "$purpose",
              // firstDay: { $first: "$createdAt" },
              amount: {
                $sum: {
                  $cond: [{ $eq: ["$user", user] }, { $subtract: ["$amount", "$splitedAmount"] }, { $ifNull: ["$splitedAmount", 0] }],
                },
              },
              transactions: {
                $sum: 1,
              },
            },
          },
          {
            $group: {
              _id: null,
              amount: {
                $sum: "$amount",
              },
              transactions: {
                $sum: "$transactions",
              },
              topCategories: {
                $push: {
                  category: "$_id",
                  amount: "$amount",
                  transactions: "$transactions",
                },
              },
            },
          },
        ],
        groups: [
          {
            $match: {
              splitedIn: user,
              expenseType: expenseTypes.group,
            },
          },
          {
            $group: {
              _id: "$purpose",
              amount: {
                $sum: {
                  $divide: ["$amount", { $size: "$splitedIn" }],
                },
              },
              transactions: {
                $sum: 1,
              },
            },
          },
          {
            $group: {
              _id: null,
              amount: {
                $sum: "$amount",
              },
              transactions: {
                $sum: "$transactions",
              },
              topCategories: {
                $push: {
                  category: "$_id",
                  amount: "$amount",
                  transactions: "$transactions",
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalAmount: {
          $round: [
            {
              $sum: [
                { $ifNull: [{ $first: "$personal.amount" }, 0] },
                { $ifNull: [{ $first: "$friends.amount" }, 0] },
                { $ifNull: [{ $first: "$groups.amount" }, 0] },
              ],
            },
            2,
          ],
        },
        totalTransactions: {
          $sum: [
            { $ifNull: [{ $first: "$personal.transactions" }, 0] },
            { $ifNull: [{ $first: "$friends.transactions" }, 0] },
            { $ifNull: [{ $first: "$groups.transactions" }, 0] },
          ],
        },
        topCategories: {
          $concatArrays: [
            { $ifNull: [{ $first: "$personal.topCategories" }, []] },
            { $ifNull: [{ $first: "$friends.topCategories" }, []] },
            { $ifNull: [{ $first: "$groups.topCategories" }, []] },
          ],
        },
        personal: 1,
        friendsAndGroups: {
          amount: {
            $round: [
              {
                $sum: [{ $ifNull: [{ $first: "$friends.amount" }, 0] }, { $ifNull: [{ $first: "$groups.amount" }, 0] }],
              },
              2,
            ],
          },
          transactions: {
            $sum: [{ $ifNull: [{ $first: "$friends.transactions" }, 0] }, { $ifNull: [{ $first: "$groups.transactions" }, 0] }],
          },
          topCategories: {
            $concatArrays: [
              { $ifNull: [{ $first: "$friends.topCategories" }, []] },
              { $ifNull: [{ $first: "$groups.topCategories" }, []] },
            ],
          },
        },
      },
    },
  ]);

export const monthlyTrendsQuery = (date, user, timezone = "Asia/Kolkata") =>
  Expense.aggregate([
    // {
    //   $sort: {
    //     createdAt: 1,
    //   },
    // },
    {
      $match: {
        createdAt: {
          $gt: new Date(momentTz(date).tz(timezone).startOf("month")),
          $lte: new Date(momentTz(date).tz(timezone).endOf("month")),
        },
      },
    },
    {
      $facet: {
        personal: [
          {
            $match: {
              user,
              expenseType: expenseTypes.own,
            },
          },
          {
            $group: {
              _id: { day: { $dayOfMonth: { date: "$createdAt", timezone } } },
              // firstDay: { $first: "$createdAt" },
              amount: {
                $sum: {
                  $ifNull: ["$amount", 0],
                },
              },
              transactions: {
                $sum: 1,
              },
            },
          },
        ],
        friends: [
          {
            $match: {
              $or: [{ user }, { to: user?.toString() }],
              expenseType: expenseTypes.friend,
            },
          },
          {
            $group: {
              _id: { day: { $dayOfMonth: { date: "$createdAt", timezone } } },
              // firstDay: { $first: "$createdAt" },
              amount: {
                $sum: {
                  $cond: [{ $eq: ["$user", user] }, { $subtract: ["$amount", "$splitedAmount"] }, { $ifNull: ["$splitedAmount", 0] }],
                },
              },
              transactions: {
                $sum: 1,
              },
            },
          },
        ],
        groups: [
          {
            $match: {
              splitedIn: user,
              expenseType: expenseTypes.group,
            },
          },
          {
            $group: {
              _id: { day: { $dayOfMonth: { date: "$createdAt", timezone } } },
              amount: {
                $sum: {
                  $divide: ["$amount", { $size: "$splitedIn" }],
                },
              },
              transactions: {
                $sum: 1,
              },
            },
          },
        ],
      },
    },
    {
      $set: {
        personal: {
          $arrayToObject: {
            $map: {
              input: { $ifNull: ["$personal", []] },
              in: {
                k: { $toString: "$$this._id.day" },
                v: { amount: "$$this.amount", transactions: "$$this.transactions" },
              },
            },
          },
        },
        friends: {
          $arrayToObject: {
            $map: {
              input: { $ifNull: ["$friends", []] },
              in: {
                k: { $toString: "$$this._id.day" },
                v: { amount: "$$this.amount", transactions: "$$this.transactions" },
              },
            },
          },
        },
        groups: {
          $arrayToObject: {
            $map: {
              input: { $ifNull: ["$groups", []] },
              in: {
                k: { $toString: "$$this._id.day" },
                v: { amount: "$$this.amount", transactions: "$$this.transactions" },
              },
            },
          },
        },
      },
    },
  ]);
