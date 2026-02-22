import moment from "moment";
import { User } from "./model";
import { expenseTypes } from "../../../config/constant";

export const addUserDB = (user) => User.create(user);
export const getUserDB = (filter, projection) => User.findOne(filter, projection);
export const getUsersDB = (filter) => User.find(filter);

export const editUserDB = (filter, updation) => User.findOneAndUpdate(filter, updation, { new: true });

export const getExpoTokensDB = (id) =>
  User.aggregate([
    {
      $match: {
        _id: {
          $ne: id,
        },
      },
    },
    {
      $group: {
        _id: null,
        tokens: {
          $push: "$expoToken",
        },
      },
    },
  ]);

export const notVerifiedEDB = () =>
  User.aggregate([
    {
      $lookup: {
        from: "groups",
        localField: "_id",
        foreignField: "members",
        as: "groups",
      },
    },
    {
      $unwind: "$groups",
    },
    {
      $lookup: {
        from: "expenses",
        let: { to: "$groups._id", id: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$to", { $toString: "$$to" }],
                  },
                },
                {
                  $expr: {
                    $not: {
                      $in: ["$$id", "$verifiedBy"],
                    },
                  },
                },
              ],
              createdAt: { $lte: moment().subtract(1, "day").toDate() },
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "expenses",
      },
    },
    {
      $unwind: "$expenses",
    },
    {
      $group: {
        _id: "$_id",
        email: { $first: "$email" },
        name: { $first: "$name" },
      },
    },
  ]);

export const settlementFriendsDB = (auth) =>
  User.aggregate([
    {
      $match: {
        _id: { $in: auth.friends },
      },
    },
    {
      $lookup: {
        from: "expenses",
        let: { to: "$_id" },
        pipeline: [
          {
            $match: {
              expenseType: expenseTypes.friend,
              verified: true,
              setteled: false,
              $or: [
                {
                  $expr: {
                    $eq: ["$user", "$$to"],
                  },
                  to: String(auth._id),
                },
                {
                  $expr: {
                    $eq: ["$to", { $toString: "$$to" }],
                  },
                  user: auth._id,
                },
              ],
              verified: true,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "expenses",
      },
    },
    { $unwind: "$expenses" },
    {
      $project: {
        name: 1,
        photo: 1,
        type: expenseTypes.friend,
      },
    },
  ]);
