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
