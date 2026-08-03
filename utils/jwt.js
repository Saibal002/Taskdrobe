const jwt = require("jsonwebtoken");
const { jwt: jwtConfig } = require("../config/environment");

const generateToken = (payload) => {
    return jwt.sign(
        payload,
        jwtConfig.JWT_SECRET,
        {
            expiresIn: jwtConfig.JWT_EXPIRY,
        }
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, jwtConfig.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken,
};