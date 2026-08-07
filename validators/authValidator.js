const Joi = require("joi");

const signupSchema = Joi.object({

    fullName: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "Full name is required.",
            "string.min": "Full name must be at least 3 characters.",
            "string.max": "Full name cannot exceed 100 characters."
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Please enter a valid email address."
        }),

    password: Joi.string()
        .min(8)
        .max(30)
        .required()
        .messages({
            "string.empty": "Password is required.",
            "string.min": "Password must be at least 8 characters.",
            "string.max": "Password cannot exceed 30 characters."
        }),

    phone: Joi.string()
        .allow("", null)

});

const loginSchema = Joi.object({

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Please enter a valid email address."
        }),

    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required."
        })

});

module.exports = {
    signupSchema,
    loginSchema,
};