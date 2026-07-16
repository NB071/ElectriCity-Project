/**
 * TC_06 - IAM Service - Account Deletion
 * UC7
 *
 * Expected: profile deleted; session invalidated; subsequent login fails.
 * Notes: explicit password confirmation required.
 */
import iamService from "../services/iam/iam.service.js";
import { UnauthorizedError, NotFoundError } from "../utils/errors.js";
import { registerCustomer } from "./helpers/tddFixtures.js";


describe("TC_06 IAM Service - Account Deletion (UC7)", () => {
    test("requires explicit current password before deletion", async () => {
        const { password, user } = await registerCustomer("tc06-req");

        await expect(
            iamService.identity_management.deleteProfile({
                userId: user.user_id,
                currentPassword: "wrong-password",
            }),
        ).rejects.toBeInstanceOf(UnauthorizedError);

        const stillThere = await iamService.identity_management.getUserById(
            user.user_id,
        );
        expect(stillThere.user_id).toBe(user.user_id);

        // cleanup path uses correct password
        try {
            await iamService.identity_management.deleteProfile({
                userId: user.user_id,
                currentPassword: password,
            });
        } catch {
            // SMTP may fail after soft-delete; identity should still be gone
        }
    });

    test("deletes profile and invalidates subsequent sign-in", async () => {
        const { email, password, user } = await registerCustomer("tc06-del");

        const session = await iamService.access_management.login({
            email,
            password,
        });
        expect(session.accessToken).toBeTruthy();

        try {
            await iamService.identity_management.deleteProfile({
                userId: user.user_id,
                currentPassword: password,
            });
        } catch {
            // email confirmation side-effect may fail in local env
        }

        await expect(
            iamService.identity_management.getUserById(user.user_id),
        ).rejects.toBeInstanceOf(NotFoundError);

        await expect(
            iamService.access_management.login({ email, password }),
        ).rejects.toThrow();
    });
});
