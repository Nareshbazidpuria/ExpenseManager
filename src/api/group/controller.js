import { ObjectId } from "mongodb";
import { createGroupDB, editGroupDB, groupDetailsDB, groupsDB } from "./query";
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
  const list = await groupsDB(new ObjectId(req.auth._id));
  rm(res, "", list || []);
});

export const groupDetails = handleExceptions(async (req, res) => {
  const group = await groupDetailsDB({ _id: new ObjectId(req.params.id) });
  rm(res, "", group?.[0]);
});

export const editGroup = handleExceptions(async (req, res) => {
  const edited = await editGroupDB({ _id: req.params.id }, req.body);
  if (edited) return rm(res, "Group name has been updated");
  return badReq(res, "Something went wrong");
});
