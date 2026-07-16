import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import {
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    DatabaseError,
    ValidationError,
} from "../../../utils/errors.js";
import { JWT } from "../../../services/iam/_access/constants.js";
import env from "../../../configs/env.js";

const mockFindSessionById = jest.fn();
const mockFindActiveSessionsByUserId = jest.fn();
const mockFindById = jest.fn();

await jest.unstable_mockModule(
    "../../../services/iam/_access/accessDAO.js",
    () => ({
        default: {
            findSessionById: mockFindSessionById,
            findActiveSessionsByUserId: mockFindActiveSessionsByUserId,
        },
    }),
);

await jest.unstable_mockModule(
    "../../../services/iam/_identity/accountDAO.js",
    () => ({
        default: {
            findById: mockFindById,
        },
    }),
);

const {
    authenticateAccessToken,
    authorizeUser,
    listUserSessions,
} = await import("../../../services/iam/_access/accessQuery.js");

const sid = "00000000-0000-4000-8000-000000000001";
const jti = "access-jti-1";

function signAccess({
    userId = 1,
    role = "customer",
    accessJti = jti,
    sessionId = sid,
    expiresIn = "15m",
} = {}) {
    return jwt.sign(
        { user_id: userId, role, sid: sessionId },
        env.jwt.JWT_SIGN_KEY,
        {
            algorithm: JWT.ALGORITHM,
            issuer: JWT.ISSUER,
            expiresIn,
            jwtid: accessJti,
        },
    );
}

describe("accessQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("authenticateAccessToken rejects bad header", async () => {
        await expect(authenticateAccessToken(undefined)).rejects.toBeInstanceOf(
            UnauthorizedError,
        );
        await expect(authenticateAccessToken("Token abc")).rejects.toBeInstanceOf(
            UnauthorizedError,
        );
    });

    test("authenticateAccessToken rejects invalid jwt", async () => {
        await expect(
            authenticateAccessToken("Bearer not.a.jwt"),
        ).rejects.toMatchObject({ message: "Invalid or expired access token" });
    });

    test("authenticateAccessToken rejects malformed claims", async () => {
        const token = jwt.sign({ user_id: 1 }, env.jwt.JWT_SIGN_KEY, {
            algorithm: JWT.ALGORITHM,
            issuer: JWT.ISSUER,
            expiresIn: "15m",
            jwtid: "only-jti",
        });
        await expect(
            authenticateAccessToken(`Bearer ${token}`),
        ).rejects.toMatchObject({ message: "Malformed access token" });
    });

    test("authenticateAccessToken rejects revoked/mismatched/stale sessions", async () => {
        const token = signAccess();

        mockFindSessionById.mockResolvedValueOnce(null);
        await expect(
            authenticateAccessToken(`Bearer ${token}`),
        ).rejects.toMatchObject({ message: "Session has been revoked" });

        mockFindSessionById.mockResolvedValueOnce({
            session_id: sid,
            user_id: 1,
            revoked_at: "2025-01-01",
            current_access_jti: jti,
        });
        await expect(
            authenticateAccessToken(`Bearer ${token}`),
        ).rejects.toMatchObject({ message: "Session has been revoked" });

        mockFindSessionById.mockResolvedValueOnce({
            session_id: sid,
            user_id: 99,
            revoked_at: null,
            current_access_jti: jti,
        });
        await expect(
            authenticateAccessToken(`Bearer ${token}`),
        ).rejects.toMatchObject({ message: "Malformed access token" });

        mockFindSessionById.mockResolvedValueOnce({
            session_id: sid,
            user_id: 1,
            revoked_at: null,
            current_access_jti: "other-jti",
        });
        await expect(
            authenticateAccessToken(`Bearer ${token}`),
        ).rejects.toMatchObject({
            message: "Access token is no longer valid",
        });
    });

    test("authenticateAccessToken maps deleted user and rethrows other DAO errors", async () => {
        const token = signAccess();
        mockFindSessionById.mockResolvedValue({
            session_id: sid,
            user_id: 1,
            revoked_at: null,
            current_access_jti: jti,
        });

        mockFindById.mockRejectedValueOnce(new NotFoundError("User"));
        await expect(
            authenticateAccessToken(`Bearer ${token}`),
        ).rejects.toMatchObject({
            message: "User account no longer exists",
        });

        mockFindById.mockRejectedValueOnce(new DatabaseError("db down"));
        await expect(
            authenticateAccessToken(`Bearer ${token}`),
        ).rejects.toBeInstanceOf(DatabaseError);
    });

    test("authenticateAccessToken success returns authenticated user", async () => {
        const token = signAccess();
        mockFindSessionById.mockResolvedValue({
            session_id: sid,
            user_id: 1,
            revoked_at: null,
            current_access_jti: jti,
        });
        mockFindById.mockResolvedValue({
            user_id: 1,
            role: "customer",
            email: "a@test.com",
            first_name: "A",
            last_name: "B",
        });

        const user = await authenticateAccessToken(`Bearer ${token}`);
        expect(user.user_id).toBe(1);
        expect(user.sid).toBe(sid);
        expect(user.jti).toBe(jti);
    });

    test("authorizeUser allows matching role and forbids others", () => {
        expect(() =>
            authorizeUser({ role: "admin" }, "admin", "customer"),
        ).not.toThrow();

        expect(() => authorizeUser({ role: "customer" }, "admin")).toThrow(
            ForbiddenError,
        );
    });

    test("authorizeUser validates context", () => {
        expect(() => authorizeUser(null, "admin")).toThrow(ValidationError);
    });

    test("listUserSessions returns DTO", async () => {
        mockFindActiveSessionsByUserId.mockResolvedValue([
            {
                session_id: sid,
                device_label: "Chrome on Windows",
                ip_address: "127.0.0.1",
                user_agent: "ua",
                last_seen_at: "2025-01-01",
                created_at: "2025-01-01",
            },
        ]);

        const result = await listUserSessions({
            userId: 1,
            currentSessionId: sid,
        });
        expect(result.sessions).toHaveLength(1);
    });
});
