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
        this.mountGroup(
            routeConfig.protected,
            [authMiddleware]
        );
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
            this.app.use(path, router);
        });
    }

    mountGroup(routes, middleware = []) {
        routes.forEach(({ path, router }) => {
            this.app.use(
                path,
                ...middleware,
                router
            );
        });
    }

    mountWithMiddleware(routes) {
        routes.forEach(
            ({ path, router, middleware = [] }) => {
                this.app.use(
                    path,
                    ...middleware,
                    router
                );
            }
        );
    }
}

module.exports = RouteServiceProvider;