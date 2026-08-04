const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {

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

req.user = decoded;

next();

    } catch (err) {

        next(err);

    }

};

module.exports = authMiddleware;