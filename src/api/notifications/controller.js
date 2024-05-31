import { ObjectId } from "mongodb";
import { notificationListDB } from "./query";
import { handleExceptions, rm } from "../../utils/common";

export const notificationList = handleExceptions(async (req, res) => {
  const list = await notificationListDB({
    members: { $elemMatch: { $eq: new ObjectId(req.auth._id) } },
    user: { $ne: new ObjectId(req.auth._id) },
  });
  rm(res, "", list || []);
});
