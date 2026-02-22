import { expenseTypes } from "../../../config/constant";
import { User } from "../user/model";
import { Group } from "./model";
import { ObjectId } from "mongodb";

export const createGroupDB = (group) => Group.create(group);
export const getGroupDB = (filter) => Group.findOne(filter);
export const getGroupsDB = (filter, fields) => Group.find(filter, fields);
export const editGroupDB = (filter, updation) => Group.findOneAndUpdate(filter, updation, { new: true });

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

export const groupsDB = ($match, auth) =>
  Group.aggregate([
    {
      $match,
    },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: "memberss",
      },
    },
    {
      $lookup: {
        from: "users",
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
        from: "expenses",
        let: { to: "$_id" },
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
                      $in: [auth, "$verifiedBy"],
                    },
                  },
                },
              ],
            },
          },
        ],
        as: "expenses",
      },
    },
    {
      $set: {
        admin: "$admin.name",
        unverifiedCount: { $size: "$expenses" },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

export const settlementGroupsDB = (userId) =>
  Group.aggregate([
    {
      $match: {
        members: { $elemMatch: { $eq: userId } },
      },
    },
    {
      $lookup: {
        from: "expenses",
        let: { to: "$_id" },
        pipeline: [
          {
            $match: {
              expenseType: expenseTypes.group,
              setteled: false,

              $expr: {
                $eq: ["$to", { $toString: "$$to" }],
              },
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
        members: 1,
        type: expenseTypes.group,
      },
    },
  ]);

export const groupsHomeDB = ($match, auth) =>
  User.aggregate([
    {
      $facet: {
        friends: [
          {
            $match: {
              friends: { $elemMatch: { $eq: auth._id } },
              $and: [{ _id: { $ne: auth._id } }, { _id: { $not: { $in: auth.hiddenGroups } } }],
            },
          },
          {
            $set: {
              type: expenseTypes.friend,
            },
          },
        ],
        groups: [
          {
            $group: {
              _id: null,
            },
          },
          {
            $lookup: {
              from: "groups",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: [auth._id, "$members"],
                    },
                    _id: { $not: { $in: auth.hiddenGroups } },
                  },
                },
                {
                  $set: {
                    type: expenseTypes.group,
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    let: {
                      ids: { $ifNull: ["$members", []] },
                      // ids: {
                      //   $cond: [
                      //     {
                      //       $eq: [
                      //         {
                      //           $size: "$members",
                      //         },
                      //         2,
                      //       ],
                      //     },
                      //     "$members",
                      //     [],
                      //   ],
                      // },
                    },
                    pipeline: [
                      {
                        $match: {
                          _id: {
                            $ne: auth._id,
                          },
                          $expr: {
                            $in: ["$_id", "$$ids"],
                          },
                        },
                      },
                      {
                        $project: {
                          name: 1,
                          photo: 1,
                        },
                      },
                    ],
                    // localField: "members",
                    // foreignField: "_id",
                    as: "memberss",
                  },
                },
                {
                  $lookup: {
                    from: "users",
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
              ],
              as: "groups",
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: null,
        all: {
          $push: {
            $setUnion: ["$friends", { $first: "$groups.groups" }],
          },
        },
      },
    },
    {
      $set: {
        all: {
          $reduce: {
            input: "$all",
            initialValue: [],
            in: { $setUnion: ["$$value", "$$this"] },
          },
        },
      },
    },
    {
      $unwind: "$all",
    },
    {
      $replaceRoot: {
        newRoot: "$all",
      },
    },
    {
      $lookup: {
        from: "expenses",
        let: { to: "$_id", type: "$type" },
        pipeline: [
          {
            $match: {
              $or: [
                {
                  type: expenseTypes.friend,
                  $and: [
                    {
                      $expr: {
                        $eq: ["$to", { $toString: auth._id }],
                      },
                    },
                    {
                      $expr: {
                        $not: {
                          $in: [auth._id, "$verifiedBy"],
                        },
                      },
                    },
                  ],
                },
                {
                  type: expenseTypes.group,
                  $and: [
                    {
                      $expr: {
                        $eq: ["$to", { $toString: "$$to" }],
                      },
                    },
                    {
                      $expr: {
                        $not: {
                          $in: [auth._id, "$verifiedBy"],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
        as: "expenses",
      },
    },
    {
      $set: {
        unverifiedCount: { $size: "$expenses" },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
