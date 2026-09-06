import { Joi } from "express-validation";

export const createGroupJoi = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(20),
    members: Joi.array().min(2).items(Joi.string().required()).required(),
  }),
};

export const editGroupJoi = {
  body: Joi.object({
    name: Joi.string().min(3).max(20),
  }),
};
