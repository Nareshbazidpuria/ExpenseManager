import { rMsg } from "../../config/constant";
import { getUserDB } from "../api/user/query";

export const rm = (res, message, data = {}, status = 200) =>
  res?.status(status)?.send({
    message,
    data,
  });

export const badReq = (res, message = "Something went wrong") =>
  res?.status(400)?.send({ message });

export const conflict = (res, message) => res?.status(409)?.send({ message });

export const noContent = (res) => res?.status(204)?.send();

export const res500 = (res) =>
  res?.status(500)?.send({ message: rMsg.INTERNAL_SERVER_ERROR });

export const handleExceptions =
  (fn) =>
  async (req, res, ...args) => {
    try {
      return await fn(req, res, ...args);
    } catch (error) {
      console.error("An error occurred:", error);
      res500(res);
    }
  };

export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const randomString = () =>
  Math.random().toString(36).slice(2).toUpperCase();

export const genSecretCode = async () => {
  const secretCode = Math.random().toString(36).slice(2).toUpperCase();
  if (secretCode?.length !== 11) return genSecretCode();
  if (await getUserDB({ secretCode })) return genSecretCode();
  return secretCode;
};

export const formatMsg = (msg) => {
  if (msg[0] === '"') {
    return msg
      .split(msg.slice(msg.indexOf('"'), msg.lastIndexOf('"') + 1))
      .join(capitalize(msg.slice(msg.indexOf('"') + 1, msg.lastIndexOf('"'))));
  }
};

export const toMsg = (res, err) =>
  err?.details?.body?.length || err?.details?.query?.length
    ? rm(
        res,
        formatMsg((err?.details?.body || err?.details?.query)[0]?.message),
        {},
        err?.statusCode
      )
    : badReq(res, "Validation error");

export const generateOtp = () => {
  let otp = parseInt(Math.random() * 1000000);
  return otp < 100000 ? generateOtp() : otp;
};

export const sortNpaginate = (query, order, by, limit, page) => {
  order = parseInt(query?.order || order || -1);
  by = query?.sortBy || by || "createdAt";
  limit = parseInt(query?.limit || limit || 10);
  page = parseInt(query?.page || page || 1);
  return {
    limit: { $limit: limit },
    sort: { $sort: { [by]: order } },
    skip: { $skip: limit * (page - 1) },
  };
};

export const getSearchParams = (query) => {
  const search = { $or: [] };
  if (query?.name) {
    search.$or.push({ userName: { $regex: query.name, $options: "i" } });
    search.$or.push({ name: { $regex: query.name, $options: "i" } });
    // search.$or.push({ email: { $regex: query.name, $options: "i" } });
  }
  return search.$or.length ? search : {};
};
