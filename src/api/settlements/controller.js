import { handleExceptions, rm } from "../../utils/common";
import { getSettlementsDB } from "./query";

export const settlementList = handleExceptions(async (req, res) => {
  const list = await getSettlementsDB({ participants: { $elemMatch: { $eq: req.auth._id } } });
  return rm(res, "", list);
});
