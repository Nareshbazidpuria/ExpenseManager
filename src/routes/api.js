import { Router } from "express";
import { expenseRouter } from "../api/expense/route";
import { userRouter } from "../api/user/route";
import { groupRouter } from "../api/group/route";

export const apiRouter = Router();

apiRouter.use("/expense", expenseRouter);
apiRouter.use("/group", groupRouter);
apiRouter.use("/user", userRouter);
