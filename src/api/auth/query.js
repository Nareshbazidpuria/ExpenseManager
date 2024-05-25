import { Auth } from "./model";

export const loginDB = (auth) => Auth.create(auth);
export const getLoginDB = (filter) => Auth.findOne(filter);
export const logoutDB = (filter) => Auth.findOneAndDelete(filter);
export const logoutAllDB = (filter) => Auth.deleteMany(filter);
