const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError("Access token is required.", 401);
        }

        if (!authHeader.startsWith("Bearer ")) {
            throw new AppError("Invalid authorization format.", 401);
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyToken(token);

        req.user = decoded;

        next();

    } catch (err) {

        next(err);

    }

};

module.exports = authMiddleware;