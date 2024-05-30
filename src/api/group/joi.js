import { Joi } from "express-validation";

export const createGroupJoi = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(20),
    members: Joi.array().items(Joi.string().required()).required().min(1),
  }),
};
