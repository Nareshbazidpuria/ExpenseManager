import momentTz from "moment-timezone";
import { expenseTypes } from "../../../config/constant";
import { Expense } from "./model";
import { ObjectId } from "mongodb";

export const addExpenseDB = (data) => Expense.create(data);
export const getExpenseDB = (filter) => Expense.findOne(filter);
export const editExpenseDB = (filter, data) => Expense.findOneAndUpdate(filter, data, { new: true });
export const editExpensesDB = (filter, data) => Expense.updateMany(filter, data, { new: true });
export const deleteExpenseDB = (filter) => Expense.findOneAndDelete(filter);

const groupLookup = (own) =>
  own
    ? []
    : [
        {
          $lookup: {
            from: "groups",
            let: { id: "$to" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: "$_id" }, "$$id"],
                  },
                },
              },
            ],
            as: "group",
          },
        },
        {
          $set: {
            group: { $first: "$group" },
          },
        },
      ];

export const expenseListDB = (filter, own) =>
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
          {
            $project: {
              name: 1,
              photo: 1,
            },
          },
        ],
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    ...groupLookup(own),
    {
      $set: {
        verified: {
          $cond: [
            own,
            true,
            {
              $cond: [
                {
                  $eq: [
                    {
                      $size: "$verifiedBy",
                    },
                    {
                      $size: {
                        $ifNull: ["$group.members", [1, 2]], // for friends , todo manages it
                      },
                    },
                  ],
                },
                true,
                false,
              ],
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { ids: "$group.members" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", { $ifNull: ["$$ids", []] }],
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
        as: "members",
      },
    },
    {
      $unset: ["group"],
    },
  ]);

// export const expenseListDB = (filter, own) =>
//   Expense.aggregate([
//     {
//       $match: filter,
//     },
//     {
//       $sort: {
//         createdAt: -1,
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         let: {
//           id: "$user",
//         },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $eq: ["$_id", "$$id"],
//               },
//             },
//           },
//           {
//             $project: {
//               name: 1,
//             },
//           },
//         ],
//         as: "user",
//       },
//     },
//     {
//       $unwind: "$user",
//     },
//     ...groupLookup(own),
//     {
//       $set: {
//         verified: {
//           $cond: [
//             own,
//             true,
//             {
//               $cond: [
//                 {
//                   $eq: [
//                     {
//                       $size: "$verifiedBy",
//                     },
//                     {
//                       $size: "$group.members",
//                     },
//                   ],
//                 },
//                 true,
//                 false,
//               ],
//             },
//           ],
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         let: { ids: "$group.members" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $in: ["$_id", { $ifNull: ["$$ids", []] }],
//               },
//             },
//           },
//           {
//             $project: {
//               name: 1,
//             },
//           },
//         ],
//         as: "members",
//       },
//     },
//     {
//       $unset: ["group"],
//     },
//   ]);

export const totalTeamDB = (date, auth, to) =>
  Expense.aggregate([
    {
      $match: {
        verified: true,
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
        to,
      },
    },
    {
      $group: {
        _id: "$user",
        amount: {
          $sum: {
            $ifNull: ["$amount", 0],
          },
        },
      },
    },
    {
      $sort: {
        amount: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        let: {
          id: "$_id",
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
        as: "name",
      },
    },
    {
      $unwind: "$name",
    },
    {
      $set: {
        name: "$name.name",
        photo: "$name.photo",
      },
    },
    {
      $group: {
        _id: null,
        members: {
          $push: "$$ROOT",
        },
        total: {
          $sum: "$amount",
        },
      },
    },
    {
      $lookup: {
        from: "groups",
        pipeline: [
          {
            $match: {
              _id: new ObjectId(to),
            },
          },
        ],
        as: "divideBy",
      },
    },
    {
      $unwind: "$divideBy",
    },
    {
      $set: {
        third: {
          $divide: ["$total", { $ifNull: [{ $size: "$divideBy.members" }, 3] }],
        },
        you: {
          $arrayElemAt: [
            {
              $ifNull: [
                {
                  $filter: {
                    input: "$members",
                    as: "you",
                    cond: { $eq: ["$$you._id", auth] },
                  },
                },
                [],
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $set: {
        you: { $ifNull: ["$you.amount", 0] },
        remaining: {
          $subtract: [{ $ifNull: ["$you.amount", 0] }, { $ifNull: ["$third", 0] }],
        },
      },
    },
  ]);

// export const groupSettlementsDB = (filter = {}) =>
//   Expense.aggregate([
//     {
//       $match: {
//         expenseType: expenseTypes.group,
//         setteled: false,
//         verified: true,
//         ...filter,
//       },
//     },
//     {
//       $addFields: {
//         shareAmount: { $divide: ["$amount", { $size: "$splitedIn" }] },
//       },
//     },
//     {
//       $unwind: "$splitedIn",
//     },
//     {
//       $project: {
//         _id: 0,
//         from: "$splitedIn",
//         amount: "$shareAmount",
//         to: "$user",
//       },
//     },
//     {
//       $match: {
//         $expr: { $ne: ["$from", "$to"] },
//       },
//     },
//     {
//       $facet: {
//         outgoing: [
//           {
//             $group: {
//               _id: "$from",
//               net: { $sum: "$amount" },
//             },
//           },
//           {
//             $project: {
//               _id: 1,
//               net: { $multiply: ["$net", -1] },
//             },
//           },
//         ],
//         incoming: [
//           {
//             $group: {
//               _id: "$to",
//               net: { $sum: "$amount" },
//             },
//           },
//         ],
//       },
//     },
//     {
//       $project: {
//         combined: {
//           $concatArrays: ["$outgoing", "$incoming"],
//         },
//       },
//     },
//     {
//       $unwind: "$combined",
//     },
//     {
//       $group: {
//         _id: "$combined._id",
//         net: { $sum: "$combined.net" },
//       },
//     },
//     {
//       $facet: {
//         creditors: [{ $match: { net: { $gt: 0 } } }, { $sort: { net: -1 } }],
//         debtors: [{ $match: { net: { $lt: 0 } } }, { $sort: { net: 1 } }],
//       },
//     },
//     // {
//     //   $project: {
//     //     settlements: {
//     //       $function: {
//     //         body: function (creditors, debtors) {
//     //           const result = [];
//     //           let i = 0,
//     //             j = 0;

//     //           while (i < creditors.length && j < debtors.length) {
//     //             let credit = creditors[i].net;
//     //             let debit = -debtors[j].net;
//     //             let amount = Math.min(credit, debit);

//     //             result.push({
//     //               from: debtors[j]._id,
//     //               to: creditors[i]._id,
//     //               amount: Math.round(amount * 100) / 100,
//     //             });

//     //             creditors[i].net -= amount;
//     //             debtors[j].net += amount;

//     //             if (creditors[i].net === 0) i++;
//     //             if (debtors[j].net === 0) j++;
//     //           }
//     //           return result;
//     //         },
//     //         args: ["$creditors", "$debtors"],
//     //         lang: "js",
//     //       },
//     //     },
//     //   },
//     // },
//     // {
//     //   $addFields: {
//     //     users: {
//     //       $setUnion: [
//     //         { $map: { input: "$settlements", as: "s", in: "$$s.from" } },
//     //         { $map: { input: "$settlements", as: "s", in: "$$s.to" } },
//     //       ],
//     //     },
//     //   },
//     // },
//     // {
//     //   $lookup: {
//     //     from: "users",
//     //     localField: "users",
//     //     foreignField: "_id",
//     //     pipeline: [{ $project: { name: 1, photo: 1 } }],
//     //     as: "users",
//     //   },
//     // },
//     // {
//     //   $addFields: {
//     //     users: {
//     //       $arrayToObject: {
//     //         $map: {
//     //           input: "$users",
//     //           as: "u",
//     //           in: {
//     //             k: { $toString: "$$u._id" },
//     //             v: "$$u",
//     //           },
//     //         },
//     //       },
//     //     },
//     //   },
//     // },
//     // {
//     //   $addFields: {
//     //     settlements: {
//     //       $map: {
//     //         input: "$settlements",
//     //         as: "s",
//     //         in: {
//     //           from: { $getField: { field: { $toString: "$$s.from" }, input: "$users" } },
//     //           to: { $getField: { field: { $toString: "$$s.to" }, input: "$users" } },
//     //           amount: "$$s.amount",
//     //         },
//     //       },
//     //     },
//     //   },
//     // },
//     // {
//     //   $project: { users: 0 },
//     // },
//   ]);
export const groupSettlementsDB = (filter = {}) =>
  Expense.aggregate([
    {
      $match: {
        expenseType: expenseTypes.group,
        setteled: false,
        verified: true,
        ...filter,
      },
    },
    {
      $addFields: {
        shareAmount: { $divide: ["$amount", { $size: "$splitedIn" }] },
      },
    },
    {
      $unwind: "$splitedIn",
    },
    {
      $project: {
        _id: 0,
        from: "$splitedIn",
        amount: "$shareAmount",
        to: "$user",
      },
    },
    {
      $match: {
        $expr: { $ne: ["$from", "$to"] },
      },
    },
    {
      $facet: {
        outgoing: [
          {
            $group: {
              _id: "$from",
              net: { $sum: "$amount" },
            },
          },
          {
            $project: {
              _id: 1,
              net: { $multiply: ["$net", -1] },
            },
          },
        ],
        incoming: [
          {
            $group: {
              _id: "$to",
              net: { $sum: "$amount" },
            },
          },
        ],
      },
    },
    {
      $project: {
        combined: {
          $concatArrays: ["$outgoing", "$incoming"],
        },
      },
    },
    {
      $unwind: "$combined",
    },
    {
      $group: {
        _id: "$combined._id",
        net: { $sum: "$combined.net" },
      },
    },
    {
      $facet: {
        creditors: [{ $match: { net: { $gt: 0 } } }, { $sort: { net: -1 } }],
        debtors: [{ $match: { net: { $lt: 0 } } }, { $sort: { net: 1 } }],
      },
    },
    {
      $addFields: {
        users: {
          $setUnion: [{ $map: { input: "$creditors", as: "s", in: "$$s._id" } }, { $map: { input: "$debtors", as: "s", in: "$$s._id" } }],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "users",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1, photo: 1 } }],
        as: "users",
      },
    },
    {
      $addFields: {
        users: {
          $arrayToObject: {
            $map: {
              input: "$users",
              as: "u",
              in: {
                k: { $toString: "$$u._id" },
                v: "$$u",
              },
            },
          },
        },
      },
    },
  ]);

export const friendSettlementsDB = (you, friend) =>
  Expense.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $match: {
        expenseType: expenseTypes.friend,
        setteled: false,
        verified: true,
        $or: [
          {
            to: friend,
            user: you,
          },
          {
            user: new ObjectId(friend),
            to: you.toString(),
          },
        ],
      },
    },
    {
      $project: {
        from: "$user",
        to: { $arrayElemAt: ["$splitedIn", 0] },
        amount: "$amount",
        createdAt: "$createdAt",
      },
    },
    {
      $group: {
        _id: { from: "$from", to: "$to" },
        total: { $sum: "$amount" },
        fromDate: { $first: "$createdAt" },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
        fromDate: { $first: "$fromDate" },
        pairs: {
          $push: {
            from: "$_id.from",
            to: "$_id.to",
            amount: "$total",
          },
        },
      },
    },
    // {
    //   $project: {
    //     settlement: {
    //       $function: {
    //         body: function (pairs, total, you, friend, fromDate) {
    //           let yourSpent = 0;
    //           let friendSpent = 0;

    //           for (const p of pairs) {
    //             if (String(p.from) === String(you)) yourSpent += p.amount;
    //             else friendSpent += p.amount;
    //           }
    //           const net = yourSpent - friendSpent;

    //           if (net > 0) return { from: you, total, amount: Number(net.toFixed(2)), yourSpent, friendSpent, fromDate };
    //           if (net < 0) return { from: friend, total, amount: Number(Math.abs(net).toFixed(2)), yourSpent, friendSpent, fromDate };

    //           return {};
    //         },
    //         args: ["$pairs", "$total", you, friend, "$fromDate"],
    //         lang: "js",
    //       },
    //     },
    //   },
    // },
    {
      $project: {
        settlement: {
          $let: {
            vars: {
              totals: {
                $reduce: {
                  input: "$pairs",
                  initialValue: {
                    yourSpent: 0,
                    friendSpent: 0,
                  },
                  in: {
                    yourSpent: {
                      $cond: [{ $eq: ["$$this.from", you] }, { $add: ["$$value.yourSpent", "$$this.amount"] }, "$$value.yourSpent"],
                    },
                    friendSpent: {
                      $cond: [{ $ne: ["$$this.from", you] }, { $add: ["$$value.friendSpent", "$$this.amount"] }, "$$value.friendSpent"],
                    },
                  },
                },
              },
            },
            in: {
              $let: {
                vars: {
                  net: {
                    $subtract: ["$$totals.yourSpent", "$$totals.friendSpent"],
                  },
                },
                in: {
                  $cond: [
                    { $gt: ["$$net", 0] },
                    {
                      from: you,
                      total: "$total",
                      amount: { $round: ["$$net", 2] },
                      yourSpent: "$$totals.yourSpent",
                      friendSpent: "$$totals.friendSpent",
                      fromDate: "$fromDate",
                    },
                    {
                      $cond: [
                        { $lt: ["$$net", 0] },
                        {
                          from: friend,
                          total: "$total",
                          amount: { $round: [{ $abs: "$$net" }, 2] },
                          yourSpent: "$$totals.yourSpent",
                          friendSpent: "$$totals.friendSpent",
                          fromDate: "$fromDate",
                        },
                        {}, // net === 0
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    { $replaceRoot: { newRoot: "$settlement" } },
  ]);

export const groupTotalsDB = (filter = {}) =>
  Expense.aggregate([
    {
      $match: {
        expenseType: expenseTypes.group,
        setteled: false,
        verified: true,
        ...filter,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$user",
        from: { $first: "$createdAt" },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1, photo: 1 } }],
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $group: {
        _id: null,
        from: { $min: "$from" },
        members: { $push: { _id: "$user._id", name: "$user.name", amount: "$totalAmount", photo: "$user.photo" } },
        total: { $sum: "$totalAmount" },
      },
    },
    {
      $unset: ["_id", "members.from"],
    },
  ]);

export const totalPersonalDB = (date, auth, to) =>
  Expense.aggregate([
    {
      $match: {
        verified: true,
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
        to,
      },
    },
    {
      $group: {
        _id: "$user",
        amount: {
          $sum: {
            $ifNull: ["$amount", 0],
          },
        },
      },
    },
    {
      $sort: {
        amount: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        let: {
          id: "$_id",
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
        as: "name",
      },
    },
    {
      $unwind: "$name",
    },
    {
      $set: {
        name: "$name.name",
        photo: "$name.photo",
      },
    },
    {
      $group: {
        _id: null,
        members: {
          $push: "$$ROOT",
        },
        total: {
          $sum: "$amount",
        },
      },
    },
    // {
    //   $lookup: {
    //     from: "groups",
    //     pipeline: [
    //       {
    //         $match: {
    //           _id: new ObjectId(to),
    //         },
    //       },
    //     ],
    //     as: "divideBy",
    //   },
    // },
    // {
    //   $unwind: "$divideBy",
    // },
    {
      $set: {
        // third: {
        //   $divide: ["$total", { $ifNull: [{ $size: "$divideBy.members" }, 3] }],
        // },
        you: {
          $arrayElemAt: [
            {
              $ifNull: [
                {
                  $filter: {
                    input: "$members",
                    as: "you",
                    cond: { $eq: ["$$you._id", auth] },
                  },
                },
                [],
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $set: {
        you: { $ifNull: ["$you.amount", 0] },
        remaining: {
          $subtract: [
            { $ifNull: ["$you.amount", 0] },
            {
              $subtract: [{ $ifNull: ["$total", 0] }, { $ifNull: ["$you.amount", 0] }],
            },
          ],
        },
      },
    },
  ]);

export const totalOwnDB = (date, auth) =>
  Expense.aggregate([
    {
      $match: {
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
        user: auth,
        to: expenseTypes.own,
      },
    },
    {
      $group: {
        _id: "$purpose",
        amount: {
          $sum: {
            $ifNull: ["$amount", 0],
          },
        },
      },
    },
    {
      $sort: {
        amount: -1,
      },
    },
  ]);

export const individualDB = (date, auth) =>
  Expense.aggregate([
    {
      $match: {
        createdAt: {
          $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
          $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
        },
        $or: [{ user: auth }, { to: auth?.toString() }],
        to: { $nin: [expenseTypes.team, expenseTypes.own] },
      },
    },
    {
      $group: {
        _id: {
          $cond: [
            {
              $eq: ["$user", auth],
            },
            {
              user: {
                $toString: "$user",
              },
              to: "$to",
            },
            {
              user: "$to",
              to: {
                $toString: "$user",
              },
            },
          ],
        },
        me: {
          $push: {
            $cond: [
              {
                $eq: ["$user", auth],
              },
              {
                purpose: "$purpose",
                _id: "$_id",
                edited: "$edited",
                createdAt: "$createdAt",
                amount: {
                  $ifNull: ["$amount", 0],
                },
              },
              "$$REMOVE",
            ],
          },
        },
        you: {
          $push: {
            $cond: [
              {
                $ne: ["$user", auth],
              },
              {
                createdAt: "$createdAt",
                _id: "$_id",
                edited: "$edited",
                purpose: "$purpose",
                amount: {
                  $ifNull: ["$amount", 0],
                },
              },
              "$$REMOVE",
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { id: "$_id.to" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $toString: "$_id",
                  },
                  "$$id",
                ],
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
        as: "to",
      },
    },
    {
      $unwind: "$to",
    },
    {
      $project: {
        _id: 0,
        to: 1,
        me: 1,
        you: 1,
        total: {
          $subtract: [
            {
              $reduce: {
                input: "$me.amount",
                initialValue: 0,
                in: { $sum: ["$$value", "$$this"] },
              },
            },
            {
              $reduce: {
                input: "$you.amount",
                initialValue: 0,
                in: { $sum: ["$$value", "$$this"] },
              },
            },
          ],
        },
      },
    },
  ]);

// export const totalExpensesDB = (date, user) =>
//   Expense.aggregate([
//     {
//       $match: {
//         createdAt: {
//           $gt: new Date(momentTz(date).tz("Asia/Kolkata").startOf("month")),
//           $lte: new Date(momentTz(date).tz("Asia/Kolkata").endOf("month")),
//         },
//         user,
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         amount: {
//           $sum: {
//             $ifNull: ["$amount", 0],
//           },
//         },
//       },
//     },
//   ]);

export const monthlyBudgetDB = (date, user) =>
  Expense.aggregate([
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
              _id: null,
              amount: {
                $sum: {
                  $ifNull: ["$amount", 0],
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
              _id: null,
              amount: {
                $sum: {
                  $cond: [{ $eq: ["$user", user] }, { $subtract: ["$amount", "$splitedAmount"] }, { $ifNull: ["$splitedAmount", 0] }],
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
              _id: null,
              amount: {
                $sum: {
                  $divide: ["$amount", { $size: "$splitedIn" }],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        amount: {
          $sum: [
            { $ifNull: [{ $first: "$personal.amount" }, 0] },
            { $ifNull: [{ $first: "$friends.amount" }, 0] },
            { $ifNull: [{ $first: "$groups.amount" }, 0] },
          ],
        },
      },
    },
  ]);
