import bcrypt from "bcryptjs";
import Cryptr from "cryptr";
import { sign } from "jsonwebtoken";

export const hashPassword = async (password) =>
  bcrypt.hash(password, await bcrypt.genSalt(10));

export const comparePassword = (password, hash) =>
  bcrypt.compare(password, hash);

export const generateToken = (payload) => sign(payload, process.env.JWT_SECRET);

export const encrypt = (str) => {
  const cryptr = new Cryptr(process.env.JWT_SECRET);
  return cryptr.encrypt(str);
};

export const decrypt = (str) => {
  const cryptr = new Cryptr(process.env.JWT_SECRET);
  return cryptr.decrypt(str);
};
