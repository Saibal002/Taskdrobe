const Joi = require("joi");

// =========================
// Create Team
// =========================
const createTeamValidator = Joi.object({
    body: Joi.object({
        teamName: Joi.string().trim().max(100).required().messages({
            "string.empty": "Team name is required.",
            "any.required": "Team name is required.",
            "string.max": "Team name cannot exceed 100 characters."
        }),
        description: Joi.string().trim().max(1000).allow(null, "").optional().messages({
            "string.max": "Description cannot exceed 1000 characters."
        })
    })
});

// =========================
// Update Team
// =========================
const updateTeamValidator = Joi.object({
    params: Joi.object({
        teamId: Joi.number().integer().required().messages({
            "number.base": "Invalid team ID.",
            "any.required": "Invalid team ID."
        })
    }),
    body: Joi.object({
        teamName: Joi.string().trim().max(100).required().messages({
            "string.empty": "Team name is required.",
            "any.required": "Team name is required.",
            "string.max": "Team name cannot exceed 100 characters."
        }),
        description: Joi.string().trim().max(1000).allow(null, "").optional().messages({
            "string.max": "Description cannot exceed 1000 characters."
        })
    })
});

// =========================
// Team ID
// =========================
const teamIdValidator = Joi.object({
    params: Joi.object({
        teamId: Joi.number().integer().required().messages({
            "number.base": "Invalid team ID.",
            "any.required": "Invalid team ID."
        })
    })
});

// =========================
// Add Team Member
// =========================
const addTeamMemberValidator = Joi.object({
    params: Joi.object({
        teamId: Joi.number().integer().required().messages({
            "number.base": "Invalid team ID.",
            "any.required": "Invalid team ID."
        })
    }),
    body: Joi.object({
        userId: Joi.number().integer().required().messages({
            "number.base": "Invalid user ID.",
            "any.required": "Invalid user ID."
        })
    })
});

// =========================
// Remove Team Member
// =========================
const removeTeamMemberValidator = Joi.object({
    params: Joi.object({
        teamId: Joi.number().integer().required().messages({
            "number.base": "Invalid team ID.",
            "any.required": "Invalid team ID."
        }),
        userId: Joi.number().integer().required().messages({
            "number.base": "Invalid user ID.",
            "any.required": "Invalid user ID."
        })
    })
});

module.exports = {
    createTeamValidator,
    updateTeamValidator,
    teamIdValidator,
    addTeamMemberValidator,
    removeTeamMemberValidator
};