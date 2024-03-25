import { Router } from "express";
import { expenseRouter } from "../api/expense/route";
import { userRouter } from "../api/user/route";

export const apiRouter = Router();

apiRouter.use("/expense", expenseRouter);
apiRouter.use("/user", userRouter);
