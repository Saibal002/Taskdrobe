const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const userModel = require("../models/userModel");

const authMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        const token =
            req.cookies.token ||
            (
                authHeader &&
                authHeader.startsWith("Bearer ")
                    ? authHeader.split(" ")[1]
                    : null
            );

        if (!token) {
            throw new AppError("Access token is required.", 401);
        }

        const decoded = verifyToken(token);

        const user = await userModel.findUserById(decoded.userId);

        if (!user) {
            throw new AppError("User not found.", 401);
        }

        req.user = user;

        next();

    } catch (err) {

        next(err);

    }

};

module.exports = authMiddleware;