// IAM access auth tests
// script: npm run test:iam:access

import iamService from "../../services/iam/iam.service.js";
import {
    validateAuthorizationContext,
    validateBearerToken,
} from "../../services/iam/_access/accessValidator.js";
import { UnauthorizedError, ValidationError } from "../../utils/errors.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function testAuthorizationValidator() {
    validateAuthorizationContext("customer", "customer", "admin");

    try {
        validateAuthorizationContext("customer");
        throw new Error("Expected empty allowedRoles to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "empty allowedRoles should throw ValidationError",
        );
    }

    try {
        validateAuthorizationContext("customer", "superadmin");
        throw new Error("Expected invalid allowed role to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "invalid allowed role should throw ValidationError",
        );
    }

    console.log("SUCCESS: authorization validator checks passed");
}

function testBearerTokenValidator() {
    const token = validateBearerToken("Bearer eyJhbGciOiJIUzI1NiJ9.test");
    assert(
        token === "eyJhbGciOiJIUzI1NiJ9.test",
        "bearer prefix should be stripped",
    );

    const lowercaseToken = validateBearerToken(
        "bearer eyJhbGciOiJIUzI1NiJ9.lowercase",
    );
    assert(
        lowercaseToken === "eyJhbGciOiJIUzI1NiJ9.lowercase",
        "bearer prefix should be case-insensitive",
    );

    try {
        validateBearerToken("Token abc");
        throw new Error("Expected malformed bearer header to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "malformed bearer header should throw ValidationError",
        );
    }

    console.log("SUCCESS: bearer token validator checks passed");
}

async function testLoginLogoutRefreshFlow() {
    const email = `iam-access-test-${Date.now()}@example.com`;
    const password = "Password1!";

    await iamService.access_management.register({
        firstName: "Test",
        lastName: "User",
        email,
        password,
    });

    const session = await iamService.access_management.login({
        email,
        password,
    });

    assert(session.accessToken, "login should return accessToken");
    assert(session.refreshToken, "login should return refreshToken");
    assert(session.user?.user_id, "login should return user");

    const me = await iamService.access_management.authenticateAccessToken(
        `Bearer ${session.accessToken}`,
    );
    assert(
        me.user_id === session.user.user_id,
        "access token should authenticate",
    );

    assert(me.sid, "authenticated user should carry a session id");

    await iamService.access_management.logout({
        userId: me.user_id,
        sid: me.sid,
    });

    await iamService.access_management.logout({
        userId: me.user_id,
        sid: me.sid,
    });

    try {
        await iamService.access_management.refreshTokens(session.refreshToken);
        throw new Error("Expected refresh to fail after logout");
    } catch (error) {
        assert(
            error instanceof UnauthorizedError,
            "refresh after logout should throw UnauthorizedError",
        );
    }

    console.log(
        "SUCCESS: login, logout (idempotent), and refresh revocation passed",
    );
}

async function testLogoutAllDevices() {
    const email = `iam-logout-all-${Date.now()}@example.com`;
    const password = "Password1!";

    await iamService.access_management.register({
        firstName: "Test",
        lastName: "User",
        email,
        password,
    });

    const deviceA = await iamService.access_management.login({
        email,
        password,
    });
    const deviceB = await iamService.access_management.login({
        email,
        password,
    });

    const meA = await iamService.access_management.authenticateAccessToken(
        `Bearer ${deviceA.accessToken}`,
    );

    await iamService.access_management.logoutAllDevices({
        userId: meA.user_id,
    });

    for (const [label, refreshToken] of [
        ["device A", deviceA.refreshToken],
        ["device B", deviceB.refreshToken],
    ]) {
        try {
            await iamService.access_management.refreshTokens(refreshToken);
            throw new Error(
                `Expected ${label} refresh to fail after logout-all`,
            );
        } catch (error) {
            assert(
                error instanceof UnauthorizedError,
                `${label} refresh after logout-all should throw UnauthorizedError`,
            );
        }
    }

    console.log("SUCCESS: logout-all revokes refresh tokens on every device");
}

