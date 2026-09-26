const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const compression = require("compression");
const CronService = require("./services/cronService");
const cacheService = require("./services/cacheService");
const cookieParser = require("cookie-parser");
const path = require("path");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("./config/passport");

const { app: appConfig } = require("./config/environment");
const pool = require("./plugins/db");
const errorHandler = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimiter");
const commentModel = require("./models/commentModel");

// Router Service Provider
const RouteServiceProvider = require("./providers/routeServiceProvider");

const { initializeChatSocket } = require("./controllers/chatSocketController");
const {
  initializeNotificationSocket,
} = require("./controllers/notificationSocketController");

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Initialize Socket.IO

// Initialize CronService with Socket.IO
CronService.init(io);

// Trust 1st hop reverse proxy (Render, Nginx, etc.) for accurate IP rate limiting
app.set("trust proxy", 1);

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
// Gzip/Deflate compression for faster HTML & JSON responses
app.use(compression());

// Payload size limits to prevent memory exhaustion attacks
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Session Middleware (with automatic expired session cleanup)
const sessionMiddleware = session({
  store: new pgSession({
    pool: pool,
    tableName: "user_sessions",
    pruneSessionInterval: 60 * 15, // Clean expired sessions in Postgres every 15 mins
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
app.use(passport.initialize());

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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Cache static assets (CSS, JS, images) in the browser for 1 day
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d",
    etag: true,
  })
);

// ======================
// Rate Limiting (Applied after static files)
// ======================
app.use(globalLimiter);

const routeServiceProvider = new RouteServiceProvider(app);
routeServiceProvider.register();

app.use(errorHandler);

// ======================
// Socket.IO Logic
// ======================
app.set("io", io);

initializeChatSocket(io);

const notificationIO = initializeNotificationSocket(io);
app.set("notificationIO", notificationIO);

// ======================
// Start Server
// ======================
server.listen(appConfig.PORT, () => {
  console.log(
    `🚀 ${appConfig.APP_NAME} running on http://localhost:${appConfig.PORT}`,
  );
});

// ======================
// Graceful Shutdown (Cleanly close Socket.IO, HTTP, Redis & PostgreSQL)
// ======================
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 Received ${signal}. Closing server, Redis, and PostgreSQL pool...`);

  // Safety fallback: force exit after 2 seconds if anything hangs
  setTimeout(() => {
    process.exit(0);
  }, 2000).unref();

  try {
    // 1. Disconnect all active Socket.IO clients
    io.close();

    // 2. Drop open HTTP keep-alive connections immediately
    if (typeof server.closeAllConnections === "function") {
      server.closeAllConnections();
    }

    // 3. Close Redis connection and PostgreSQL pool
    await cacheService.close();
    await pool.end();

    console.log("✅ Server, Redis, and PostgreSQL pool closed cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err.message);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

module.exports = app;