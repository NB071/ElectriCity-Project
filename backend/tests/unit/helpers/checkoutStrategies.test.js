import { jest } from "@jest/globals";
import { ValidationError } from "../../../utils/errors.js";
import CheckoutContext from "../../../services/order/strategies/CheckoutContext.js";

const mockFindCartByUserId = jest.fn();
const mockFindActiveGuestCartBySessionToken = jest.fn();
const mockRunCheckout = jest.fn();

await jest.unstable_mockModule("../../../services/cart/cartDAO.js", () => ({
    default: {
        findCartByUserId: mockFindCartByUserId,
        findActiveGuestCartBySessionToken: mockFindActiveGuestCartBySessionToken,
    },
}));

await jest.unstable_mockModule(
    "../../../services/order/strategies/checkoutHelpers.js",
    () => ({
        runCheckout: mockRunCheckout,
        roundCurrency: (n) => n,
        computeOrderTotals: () => ({}),
        buildAddressRecords: () => [],
    }),
);

const customerCheckoutStrategy = (
    await import(
        "../../../services/order/strategies/CustomerCheckoutStrategy.js"
    )
).default;
const guestCheckoutStrategy = (
    await import("../../../services/order/strategies/GuestCheckoutStrategy.js")
).default;

describe("CheckoutContext", () => {
    test("throws when strategy unset", async () => {
        const ctx = new CheckoutContext();
        await expect(ctx.checkout({})).rejects.toThrow(
            "No checkout strategy set.",
        );
    });

    test("delegates to strategy", async () => {
        const ctx = new CheckoutContext();
        const strategy = {
            checkout: jest.fn().mockResolvedValue({ order_id: 1 }),
        };
        ctx.setStrategy(strategy);
        await expect(ctx.checkout({ a: 1 })).resolves.toEqual({ order_id: 1 });
    });
});

describe("CustomerCheckoutStrategy", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRunCheckout.mockResolvedValue({ order_id: 9 });
    });

    test("throws when customer cart missing", async () => {
        mockFindCartByUserId.mockResolvedValue(null);
        await expect(
            customerCheckoutStrategy.checkout({
                userId: 1,
                shipping_address: {},
                payment_method: "credit_card",
            }),
        ).rejects.toBeInstanceOf(ValidationError);
        expect(mockRunCheckout).not.toHaveBeenCalled();
    });

    test("runs checkout with cart id", async () => {
        mockFindCartByUserId.mockResolvedValue({ cart_id: 5 });
        await expect(
            customerCheckoutStrategy.checkout({
                userId: 1,
                shipping_address: { province: "ON" },
                payment_method: "credit_card",
                payment_details: {},
            }),
        ).resolves.toEqual({ order_id: 9 });
        expect(mockRunCheckout).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 1, cartId: 5 }),
        );
    });
});

describe("GuestCheckoutStrategy", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRunCheckout.mockResolvedValue({ order_id: 11 });
    });

    test("throws when session cart missing", async () => {
        mockFindActiveGuestCartBySessionToken.mockResolvedValue(null);
        await expect(
            guestCheckoutStrategy.checkout({
                sessionToken: "tok",
                guest_email: "g@test.com",
                shipping_address: {},
                payment_method: "credit_card",
            }),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test("checks out from session cart when present", async () => {
        mockFindActiveGuestCartBySessionToken.mockResolvedValue({
            cart_id: 8,
        });
        await guestCheckoutStrategy.checkout({
            sessionToken: "tok",
            guest_email: "g@test.com",
            shipping_address: {},
            payment_method: "credit_card",
        });
        expect(mockRunCheckout).toHaveBeenCalledWith(
            expect.objectContaining({ cartId: 8, userId: null }),
        );
    });

    test("falls back to body items without session", async () => {
        await guestCheckoutStrategy.checkout({
            guest_email: "g@test.com",
            items: [{ cid: 1, quantity: 1 }],
            shipping_address: {},
            payment_method: "credit_card",
        });
        expect(mockRunCheckout).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [{ cid: 1, quantity: 1 }],
                userId: null,
            }),
        );
        expect(mockRunCheckout.mock.calls[0][0].cartId).toBeUndefined();
        expect(mockFindActiveGuestCartBySessionToken).not.toHaveBeenCalled();
    });
});
