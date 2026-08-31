const express = require('express');
const http = require('http'); // Add this
const { Server } = require('socket.io'); // Add this
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const { app: appConfig } = require('./config/environment');
const pool = require('./plugins/db');
const errorHandler = require("./middleware/errorHandler");

const commentModel = require("./models/commentModel"); // Add comment model

const homeRoute = require('./routes/homeRoute');
const authRoute = require("./routes/authRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const adminRoute = require("./routes/adminRoutes");
const managerRoute = require("./routes/managerRoutes");
const projectRoute = require("./routes/projectRoute");
const projectMemberRoutes = require("./routes/projectMemberRoutes");
const taskRoute = require("./routes/taskRoute");
const searchRoute = require("./routes/searchRoute");
const profileRoute = require("./routes/profileRoute");
const chatRoutes = require("./routes/chatRoute");
const { initializeChatSocket } = require("./controllers/chatSocketController");

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Initialize Socket.IO

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

// Session Middleware
const sessionMiddleware = session({
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
});

app.use(sessionMiddleware);

app.use((req, res, next) => {
    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;
    req.session.success = null;
    req.session.error = null;
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
app.use('/', homeRoute);
app.use('/auth', authRoute);
app.use('/', dashboardRoute);
app.use('/admin', adminRoute);
app.use('/manager', managerRoute);
app.use('/projects', projectRoute);
app.use("/", projectMemberRoutes);
app.use('/tasks', taskRoute);
app.use("/search", searchRoute);
app.use('/', profileRoute);
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

// ======================
// Socket.IO Logic
// ======================

initializeChatSocket(io);
// ======================
// Start Server
// ======================
server.listen(appConfig.PORT, () => {
    console.log(
        `🚀 ${appConfig.APP_NAME} running on http://localhost:${appConfig.PORT}`
    );
});

module.exports = app;