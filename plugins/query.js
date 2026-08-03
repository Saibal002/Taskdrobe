const pool = require("./db");

const query = async (text, params = []) => {
    return await pool.query(text, params);
};

module.exports = query;