const AppError = require("../utils/AppError");

module.exports = (schema) => {
    return (req, res, next) => {

        // Determine whether this schema validates the full request
        // structure (body/params/query) or just req.body.
        const schemaKeys =
            schema.describe().keys || {};

        const usesRequestStructure =
            schemaKeys.body ||
            schemaKeys.params ||
            schemaKeys.query;

        const dataToValidate = usesRequestStructure
            ? {
                body: req.body,
                params: req.params,
                query: req.query
            }
            : req.body;

        const { error, value } = schema.validate(
            dataToValidate,
            {
                abortEarly: false,
                stripUnknown: true,
                allowUnknown: true
            }
        );

        if (error) {
            return next(
                new AppError(
                    error.details[0].message,
                    400
                )
            );
        }

        // Full request validation
        if (usesRequestStructure) {

            if (value.body) {
                req.body = value.body;
            }

            if (value.params) {
                req.params = value.params;
            }

            if (value.query) {
                req.query = value.query;
            }

        } else {

            // Body-only validation
            req.body = value;

        }

        next();
    };
};