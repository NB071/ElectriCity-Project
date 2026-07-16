import { ValidationError } from "../../../utils/errors.js";
import {
    validateUserId,
    validateGetUserOptions,
    validateUpdateProfile,
    validateDeleteProfile,
    validateAdminUserSearchQuery,
    validateCreateAddress,
    validateUpdateAddress,
    validateAddressRef,
} from "../../../services/iam/_identity/identityValidator.js";

describe("identityValidator", () => {
    test("userId and getUserOptions", () => {
        expect(validateUserId("5")).toBe(5);
        expect(() => validateUserId(0)).toThrow(ValidationError);

        expect(validateGetUserOptions({}).fields).toEqual([]);
        expect(
            validateGetUserOptions({ fields: "email,first_name" }).fields,
        ).toContain("email");
        expect(() =>
            validateGetUserOptions({ fields: ["not_a_field"] }),
        ).toThrow(ValidationError);
    });

    test("updateProfile requires a field; password needs current", () => {
        expect(
            validateUpdateProfile({ userId: 1, firstName: "A" }).firstName,
        ).toBe("A");

        expect(() => validateUpdateProfile({ userId: 1 })).toThrow(
            ValidationError,
        );
        expect(() =>
            validateUpdateProfile({ userId: 1, newPassword: "Password2!" }),
        ).toThrow(ValidationError);

        expect(
            validateUpdateProfile({
                userId: 1,
                newPassword: "Password2!",
                currentPassword: "Password1!",
            }).newPassword,
        ).toBe("Password2!");
    });

    test("deleteProfile and admin search", () => {
        expect(
            validateDeleteProfile({
                userId: 1,
                currentPassword: "Password1!",
            }).userId,
        ).toBe(1);
        expect(() => validateDeleteProfile({ userId: 1 })).toThrow(
            ValidationError,
        );

        expect(validateAdminUserSearchQuery({ q: "ada" }).q).toBe("ada");
        expect(() => validateAdminUserSearchQuery({ q: "" })).toThrow(
            ValidationError,
        );
    });

    test("address create / update / ref", () => {
        const created = validateCreateAddress({
            userId: 1,
            street: "1 King",
            city: "Toronto",
            province: "ON",
            country: "Canada",
            postalCode: "M5H1A1",
        });
        expect(created.street).toBe("1 King");

        expect(() =>
            validateCreateAddress({
                userId: 1,
                street: "",
                city: "Toronto",
                province: "ON",
                country: "Canada",
                postalCode: "M5H1A1",
            }),
        ).toThrow(ValidationError);

        expect(
            validateUpdateAddress({
                userId: 1,
                addressId: 2,
                street: "2 Queen",
            }).street,
        ).toBe("2 Queen");
        expect(() =>
            validateUpdateAddress({ userId: 1, addressId: 2 }),
        ).toThrow(ValidationError);

        expect(
            validateAddressRef({ userId: 1, addressId: 9 }).addressId,
        ).toBe(9);
        expect(() => validateAddressRef({ userId: 1 })).toThrow(
            ValidationError,
        );
    });
});
