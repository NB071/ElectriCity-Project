// IAM identity tests
// script: npm run test:iam:identity

import iamService from "../../services/iam/iam.service.js";
import accountDAO from "../../services/iam/_identity/accountDAO.js";
import { toUserDTO } from "../../services/iam/_identity/DTOs/userDTO.js";
import {
    validateDeleteProfile,
    validateAdminUserSearchQuery,
} from "../../services/iam/_identity/identityValidator.js";
import {
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from "../../utils/errors.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function registerUser(prefix) {
    const email = `${prefix}-${Date.now()}@example.com`;
    const password = "Password1!";
    const user = await iamService.access_management.register({
        firstName: "Id",
        lastName: "Test",
        email,
        password,
    });
    return { email, password, user };
}

function testToUserDto() {
    const dto = toUserDTO({
        user_id: 7,
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
        role: "customer",
        role_name: "should-be-ignored",
        password_hash: "secret",
    });

    assert(dto.user_id === 7, "DTO should copy user_id");
    assert(dto.role === "customer", "DTO should copy role alias");
    assert(
        dto.password_hash === undefined,
        "DTO must never expose password_hash",
    );
    assert(
        dto.role_name === undefined,
        "DTO should not invent role_name from undefined USER_FIELDS",
    );

    const withoutRole = toUserDTO({
        user_id: 1,
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
        role_name: "admin",
    });
    assert(
        withoutRole.role === undefined,
        "role_name alone must not populate role (dead fallback removed)",
    );

    console.log("SUCCESS: toUserDTO field mapping passed");
}

function testDeleteProfileValidator() {
    try {
        validateDeleteProfile({ userId: 1 });
        throw new Error("Expected delete without password to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "delete without password should throw ValidationError",
        );
    }

    const valid = validateDeleteProfile({
        userId: 1,
        currentPassword: "Password1!",
    });
    assert(valid.userId === 1, "validated userId should be returned");
    assert(
        valid.currentPassword === "Password1!",
        "validated currentPassword should be returned",
    );

    console.log("SUCCESS: delete profile validator checks passed");
}

function testAdminSearchValidator() {
    const { q } = validateAdminUserSearchQuery({ q: "  ontario  " });
    assert(q === "ontario", "search q should be trimmed");

    try {
        validateAdminUserSearchQuery({ q: "" });
        throw new Error("Expected empty q to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "empty q should throw ValidationError",
        );
    }

    console.log("SUCCESS: admin search validator checks passed");
}

async function testUpdateProfileAndGetUser() {
    const { email, password, user } = await registerUser("iam-id-profile");

    const updated = await iamService.identity_management.updateProfile({
        userId: user.user_id,
        firstName: "Updated",
        phoneNumber: "4165550100",
    });

    assert(updated.first_name === "Updated", "first name should update");
    assert(updated.phone_number === "4165550100", "phone should update");
    assert(updated.email === email, "email should remain");
    assert(
        updated.password_hash === undefined,
        "profile response must omit password_hash",
    );

    try {
        await iamService.identity_management.updateProfile({
            userId: user.user_id,
            newPassword: "Password2!",
            currentPassword: "wrong-password",
        });
        throw new Error("Expected wrong current password to fail");
    } catch (error) {
        assert(
            error instanceof UnauthorizedError,
            "wrong current password should throw UnauthorizedError",
        );
    }

    await iamService.identity_management.updateProfile({
        userId: user.user_id,
        newPassword: "Password2!",
        currentPassword: password,
    });

    const session = await iamService.access_management.login({
        email,
        password: "Password2!",
    });
    assert(session.accessToken, "login with new password should succeed");

    await accountDAO.softDeleteById(user.user_id);
    console.log("SUCCESS: update profile / password change passed");
}

