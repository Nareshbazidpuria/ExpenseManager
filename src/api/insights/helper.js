import moment from "moment-timezone";
import { getUsersDB } from "../user/query";
import { addInsightsQuery, monthlyExpensesQuery, monthlyInsightsQuery } from "./query";
import { getExpenseDB } from "../expense/query";

export const generateMonthlyTrends = async (date = new Date(), tz = "Asia/Kolkata") => {
  try {
    const users = await getUsersDB({});
    if (!users?.length) return;
    for (const user of users) {
      const data = (await monthlyExpensesQuery(date, user._id))?.[0];
      if (data?.totalAmount) {
        const days = moment(date).tz(tz).daysInMonth();
        // const days =
        //   moment(date).tz(tz).startOf("month").toISOString() === moment().tz(tz).startOf("month").toISOString()
        //     ? moment().tz(tz).date()
        //     : moment(date).tz(tz).daysInMonth();

        await addInsightsQuery({
          user: user._id,
          timezone: tz,
          totalAmount: data.totalAmount,
          totalTransactions: data.totalTransactions,
          month: moment(date).tz(tz).startOf("month").toDate(),
          dailyAvg: data.totalAmount / days,
        });
      }
    }
  } catch (error) {}
};

const addIntialInsights = async (tz = "Asia/Kolkata") => {
  const insightsExists = await monthlyInsightsQuery();
  if (!insightsExists) {
    const firstExpense = await getExpenseDB().sort({ createdAt: 1 });
    if (!firstExpense) return;
    const startingMonth = moment(firstExpense.createdAt).tz(tz).startOf("month").toDate();
    while (startingMonth < moment().tz(tz).startOf("month").toDate()) {
      await generateMonthlyTrends(startingMonth, tz);
      startingMonth.setMonth(startingMonth.getMonth() + 1);
    }
  }
};

addIntialInsights();
