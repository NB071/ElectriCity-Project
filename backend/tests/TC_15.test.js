/**
 * TC_15 - IAM Service - Sign Out
 * UC19
 *
 * Expected: logout invalidates refresh; protected actions require re-login.
 */
import iamService from "../services/iam/iam.service.js";
import { UnauthorizedError } from "../utils/errors.js";
import { registerAndLogin } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_15 IAM Service - Sign Out (UC19)", () => {
    test("logout invalidates the refresh token session", async () => {
        const { session, me } = await registerAndLogin("tc15");

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

    test("logout is idempotent for the same session", async () => {
        const { me } = await registerAndLogin("tc15-idem");

        try {
            await iamService.access_management.logout({
                userId: me.user_id,
                sid: me.sid,
            });
            await iamService.access_management.logout({
                userId: me.user_id,
                sid: me.sid,
            });
        } finally {
            await cleanupUser(me.user_id);
        }
    });
});
