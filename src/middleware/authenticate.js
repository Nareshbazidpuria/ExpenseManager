import { handleExceptions, rm } from "../utils/common";
import { jwtDecode } from "jwt-decode";
import { getUserDB } from "../api/user/query";
import { getLoginDB } from "../api/auth/query";

export const authenticate = handleExceptions(async (req, res, next) => {
  const { token, version } = req.headers;
  if (version !== "3.1.0")
    return rm(res, "", { update: { size: 67294340, version: "v3.1.0" } }, 404);
  if (!token) return rm(res, "Inaccessible", {}, 401);
  const credentials = jwtDecode(token),
    user = await getUserDB({ _id: credentials.userId });
  if (!user) return rm(res, "Session expired", {}, 401);
  const auth = await getLoginDB({ userId: credentials.userId });
  if (!auth) return rm(res, "Session expired", {}, 401);
  req.auth = user;
  next();
});
