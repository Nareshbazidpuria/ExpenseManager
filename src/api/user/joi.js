import { Joi } from "express-validation";

export const getMemberJoi = {
  query: Joi.object({
    secretCode: Joi.string().required().length(11),
  }),
};
