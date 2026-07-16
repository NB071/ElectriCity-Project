import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import {
    ConflictError,
    NotFoundError,
    DatabaseError,
} from "../../../utils/errors.js";

const { execute, connExecute, getPool } = createMockPool();
await mockDbModule(getPool);

const accessDAO = (await import("../../../services/iam/_access/accessDAO.js"))
    .default;

const sessionPayload = {
    session: {
        sessionId: "sess-1",
        userId: 7,
        accessJti: "access-jti",
        ipAddress: "127.0.0.1",
        userAgent: "jest",
        deviceLabel: "desktop",
    },
    refreshRecord: {
        jti: "refresh-jti",
        sessionId: "sess-1",
        userId: 7,
        tokenHash: "hash",
        expiresAt: "2099-01-01T00:00:00.000Z",
    },
};

describe("accessDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("findSessionById returns row or null", async () => {
        execute.mockResolvedValueOnce([[{ session_id: "sess-1" }], []]);
        await expect(accessDAO.findSessionById("sess-1")).resolves.toEqual({
            session_id: "sess-1",
        });

        execute.mockResolvedValueOnce([[], []]);
        await expect(accessDAO.findSessionById("missing")).resolves.toBeNull();
    });

    test("findRefreshTokenByJti returns row or null", async () => {
        execute.mockResolvedValueOnce([[{ jti: "abc" }], []]);
        await expect(accessDAO.findRefreshTokenByJti("abc")).resolves.toEqual({
            jti: "abc",
        });

        execute.mockResolvedValueOnce([[], []]);
        await expect(accessDAO.findRefreshTokenByJti("none")).resolves.toBeNull();
    });

    test("createSessionWithRefreshToken maps duplicate to ConflictError", async () => {
        connExecute.mockRejectedValueOnce({
            code: "ER_DUP_ENTRY",
            message: "dup",
        });

        await expect(
            accessDAO.createSessionWithRefreshToken(sessionPayload),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    test("createSessionWithRefreshToken succeeds", async () => {
        connExecute
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        await expect(
            accessDAO.createSessionWithRefreshToken(sessionPayload),
        ).resolves.toBeUndefined();
    });

    test("rotateSessionTokens throws when previous refresh missing", async () => {
        connExecute
            .mockResolvedValueOnce([{ insertId: 99, affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 0 }, []]);

        await expect(
            accessDAO.rotateSessionTokens({
                sessionId: "sess-1",
                accessJti: "new-access",
                previousRefreshJti: "old",
                refreshRecord: sessionPayload.refreshRecord,
            }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test("rotateSessionTokens throws when session revoked", async () => {
        connExecute
            .mockResolvedValueOnce([{ insertId: 99, affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 0 }, []]);

        await expect(
            accessDAO.rotateSessionTokens({
                sessionId: "sess-1",
                accessJti: "new-access",
                previousRefreshJti: "old",
                refreshRecord: sessionPayload.refreshRecord,
            }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test("rotateSessionTokens maps duplicate refresh to ConflictError", async () => {
        connExecute.mockRejectedValueOnce({
            code: "ER_DUP_ENTRY",
            message: "dup",
        });

        await expect(
            accessDAO.rotateSessionTokens({
                sessionId: "sess-1",
                accessJti: "new-access",
                previousRefreshJti: "old",
                refreshRecord: sessionPayload.refreshRecord,
            }),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    test("rotateSessionTokens succeeds", async () => {
        connExecute
            .mockResolvedValueOnce([{ insertId: 100, affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        await expect(
            accessDAO.rotateSessionTokens({
                sessionId: "sess-1",
                accessJti: "new-access",
                previousRefreshJti: "old",
                refreshRecord: sessionPayload.refreshRecord,
                ipAddress: "10.0.0.2",
            }),
        ).resolves.toBeUndefined();
    });

    test("endSession maps duplicate key to ConflictError", async () => {
        connExecute.mockRejectedValueOnce({
            code: "ER_DUP_ENTRY",
            message: "dup",
        });

        await expect(accessDAO.endSession("sess-1")).rejects.toBeInstanceOf(
            ConflictError,
        );
    });

    test("endAllSessionsByUserId wraps unexpected errors as DatabaseError", async () => {
        connExecute.mockRejectedValueOnce(new Error("connection reset"));

        await expect(accessDAO.endAllSessionsByUserId(7)).rejects.toBeInstanceOf(
            DatabaseError,
        );
    });
});
