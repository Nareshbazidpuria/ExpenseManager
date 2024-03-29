import { User } from "./model";

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
