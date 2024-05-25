import { ObjectId } from "mongodb";
import { groupsDB } from "./query";

export const groupList = async (req, res) => {
  try {
    return res.status(200).send({
      data: await groupsDB({
        members: { $elemMatch: { $eq: new ObjectId(req.headers?.user) } },
      }),
    });
  } catch (error) {
    return res.status(500).send({ message: "Something went wrong" });
  }
};
