import { model, Schema } from "mongoose";

export const Settlements = model(
  "settlements",
  new Schema(
    {
      user: Schema.ObjectId,
      upto: Date,
      to: Schema.ObjectId,
      expenseType: String,
      participants: [Schema.ObjectId],
      data: Object,
    },
    { timestamps: true }
  )
);
