import { Router } from "express";
import { expenseRouter } from "../api/expense/route";
import { groupRouter } from "../api/group/route";
import { authRouter } from "../api/auth/route";
import { userRouter } from "../api/user/route";
import { alertRouter } from "../api/notifications/route";

export const protectedRoutes = Router();

protectedRoutes.use("/auth", authRouter);
protectedRoutes.use("/expense", expenseRouter);
protectedRoutes.use("/group", groupRouter);
protectedRoutes.use("/notification", alertRouter);
protectedRoutes.use("/user", userRouter);
