const fs = require("fs");
const path = require("path");
const pool = require("../plugins/db");

async function runSQLFile(filePath) {
    try {
        const sql = fs.readFileSync(filePath, "utf8");
        await pool.query(sql);
        console.log(`✅ Executed: ${path.basename(filePath)}`);
    } catch (err) {
        console.error(`❌ Failed: ${path.basename(filePath)}`);
        console.error(err);
        throw err;
    }
}

async function setupDatabase() {

    // ======================
    // Auth Module
    // ======================

    const authFolder = path.join(
        __dirname,
        "modules",
        "auth"
    );

    const authFiles = fs
        .readdirSync(authFolder)
        .sort();

    for (const file of authFiles) {
        await runSQLFile(
            path.join(authFolder, file)
        );
    }


    // ======================
    // Projects Module
    // ======================

    const projectFolder = path.join(
        __dirname,
        "modules",
        "projects"
    );

    const projectFiles = fs
        .readdirSync(projectFolder)
        .sort();

    // Run projects first, except files that depend on tasks
    for (const file of projectFiles) {

        if (
            file === "04_attachments.sql" ||
            file === "05_comments.sql"
        ) {
            continue;
        }

        await runSQLFile(
            path.join(projectFolder, file)
        );
    }


    // ======================
    // Tasks Module
    // ======================

    const taskFolder = path.join(
        __dirname,
        "modules",
        "tasks"
    );

    const taskFiles = fs
        .readdirSync(taskFolder)
        .sort();

    for (const file of taskFiles) {
        await runSQLFile(
            path.join(taskFolder, file)
        );
    }


    // ======================
    // Remaining Projects Files
    // ======================

    for (const file of [
        "04_attachments.sql",
        "05_comments.sql"
    ]) {
        await runSQLFile(
            path.join(projectFolder, file)
        );
    }


    // ======================
    // Teams Module
    // ======================

    const teamFolder = path.join(
        __dirname,
        "modules",
        "teams"
    );

    const teamFiles = fs
        .readdirSync(teamFolder)
        .sort();

    for (const file of teamFiles) {
        await runSQLFile(
            path.join(teamFolder, file)
        );
    }


    // ======================
    // Activity Module
    // ======================

    const activityFolder = path.join(
        __dirname,
        "modules",
        "activities"
    );

    const activityFiles = fs
        .readdirSync(activityFolder)
        .sort();

    for (const file of activityFiles) {
        await runSQLFile(
            path.join(activityFolder, file)
        );
    }

    console.log("\n🎉 Database setup completed.");

    process.exit(0);
}

setupDatabase().catch((err) => {
    console.error(err.message);
    process.exit(1);
});