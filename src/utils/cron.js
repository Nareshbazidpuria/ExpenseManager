import cron from "node-cron";
import https from "https";

export const keepAlive = () =>
  cron.schedule("*/14 * * * * ", () => {
    https
      .get("https://expensemanager-047k.onrender.com", (res) => {
        if (res?.statusCode === 200) console.log("server restarted");
        else console.log("unable to restart the server");
      })
      .on("error", (error) => console.log(error));
  });
