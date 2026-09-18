const Joi = require("joi");

const createProjectSchema = Joi.object({
    teamId: Joi.number().integer().required(),
    projectName: Joi.string().max(150).required(),
    description: Joi.string().allow('', null),
    deadline: Joi.date().allow('', null),
    status: Joi.string().valid('Not Started', 'In Progress', 'Completed', 'On Hold', 'Archived'),
    progress: Joi.number().min(0).max(100),
    tasks: Joi.alternatives().try(
        Joi.array().items(Joi.string().allow('')),
        Joi.string().allow('')
    )
});

// This is the missing piece causing the crash!
module.exports = {
    createProjectSchema
};