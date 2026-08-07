const AppError = require("../utils/AppError");

module.exports = (schema) => {

    return (req, res, next) => {

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {

            return next(
                new AppError(
                    error.details[0].message,
                    400
                )
            );

        }

        req.body = value;

        next();

    };

};