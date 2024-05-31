import { ObjectId } from "mongodb";
import { model, Schema } from "mongoose";

export const Notification = model(
  "notifications",
  new Schema({
    user: ObjectId,
    group: ObjectId,
    readBy: [ObjectId],
    amount: Number,
    purpose: String,
    prevAmount: Number,
    prevPurpose: String,
  })
);
