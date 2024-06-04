import { Joi } from "express-validation";

export const readAlertsJoi = {
  body: Joi.object({
    ids: Joi.array().items(Joi.string().required()).required().min(1),
  }),
};

export const alertListJoi = {
  query: Joi.object({
    unread: Joi.boolean(),
  }),
};
