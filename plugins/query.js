const pool = require("./db");

const query = async (text, params = []) => {

    console.log("Executing SQL...");
    console.log(text);
    console.log(params);

    const result = await pool.query(text, params);

    console.log("SQL Finished");

    return result;
};

module.exports = query;