require("@babel/register");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const { ValidationError } = require("express-validation");
const { connectDatabase } = require("./config/db");
const { apiRouter } = require("./src/routes/api");
// const {
//   validationErrorMessageConverter,
//   responseMethod,
// } = require("./src/utils/common");

const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRouter);

// app.use((err, req, res, next) => {
//   if (err instanceof ValidationError) {
//     return validationErrorMessageConverter(req, res, err);
//   }
//   if (err instanceof MulterError) {
//     return responseMethod(
//       res,
//       responseCode.BAD_REQUEST,
//       err?.message || responseMessage.BAD_REQUEST
//     );
//   }
//   return responseMethod(
//     res,
//     responseCode.INTERNAL_SERVER_ERROR,
//     responseMessage.INTERNAL_SERVER_ERROR
//   );
// });
connectDatabase().then((data) => {
  console.log(data);
  app.listen(port, () => console.log("App is listening at", port));
});
