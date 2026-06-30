import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import env from "../configs/env.js";

const schemaPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "schema.sql",
);

const {
    DB_LOCAL_DBNAME: db,
    DB_LOCAL_USER: user,
    DB_LOCAL_PASSWORD: pass,
} = env.db;

const creds = [`-u${user}`, `-p${pass}`];

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

// Drop all tables, then apply schema
mysql(`DROP DATABASE IF EXISTS \`${db}\`; CREATE DATABASE \`${db}\`;`);
mysql(`USE \`${db}\`;` + readFileSync(schemaPath, "utf8"));
