import { jest } from "@jest/globals";

/**
 * Builds a mock mysql2 pool for DAO unit tests.
 */
function createMockPool() {
    const connExecute = jest.fn();
    const conn = {
        execute: connExecute,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
        release: jest.fn(),
    };

    const execute = jest.fn();
    const getConnection = jest.fn().mockResolvedValue(conn);
    const pool = { execute, getConnection };
    const getPool = jest.fn().mockResolvedValue(pool);

    return { pool, execute, getConnection, conn, connExecute, getPool };
}

/**
 * This function is used to mock the db module for unit tests.
 * @param {jest.Mock} getPool
 */
async function mockDbModule(getPool) {
    await jest.unstable_mockModule("../../../configs/db.js", () => ({
        default: getPool,
    }));
}

export { createMockPool, mockDbModule };
