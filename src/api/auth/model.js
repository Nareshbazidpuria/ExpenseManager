import { ObjectId } from "mongodb";
import { model, Schema } from "mongoose";

export const Auth = model(
  "auths",
  new Schema(
    {
      userId: ObjectId,
      accessToken: String,
      fcmToken: String,
    },
    { timestamps: true }
  )
);
