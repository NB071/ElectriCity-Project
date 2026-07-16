/**
 * TC_19 - IAM Service - Session Management and Sign Out of All Devices
 * UC23
 */
import iamService from "../services/iam/iam.service.js";
import { UnauthorizedError } from "../utils/errors.js";
import { registerCustomer } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_19 IAM Service - Sessions / Sign Out Everywhere (UC23)", () => {
    test("lists active sessions then revokes all of them", async () => {
        const { email, password, user } = await registerCustomer("tc19");

        try {
            const deviceA = await iamService.access_management.login({
                email,
                password,
                ipAddress: "203.0.113.10",
                userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/120",
            });
            const deviceB = await iamService.access_management.login({
                email,
                password,
                ipAddress: "203.0.113.20",
                userAgent:
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
            });

            const meA =
                await iamService.access_management.authenticateAccessToken(
                    `Bearer ${deviceA.accessToken}`,
                );

            const sessions = await iamService.access_management.listUserSessions(
                {
                    userId: meA.user_id,
                    currentSessionId: meA.sid,
                },
            );
            expect(sessions.sessions.length).toBeGreaterThanOrEqual(2);

            await iamService.access_management.logoutAllDevices({
                userId: meA.user_id,
            });

            await expect(
                iamService.access_management.refreshTokens(deviceA.refreshToken),
            ).rejects.toBeInstanceOf(UnauthorizedError);
            await expect(
                iamService.access_management.refreshTokens(deviceB.refreshToken),
            ).rejects.toBeInstanceOf(UnauthorizedError);
        } finally {
            await cleanupUser(user.user_id);
        }
    });
});
