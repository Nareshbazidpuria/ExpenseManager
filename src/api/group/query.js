import { Group } from "./model";

export const createGroupDB = (group) => Group.create(group);
export const editGroupDB = (filter, updation) =>
  Group.findOneAndUpdate(filter, updation, { new: true });

export const groupDetailsDB = (filter) =>
  Group.aggregate([
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
      $lookup: {
        from: "users",
        let: { ids: "$members" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$ids"],
              },
            },
          },
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: "members",
      },
    },
    {
      $set: {
        admin: "$admin.name",
      },
    },
  ]);

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
