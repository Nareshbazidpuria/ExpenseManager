import momentTz from "moment-timezone";
import { handleExceptions, rm } from "../../utils/common";
import { getInsightsQuery, monthlyExpensesQuery, monthlyInsightsQuery, monthlyTrendsQuery } from "./query";

export const topCards = handleExceptions(async (req, res) => {
  // const date = momentTz("2/28/2026"); // todo - dynamic filter and timezone and keep separate API
  const tz = "Asia/Kolkata";
  const date = momentTz().tz(tz); // todo - dynamic filter
  const previousMonth = momentTz(date).tz(tz).subtract(1, "month").startOf("month").toDate();
  const user = req.auth._id;
  const [expenses, previous, trends, monthlyInsights] = await Promise.all([
    monthlyExpensesQuery(date.toDate(), user),
    monthlyInsightsQuery({ user, month: previousMonth }),
    monthlyTrendsQuery(date.toDate(), user),
    getInsightsQuery({
      user,
      month: {
        $gte: momentTz(date).tz(tz).startOf("year").toDate(),
        $lte: momentTz(date).tz(tz).endOf("year").toDate(),
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
      timezone: tz,
      verified: true,
    },
  ];

  const data = { data: expenses?.[0] || {}, previous, monthlyTrends: trends?.[0] || {}, monthlyInsights: year };
  if (data?.data) data.data.divideBy = date.date();

  return rm(res, "", data);
});
