import { ValidationError } from "../../../utils/errors.js";
import {
    validateRegisterInput,
    validateLoginInput,
    validateRefreshTokenInput,
    validateBearerToken,
    validateLogoutContext,
    validateLogoutAllContext,
    validateListUserSessionsContext,
    validateAuthorizationContext,
} from "../../../services/iam/_access/accessValidator.js";
import { VALIDATIONS } from "../../../services/iam/_access/constants.js";

const SID = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; // 36 chars

describe("accessValidator", () => {
    test("register / login happy and reject paths", () => {
        const reg = validateRegisterInput({
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@example.com",
            password: "Password1!",
        });
        expect(reg.email).toBe("ada@example.com");

        expect(() =>
            validateRegisterInput({
                firstName: "",
                lastName: "X",
                email: "bad",
                password: "short",
            }),
        ).toThrow(ValidationError);

        expect(
            validateLoginInput({
                email: "ada@example.com",
                password: "x",
            }).email,
        ).toBe("ada@example.com");
        expect(() =>
            validateLoginInput({ email: "nope", password: "" }),
        ).toThrow(ValidationError);
    });

    test("tokens and logout contexts", () => {
        expect(validateRefreshTokenInput("rtok")).toBe("rtok");
        expect(() => validateRefreshTokenInput("")).toThrow(ValidationError);

        expect(validateBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
        expect(() => validateBearerToken("Token abc")).toThrow(ValidationError);
        expect(() => validateBearerToken(undefined)).toThrow(ValidationError);

        expect(validateLogoutContext({ userId: 1, sid: SID }).sid).toBe(SID);
        expect(() =>
            validateLogoutContext({ userId: 1, sid: "short" }),
        ).toThrow(ValidationError);

        expect(validateLogoutAllContext({ userId: 2 }).userId).toBe(2);
        expect(
            validateListUserSessionsContext({
                userId: 1,
                currentSessionId: SID,
            }).userId,
        ).toBe(1);
    });

    test("authorization context role checks", () => {
        expect(() =>
            validateAuthorizationContext(
                VALIDATIONS.ROLES.CUSTOMER,
                VALIDATIONS.ROLES.CUSTOMER,
            ),
        ).not.toThrow();

        expect(() => validateAuthorizationContext("", "customer")).toThrow(
            ValidationError,
        );
        expect(() =>
            validateAuthorizationContext(VALIDATIONS.ROLES.CUSTOMER),
        ).toThrow(ValidationError);
        expect(() =>
            validateAuthorizationContext("superuser", VALIDATIONS.ROLES.ADMIN),
        ).toThrow(ValidationError);
        expect(() =>
            validateAuthorizationContext(
                VALIDATIONS.ROLES.CUSTOMER,
                "not-a-role",
            ),
        ).toThrow(ValidationError);
    });
});
