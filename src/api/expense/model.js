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
    },
    { timestamps: true }
  )
);
