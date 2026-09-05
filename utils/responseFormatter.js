const responseFormatter = {

    error(res, {
        statusCode = 500,
        title = "Something went wrong",
        message = "Internal Server Error",
        stack = null
    } = {}) {

        return res
            .status(statusCode)
            .render("error", {
                statusCode,
                title,
                message,
                stack
            });
    }

};

module.exports = responseFormatter;