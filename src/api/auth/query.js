import { Auth } from "./model";

export const loginDB = (auth) => Auth.create(auth);
export const getLoginDB = (filter) => Auth.findOne(filter).sort({ createdAt: -1 });
export const getLoginsDB = (filter) => Auth.find(filter);
export const logoutDB = (filter) => Auth.findOneAndDelete(filter);
export const logoutAllDB = (filter) => Auth.deleteMany(filter);
