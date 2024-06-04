import { Group } from "../group/model";
import { Notification } from "./model";

export const addNotificationDB = (data) => Notification.create(data);

export const editNotificationDB = (filter, updation) =>
  Notification.findOneAndUpdate(filter, updation, { new: true });

export const editNotificationsDB = (filter, updation) =>
  Notification.updateMany(filter, updation, { new: true });

export const notificationListDB = (user, stages = []) =>
  Group.aggregate([
    {
      $match: {
        members: {
          $elemMatch: {
            $eq: user,
          },
        },
      },
    },
    {
      $lookup: {
        from: "notifications",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$group", "$$id"],
              },
              user: { $ne: user },
            },
          },
        ],
        as: "notification",
      },
    },
    {
      $unwind: "$notification",
    },
    {
      $sort: {
        "notification.createdAt": -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "notification.user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        user: "$user.name",
        group: {
          name: "$name",
          _id: "$_id",
          members: "$members",
        },
        _id: "$notification._id",
        amount: "$notification.amount",
        purpose: "$notification.purpose",
        prevAmount: "$notification.prevAmount",
        prevPurpose: "$notification.prevPurpose",
        time: "$notification.createdAt",
        unread: {
          $cond: [
            {
              $in: [user, "$notification.readBy"],
            },
            false,
            true,
          ],
        },
      },
    },
    ...stages,
  ]);
