import { ValidationError } from "../../../utils/errors.js";
import {
    validateOrderId,
    validateOrderPaymentStatus,
    validateUserId,
    validateOrderStatus,
    validateCustomerCheckoutInput,
    validateGuestCheckoutInput,
    validateCustomerCalculateInput,
    validateGuestCalculateInput,
} from "../../../services/order/orderValidator.js";
import { VALIDATIONS } from "../../../services/order/constants.js";

const ADDR = {
    full_name: "Test Shopper",
    phone_number: "4165550100",
    street: "100 Queen St W",
    city: "Toronto",
    province: "ON",
    country: "Canada",
    postal_code: "M5H2N2",
};

describe("orderValidator", () => {
    test("ids and status enums", () => {
        expect(validateOrderId("8")).toBe(8);
        expect(validateUserId(3)).toBe(3);
        expect(
            validateOrderStatus(VALIDATIONS.ORDER_STATUS.PENDING),
        ).toBe(VALIDATIONS.ORDER_STATUS.PENDING);
        expect(
            validateOrderPaymentStatus(VALIDATIONS.PAYMENT_STATUS.UNPAID),
        ).toBe(VALIDATIONS.PAYMENT_STATUS.UNPAID);

        expect(() => validateOrderId(0)).toThrow(ValidationError);
        expect(() => validateOrderStatus("shipped_to_moon")).toThrow(
            ValidationError,
        );
        expect(() => validateOrderPaymentStatus("maybe")).toThrow(
            ValidationError,
        );
    });

    test("customer checkout validates address + payment shape", () => {
        const data = validateCustomerCheckoutInput({
            userId: 1,
            shipping_address: ADDR,
            payment_method: "credit_card",
            payment_details: { card_number: "4111" },
        });
        expect(data.shipping_address.province).toBe("ON");

        expect(() =>
            validateCustomerCheckoutInput({
                userId: 1,
                shipping_address: { ...ADDR, province: "Narnia" },
                payment_method: "credit_card",
            }),
        ).toThrow(ValidationError);

        expect(() =>
            validateCustomerCheckoutInput({
                shipping_address: ADDR,
                payment_method: "credit_card",
            }),
        ).toThrow(ValidationError);
    });

    test("guest checkout requires items or session", () => {
        expect(() =>
            validateGuestCheckoutInput({
                guest_email: "g@example.com",
                shipping_address: ADDR,
                payment_method: "credit_card",
            }),
        ).toThrow(ValidationError);

        const withItems = validateGuestCheckoutInput({
            guest_email: "g@example.com",
            items: [{ cid: 1, quantity: 1 }],
            shipping_address: ADDR,
            payment_method: "credit_card",
        });
        expect(withItems.items[0].cid).toBe(1);

        const withSession = validateGuestCheckoutInput({
            guest_email: "g@example.com",
            sessionToken: "550e8400-e29b-41d4-a716-446655440000",
            shipping_address: ADDR,
            payment_method: "apple_pay",
        });
        expect(withSession.sessionToken).toBeTruthy();

        expect(() =>
            validateGuestCheckoutInput({
                guest_email: "bad",
                items: [{ cid: 1, quantity: 1 }],
                shipping_address: ADDR,
                payment_method: "credit_card",
            }),
        ).toThrow(ValidationError);
    });

    test("customer calculate only requires userId + province", () => {
        const data = validateCustomerCalculateInput({
            userId: 1,
            shipping_address: { province: "british columbia" },
        });
        expect(data.shipping_address.province).toBe("BC");

        expect(() =>
            validateCustomerCalculateInput({
                userId: 1,
                shipping_address: { province: "Narnia" },
            }),
        ).toThrow(ValidationError);
    });

    test("guest calculate requires items or session plus province", () => {
        expect(() =>
            validateGuestCalculateInput({
                shipping_address: { province: "ON" },
            }),
        ).toThrow(ValidationError);

        const withItems = validateGuestCalculateInput({
            items: [{ cid: 2, quantity: 1 }],
            shipping_address: { province: "QC" },
        });
        expect(withItems.shipping_address.province).toBe("QC");
        expect(withItems.items[0].cid).toBe(2);
    });
});
