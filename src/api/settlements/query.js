import { Settlements } from "./model";

export const addSettlementDB = (data) => Settlements.create(data);

export const getSettlementsDB = (filter) =>
  Settlements.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "to",
        foreignField: "_id",
        as: "friend",
      },
    },
    {
      $unwind: {
        path: "$friend",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "to",
        foreignField: "_id",
        as: "group",
      },
    },
    {
      $unwind: {
        path: "$group",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        user: { _id: 1, name: 1, email: 1, phone: 1, photo: 1 },
        to: 1,
        friend: { _id: 1, name: 1, email: 1, phone: 1, photo: 1 },
        group: { _id: 1, name: 1, photo: 1 },
        upto: 1,
        expenseType: 1,
        data: 1,
        createdAt: 1,
      },
    },
  ]);
