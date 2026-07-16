/**
 * TC_30 - IAM Service - Admin User Search and Management
 * UC34
 *
 * Expected: paginated user list; search by name/email; deleted accounts distinguishable.
 */
import iamService from "../services/iam/iam.service.js";
import accountDAO from "../services/iam/_identity/accountDAO.js";
import { registerCustomer } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_30 IAM Service - Admin User Search (UC34)", () => {
    test("viewAllUsers returns a paginated list", async () => {
        const { user } = await registerCustomer("tc30-list");

        try {
            const page = await iamService.identity_management.viewAllUsers({
                page: 1,
                limit: 20,
            });
            expect(Array.isArray(page.items)).toBe(true);
            expect(page.items.length).toBeGreaterThanOrEqual(1);
            expect(
                page.pagination?.total ?? page.items.length,
            ).toBeGreaterThanOrEqual(1);
        } finally {
            await cleanupUser(user.user_id);
        }
    });

    test("search narrows results and distinguishes deleted accounts", async () => {
        const live = await registerCustomer("tc30-live");
        const gone = await registerCustomer("tc30-gone");

        try {
            await accountDAO.softDeleteById(gone.user.user_id);

            const byEmail = await iamService.identity_management.searchUsers({
                q: live.email.split("@")[0],
            });
            expect(
                byEmail.items.some((u) => u.user_id === live.user.user_id),
            ).toBe(true);

            const deleted = await iamService.identity_management.searchUsers({
                q: "deleted",
            });
            expect(deleted.items.length).toBeGreaterThan(0);
            expect(deleted.items.every((u) => u.is_deleted === true)).toBe(true);

            const detail = await iamService.identity_management.getUserById(
                live.user.user_id,
            );
            expect(detail.user_id).toBe(live.user.user_id);
            expect(detail.is_deleted === true ? false : true).toBe(true);
        } finally {
            await cleanupUser(live.user.user_id);
            await cleanupUser(gone.user.user_id);
        }
    });
});
