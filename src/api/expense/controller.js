import moment from "moment-timezone";
import {
  addExpenseDB,
  deleteExpenseDB,
  editExpenseDB,
  expenseListDB,
  getExpenseDB,
  individualDB,
  totalExpensesDB,
  totalOwnDB,
  totalPersonalDB,
  totalTeamDB,
} from "./query";
import { expenseTags, expenseTypes, pushTypes } from "../../../config/constant";
import { ObjectId } from "mongodb";
import { getUserDB } from "../user/query";
import { badReq, handleExceptions, rm } from "../../utils/common";
import { addNotificationDB } from "../notifications/query";
import { getGroupDB } from "../group/query";
import { sendPushNtification } from "../../utils/firebase";
import { getLoginDB, getLoginsDB } from "../auth/query";
// import { sendNotification } from "../../utils/push";
// import { getExpoTokensDB, getUserDB } from "../user/query";

export const addExpense = handleExceptions(async (req, res) => {
  const { purpose, to, images = [], amount, expenseType, splitedIn = [] } = req.body,
    { _id, monthlyLimit, name } = req.auth;
  const added = await addExpenseDB({ ...req.body, user: _id, verifiedBy: [_id] });
  if (added) {
    const data = {};
    if (monthlyLimit) {
      const totalExpenses = (await totalExpensesDB(new Date(), _id))?.[0]?.amount || 0;
      if (totalExpenses > monthlyLimit) data.message = "You have crossed your monthly expense limit, spend carefully";
    }
    const pushPayload = {
      title: "New Expense",
      body: `${req.auth.name} has added a new expense\n${purpose}\nRs. ${amount}`,
      imageUrl: images[0] && process.env.BASE_URL + images[0],
      customData: {
        type: pushTypes.expenseDetails,
        data: JSON.stringify({ ...(added._doc || added), user: { name, _id } }),
        android: JSON.stringify({
          actions: [
            { title: "Verify", pressAction: { action: "verify", id: added._id } },
            { title: "View Details", pressAction: { action: "view", id: added._id } },
            {
              title: "Comment",
              pressAction: { action: "comment", id: added._id },
              input: {
                allowFreeFormInput: true,
                placeholder: "Add a comment",
              },
            },
          ],
        }),
      },
    };
    if (expenseType === expenseTypes.friend) {
      const userlogin = ObjectId.isValid(to) && (await getLoginDB({ userId: to }));
      if (userlogin?.fcmToken) await sendPushNtification(userlogin.fcmToken, pushPayload);
    } else if (expenseType === expenseTypes.group) {
      const members = await getLoginsDB({
        $and: [{ fcmToken: { $ne: "" } }, { userId: { $in: splitedIn } }, { userId: { $ne: _id } }],
      });
      for (const user of members || []) {
        await sendPushNtification(user.fcmToken, pushPayload);
      }
    }
    return rm(res, "Expense added", data, 201);
  }
  return badReq(res, "Unable to save your data !");
});

