import { ObjectId } from "mongodb";
import { createGroupDB, groupsDB } from "./query";
import { badReq, handleExceptions, rm } from "../../utils/common";
import { rMsg } from "../../../config/constant";

export const createGroup = handleExceptions(async (req, res) => {
  const created = await createGroupDB({
    ...req.body,
    members: [...req.body.members, req.auth._id],
    admin: req.auth._id,
  });
  if (created) return rm(res, rMsg.GROUP_CREATED);
  return badReq(res);
});

export const groupList = handleExceptions(async (req, res) => {
  const list = await groupsDB({
    members: { $elemMatch: { $eq: new ObjectId(req.auth._id) } },
  });
  rm(res, "", list || []);
});
