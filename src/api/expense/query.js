import { Expense } from "./model";

export const addExpenseDB = (data) => Expense.create(data);
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
