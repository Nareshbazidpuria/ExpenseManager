import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export const hashPassword = async (password) =>
  bcrypt.hash(password, await bcrypt.genSalt(10));

export const comparePassword = (password, hash) =>
  bcrypt.compare(password, hash);

export const generateToken = async (payload) =>
  sign(payload, process.env.JWT_SECRET);
