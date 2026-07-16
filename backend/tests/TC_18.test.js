/**
 * TC_18 - IAM Service - Manage Saved Addresses
 * UC22
 *
 * Expected: add / default / edit / delete; only one default; ownership scoped.
 */
import iamService from "../services/iam/iam.service.js";
import { NotFoundError } from "../utils/errors.js";
import { registerCustomer } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_18 IAM Service - Manage Saved Addresses (UC22)", () => {
    test("add, set default, edit, and delete addresses for the owner", async () => {
        const { user } = await registerCustomer("tc18");

        try {
            const first = await iamService.identity_management.addAddress({
                userId: user.user_id,
                street: "1 King St",
                city: "Toronto",
                province: "ON",
                country: "Canada",
                postalCode: "M5H1A1",
                isDefault: true,
            });
            expect(first.address_id).toBeGreaterThan(0);
            expect(Boolean(first.is_default)).toBe(true);

            const second = await iamService.identity_management.addAddress({
                userId: user.user_id,
                street: "2 Queen St",
                city: "Toronto",
                province: "ON",
                country: "Canada",
                postalCode: "M5H2N2",
                isDefault: false,
            });

            await iamService.identity_management.setDefaultAddress({
                userId: user.user_id,
                addressId: second.address_id,
            });

            const list = await iamService.identity_management.getUserAddresses(
                user.user_id,
                { page: 1, limit: 10 },
            );
            const defaults = list.items.filter((a) => Boolean(a.is_default));
            expect(defaults.length).toBe(1);
            expect(defaults[0].address_id).toBe(second.address_id);

            const edited = await iamService.identity_management.updateAddress({
                userId: user.user_id,
                addressId: second.address_id,
                street: "2 Queen St W",
                city: "Toronto",
                province: "ON",
                country: "Canada",
                postalCode: "M5H2N2",
            });
            expect(edited.street).toMatch(/Queen/);

            await iamService.identity_management.deleteAddress({
                userId: user.user_id,
                addressId: first.address_id,
            });

            const after = await iamService.identity_management.getUserAddresses(
                user.user_id,
                { page: 1, limit: 10 },
            );
            expect(
                after.items.some((a) => a.address_id === first.address_id),
            ).toBe(false);
        } finally {
            await cleanupUser(user.user_id);
        }
    });

    test("prevents cross-user address access (IDOR)", async () => {
        const a = await registerCustomer("tc18-a");
        const b = await registerCustomer("tc18-b");

        try {
            const address = await iamService.identity_management.addAddress({
                userId: a.user.user_id,
                street: "9 Isolation Ave",
                city: "Ottawa",
                province: "ON",
                country: "Canada",
                postalCode: "K1A0B1",
                isDefault: true,
            });

            await expect(
                iamService.identity_management.getUserAddress({
                    userId: b.user.user_id,
                    addressId: address.address_id,
                }),
            ).rejects.toBeInstanceOf(NotFoundError);
        } finally {
            await cleanupUser(a.user.user_id);
            await cleanupUser(b.user.user_id);
        }
    });
});
