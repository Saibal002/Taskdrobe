const rateLimit = require("express-rate-limit");
const AppError = require("../utils/AppError");

/**
 * Identify logged-in users by user_id (so teammates on the same Wi-Fi don't block each other)
 * and fall back to IP address for unauthenticated guests.
 */
const keyGenerator = (req) => {
    if (req.user && req.user.user_id) {
        return `user_${req.user.user_id}`;
    }
    return req.ip || req.connection.remoteAddress || "unknown_ip";
};

/**
 * Bypass rate limits for Admin ("God Mode") accounts and Socket.io polling
 */
const skipIfAdminOrSocket = (req) => {
    if (req.path && req.path.startsWith("/socket.io")) return true;
    if (req.user && req.user.role_name === "admin") return true;
    return false;
};

/**
 * Unified 429 response handler:
 * Returns JSON for jQuery $.ajax / fetch calls, or passes AppError to errorHandler for page loads.
 */
const createLimitHandler = (customMessage) => {
    return (req, res, next) => {
        const isAjax =
            req.xhr ||
            (req.headers.accept && req.headers.accept.includes("application/json")) ||
            (req.headers["content-type"] && req.headers["content-type"].includes("application/json"));

        if (isAjax) {
            return res.status(429).json({
                success: false,
                status: "fail",
                message: customMessage
            });
        }

        return next(new AppError(customMessage, 429));
    };
};

// 1. Global Limiter (All dynamic routes)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator,
    skip: skipIfAdminOrSocket,
    handler: createLimitHandler("Too many requests from your account/IP. Please wait a few minutes and try again.")
});

// 2. Strict Auth Limiter (Login / Register / Password Reset)
// 2. Strict Auth Limiter (Login / Register / Password Reset)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    skipSuccessfulRequests: true, // Only count failed attempts
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    // Only rate-limit form submissions (POST), not GET page loads or logout
    skip: (req) => req.method !== "POST",
    handler: createLimitHandler("Too many login or authentication attempts. Please try again in 15 minutes.")
});

// 3. Write / Mutation Limiter (POST, PUT, PATCH, DELETE actions)
const mutationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 40,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator,
    skip: (req) => {
        if (skipIfAdminOrSocket(req)) return true;
        // Only rate-limit state-changing methods; let GET requests pass through
        return ["GET", "HEAD", "OPTIONS"].includes(req.method);
    },
    handler: createLimitHandler("You are performing actions too quickly. Please slow down and try again in a moment.")
});

// 4. Search & Polling Limiter (Global Search & Notification checks)
const apiSearchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator,
    skip: skipIfAdminOrSocket,
    handler: createLimitHandler("Search rate limit reached. Please pause briefly before searching again.")
});

module.exports = {
    globalLimiter,
    authLimiter,
    mutationLimiter,
    apiSearchLimiter
};