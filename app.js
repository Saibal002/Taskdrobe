require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const homeRoute = require('./routes/homeRoute');

// const connectDB = require('./config/db');
// const routeServiceProvider = require('./config/routeServiceProvider');

const app = express();

// ======================
// 1. Connect Database
// ======================
// connectDB();

// ======================
// 2. Middleware
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================
// 3. Static Files & Views
// ======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// 4. Load Routes
// ======================
// routeServiceProvider(app);
app.use('/', homeRoute);



// ======================
// 5. Start Server
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;