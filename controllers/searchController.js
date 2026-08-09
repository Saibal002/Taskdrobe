const searchService = require("../services/searchService");

/**
 * Global Search
 */
const search = async (req, res, next) => {

    try {

        const searchTerm = req.query.q;

        const results =
            await searchService.search(searchTerm);

        res.json({

            success: true,

            ...results,

        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    search,
};