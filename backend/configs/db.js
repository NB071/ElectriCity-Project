/* Resources used:
 * https://github.com/sidorares/node-mysql2
 * https://sidorares.github.io/node-mysql2/docs#using-connection-pools
 */

/*
    This file configures the MySQL connection pool.
*/

import mysql from "mysql2/promise";
import env from "./env.js";

/**
 * This object contains the MySQL database configuration.
 * @type {object}
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} user
 * @property {string} password
 */
export const dbConfig = {
    host: env.db.DB_HOST,
    port: Number(process.env.DB_PORT ?? process.env.MYSQL_PORT ?? 3306),
    database: env.db.DB_LOCAL_DBNAME,
    user: env.db.DB_LOCAL_USER,
    password: env.db.DB_LOCAL_PASSWORD,
};

/**
 * This variable caches the MySQL connection pool instance.
 * @type {import('mysql2/promise').Pool|null}
 */
let pool = null;

/**
 * This function returns the database connection pool.
 * @returns {Promise<import('mysql2/promise').Pool>}
 * @throws {Error} If the database connection fails.
 */
async function getPool() {
    if (pool) {
        return pool;
    }

    try {
        pool = mysql.createPool({
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            user: dbConfig.user,
            password: dbConfig.password,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        console.log("[DB] MySQL pool ready");

        return pool;
    } catch (error) {
        console.error("[DB] Error connecting to MySQL:", error);
        throw error;
    }
}

export default getPool;
