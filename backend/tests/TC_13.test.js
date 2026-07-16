/**
 * TC_13 - IAM Service - User Registration
 * UC17
 *
 * Expected: new user row created; duplicate email rejected; password rules enforced.
 */
import iamService from "../services/iam/iam.service.js";
import { ValidationError } from "../utils/errors.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_13 IAM Service - User Registration (UC17)", () => {
    test("registers a new user when email is unique", async () => {
        const email = `tc13-${Date.now()}@example.com`;
        const user = await iamService.access_management.register({
            firstName: "Reg",
            lastName: "User",
            email,
            password: "Password1!",
        });

        try {
            expect(user.user_id).toBeGreaterThan(0);
            expect(user.email).toBe(email);

            const profile = await iamService.identity_management.getUserById(
                user.user_id,
            );
            expect(profile.email).toBe(email);
        } finally {
            await cleanupUser(user.user_id);
        }
    });

    test("rejects weak passwords", async () => {
        await expect(
            iamService.access_management.register({
                firstName: "Weak",
                lastName: "Pw",
                email: `tc13-weak-${Date.now()}@example.com`,
                password: "short",
            }),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test("rejects duplicate emails", async () => {
        const email = `tc13-dup-${Date.now()}@example.com`;
        const first = await iamService.access_management.register({
            firstName: "A",
            lastName: "B",
            email,
            password: "Password1!",
        });

        try {
            await expect(
                iamService.access_management.register({
                    firstName: "C",
                    lastName: "D",
                    email,
                    password: "Password1!",
                }),
            ).rejects.toThrow();
        } finally {
            await cleanupUser(first.user_id);
        }
    });
});
