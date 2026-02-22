import moment from "moment-timezone";
import {
  addExpenseDB,
  deleteExpenseDB,
  editExpenseDB,
  editExpensesDB,
  expenseListDB,
  friendSettlementsDB,
  getExpenseDB,
  groupSettlementsDB,
  groupTotalsDB,
  individualDB,
  totalExpensesDB,
  totalOwnDB,
  totalPersonalDB,
  totalTeamDB,
} from "./query";
import { expenseTags, expenseTypes, pushTypes } from "../../../config/constant";
import { ObjectId } from "mongodb";
import { badReq, handleExceptions, noContent, rm } from "../../utils/common";
import { addNotificationDB } from "../notifications/query";
import { getGroupDB } from "../group/query";
import { sendPushNtification } from "../../utils/firebase";
import { getLoginDB, getLoginsDB } from "../auth/query";
import { addSettlementDB } from "../settlements/query";
import { editUserDB, getUserDB } from "../user/query";
import { settlementRearrangement } from "./helper";

export const addExpense = handleExceptions(async (req, res) => {
  const { purpose, to, images = [], amount, expenseType, splitedIn = [] } = req.body,
    { _id, monthlyLimit, name } = req.auth;

  const user = JSON.parse(JSON.stringify(req.auth));
  delete user.password;

  const groupOrUser =
    expenseType === expenseTypes.own
      ? req.auth
      : expenseType === expenseTypes.group
        ? await getGroupDB({ _id: to })
        : await getUserDB({ _id: to }, { password: 0 });
  if (!groupOrUser) return badReq(res, "Invalid 'to' field provided");
  const added = await addExpenseDB({ ...req.body, user: _id, verifiedBy: [_id] });
  if (added) {
    const data = {};
    if (monthlyLimit) {
      const totalExpenses = (await totalExpensesDB(new Date(), _id))?.[0]?.amount || 0;
      if (totalExpenses > monthlyLimit) data.message = "You have crossed your monthly expense limit, spend carefully";
    }
    if (expenseType !== expenseTypes.own) {
      const pushPayload = {
        // title: "New Expense",
        // body: `${name} has added a new expense\n${purpose}\nRs. ${amount}`,
        title: `${name} has added a new expense`,
        body: `<div><strong>₹${amount}</strong> • ${purpose}</div>`,
        imageUrl: images[0],
        customData: {
          subtitle: expenseType === expenseTypes.friend ? "Personal" : `Group • ${groupOrUser.name}`,
          type: pushTypes.expenseDetails,
          data: JSON.stringify({
            ...(added._doc || added),
            user: { name, _id },
            groupOrUser: expenseType === expenseTypes.friend ? user : groupOrUser,
          }),
          android: JSON.stringify({
            actions: [
              { title: "Verify", pressAction: { id: `verify/${added._id}` } },
              { title: "View Details", pressAction: { id: `details/${added._id}`, launchActivity: "default" } },
              // {
              //   title: "Comment",
              //   pressAction: { id: `comment/${added._id}` },
              //   input: {
              //     allowFreeFormInput: true,
              //     placeholder: "Add a comment",
              //   },
              // },
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
    }
    if (!req.auth.options.includes(purpose))
      await editUserDB({ _id: req.auth._id }, { $push: { options: { $each: [purpose], $position: 0 } } });

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
    details = data && (await expenseListDB({ _id: new ObjectId(req.params.id) }, data.expenseType === expenseTypes.own));
  if (details?.[0]) return rm(res, "", details[0]);
  return badReq(res, "Expense not found");
});

export const deleteExpense = handleExceptions(async (req, res) => {
  if (await deleteExpenseDB({ _id: req.params.id, user: req.auth._id })) return rm(res, "Expense deleted");
  return badReq(res, "Unable to delete your expense !");
});

export const editExpense = handleExceptions(async (req, res) => {
  const { purpose, to, images = [], amount, expenseType } = req.body,
    _id = req.params.id,
    { name, _id: userId } = req.auth;

  const user = JSON.parse(JSON.stringify(req.auth));
  delete user.password;

  const groupOrUser =
    expenseType === expenseTypes.own
      ? req.auth
      : expenseType === expenseTypes.group
        ? await getGroupDB({ _id: to })
        : await getUserDB({ _id: to }, { password: 0 });
  if (!groupOrUser) return badReq(res, "Invalid 'to' field provided");

  // if (!Object.values(expenseTypes).includes(req.body.to))
  //   req.body.to = (await getUserDB({ name: req.body.to }))?._id;
  const prev = await getExpenseDB({ _id }),
    edited = await editExpenseDB({ _id }, { ...req.body, edited: true });
  if (edited) {
    const { expenseType, splitedIn } = edited;
    if (expenseType !== expenseTypes.own) {
      await addNotificationDB({
        user: userId,
        group: edited.to,
        amount: edited.amount,
        purpose: edited.purpose,
        prevAmount: prev.amount,
        prevPurpose: prev.purpose,
      });
      const pushPayload = {
        // title: "New Expense",
        // body: `${name} has added a new expense\n${purpose}\nRs. ${amount}`,
        title: `${name} has updated an expense`,
        body: `<div><strong>₹${amount}</strong> • ${purpose}</div>`,
        imageUrl: images[0] || edited.images[0],
        customData: {
          subtitle: expenseType === expenseTypes.friend ? "Personal" : `Group • ${groupOrUser.name}`,
          type: pushTypes.expenseDetails,
          data: JSON.stringify({
            ...(edited._doc || edited),
            user: { name, _id: userId },
            groupOrUser: expenseType === expenseTypes.friend ? user : groupOrUser,
          }),
          android: {
            actions: [
              // { title: "Verify", pressAction: { id: `verify/${edited._id}` } },
              { title: "View Details", pressAction: { id: `details/${edited._id}`, launchActivity: "default" } },
              // {
              //   title: "Comment",
              //   pressAction: { id: `comment/${edited._id}` },
              //   input: {
              //     allowFreeFormInput: true,
              //     placeholder: "Add a comment",
              //   },
              // },
            ],
          },
        },
      };
      if (expenseType === expenseTypes.friend) {
        if (!edited.verifiedBy.includes(new ObjectId(to))) {
          pushPayload.customData.android.actions.unshift({ title: "Verify", pressAction: { id: `verify/${edited._id}` } });
        }
        pushPayload.customData.android = JSON.stringify(pushPayload.customData.android);
        const userlogin = ObjectId.isValid(to) && (await getLoginDB({ userId: to }));
        if (userlogin?.fcmToken) await sendPushNtification(userlogin.fcmToken, pushPayload);
      } else if (expenseType === expenseTypes.group) {
        const members = await getLoginsDB({
          $and: [{ fcmToken: { $ne: "" } }, { userId: { $in: splitedIn } }, { userId: { $ne: _id } }],
        });
        for (const user of members || []) {
          const push = { ...pushPayload };
          // if (!edited.verifiedBy.includes(new ObjectId(user.userId))) {
          //   push.customData.android.actions.unshift({ title: "Verify", pressAction: { id: `verify/${edited._id}` } });
          // }
          push.customData.android = JSON.stringify(push.customData.android);
          await sendPushNtification(user.fcmToken, push);
        }
      }
    }
    if (!req.auth.options.includes(purpose))
      await editUserDB({ _id: req.auth._id }, { $push: { options: { $each: [purpose], $position: 0 } } });
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

export const monthlyBudget = handleExceptions(async (req, res) => {
  if (!req.auth.monthlyLimit) return noContent(res);
  const data = { limit: req.auth.monthlyLimit, spent: (await totalExpensesDB(new Date(), req.auth._id))?.[0]?.amount || 0 };
  return rm(res, "", data);
});

export const settlements = handleExceptions(async (req, res) => {
  const { to, expenseType } = req.query,
    filter = { to, createdAt: { $lte: new Date() } };

  if (expenseType === expenseTypes.group) {
    const [data, total] = await Promise.all([groupSettlementsDB(filter), groupTotalsDB(filter)]);
    const resp = settlementRearrangement(data);
    if (!resp?.length) return noContent(res);
    return rm(res, "", { data: resp, total: total[0] });
  } else {
    const data = await friendSettlementsDB(req.auth._id, to);
    if (!data?.[0]) return noContent(res);
    return rm(res, "", data[0]);
  }
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

export const settleDown = handleExceptions(async (req, res) => {
  const { type, to } = req.body,
    upto = new Date(),
    filter = { to, setteled: false, createdAt: { $lte: upto } };
  let history;
  if (type === expenseTypes.group) {
    const unverifiedExpenses = await getExpenseDB({ ...filter, verified: false });
    if (unverifiedExpenses) return badReq(res, "Cannot settle dues with unverified expenses present in the group");

    const historyFilter = { to, createdAt: { $lte: upto } };

    const [data, total, group] = await Promise.all([
      groupSettlementsDB(historyFilter),
      groupTotalsDB(historyFilter),
      getGroupDB({ _id: to }),
    ]);

    const resp = settlementRearrangement(data);

    history = {
      expenseType: expenseTypes.group,
      user: req.auth._id,
      upto,
      participants: group?.members,
      to,
      data: { data: resp, total: total?.[0] },
    };

    const settled = await editExpensesDB(filter, { setteled: true });
    if (!settled?.modifiedCount) return badReq(res, "No dues to settle in the group");
    await addSettlementDB(history);
    return rm(res, "Settled all dues in the group");
  } else if (type === expenseTypes.friend) {
    delete filter.to;
    filter.$or = [
      { to: String(req.auth._id), user: new ObjectId(to) },
      { to, user: req.auth._id },
    ];
    const unverifiedExpenses = await getExpenseDB({ ...filter, verified: false });
    if (unverifiedExpenses) return badReq(res, "Cannot settle dues with unverified expenses present with the friend");

    const data = await friendSettlementsDB(req.auth._id, to);
    history = {
      expenseType: expenseTypes.friend,
      user: req.auth._id,
      upto,
      to,
      participants: [req.auth._id, to],
      data: data?.[0],
    };

    const settled = await editExpensesDB(filter, { setteled: true });
    if (!settled?.modifiedCount) return badReq(res, "No dues to settle with the friend");

    await addSettlementDB(history);

    return rm(res, "Settled all dues with the friend");
  }

  // todo notify the other party
});
