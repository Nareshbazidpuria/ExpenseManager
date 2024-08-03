import {
  comparePassword,
  decrypt,
  encrypt,
  generateToken,
  hashPassword,
} from "../../utils/bcrypt";
import {
  badReq,
  conflict,
  genSecretCode,
  generateOtp,
  handleExceptions,
  rm,
} from "../../utils/common";
import { getUserDB, addUserDB, editUserDB } from "../user/query";
import { logoutDB, loginDB, logoutAllDB } from "./query";
import { rMsg } from "../../../config/constant";
import { notificationListDB } from "../notifications/query";
import { ObjectId } from "mongodb";
import { sendEmail } from "../../utils/mailer";
import { readFileSync } from "fs";
import { jwtDecode } from "jwt-decode";
import { totalExpensesDB } from "../expense/query";

export const signUp = handleExceptions(async (req, res) => {
  const email = req.body.email.trim()?.toLowerCase();
  if (await getUserDB({ email })) return conflict(res, rMsg.USER_EXIST);
  req.body = {
    ...req.body,
    email,
    password: await hashPassword(req.body.password?.trim()),
    secretCode: await genSecretCode(),
  };
  if (await addUserDB(req.body)) return rm(res, rMsg.SIGNUP, {}, 201);
  return badReq(res);
});

export const login = handleExceptions(async (req, res) => {
  const user = await getUserDB({ email: req.body.email.trim()?.toLowerCase() });
  if (!user) return badReq(res, rMsg.USER_NOT_FOUND);
  if (!(await comparePassword(req.body.password, user.password)))
    return badReq(res, rMsg.INCORRECT_PASSWORD);
  const accessToken = generateToken({ userId: user._id });
  if (!(await loginDB({ userId: user._id, accessToken }))) return badReq(res);
  return rm(res, rMsg.LOGIN_SUCCESS, {
    accessToken,
    user: { name: user.name, _id: user._id },
  });
});

export const logout = handleExceptions(async (req, res) => {
  if (!(await logoutDB({ accessToken: req.headers.token }))) return badReq(res);
  return rm(res, rMsg.LOGGED_OUT);
});

export const profile = handleExceptions(async (req, res) => {
  const user = { ...req.auth._doc };
  delete user.password;
  user.unreadAlertsCount =
    (
      await notificationListDB(req.auth._id, [
        {
          $group: {
            _id: null,
            count: { $sum: { $cond: [{ $eq: ["$unread", true] }, 1, 0] } },
          },
        },
      ])
    )?.[0]?.count || 0;
  user.totalExpenses = user.monthlyLimit
    ? (await totalExpensesDB(new Date(), req.auth._id))?.[0]?.amount || 0
    : 0;
  return rm(res, "", user);
});

export const updateProfile = handleExceptions(async (req, res) => {
  const { hiddenGroups, type } = req.body;
  if (type === "hide") {
    const updated = await editUserDB(
      { _id: req.auth._id },
      { $addToSet: { hiddenGroups } }
    );
    if (updated)
      return rm(
        res,
        "Groups have been hidden, you can unhide them from my profile"
      );
  } else if (type === "unhide") {
    const updated = await editUserDB({ _id: req.auth._id }, { hiddenGroups });
    if (updated) return rm(res, "");
  } else {
    const updated = await editUserDB({ _id: req.auth._id }, req.body);
    if (updated) return rm(res, "Profile updated");
  }
  return badReq(res, "Something went wrong");
});

export const forgotPassword = handleExceptions(async (req, res) => {
  const email = req.body.email.trim()?.toLowerCase();
  const user = await getUserDB({ email });
  if (!user) return badReq(res, rMsg.USER_NOT_FOUND);
  const otp = generateOtp();
  let html = readFileSync("public/templates/forgotPassword.html", "utf8");
  html = html.replace("{{otp}}", otp);
  html = html.replace("{{name}}", user?.name);
  const mailSent = await sendEmail({
    to: email,
    subject: "Reset your password",
    html,
  });
  if (!mailSent) return badReq(res, "Something went wrong");
  const token = encrypt(
    generateToken({
      otp,
      email,
      expirationTime: new Date().setMinutes(new Date().getMinutes() + 10),
    })
  );
  return rm(res, rMsg.OTP_SENT, token);
});

export const setPassword = handleExceptions(async (req, res) => {
  const token = jwtDecode(decrypt(req.body.token));
  if (new Date(token.expirationTime) < new Date())
    return badReq(res, rMsg.OTP_EXPIRED);
  else if (token.otp != req.body.otp) return badReq(res, rMsg.INVALID_OTP);
  const password = await hashPassword(req.body.password);
  const updated = await editUserDB({ email: token.email }, { password });
  if (!updated) return badReq(res, "Something went wrong");
  await logoutAllDB({ userId: updated._id });
  return rm(res, rMsg.PASSWORD_CHANGED);
});

export const changePassword = handleExceptions(async (req, res) => {
  const { password, newPassword } = req.body,
    matched = await comparePassword(password, req.auth.password);
  if (!matched) return badReq(res, rMsg.INCORRECT_PASSWORD);
  const pwd = await hashPassword(newPassword),
    updated = await editUserDB({ _id: req.auth._id }, { password: pwd });
  if (updated) return rm(res, rMsg.PASSWORD_CHANGED);
  return badReq(res, "Something went wrong");
});

// export const deleteAccount = async (req, res) => {
//   try {
//     const deleted = await deleteUserService({ _id: req.auth._id });
//     if (deleted) {
//       return responseMethod(
//         res,
//         responseCode.OK,
//         rMsg.ACCOUNT_DELETED,
//         true,
//         {}
//       );
//     }
//     return responseMethod(
//       res,
//       responseCode.BAD_REQUEST,
//       rMsg.BAD_REQUEST,
//       false,
//       {}
//     );
//   } catch (error) {
//     console.log(error);
//     return responseMethod(
//       res,
//       responseCode.INTERNAL_SERVER_ERROR,
//       rMsg.INTERNAL_SERVER_ERROR,
//       false,
//       {}
//     );
//   }
// };
