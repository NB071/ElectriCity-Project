import { ValidationError } from "../../../utils/errors.js";
import validateEmail from "../../../services/email/emailValidator.js";
import { TEMPLATES, VALIDATIONS } from "../../../services/email/constants.js";

describe("emailValidator", () => {
    test("welcome template happy path", () => {
        const data = validateEmail({
            to: "user@example.com",
            subject: "Welcome",
            template: TEMPLATES.WELCOME,
            vars: { fname: "Ada" },
        });

        expect(data.to).toBe("user@example.com");
        expect(data.template).toBe(TEMPLATES.WELCOME);
        expect(data.vars.fname).toBe("Ada");
    });

    test("order-confirm template requires items and total", () => {
        const data = validateEmail({
            to: "buyer@example.com",
            subject: "Order Confirmation - #42",
            template: TEMPLATES.ORDER_CONFIRM,
            vars: {
                fname: "Bob",
                orderId: "42",
                items: [{ name: "Model 3", quantity: 1, price: 45000 }],
                total: 45000,
            },
        });

        expect(data.vars.orderId).toBe("42");
        expect(data.vars.items).toHaveLength(1);
        expect(data.vars.total).toBe(45000);
    });

    test("account-deletion template happy path", () => {
        const data = validateEmail({
            to: "gone@example.com",
            subject: "Account Deletion Confirmation",
            template: TEMPLATES.ACCOUNT_DELETION,
            vars: { fname: "Chris" },
        });

        expect(data.template).toBe(TEMPLATES.ACCOUNT_DELETION);
    });

    test("rejects invalid to / blank subject / unknown template", () => {
        expect(() =>
            validateEmail({
                to: "not-an-email",
                subject: "Hi",
                template: TEMPLATES.WELCOME,
                vars: { fname: "Ada" },
            }),
        ).toThrow(ValidationError);

        expect(() =>
            validateEmail({
                to: "user@example.com",
                subject: "",
                template: TEMPLATES.WELCOME,
                vars: { fname: "Ada" },
            }),
        ).toThrow(ValidationError);

        expect(() =>
            validateEmail({
                to: "user@example.com",
                subject: "Hi",
                template: "not-a-template",
                vars: { fname: "Ada" },
            }),
        ).toThrow(ValidationError);
    });

    test("rejects subject longer than SUBJECT_MAX_LENGTH", () => {
        expect(() =>
            validateEmail({
                to: "user@example.com",
                subject: "x".repeat(VALIDATIONS.SUBJECT_MAX_LENGTH + 1),
                template: TEMPLATES.WELCOME,
                vars: { fname: "Ada" },
            }),
        ).toThrow(ValidationError);
    });

    test("rejects missing or invalid template vars", () => {
        expect(() =>
            validateEmail({
                to: "user@example.com",
                subject: "Welcome",
                template: TEMPLATES.WELCOME,
                vars: { fname: "" },
            }),
        ).toThrow(ValidationError);

        expect(() =>
            validateEmail({
                to: "buyer@example.com",
                subject: "Order",
                template: TEMPLATES.ORDER_CONFIRM,
                vars: {
                    fname: "Bob",
                    orderId: "1",
                    items: [{ name: "X", quantity: 0, price: 10 }],
                    total: 10,
                },
            }),
        ).toThrow(ValidationError);

        expect(() =>
            validateEmail({
                to: "buyer@example.com",
                subject: "Order",
                template: TEMPLATES.ORDER_CONFIRM,
                vars: {
                    fname: "Bob",
                    orderId: "1",
                    items: [],
                    total: -1,
                },
            }),
        ).toThrow(ValidationError);
    });
});
