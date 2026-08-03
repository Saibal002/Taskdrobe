const Joi = require("joi");

const signupSchema = Joi.object({

    fullName: Joi.string()
        .min(3)
        .max(100)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(8)
        .max(30)
        .required(),

    phone: Joi.string()
        .allow("", null),

});

const loginSchema = Joi.object({

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .required(),

});

module.exports = {
    signupSchema,
    loginSchema,
};