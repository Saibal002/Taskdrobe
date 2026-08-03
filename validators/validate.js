const AppError = require("../utils/AppError");

module.exports = (schema) => {

    return (req, res, next) => {

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {

            const errors = error.details.map((err) => err.message);

            return next(
                new AppError("Validation Failed", 400, errors)
            );

        }

        req.body = value;

        next();

    };

};