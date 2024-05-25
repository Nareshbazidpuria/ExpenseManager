require("@babel/register");
require("dotenv").config();

const express = require("express"),
  app = express(),
  path = require("path"),
  port = process.env.PORT,
  cors = require("cors"),
  { connectToDB } = require("./config/db"),
  { mainRoutes } = require("./src/routes/main"),
  { keepAlive } = require("./src/utils/cron");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

keepAlive();

app.use("/", mainRoutes);

connectToDB()
  .then(() => app.listen(port, () => console.log("App is listening at", port)))
  .catch((e) => console.log(e));

module.exports = app;
