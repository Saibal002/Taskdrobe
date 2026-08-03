module.exports = (err, req, res, next) => {
    console.log("🔥 ERROR HANDLER");
    console.log(err);
    res.status(err.statusCode || 500).json({

        success: false,

        status: err.status || "error",

        message: err.message || "Internal Server Error",

        errors: err.errors || []

    });

};