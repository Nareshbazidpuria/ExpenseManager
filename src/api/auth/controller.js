import {
  comparePassword,
  generateToken,
  hashPassword,
} from "../../utils/bcrypt";
import {
  badReq,
  conflict,
  genSecretCode,
  handleExceptions,
  rm,
} from "../../utils/common";
import { getUserDB, addUserDB } from "../user/query";
import { logoutDB, loginDB } from "./query";
import { rMsg } from "../../../config/constant";

export const signUp = handleExceptions(async (req, res) => {
  if (await getUserDB({ email: req.body.email.trim()?.toLowerCase() }))
    return conflict(res, rMsg.USER_EXIST);
  req.body.password = await hashPassword(req.body.password?.trim());
  req.body.secretCode = await genSecretCode();
  if (await addUserDB(req.body)) return rm(res, rMsg.SIGNUP, {}, 201);
  return badReq(res);
});

export const login = handleExceptions(async (req, res) => {
  const user = await getUserDB({ email: req.body.email.trim()?.toLowerCase() });
  if (!user) return badReq(res, rMsg.USER_NOT_FOUND);
  if (!(await comparePassword(req.body.password, user.password)))
    return badReq(res, rMsg.INCORRECT_PASSWORD);
  const accessToken = await generateToken({ userId: user._id });
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
  return rm(res, "", user);
});

// // Todo
// export const forgotPassword = async (req, res) => {
//   try {
//     const email = req.body.email.trim()?.toLowerCase();
//     const user = await getUserDB({ email });
//     if (!user) {
//       return responseMethod(
//         res,
//         responseCode.BAD_REQUEST,
//         rMsg.USER_NOT_FOUND,
//         false,
//         {}
//       );
//     }
//     const otp = generateOtp();
//     const payload = {
//       to: req.body.email.trim()?.toLowerCase(),
//       subject: "OTP received to reset password",
//       text: `You OTP to reset password for account ${email} is ${otp}. Please don't disclose.`,
//     };
//     sendEmail(payload);
//     let token = await generateToken({
//       otp,
//       email,
//       expirationTime: new Date().setMinutes(new Date().getMinutes() + 3),
//     });
//     token = await encrypt(token);
//     return responseMethod(res, responseCode.OK, rMsg.OTP_SENT, true, { token });
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

// // Todo
// export const setPassword = async (req, res) => {
//   try {
//     let token = await decrypt(req.body.token);
//     token = jwt_decode(token);
//     if (new Date(token.expirationTime) < new Date()) {
//       return responseMethod(
//         res,
//         responseCode.NO_LONGER_AVAILABLE,
//         rMsg.OTP_EXPIRED,
//         false,
//         {}
//       );
//     } else if (token.otp != req.body.otp) {
//       return responseMethod(
//         res,
//         responseCode.BAD_REQUEST,
//         rMsg.INVALID_OTP,
//         false,
//         {}
//       );
//     }
//     const password = await hashPassword(req.body.password);
//     const user = await updateUserService({ email: token.email }, { password });
//     if (!user) {
//       return responseMethod(
//         res,
//         responseCode.BAD_REQUEST,
//         rMsg.BAD_REQUEST,
//         false,
//         {}
//       );
//     }
//     await logoutAllDB({ userId: user._id });
//     return responseMethod(
//       res,
//       responseCode.OK,
//       rMsg.PASSWORD_CHANGED,
//       true,
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

// export const changePassword = async (req, res) => {
//   try {
//     const user = await getUserDB({ _id: req.auth._id });
//     const matched = await comparePassword(
//       req.body.currentPassword,
//       user.password
//     );
//     if (!matched) {
//       return responseMethod(
//         res,
//         responseCode.BAD_REQUEST,
//         rMsg.INCORRECT_PASSWORD,
//         false,
//         {}
//       );
//     }
//     const password = await hashPassword(req.body.newPassword);
//     const updated = await updateUserService({ _id: user?._id }, { password });
//     if (updated) {
//       return responseMethod(
//         res,
//         responseCode.OK,
//         rMsg.PASSWORD_CHANGED,
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
