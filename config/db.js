import { connect, set } from "mongoose";

export const connectDatabase = () =>
  new Promise((resolve, reject) => {
    set("strictQuery", true);
    connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => resolve("Database connected"))
      .catch((err) => reject(err));
  });
