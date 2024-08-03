import { Joi } from "express-validation";

export const signUpJoi = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(20),
    email: Joi.string().required(),
    password: Joi.string().required().min(8).max(30),
  }),
};

export const loginJoi = {
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const forgotPwdJoi = {
  body: Joi.object({
    email: Joi.string().required(),
  }),
};

export const setPwdJoi = {
  body: Joi.object({
    token: Joi.string().required(),
    otp: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const changePwdJoi = {
  body: Joi.object({
    password: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
};

export const editProfileJoi = {
  body: Joi.object({
    name: Joi.string().min(3).max(20),
    monthlyLimit: Joi.number().positive().allow(0),
    hiddenGroups: Joi.array().items(Joi.string()),
    type: Joi.string().valid("hide", "unhide"),
  }),
};
