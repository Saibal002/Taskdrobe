const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const { app: appConfig } = require('./config/environment');
const pool = require('./plugins/db');
const errorHandler = require("./middleware/errorHandler");

const homeRoute = require('./routes/homeRoute');
const authRoute = require("./routes/authRoute");

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