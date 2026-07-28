import { jest } from "@jest/globals";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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
const mockFindRefreshTokenByJti = jest.fn();
const mockRotateSessionTokens = jest.fn();
const mockEndSession = jest.fn();
const mockEndAllSessionsByUserId = jest.fn();
const mockCreateSessionWithRefreshToken = jest.fn();
const mockFindByEmail = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();

await jest.unstable_mockModule(
    "../../../services/iam/_access/accessDAO.js",
    () => ({
        default: {
            findSessionById: mockFindSessionById,
            findRefreshTokenByJti: mockFindRefreshTokenByJti,
            rotateSessionTokens: mockRotateSessionTokens,
            endSession: mockEndSession,
            endAllSessionsByUserId: mockEndAllSessionsByUserId,
            createSessionWithRefreshToken: mockCreateSessionWithRefreshToken,
        },
    }),
);

await jest.unstable_mockModule(
    "../../../services/iam/_identity/accountDAO.js",
    () => ({
        default: {
            findByEmail: mockFindByEmail,
            findById: mockFindById,
            create: mockCreate,
        },
    }),
);

const { login, logout, logoutAllDevices, revokeSession, refreshTokens } =
    await import("../../../services/iam/_access/accessMutation.js");

function hashToken(raw) {
    return crypto.createHash("sha256").update(raw).digest("hex");
}

function signRefresh({
    userId = 1,
    jti = "refresh-jti",
    sid = "00000000-0000-4000-8000-000000000001",
    expiresIn = "1h",
} = {}) {
    return jwt.sign({ user_id: userId, sid }, env.jwt.JWT_SIGN_KEY, {
        algorithm: JWT.ALGORITHM,
        issuer: JWT.ISSUER,
        expiresIn,
        jwtid: jti,
    });
}

