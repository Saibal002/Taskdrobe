
const home = (req, res) => {
    res.render('landing'); // views/home.ejs
};

const viewLogin = (req, res) => {
    res.render('login',{ title: "Login", error: null, success: null }); // views/login.ejs
};

const viewSignup = (req, res) => {
    res.render('signup',{ title: "Login", error: null, success: null }); // views/signup.ejs
};

module.exports = {
    home,
    viewLogin,
    viewSignup
};