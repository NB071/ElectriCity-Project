import { toAuthenticatedUserDTO } from "../../../services/iam/_access/DTOs/authenticatedUserDTO.js";

describe("authenticatedUserDTO", () => {
    test("prefers role over role_name", () => {
        expect(
            toAuthenticatedUserDTO({
                user: {
                    user_id: 1,
                    role: "admin",
                    role_name: "customer",
                    email: "a@test.com",
                },
                jti: "j",
                exp: 1,
                sid: "s",
            }).role,
        ).toBe("admin");
    });

    test("falls back to role_name when role missing", () => {
        expect(
            toAuthenticatedUserDTO({
                user: {
                    user_id: 1,
                    role_name: "customer",
                    email: "a@test.com",
                },
                jti: "j",
                exp: 1,
                sid: "s",
            }).role,
        ).toBe("customer");
    });
});
