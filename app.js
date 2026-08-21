const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const { app: appConfig } = require('./config/environment');
const pool = require('./plugins/db');
const errorHandler = require("./middleware/errorHandler");

const homeRoute = require('./routes/homeRoute');
const authRoute = require("./routes/authRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const adminRoute = require("./routes/adminRoutes");
const managerRoute = require("./routes/managerRoutes");
const projectRoute = require("./routes/projectRoute");
const taskRoute = require("./routes/taskRoute");
const searchRoute = require("./routes/searchRoute");

const app = express();

// ======================
// Test Database Connection
// ======================
(async () => {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("✅ Database Connected");
        console.log("🕒 Server Time:", result.rows[0].now);
    } catch (err) {
        console.error("❌ Database Connection Failed");
        console.error(err.message);
        process.exit(1);
    }
})();

// ======================
// Middleware
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//session middleware 
app.use(
    session({

        store: new pgSession({
            pool: pool,
            tableName: "user_sessions",
        }),

        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {

            secure: false,

            httpOnly: true,

            maxAge: 30 * 24 * 60 * 60 * 1000,

        },

    })
);
app.use((req, res, next) => {

    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;

     req.session.success = null;
     req.session.error = null
    next();

});

// ======================
// Static Files & Views
// ======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// Routes
// ======================
app.use('/', homeRoute); //landing page route
app.use('/auth', authRoute);  //authentication routes
//RBAC routes
app.use('/',dashboardRoute); //Employee
app.use('/admin', adminRoute); //Admin
app.use('/manager', managerRoute); //Manager

app.use('/projects', projectRoute);
app.use('/tasks', taskRoute);
app.use("/search", searchRoute);



app.use(errorHandler);
// ======================
// Start Server
// ======================
app.listen(appConfig.PORT, () => {
    console.log(
        `🚀 ${appConfig.APP_NAME} running on http://localhost:${appConfig.PORT}`
    );
});

module.exports = app;