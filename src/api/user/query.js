import moment from "moment";
import { User } from "./model";

export const addUserDB = (user) => User.create(user);
export const getUserDB = (filter) => User.findOne(filter);

export const editUserDB = (filter, updation) =>
  User.findOneAndUpdate(filter, updation, { new: true });

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
        let: { to: "$groups._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$to", { $toString: "$$to" }],
              },
              createdAt: { $lte: moment().subtract(1, "day").toDate() },
              verifiedBy: { $elemMatch: { $ne: "$_id" } },
            },
          },
        ],
        as: "expenses",
      },
    },
    {
      $match: {
        $expr: {
          $gt: [{ $size: "$expenses" }, 0],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        email: { $first: "$email" },
        name: { $first: "$name" },
      },
    },
  ]);
