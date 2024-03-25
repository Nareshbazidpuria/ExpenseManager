import { ObjectId } from "mongodb";
import { model, Schema } from "mongoose";

export const Expense = model(
  "expenses",
  new Schema(
    {
      user: ObjectId,
      amount: Number,
      purpose: String,
      additional: String,
      to: String,
    },
    { timestamps: true }
  )
);
