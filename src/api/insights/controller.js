import momentTz from "moment-timezone";
import { badReq, handleExceptions, noContent, rm } from "../../utils/common";
import { monthlyExpensesQuery, monthlyInsightsQuery, monthlyTrendsQuery } from "./query";

export const topCards = handleExceptions(async (req, res) => {
  // const date = momentTz("12/28/2025"); // todo - dynamic filter
  const date = momentTz(); // todo - dynamic filter
  const previousMonth = momentTz().subtract(1, "month").startOf("month").toDate();
  const user = req.auth._id;
  const [expenses, previous, trends] = await Promise.all([
    monthlyExpensesQuery(date.toDate(), user),
    monthlyInsightsQuery({ user, month: previousMonth }),
    monthlyTrendsQuery(date.toDate(), user),
  ]);

  const data = { data: expenses?.[0] || {}, previous, monthlyTrends: trends?.[0] || {} };
  if (data?.data) data.data.divideBy = date.date();

  return rm(res, "", data);
});
