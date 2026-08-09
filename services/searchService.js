const projectModel = require("../models/projectModel");
const taskModel = require("../models/taskModel");

/**
 * Global Search
 */
const search = async (searchTerm) => {

    const term = searchTerm?.trim();

    // Don't query the database for an empty search
    if (!term) {

        return {
            projects: [],
            tasks: [],
        };

    }

    const [projects, tasks] = await Promise.all([

        projectModel.searchProjects(term),

        taskModel.searchTasks(term),

    ]);

    return {

        projects,

        tasks,

    };

};

module.exports = {
    search,
};