import { ObjectId } from "mongodb";
import { editNotificationsDB, notificationListDB } from "./query";
import { handleExceptions, rm } from "../../utils/common";

export const notificationList = handleExceptions(async (req, res) => {
  const stages = [];
  if (req.query.unread)
    stages.push({
      $group: {
        _id: null,
        count: { $sum: { $cond: [{ $eq: ["$unread", true] }, 1, 0] } },
      },
    });
  const list = await notificationListDB(new ObjectId(req.auth._id), stages);
  rm(res, "", list || []);
});

export const readNotification = handleExceptions(async (req, res) => {
  await editNotificationsDB(
    { _id: req.params.id || { $in: req.body.ids } },
    { $addToSet: { readBy: req.auth._id } }
  );
  rm(res);
});
