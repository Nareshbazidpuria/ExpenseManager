import cron from "node-cron";

export const keepAlive = () =>
  //   cron.schedule("*/14 * * * * ", () => console.log(new Date()));
  cron.schedule("* * * * * * ", () => console.log(new Date()));
