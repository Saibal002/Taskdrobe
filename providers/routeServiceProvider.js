const express = require("express");

const routeConfig = require("./routeConfig");
const authMiddleware = require("../middleware/authMiddleware");
const { mutationLimiter } = require("../middleware/rateLimiter");

class RouteServiceProvider {
    constructor(app) {
        this.app = app;
    }

    register() {
        this.registerPublicRoutes();
        this.registerProtectedRoutes();
        this.registerApiRoutes();
        this.registerRoleRoutes();
    }

    registerPublicRoutes() {
        this.mount(routeConfig.public);
    }

    registerProtectedRoutes() {
        const protectedRouter = express.Router();

        // 1. Authenticate once for the entire protected group
        protectedRouter.use(authMiddleware);

        // 2. Apply write/mutation rate limiter now that req.user is populated
        protectedRouter.use(mutationLimiter);

        routeConfig.protected.forEach(({ path, router, middleware = [] }) => {
            protectedRouter.use(path, ...middleware, router);
        });

        this.app.use("/", protectedRouter);
    }

    registerApiRoutes() {
        this.mount(
            routeConfig.api.map(({ path, router, middleware = [] }) => ({
                path: `/api${path}`,
                middleware: [mutationLimiter, ...middleware],
                router,
            }))
        );
    }

    registerRoleRoutes() {
        this.mountWithMiddleware(
            routeConfig.roles.map((route) => ({
                ...route,
                middleware: [...(route.middleware || []), mutationLimiter],
            }))
        );
    }

    mount(routes) {
        routes.forEach(({ path, router, middleware = [] }) => {
            console.log("📌 MOUNTING:", path);
            this.app.use(path, ...middleware, router);
        });
    }

    mountWithMiddleware(routes) {
        routes.forEach(({ path, router, middleware = [] }) => {
            console.log("📌 MOUNTING ROLE:", path);
            this.app.use(path, ...middleware, router);
        });
    }
}

module.exports = RouteServiceProvider;