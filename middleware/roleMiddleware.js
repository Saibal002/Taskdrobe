const AppError = require("../utils/AppError");

/**
 * Require specific role(s)
 *
 * Usage:
 *
 * requireRole("admin")
 *
 * requireRole(["admin", "manager"])
 */
const requireRole = (roles) => {

    const allowedRoles =
        Array.isArray(roles)
            ? roles
            : [roles];

    return (req, res, next) => {

        try {

            if (!req.user) {

                throw new AppError(
                    "Authentication required.",
                    401
                );

            }

            const userRole = req.user.role_name;

            if (!allowedRoles.includes(userRole)) {

                throw new AppError(
                    "You do not have permission to access this resource.",
                    403
                );

            }

            next();

        } catch (err) {

            next(err);

        }

    };

};

module.exports = requireRole;