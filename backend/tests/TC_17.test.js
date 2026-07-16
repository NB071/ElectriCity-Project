/**
 * TC_17 - IAM Service - Update Profile Information
 * UC21
 *
 * Expected: profile fields update immediately; email conflict / wrong password rejected.
 */
import iamService from "../services/iam/iam.service.js";
import { UnauthorizedError } from "../utils/errors.js";
import { registerCustomer } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_17 IAM Service - Update Profile Information (UC21)", () => {
    test("updates first name and phone without requiring re-login", async () => {
        const { email, user } = await registerCustomer("tc17");

        try {
            const updated = await iamService.identity_management.updateProfile({
                userId: user.user_id,
                firstName: "Updated",
                phoneNumber: "4165550199",
            });

            expect(updated.first_name).toBe("Updated");
            expect(updated.phone_number).toBe("4165550199");
            expect(updated.email).toBe(email);
            expect(updated.password_hash).toBeUndefined();
        } finally {
            await cleanupUser(user.user_id);
        }
    });

    test("rejects password change when current password is wrong", async () => {
        const { user } = await registerCustomer("tc17-pw");

        try {
            await expect(
                iamService.identity_management.updateProfile({
                    userId: user.user_id,
                    newPassword: "Password2!",
                    currentPassword: "not-correct",
                }),
            ).rejects.toBeInstanceOf(UnauthorizedError);
        } finally {
            await cleanupUser(user.user_id);
        }
    });

    test("rejects email change that collides with another account", async () => {
        const a = await registerCustomer("tc17-email-a");
        const b = await registerCustomer("tc17-email-b");

        try {
            await expect(
                iamService.identity_management.updateProfile({
                    userId: b.user.user_id,
                    email: a.email,
                }),
            ).rejects.toThrow();
        } finally {
            await cleanupUser(a.user.user_id);
            await cleanupUser(b.user.user_id);
        }
    });
});