describe("accessMutation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateSessionWithRefreshToken.mockResolvedValue(undefined);
        mockEndSession.mockResolvedValue(undefined);
        mockEndAllSessionsByUserId.mockResolvedValue(undefined);
        mockRotateSessionTokens.mockResolvedValue(undefined);
    });

    test("login rejects unknown email and bad password", async () => {
        mockFindByEmail.mockResolvedValueOnce(null);
        await expect(
            login({ email: "nobody@test.com", password: "Password1!" }),
        ).rejects.toBeInstanceOf(UnauthorizedError);

        const passwordHash = await bcrypt.hash("Password1!", 4);
        mockFindByEmail.mockResolvedValueOnce({
            user_id: 1,
            role: "customer",
            password_hash: passwordHash,
            first_name: "A",
            last_name: "B",
            email: "a@test.com",
        });
        await expect(
            login({ email: "a@test.com", password: "WrongPass1!" }),
        ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test("logout rejects missing or foreign session", async () => {
        mockFindSessionById.mockResolvedValueOnce(null);
        await expect(
            logout({
                userId: 1,
                sid: "00000000-0000-4000-8000-000000000001",
            }),
        ).rejects.toBeInstanceOf(UnauthorizedError);

        mockFindSessionById.mockResolvedValueOnce({
            session_id: "00000000-0000-4000-8000-000000000001",
            user_id: 99,
        });
        await expect(
            logout({
                userId: 1,
                sid: "00000000-0000-4000-8000-000000000001",
            }),
        ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test("logout and logoutAllDevices succeed", async () => {
        mockFindSessionById.mockResolvedValue({
            session_id: "00000000-0000-4000-8000-000000000001",
            user_id: 1,
        });

        await logout({
            userId: 1,
            sid: "00000000-0000-4000-8000-000000000001",
        });
        expect(mockEndSession).toHaveBeenCalled();

        await logoutAllDevices({ userId: 1 });
        expect(mockEndAllSessionsByUserId).toHaveBeenCalledWith(1);
    });

    test("revokeSession rejects current session, missing, foreign, and already revoked", async () => {
        const currentSid = "00000000-0000-4000-8000-000000000001";
        const otherSid = "00000000-0000-4000-8000-000000000002";

        await expect(
            revokeSession({
                userId: 1,
                currentSid,
                sessionId: currentSid,
            }),
        ).rejects.toBeInstanceOf(ValidationError);

        mockFindSessionById.mockResolvedValueOnce(null);
        await expect(
            revokeSession({
                userId: 1,
                currentSid,
                sessionId: otherSid,
            }),
        ).rejects.toBeInstanceOf(UnauthorizedError);

        mockFindSessionById.mockResolvedValueOnce({
            session_id: otherSid,
            user_id: 99,
            revoked_at: null,
        });
        await expect(
            revokeSession({
                userId: 1,
                currentSid,
                sessionId: otherSid,
            }),
        ).rejects.toBeInstanceOf(UnauthorizedError);

        mockFindSessionById.mockResolvedValueOnce({
            session_id: otherSid,
            user_id: 1,
            revoked_at: new Date().toISOString(),
        });
        await expect(
            revokeSession({
                userId: 1,
                currentSid,
                sessionId: otherSid,
            }),
        ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test("revokeSession ends another owned active session", async () => {
        const currentSid = "00000000-0000-4000-8000-000000000001";
        const otherSid = "00000000-0000-4000-8000-000000000002";

        mockFindSessionById.mockResolvedValue({
            session_id: otherSid,
            user_id: 1,
            revoked_at: null,
        });

        await revokeSession({
            userId: 1,
            currentSid,
            sessionId: otherSid,
        });
        expect(mockEndSession).toHaveBeenCalledWith(otherSid);
    });

    test("refreshTokens rejects invalid jwt", async () => {
        await expect(refreshTokens("not.a.jwt")).rejects.toBeInstanceOf(
            UnauthorizedError,
        );
    });

    test("refreshTokens rejects malformed claims", async () => {
        const token = jwt.sign({ user_id: 1 }, env.jwt.JWT_SIGN_KEY, {
            algorithm: JWT.ALGORITHM,
            issuer: JWT.ISSUER,
            expiresIn: "1h",
            jwtid: "jti-only",
        });
        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Malformed refresh token",
        });
    });

    test("refreshTokens rejects missing/replaced/expired/mismatched token rows", async () => {
        const sid = "00000000-0000-4000-8000-000000000001";
        const jti = "refresh-jti-1";
        const token = signRefresh({ userId: 1, jti, sid });

        mockFindRefreshTokenByJti.mockResolvedValueOnce(null);
        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Refresh token is no longer valid",
        });

        mockFindRefreshTokenByJti.mockResolvedValueOnce({
            replaced_by: 9,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            token_hash: hashToken(token),
            session_id: sid,
        });
        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Refresh token is no longer valid",
        });

        mockFindRefreshTokenByJti.mockResolvedValueOnce({
            replaced_by: null,
            expires_at: new Date(Date.now() - 60_000).toISOString(),
            token_hash: hashToken(token),
            session_id: sid,
        });
        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Refresh token has expired",
        });

        mockFindRefreshTokenByJti.mockResolvedValueOnce({
            replaced_by: null,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            token_hash: "deadbeef",
            session_id: sid,
        });
        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Refresh token mismatch",
        });

        mockFindRefreshTokenByJti.mockResolvedValueOnce({
            replaced_by: null,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            token_hash: hashToken(token),
            session_id: "00000000-0000-4000-8000-000000000099",
        });
        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Malformed refresh token",
        });
    });

    test("refreshTokens rejects revoked or mismatched sessions", async () => {
        const sid = "00000000-0000-4000-8000-000000000001";
        const jti = "refresh-jti-2";
        const token = signRefresh({ userId: 1, jti, sid });
        const stored = {
            replaced_by: null,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            token_hash: hashToken(token),
            session_id: sid,
        };

        mockFindRefreshTokenByJti.mockResolvedValue(stored);
        mockFindSessionById.mockResolvedValueOnce(null);
        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Session has been revoked",
        });

        mockFindSessionById.mockResolvedValueOnce({
            session_id: sid,
            user_id: 1,
            revoked_at: "2025-01-01",
        });
        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Session has been revoked",
        });

        mockFindSessionById.mockResolvedValueOnce({
            session_id: sid,
            user_id: 99,
            revoked_at: null,
        });
        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Malformed refresh token",
        });
    });

    test("refreshTokens maps deleted user to ForbiddenError", async () => {
        const sid = "00000000-0000-4000-8000-000000000001";
        const jti = "refresh-jti-3";
        const token = signRefresh({ userId: 1, jti, sid });

        mockFindRefreshTokenByJti.mockResolvedValue({
            replaced_by: null,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            token_hash: hashToken(token),
            session_id: sid,
        });
        mockFindSessionById.mockResolvedValue({
            session_id: sid,
            user_id: 1,
            revoked_at: null,
        });
        mockFindById.mockRejectedValue(new NotFoundError("User"));

        await expect(refreshTokens(token)).rejects.toBeInstanceOf(
            ForbiddenError,
        );
    });

    test("refreshTokens rethrows non-NotFoundError from findById", async () => {
        const sid = "00000000-0000-4000-8000-000000000001";
        const jti = "refresh-jti-4";
        const token = signRefresh({ userId: 1, jti, sid });

        mockFindRefreshTokenByJti.mockResolvedValue({
            replaced_by: null,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            token_hash: hashToken(token),
            session_id: sid,
        });
        mockFindSessionById.mockResolvedValue({
            session_id: sid,
            user_id: 1,
            revoked_at: null,
        });
        mockFindById.mockRejectedValue(new DatabaseError("db down"));

        await expect(refreshTokens(token)).rejects.toBeInstanceOf(
            DatabaseError,
        );
    });

    test("refreshTokens maps rotate NotFoundError to UnauthorizedError", async () => {
        const sid = "00000000-0000-4000-8000-000000000001";
        const jti = "refresh-jti-5";
        const token = signRefresh({ userId: 1, jti, sid });

        mockFindRefreshTokenByJti.mockResolvedValue({
            replaced_by: null,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            token_hash: hashToken(token),
            session_id: sid,
        });
        mockFindSessionById.mockResolvedValue({
            session_id: sid,
            user_id: 1,
            revoked_at: null,
        });
        mockFindById.mockResolvedValue({
            user_id: 1,
            role: "customer",
            first_name: "A",
            last_name: "B",
            email: "a@test.com",
        });
        mockRotateSessionTokens.mockRejectedValue(
            new NotFoundError("Refresh token"),
        );

        await expect(refreshTokens(token)).rejects.toMatchObject({
            message: "Refresh token is no longer valid",
        });
    });

    test("refreshTokens rethrows unexpected rotate errors", async () => {
        const sid = "00000000-0000-4000-8000-000000000001";
        const jti = "refresh-jti-6";
        const token = signRefresh({ userId: 1, jti, sid });

        mockFindRefreshTokenByJti.mockResolvedValue({
            replaced_by: null,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            token_hash: hashToken(token),
            session_id: sid,
        });
        mockFindSessionById.mockResolvedValue({
            session_id: sid,
            user_id: 1,
            revoked_at: null,
        });
        mockFindById.mockResolvedValue({
            user_id: 1,
            role: "customer",
            first_name: "A",
            last_name: "B",
            email: "a@test.com",
        });
        mockRotateSessionTokens.mockRejectedValue(
            new DatabaseError("rotate failed"),
        );

        await expect(refreshTokens(token)).rejects.toBeInstanceOf(
            DatabaseError,
        );
    });

    test("refreshTokens success path returns new token pair", async () => {
        const sid = "00000000-0000-4000-8000-000000000001";
        const jti = "refresh-jti-ok";
        const token = signRefresh({ userId: 1, jti, sid });

        mockFindRefreshTokenByJti.mockResolvedValue({
            replaced_by: null,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            token_hash: hashToken(token),
            session_id: sid,
        });
        mockFindSessionById.mockResolvedValue({
            session_id: sid,
            user_id: 1,
            revoked_at: null,
        });
        mockFindById.mockResolvedValue({
            user_id: 1,
            role: "customer",
            first_name: "A",
            last_name: "B",
            email: "a@test.com",
        });

        const pair = await refreshTokens(token, {
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/120.0.0.0",
        });

        expect(pair.accessToken).toEqual(expect.any(String));
        expect(pair.refreshToken).toEqual(expect.any(String));
        expect(mockRotateSessionTokens).toHaveBeenCalled();
    });
});
