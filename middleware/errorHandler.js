const responseFormatter = require("../utils/responseFormatter");

module.exports = (err, req, res, next) => {

    console.log("🔥 ERROR HANDLER");
    console.log(err);

    const statusCode = err.statusCode || 500;

    const message =
        err.message || "Internal Server Error";

    const title =
        err.status === "fail"
            ? "Request Failed"
            : "Something went wrong";

    return responseFormatter.error(res, {
        statusCode,
        title,
        message,
        stack: err.stack
    });

};