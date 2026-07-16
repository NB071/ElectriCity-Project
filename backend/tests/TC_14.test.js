/**
 * TC_14 - IAM Service - Sign In / Token Authentication
 * UC18
 *
 * Expected: valid credentials yield access+refresh tokens; invalid credentials fail.
 */
import iamService from "../services/iam/iam.service.js";
import { UnauthorizedError } from "../utils/errors.js";
import { registerCustomer } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_14 IAM Service - Sign In / Token Authentication (UC18)", () => {
    test("issues a valid token pair on successful sign-in", async () => {
        const { email, password, user } = await registerCustomer("tc14");

        try {
            const session = await iamService.access_management.login({
                email,
                password,
            });

            expect(session.accessToken).toBeTruthy();
            expect(session.refreshToken).toBeTruthy();
            expect(session.user.user_id).toBe(user.user_id);

            const me = await iamService.access_management.authenticateAccessToken(
                `Bearer ${session.accessToken}`,
            );
            expect(me.user_id).toBe(user.user_id);
            expect(me.sid).toBeTruthy();
        } finally {
            await cleanupUser(user.user_id);
        }
    });

    test("rejects invalid credentials", async () => {
        const { email, user } = await registerCustomer("tc14-bad");

        try {
            await expect(
                iamService.access_management.login({
                    email,
                    password: "WrongPassword1!",
                }),
            ).rejects.toBeInstanceOf(UnauthorizedError);
        } finally {
            await cleanupUser(user.user_id);
        }
    });
});
