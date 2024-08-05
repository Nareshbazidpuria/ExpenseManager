import cron from "node-cron";
import https from "https";
import { readFileSync } from "fs";
import { notVerifiedEDB } from "../api/user/query";
import { sendEmail } from "./mailer";

export const keepAlive = () =>
  cron.schedule("*/14 * * * * ", () => {
    https
      .get("https://expensemanager-047k.onrender.com", (res) => {
        if (res?.statusCode === 200) console.log("server restarted");
        else console.log("unable to restart the server");
      })
      .on("error", (error) => console.log(error));
  });

export const verifyReminder = () =>
  cron.schedule(
    "30 20 * * * ",
    async () => {
      try {
        const users = await notVerifiedEDB(),
          template = readFileSync(
            "public/templates/verifyExpenses.html",
            "utf8"
          );
        if (users?.length) {
          for (const { name, email } of users) {
            const html = template.replace("{{name}}", name);
            await sendEmail({ to: email, subject: "Verify Expenses", html });
          }
        }
      } catch (error) {
        console.log("verify expense cron : ", error);
      }
    },
    { timezone: "Asia/Kolkata" }
  );
