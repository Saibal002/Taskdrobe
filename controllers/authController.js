const authService = require("../services/authService");
const home = (req, res) => {
    res.render('landing'); // views/home.ejs
};

const viewLogin = (req, res) => {
    res.render('login',{ title: "Login", error: null, success: null }); // views/login.ejs
};

const viewSignup = (req, res) => {
    res.render('signup',{ title: "Login", error: null, success: null }); // views/signup.ejs
};

/**
 * User Registration
 */
const signup = async (req, res, next) => {
    console.log("1. Controller");
    try {
        
        const user = await authService.registerUser(req.body);
        console.log("7. Back to controller");
        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: user,
        });

    } catch (err) {

        next(err);

    }

};

/**
 * User Login
 */

// const login = async (req, res, next) => {

//     try {

//         const user = await authService.loginUser(req.body);

//         return res.status(200).json({
//             success: true,
//             message: "User found.",
//             data: user
//         });

//     } catch (err) {

//         next(err);

//     }

// };
const login = async (req, res, next) => {

    try {

        const result = await authService.loginUser(req.body);

        res.cookie("token", result.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        return res.redirect("/dashboard");

    } catch (err) {

        next(err);

    }

};

module.exports = {
    home,
    viewLogin,
    viewSignup,
    signup,
    login,
};