async function testAddressOwnership() {
    const a = await registerUser("iam-id-addr-a");
    const b = await registerUser("iam-id-addr-b");

    const address = await iamService.identity_management.addAddress({
        userId: a.user.user_id,
        street: "1 King St",
        city: "Toronto",
        province: "ON",
        country: "Canada",
        postalCode: "M5H1A1",
        isDefault: true,
    });

    assert(address.address_id > 0, "address should be created");
    assert(address.is_default === true || address.is_default === 1, "default");

    const list = await iamService.identity_management.getUserAddresses(
        a.user.user_id,
        { page: 1, limit: 10 },
    );
    assert(list.items.length === 1, "owner should see their address");

    try {
        await iamService.identity_management.getUserAddress({
            userId: b.user.user_id,
            addressId: address.address_id,
        });
        throw new Error("Expected cross-user address access to fail");
    } catch (error) {
        assert(
            error instanceof NotFoundError,
            "other user must not read address (IDOR)",
        );
    }

    try {
        await iamService.identity_management.deleteAddress({
            userId: b.user.user_id,
            addressId: address.address_id,
        });
        throw new Error("Expected cross-user address delete to fail");
    } catch (error) {
        assert(
            error instanceof NotFoundError,
            "other user must not delete address (IDOR)",
        );
    }

    await iamService.identity_management.deleteAddress({
        userId: a.user.user_id,
        addressId: address.address_id,
    });

    await accountDAO.softDeleteById(a.user.user_id);
    await accountDAO.softDeleteById(b.user.user_id);
    console.log("SUCCESS: address ownership / IDOR checks passed");
}

async function testDeleteProfileRequiresPassword() {
    const { password, user } = await registerUser("iam-id-delete");

    try {
        await iamService.identity_management.deleteProfile({
            userId: user.user_id,
            currentPassword: "not-the-password",
        });
        throw new Error("Expected wrong password delete to fail");
    } catch (error) {
        assert(
            error instanceof UnauthorizedError,
            "wrong password should throw UnauthorizedError",
        );
    }

    const stillThere = await iamService.identity_management.getUserById(
        user.user_id,
    );
    assert(stillThere.user_id === user.user_id, "user should still exist");

    try {
        await iamService.identity_management.deleteProfile({
            userId: user.user_id,
            currentPassword: password,
        });
    } catch {
        // Local SMTP may fail after soft-delete; account should still be gone.
    }

    try {
        await iamService.identity_management.getUserById(user.user_id);
        throw new Error("Expected soft-deleted user to be NotFound");
    } catch (error) {
        assert(
            error instanceof NotFoundError,
            "soft-deleted user should throw NotFoundError",
        );
    }

    console.log("SUCCESS: delete profile password step-up passed");
}

async function testAdminSearchStatusKeywords() {
    const live = await registerUser("iam-id-search-live");
    const gone = await registerUser("iam-id-search-gone");
    await accountDAO.softDeleteById(gone.user.user_id);

    const ones = await iamService.identity_management.searchUsers({ q: "1" });
    assert(
        !ones.items.every((row) => row.is_deleted === true),
        "q=1 must not dump all deleted users via status OR",
    );

    const deleted = await iamService.identity_management.searchUsers({
        q: "deleted",
    });
    assert(
        deleted.items.length > 0,
        "q=deleted should return soft-deleted users",
    );
    assert(
        deleted.items.every((row) => row.is_deleted === true),
        "q=deleted should only include soft-deleted users",
    );

    const active = await iamService.identity_management.searchUsers({
        q: "active",
    });
    assert(active.items.length > 0, "q=active should return active users");
    assert(
        active.items.every((row) => row.is_deleted === false),
        "q=active should only include active users",
    );

    await accountDAO.softDeleteById(live.user.user_id);
    console.log("SUCCESS: admin search status keywords passed");
}

async function main() {
    testToUserDto();
    testDeleteProfileValidator();
    testAdminSearchValidator();
    await testUpdateProfileAndGetUser();
    await testAddressOwnership();
    await testDeleteProfileRequiresPassword();
    await testAdminSearchStatusKeywords();
    console.log("\nAll IAM identity tests passed.");
}

main().catch((error) => {
    console.error("\nIAM identity tests failed:");
    console.error(error);
    process.exit(1);
});
