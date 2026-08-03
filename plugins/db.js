const { Pool } = require("pg");
const {database} = require("../config/environment");

const pool = new Pool({
     host: database.DB_HOST,
    port: database.DB_PORT,
    database: database.DB_NAME,
    user: database.DB_USER,
    password: database.DB_PWD,
    ssl: {
        rejectUnauthorized: false,
    },

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Test Connection
pool.on("connect", () => {
    console.log("✅ PostgreSQL Connected");
});

pool.on("error", (err) => {
    console.error("❌ PostgreSQL Error:", err.message);
});

module.exports = pool;