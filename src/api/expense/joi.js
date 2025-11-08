import { Joi } from "express-validation";
import { expenseTypes } from "../../../config/constant";

export const expenseListJoi = {
  query: Joi.object({
    to: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    startDate: Joi.date(),
    endDate: Joi.date(),
    expenseType: Joi.string()
      .required()
      .valid(...Object.values(expenseTypes)),
  }),
};

// login navigation, authUser
// home focus
// expenses focus
