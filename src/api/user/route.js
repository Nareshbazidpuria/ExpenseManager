import { Router } from "express";
import { addFriend, friendList, getMember } from "./controller";
import { validate } from "express-validation";
import { addFriendJoi, friendListJoi, getMemberJoi } from "./joi";

export const userRouter = Router();

userRouter.route("/").get(validate(getMemberJoi), getMember);
userRouter.route("/friends").get(validate(friendListJoi), friendList);
userRouter.route("/:id").post(validate(addFriendJoi), addFriend);
