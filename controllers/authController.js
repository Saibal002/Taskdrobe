const authService = require("../services/authService");
const home = (req, res) => {
  res.render("landing"); // views/home.ejs
};

const viewLogin = (req, res) => {
  console.log("Locals:", res.locals);
  res.render("login", {
    title: "Login",
  });
};

const viewSignup = (req, res) => {
  res.render("signup", {
    title: "Signup",
  });
};

/**
 * User Registration
 */
const signup = async (req, res, next) => {
  console.log("1. Controller");
  try {
    const user = await authService.registerUser(req.body);
    console.log("7. Back to controller");
    req.session.success = "Account created successfully.";

    return res.redirect("/login");
  } catch (err) {
    if ([400, 409].includes(err.statusCode)) {
      req.session.error = err.message;

      return res.redirect("/signup");
    }

    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    const rememberMe = req.body.rememberMe === "on";

    res.cookie("token", result.token, {
      httpOnly: true,

      sameSite: "lax",

      secure: false,

      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    req.session.success = "Welcome back!";

    return res.redirect("/dashboard");
  } catch (err) {
    if ([400, 401, 403].includes(err.statusCode)) {
      req.session.error = err.message;

      return res.redirect("/login");
    }

    next(err);
  }
};

/**
 * Logout User
 */
const logout = async (req, res, next) => {
  try {
    // Destroy Session
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      // Clear JWT Cookie
      res.clearCookie("token");

      return res.redirect("/");
    });
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
  logout,
};
