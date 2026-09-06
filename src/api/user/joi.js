import { Joi } from "express-validation";
import joiObjectid from "joi-objectid";

Joi.objectId = joiObjectid(Joi);

export const getMemberJoi = {
  query: Joi.object({
    secretCode: Joi.string().required().length(11),
  }),
};

export const friendListJoi = {
  query: Joi.object({
    name: Joi.string().allow(""),
  }),
};

export const addFriendJoi = {
  params: Joi.object({
    id: Joi.objectId()
      .required()
      .messages({ "string.pattern.name": "Invalid QR code" }),
  }),
};
