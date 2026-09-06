import { Joi } from "express-validation";
import { expenseTypes } from "../../../config/constant";

export const addExpenseJoi = {
  body: Joi.object({
    purpose: Joi.string().required(),
    to: Joi.string().required(),
    images: Joi.array().items(Joi.string()),
    amount: Joi.number().required(),
    expenseType: Joi.string()
      .required()
      .valid(...Object.values(expenseTypes)),
    splitedIn: Joi.array()
      .items(Joi.string())
      .when("expenseType", {
        is: expenseTypes.group,
        then: Joi.array().min(2).messages({
          "array.min": "Expense must be split between at least two people",
        }),
        otherwise: Joi.optional(),
      }),
    additional: Joi.string().allow(""),
    splitedAmount: Joi.when("expenseType", {
      is: expenseTypes.friend,
      then: Joi.number().required(),
      otherwise: Joi.forbidden(),
    }),
  }),
};

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

export const settlementsJoi = {
  query: Joi.object({
    to: Joi.string().required(),
    date: Joi.string().allow(""),
    expenseType: Joi.string()
      .required()
      .valid(...Object.values(expenseTypes)),
  }),
};

export const settleDownJoi = {
  body: Joi.object({
    to: Joi.string().required(),
    type: Joi.string()
      .required()
      .valid(...Object.values(expenseTypes)),
  }),
};

// login navigation, authUser
// home focus
// expenses focus
