import { Router } from "express";
import {
  forgotPassword,
  login,
  setPassword,
  signUp,
} from "../api/auth/controller";
import { validate } from "express-validation";
import { forgotPwdJoi, loginJoi, setPwdJoi, signUpJoi } from "../api/auth/joi";
// import { createReadStream, existsSync } from "fs";
// import path from "path";

export const pubRoutes = Router();

pubRoutes.route("/signup").post(validate(signUpJoi), signUp);
pubRoutes.route("/login").post(validate(loginJoi), login);
pubRoutes.post("/forgot-password", validate(forgotPwdJoi), forgotPassword);
pubRoutes.post("/set-password", validate(setPwdJoi), setPassword);
// pubRoutes.get("/download", (req, res) => {
//   try {
//     const filepath = path.join(
//       __dirname.replace(`\\src\\routes`, ""),
//       "public/app/em.apk"
//     );
//     if (existsSync(filepath)) {
//       res.setHeader("Content-Disposition", `attachment; filename=em.apk`);
//       const readStream = createReadStream(filepath);
//       readStream.pipe(res);
//     } else {
//       res.status(404).send("File not found");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });
