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
        throw err;
    }
}

async function setupDatabase() {
    const authFolder = path.join(__dirname, "modules", "auth");

    const files = fs.readdirSync(authFolder).sort();

    for (const file of files) {
        await runSQLFile(path.join(authFolder, file));
    }
     // ======================
    // Projects Module
    // ======================

    const projectFolder = path.join(__dirname, "modules", "projects");

    const projectFiles = fs.readdirSync(projectFolder).sort();

    for (const file of projectFiles) {
        await runSQLFile(path.join(projectFolder, file));
    }

    console.log("\n🎉 Database setup completed.");

    process.exit(0);
    
}

setupDatabase().catch((err) => {
    console.error(err.message);
    process.exit(1);
});