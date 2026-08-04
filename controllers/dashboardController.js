const dashboard = async (req, res, next) => {

    try {

        res.render("dashboard", {
            title: "Dashboard",

            user: {
                full_name: "Saibal Chakraborty",
                role_name: "Employee",
                profile_image: null
            },

            today: new Date().toDateString(),

            projects: []
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    dashboard,
};