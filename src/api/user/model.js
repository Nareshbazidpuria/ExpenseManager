import { model, Schema } from "mongoose";

export const User = model(
  "users",
  new Schema(
    {
      name: String,
      password: String,
      secretCode: String,
      email: String,
      monthlyLimit: Number,
    },
    { timestamps: true }
  )
);