export const expenseList = handleExceptions(async (req, res) => {
  const { to, expenseType, startDate, endDate, tags } = req.query,
    filter = { to, expenseType, createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
  if (tags?.length) {
    if (tags.includes(expenseTags.me) && !tags.includes(expenseTags.other)) filter.user = req.auth._id;
    if (tags.includes(expenseTags.other) && !tags.includes(expenseTags.me)) filter.user = { $ne: req.auth._id };
    if (tags.includes(expenseTags.verified) && !tags.includes(expenseTags.notVerified)) filter.verified = true;
    if (tags.includes(expenseTags.notVerified) && !tags.includes(expenseTags.verified)) filter.verified = false;
  }
  if (expenseType === expenseTypes.friend) {
    delete filter.to;
    filter.$or = [
      { to: req.auth._id.toString(), user: new ObjectId(to) },
      { to, user: req.auth._id },
    ];
  } else if (expenseType === expenseTypes.own) filter.user = req.auth._id;
  const list = await expenseListDB(filter, expenseType === expenseTypes.own);
  return rm(res, "", list);
});

// export const expenseList = handleExceptions(async (req, res) => {
//   const date = req.query.date || new Date(),
//     filter = {
//       createdAt: {
//         $gt: new Date(
//           moment(new Date(date)).tz("Asia/Kolkata").startOf("month")
//         ),
//         $lte: new Date(
//           moment(new Date(date)).tz("Asia/Kolkata").endOf("month")
//         ),
//       },
//       to: req.query.to || expenseTypes.team,
//     };
//   if (filter.to === expenseTypes.own) filter.user = new ObjectId(req.auth._id);
//   const list = await expenseListDB(filter, filter.to === expenseTypes.own);
//   return rm(res, "", list);
// });

export const getExpense = handleExceptions(async (req, res) => {
  const data = await getExpenseDB({ _id: req.params.id, user: req.auth._id }),
    details =
      data && (await expenseListDB({ _id: new ObjectId(req.params.id) }, data.expenseType === expenseTypes.own));
  if (details?.[0]) return rm(res, "", details[0]);
  return badReq(res, "Expense not found");
});

export const deleteExpense = handleExceptions(async (req, res) => {
  if (await deleteExpenseDB({ _id: req.params.id, user: req.auth._id })) return rm(res, "Expense deleted");
  return badReq(res, "Unable to delete your expense !");
});

export const editExpense = handleExceptions(async (req, res) => {
  const { additional, purpose, to, images = [], amount } = req.body,
    _id = req.params.id;
  if (purpose === "Write your own ...") req.body.purpose = additional;

  // if (!Object.values(expenseTypes).includes(req.body.to))
  //   req.body.to = (await getUserDB({ name: req.body.to }))?._id;
  const prev = await getExpenseDB({ _id }),
    edited = await editExpenseDB({ _id }, { ...req.body, edited: true });
  if (edited) {
    if (to !== expenseTypes.own)
      await addNotificationDB({
        user: req.auth._id,
        group: edited.to,
        amount: edited.amount,
        purpose: edited.purpose,
        prevAmount: prev.amount,
        prevPurpose: prev.purpose,
      });
    return rm(res, "Expense updated");
  }
  return badReq(res, "Unable to update your expense");
});

export const verifyExpense = handleExceptions(async (req, res) => {
  const _id = req.params.id;
  const expense = await getExpenseDB({ _id });
  if (!expense) return badReq(res, "Expense not found");
  if (expense.user.toString() === req.auth._id.toString() || expense.expenseType === expenseTypes.own)
    return badReq(res, "You cannot verify your own expense");
  if (expense.verified || expense.verifiedBy.map((id) => id.toString()).includes(req.auth._id.toString()))
    return badReq(res, "Expense already verified");
  const updates = { $addToSet: { verifiedBy: req.auth._id } };
  if (expense.expenseType === expenseTypes.friend) updates.$set = { verified: true };
  else {
    const group = await getGroupDB({ _id: expense.to });
    if (group?.members?.length - 1 === expense.verifiedBy.length) updates.$set = { verified: true };
  }

  const verified = await editExpenseDB({ _id, user: { $ne: req.auth._id } }, updates);
  if (verified) return rm(res, "Expense has been verified from your side");
  return badReq(res, "Unable to verify your expense");
});

export const totalTeam = handleExceptions(async (req, res) => {
  const { date = new Date(), to } = req.query;
  const group = ObjectId.isValid(to) ? await getGroupDB({ _id: to }) : null;
  const list =
    group?.members?.length === 2
      ? await totalPersonalDB(date, new ObjectId(req.auth._id), to)
      : await totalTeamDB(date, new ObjectId(req.auth._id), to);
  return rm(res, "", list?.[0]);
});

export const totalOwn = handleExceptions(async (req, res) => {
  const date = req.query.date || new Date(),
    list = await totalOwnDB(date, new ObjectId(req.auth._id));
  return rm(res, "", list);
});

export const individual = handleExceptions(async (req, res) => {
  const date = req.query.date || new Date();
  return rm(res, "", await individualDB(date, new ObjectId(req.auth._id)));
});
