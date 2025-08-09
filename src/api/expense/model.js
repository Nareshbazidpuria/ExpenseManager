import { ObjectId } from "mongodb";
import { model, Schema } from "mongoose";

export const Expense = model(
  "expenses",
  new Schema(
    {
      user: ObjectId,
      amount: Number,
      additional: String,
      to: String,
      expenseType: String,
      splitedIn: [ObjectId],
      splitedAmount: Number,
      verified: {
        type: Boolean,
        default: false,
      },
      verifiedBy: [ObjectId],
      purpose: {
        type: String,
        trim: true,
      },
      edited: {
        type: Boolean,
        default: false,
      },
      images: [String],
    },
    { timestamps: true }
  )
);
