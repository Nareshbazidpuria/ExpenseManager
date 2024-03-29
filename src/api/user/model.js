import { model, Schema } from "mongoose";

export const User = model(
  "users",
  new Schema(
    {
      name: String,
      password: String,
      expoToken: String,
    },
    { timestamps: true }
  )
);
