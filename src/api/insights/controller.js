import momentTz from "moment-timezone";
import { badReq, handleExceptions, noContent, rm } from "../../utils/common";
import { getInsightsQuery, monthlyExpensesQuery, monthlyInsightsQuery, monthlyTrendsQuery } from "./query";
import { generateMonthlyTrends } from "./helper";

export const topCards = handleExceptions(async (req, res) => {
  // const date = momentTz("2/28/2026"); // todo - dynamic filter and timezone and keep separate API
  const date = momentTz(); // todo - dynamic filter
  const previousMonth = momentTz(date).subtract(1, "month").startOf("month").toDate();
  const user = req.auth._id;
  const [expenses, previous, trends, monthlyInsights] = await Promise.all([
    monthlyExpensesQuery(date.toDate(), user),
    monthlyInsightsQuery({ user, month: previousMonth }),
    monthlyTrendsQuery(date.toDate(), user),
    getInsightsQuery({
      user,
      month: {
        $gte: momentTz(date).startOf("year").toDate(),
        $lte: momentTz(date).endOf("year").toDate(),
      },
    }),
  ]);

  const year = [
    ...(monthlyInsights || []),
    {
      totalAmount: expenses?.[0]?.totalAmount || 0,
      totalTransactions: expenses?.[0]?.totalTransactions || 0,
      month: date.toDate(),
      dailyAvg: expenses?.[0]?.totalAmount / date.date(),
      timezone: date.tz(),
      verified: true,
    },
  ];

  const data = { data: expenses?.[0] || {}, previous, monthlyTrends: trends?.[0] || {}, monthlyInsights: year };
  if (data?.data) data.data.divideBy = date.date();

  return rm(res, "", data);
});