async function testListUserSessions() {
    const email = `iam-sessions-list-${Date.now()}@example.com`;
    const password = "Password1!";

    await iamService.access_management.register({
        firstName: "Test",
        lastName: "User",
        email,
        password,
    });

    const deviceA = await iamService.access_management.login({
        email,
        password,
        ipAddress: "203.0.113.10",
        userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/120",
    });
    await iamService.access_management.login({
        email,
        password,
        ipAddress: "203.0.113.20",
        userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });

    const meA = await iamService.access_management.authenticateAccessToken(
        `Bearer ${deviceA.accessToken}`,
    );

    const { sessions } = await iamService.access_management.listUserSessions({
        userId: meA.user_id,
        currentSessionId: meA.sid,
    });

    console.log("\n--- Active sessions (before logout) ---");
    console.log(JSON.stringify(sessions, null, 2));

    assert(sessions.length === 2, "user should have two active sessions");
    assert(
        sessions.some((s) => s.is_current),
        "one session should be marked as current",
    );
    assert(
        sessions.find((s) => s.is_current)?.session_id === meA.sid,
        "current session should match authenticated sid",
    );
    assert(
        sessions.every((s) => s.ip_address),
        "sessions should include ip_address from login",
    );
    assert(
        sessions.some((s) => s.device_label === "Chrome on Windows"),
        "sessions should include device_label derived from user agent",
    );
    assert(
        sessions.some((s) => s.device_label === "Safari on iPhone"),
        "sessions should parse iPhone Safari user agent",
    );

    await iamService.access_management.logout({
        userId: meA.user_id,
        sid: meA.sid,
    });

    const afterLogout = await iamService.access_management.listUserSessions({
        userId: meA.user_id,
        currentSessionId: meA.sid,
    });

    console.log("\n--- Active sessions (after logout device A) ---");
    console.log(JSON.stringify(afterLogout.sessions, null, 2));

    assert(
        afterLogout.sessions.length === 1,
        "logout should leave only the other device session active",
    );
    assert(
        !afterLogout.sessions.some((s) => s.is_current),
        "logged-out session should not appear in active list",
    );

    console.log("SUCCESS: list user sessions for profile passed");
}

async function testRefreshUpdatesDeviceLabel() {
    const email = `iam-refresh-label-${Date.now()}@example.com`;
    const password = "Password1!";

    await iamService.access_management.register({
        firstName: "Test",
        lastName: "User",
        email,
        password,
    });

    const device = await iamService.access_management.login({
        email,
        password,
        ipAddress: "203.0.113.10",
        userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/120",
    });

    const me = await iamService.access_management.authenticateAccessToken(
        `Bearer ${device.accessToken}`,
    );

    const before = await iamService.access_management.listUserSessions({
        userId: me.user_id,
        currentSessionId: me.sid,
    });
    assert(
        before.sessions[0]?.device_label === "Chrome on Windows",
        "session should start labelled from the login user agent",
    );

    await iamService.access_management.refreshTokens(device.refreshToken, {
        ipAddress: "198.51.100.42",
        userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });

    const after = await iamService.access_management.listUserSessions({
        userId: me.user_id,
        currentSessionId: me.sid,
    });

    console.log("\n--- Session after refresh from a new device ---");
    console.log(JSON.stringify(after.sessions, null, 2));

    assert(
        after.sessions[0]?.device_label === "Safari on iPhone",
        "refresh should update device_label from the new user agent",
    );
    assert(
        after.sessions[0]?.ip_address === "198.51.100.42",
        "refresh should update ip_address from the new request",
    );

    console.log("SUCCESS: refresh updates session device_label and ip_address");
}

(async () => {
    try {
        testAuthorizationValidator();
        testBearerTokenValidator();
        await testLoginLogoutRefreshFlow();
        await testLogoutAllDevices();
        await testListUserSessions();
        await testRefreshUpdatesDeviceLabel();
        process.exit(0);
    } catch (error) {
        console.error("FAIL:", error.message);
        process.exit(1);
    }
})();
