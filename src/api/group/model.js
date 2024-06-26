import { ObjectId } from "mongodb";
import { model, Schema } from "mongoose";

export const Group = model(
  "groups",
  new Schema({
    name: String,
    sequence: Number,
    admin: ObjectId,
    category: String,
    members: [ObjectId],
  })
);
