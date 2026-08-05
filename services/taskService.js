const taskModel = require("../models/taskModel");

const createTask = async (taskData) => {

    const task = await taskModel.createTask(taskData);

    return task;

};

module.exports = {
    createTask,
};