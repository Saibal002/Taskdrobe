const AppError = require("../utils/AppError");

module.exports = (schema) => {
    return (req, res, next) => {
        // Group the request properties for Joi to evaluate
        const dataToValidate = {
            body: req.body,
            params: req.params,
            query: req.query
        };

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            allowUnknown: true, // Prevents Joi from crashing if a schema only checks body but params exist
        });

        if (error) {
            return next(new AppError(error.details[0].message, 400));
        }

        // Reassign validated values back to the request object
        if (value.body) req.body = value.body;
        if (value.params) req.params = value.params;
        if (value.query) req.query = value.query;

        next();
    };
};