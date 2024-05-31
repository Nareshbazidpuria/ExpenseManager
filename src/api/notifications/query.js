import { Group } from "../group/model";
import { Notification } from "./model";

export const addNotificationDB = (data) => Notification.create(data);

export const notificationListDB = ($match) =>
  Group.aggregate([
    {
      $match,
    },
    {
      $lookup: {
        from: "notifications",
        localField: "_id",
        foreignField: "group",
        as: "notification",
      },
    },
    {
      $unwind: "$notification",
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
        group: "$name",
        amount: "$notification.amount",
        purpose: "$notification.purpose",
        prevAmount: "$notification.prevAmount",
        prevPurpose: "$notification.prevPurpose",
      },
    },
  ]);
