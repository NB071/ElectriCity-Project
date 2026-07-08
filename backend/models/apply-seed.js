import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import env from "../configs/env.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
const seedsDir = path.join(dir, "seeds");

const {
    DB_LOCAL_DBNAME: db,
    DB_LOCAL_USER: user,
    DB_LOCAL_PASSWORD: pass,
} = env.db;

const creds = [`-u${user}`, `-p${pass}`, db];

function mysql(sql) {
    const result = spawnSync(
        "docker",
        ["exec", "-i", "electricity-mysql", "mysql", ...creds],
        { input: sql, stdio: ["pipe", "inherit", "inherit"] },
    );

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

function mysqlRows(sql) {
    const result = spawnSync(
        "docker",
        ["exec", "-i", "electricity-mysql", "mysql", "-N", "-s", ...creds],
        { input: sql, encoding: "utf8" },
    );

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }

    return result.stdout.trim().split("\n").filter(Boolean);
}

// 1. Truncate all tables (schema stays)
const tables = mysqlRows(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()",
);

let wipe = "SET FOREIGN_KEY_CHECKS = 0;\n";
for (const table of tables) {
    wipe += `TRUNCATE TABLE \`${table}\`;\n`;
}
wipe += "SET FOREIGN_KEY_CHECKS = 1;";
mysql(wipe);

// 2. Run seeds in order: 01-..., 02-..., etc.
const files = readdirSync(seedsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

for (const file of files) {
    mysql(readFileSync(path.join(seedsDir, file), "utf8"));
}
