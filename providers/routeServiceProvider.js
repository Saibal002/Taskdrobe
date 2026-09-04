const express = require("express");

const routeConfig = require("./routeConfig");
const authMiddleware = require("../middleware/authMiddleware");

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

        // Authenticate once for the entire protected group
        protectedRouter.use(authMiddleware);

        routeConfig.protected.forEach(({ path, router }) => {
            protectedRouter.use(path, router);
        });

        this.app.use("/", protectedRouter);
    }

    registerApiRoutes() {
        this.mount(
            routeConfig.api.map(({ path, router }) => ({
                path: `/api${path}`,
                router,
            }))
        );
    }

    registerRoleRoutes() {
        this.mountWithMiddleware(routeConfig.roles);
    }

    mount(routes) {
        routes.forEach(({ path, router }) => {
            console.log("📌 MOUNTING:", path);
            this.app.use(path, router);
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