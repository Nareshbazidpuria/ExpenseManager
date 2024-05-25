import { connect, set } from "mongoose";

export const connectToDB = () =>
  new Promise((resolve, reject) => {
    set("strictQuery", true);
    connect(process.env.MONGODB_URI)
      .then(() => resolve("Database Connected"))
      .catch((err) => reject(err));
  });
