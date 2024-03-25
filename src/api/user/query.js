import { User } from "./model";

export const getUserDB = (filter) => User.findOne(filter);
export const editUserDB = (filter, updation) =>
  User.findOneAndUpdate(filter, updation, { new: true });
