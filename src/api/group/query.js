import { Group } from "./model";

export const createGroupDB = (group) => Group.create(group);

export const groupsDB = (filter) =>
  Group.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "users",
        // let: { id: "$admin" },
        // pipeline: [
        //   {
        //     $match: {
        //       $expr: {
        //         $eq: ["$_id", "$$id"],
        //       },
        //     },
        //   },
        //   {
        //     $project: {
        //       name: 1,
        //     },
        //   },
        // ],
        localField: "admin",
        foreignField: "_id",
        as: "admin",
      },
    },
    {
      $unwind: "$admin",
    },
    {
      $set: {
        admin: "$admin.name",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
