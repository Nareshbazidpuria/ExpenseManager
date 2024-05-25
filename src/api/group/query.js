import { Group } from "./model";

export const groupsDB = (filter) =>
  Group.aggregate([
    {
      $match: filter,
    },
    {
      $unwind: "$members",
    },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "members",
      },
    },
    {
      $unwind: "$members",
    },
    {
      $group: {
        _id: "$_id",
        name: {
          $first: "$name",
        },
        sequence: {
          $first: "$sequence",
        },
        members: {
          $push: "$members.name",
        },
      },
    },
    {
      $sort: {
        sequence: 1,
      },
    },
  ]);
