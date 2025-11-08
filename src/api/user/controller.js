import moment from "moment";
import { editUserDB, expenseListDB, getUserDB, getUsersDB } from "./query";
import { expenseTypes } from "../../../config/constant";
import { badReq, handleExceptions, noContent, rm } from "../../utils/common";

export const getMember = handleExceptions(async (req, res) => {
  if (req.auth.secretCode === req.query.secretCode)
    return badReq(res, "You cannot add yourself as a friend, it's your own connection code");
  const member = await getUserDB({ secretCode: req.query.secretCode });
  if (member) return rm(res, "", { name: member.name, _id: member._id });
  return badReq(res, "No user found with this connection code");
});

export const friendList = handleExceptions(async (req, res) => {
  const { name } = req.query,
    filter = { _id: { $in: req.auth.friends } };
  if (name) filter.name = { $regex: name, $options: "i" };
  const friends = await getUsersDB(filter).select({ name: 1 });
  if (friends?.length) return rm(res, "", friends);
  noContent(res);
});

export const expenseList = handleExceptions(async (req, res) => {
  const date = req.query.date || new Date();
  return res.status(200).send({
    data: await expenseListDB({
      createdAt: {
        $gt: new Date(moment(date).startOf("month")),
        $lte: new Date(moment(date).endOf("month")),
      },
      to: req.query.to || expenseTypes.team,
    }),
  });
});

export const addFriend = handleExceptions(async (req, res) => {
  const { id } = req.params,
    { _id } = req.auth;
  if (id === _id) return badReq(res, "You cannot add yourself as a friend");
  if ((req.auth.friends || []).map((id) => id.toString()).includes(id)) return badReq(res, "You have already added this user as a friend");

  const [you, friend] = await Promise.all([
    editUserDB({ _id }, { $addToSet: { friends: id } }),
    editUserDB({ _id: id }, { $addToSet: { friends: _id } }),
  ]);

  if (you && friend) return rm(res, "Friend added");
  return badReq(res);
});
