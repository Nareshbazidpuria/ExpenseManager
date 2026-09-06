import { ObjectId } from "mongodb";
import { model, Schema } from "mongoose";
import { collectionNames } from "../../../config/constant";

const schema = new Schema(
  {
    user: ObjectId,
    timezone: String,
    month: Date, // First day of the month
    totalAmount: Number,
    personalAmount: Number,
    byYouAmount: Number,
    byOthersAmount: Number,
    totalTransactions: Number,
    personalTransactions: Number,
    byYouTransactions: Number,
    byOthersTransactions: Number,
    dailyAvg: Number,
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

schema.index({ user: 1, month: 1, verified: 1 });
schema.index({ user: 1, month: 1 });
// schema.index({ month: 1 });
// schema.index({ verified: 1 });
// schema.index({ user: 1, verified: 1 });

export const Insights = model(collectionNames.insights, schema);
