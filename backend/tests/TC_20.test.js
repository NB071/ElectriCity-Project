/**
 * TC_20 - IAM Service - Refresh Access Token
 * UC24
 *
 * Expected: valid refresh returns new token pair; used/revoked refresh fails.
 */
import iamService from "../services/iam/iam.service.js";
import { UnauthorizedError } from "../utils/errors.js";
import { registerAndLogin } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_20 IAM Service - Refresh Access Token (UC24)", () => {
    test("silent refresh issues a new token pair", async () => {
        const { session, me } = await registerAndLogin("tc20");

        try {
            const refreshed = await iamService.access_management.refreshTokens(
                session.refreshToken,
            );

            expect(refreshed.accessToken).toBeTruthy();
            expect(refreshed.refreshToken).toBeTruthy();
            expect(refreshed.accessToken).not.toBe(session.accessToken);

            const auth =
                await iamService.access_management.authenticateAccessToken(
                    `Bearer ${refreshed.accessToken}`,
                );
            expect(auth.user_id).toBeTruthy();
        } finally {
            await cleanupUser(me.user_id);
        }
    });

    test("rejects an already-used or revoked refresh token", async () => {
        const { session, me } = await registerAndLogin("tc20-rev");

        try {
            await iamService.access_management.logout({
                userId: me.user_id,
                sid: me.sid,
            });

            await expect(
                iamService.access_management.refreshTokens(session.refreshToken),
            ).rejects.toBeInstanceOf(UnauthorizedError);
        } finally {
            await cleanupUser(me.user_id);
        }
    });
});
