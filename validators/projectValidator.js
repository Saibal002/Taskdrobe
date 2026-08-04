const Joi = require("joi");

const createProjectSchema = Joi.object({

    projectName: Joi.string()
        .trim()
        .min(3)
        .max(150)
        .required(),

    description: Joi.string()
        .allow("")
        .optional(),

    status: Joi.string()
        .valid(
            "Not Started",
            "In Progress",
            "Completed",
            "On Hold",
            "Archived"
        )
        .default("Not Started"),

    progress: Joi.number()
        .integer()
        .min(0)
        .max(100)
        .default(0),

    deadline: Joi.date()
        .allow(null, "")

});

module.exports = {
    createProjectSchema,
};