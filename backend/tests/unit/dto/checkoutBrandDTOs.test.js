import {
    toCheckoutCalculateLineDTO,
    toCheckoutCalculateDTO,
} from "../../../services/order/DTOs/checkoutCalculateDTO.js";
import {
    toCheckoutLineItemDTO,
    toCheckoutResultDTO,
    toOrderConfirmEmailItems,
} from "../../../services/order/DTOs/checkoutResultDTO.js";
import { toBrandLogoDTO } from "../../../services/catalog/_brand/DTOs/brandLogoDTO.js";
import { toBrandModelListItemDTO } from "../../../services/catalog/_brand/DTOs/brandModelListItemDTO.js";

describe("checkoutCalculateDTO", () => {
    test("maps config_id and line totals", () => {
        expect(
            toCheckoutCalculateLineDTO({
                cid: "1",
                config_id: "2",
                quantity: "2",
                unit_price: "10.5",
            }),
        ).toEqual({
            cid: 1,
            config_id: 2,
            quantity: 2,
            unit_price: 10.5,
            line_total: 21,
        });

        expect(
            toCheckoutCalculateLineDTO({
                cid: 3,
                config_id: null,
                quantity: 1,
                unit_price: 5,
            }).config_id,
        ).toBeNull();
    });

    test("maps calculate totals payload", () => {
        const dto = toCheckoutCalculateDTO({
            items: [
                {
                    cid: 1,
                    config_id: null,
                    quantity: 1,
                    unit_price: 100,
                },
            ],
            subtotal: 100,
            tax: 13,
            total: 113,
            tax_breakdown: {
                province: "ON",
                type: "HST",
                rates: { gst: 0, pst: 0, hst: 0.13, applicable: 0.13 },
                gst: 0,
                pst: 0,
                hst: 13,
                tax: 13,
            },
        });

        expect(dto.currency).toBe("CAD");
        expect(dto.province).toBe("ON");
        expect(dto.items[0].line_total).toBe(100);
    });
});

describe("checkoutResultDTO", () => {
    test("maps line item with name and config", () => {
        expect(
            toCheckoutLineItemDTO({
                cid: 1,
                config_id: 9,
                name: "Model 3",
                quantity: 1,
                unit_price: 40,
            }),
        ).toMatchObject({
            config_id: 9,
            name: "Model 3",
            line_total: 40,
        });
    });

    test("falls back when name and config_id missing", () => {
        expect(
            toCheckoutLineItemDTO({
                cid: 7,
                config_id: undefined,
                quantity: 2,
                unit_price: 5,
            }),
        ).toMatchObject({
            config_id: null,
            name: "Catalog item 7",
            line_total: 10,
        });
    });

    test("maps checkout result and defaults empty items", () => {
        const withItems = toCheckoutResultDTO({
            order_id: "10",
            order_status: "pending",
            payment_status: "paid",
            subtotal: 20,
            tax: 2,
            total: 22,
            payment: {
                attempt_id: "3",
                status: "succeeded",
                payment_method: "card",
            },
            items: [
                {
                    cid: 1,
                    config_id: null,
                    name: "Leaf",
                    quantity: 1,
                    unit_price: 20,
                },
            ],
        });

        expect(withItems.order_id).toBe(10);
        expect(withItems.items).toHaveLength(1);

        const empty = toCheckoutResultDTO({
            order_id: 11,
            order_status: "pending",
            payment_status: "paid",
            subtotal: 0,
            tax: 0,
            total: 0,
            payment: {
                attempt_id: 1,
                status: "succeeded",
                payment_method: "card",
            },
        });
        expect(empty.items).toEqual([]);
    });

    test("toOrderConfirmEmailItems uses name fallback and empty default", () => {
        expect(toOrderConfirmEmailItems()).toEqual([]);
        expect(
            toOrderConfirmEmailItems([
                { cid: 4, quantity: "1", unit_price: "9" },
                {
                    cid: 5,
                    name: "Custom",
                    quantity: 2,
                    unit_price: 3,
                },
            ]),
        ).toEqual([
            { name: "Catalog item 4", quantity: 1, price: 9 },
            { name: "Custom", quantity: 2, price: 3 },
        ]);
    });
});

describe("brand logo and model DTOs", () => {
    test("toBrandLogoDTO returns null without media_id", () => {
        expect(toBrandLogoDTO({ media_id: null })).toBeNull();
    });

    test("toBrandLogoDTO nulls missing logo fields", () => {
        expect(toBrandLogoDTO({ media_id: "8" })).toEqual({
            media_id: 8,
            url: null,
            file_type: null,
            alt_text: null,
        });
    });

    test("toBrandLogoDTO maps logo fields when present", () => {
        expect(
            toBrandLogoDTO({
                media_id: 1,
                logo_url: "https://cdn/a.png",
                logo_file_type: "image/png",
                logo_alt_text: "Logo",
            }),
        ).toEqual({
            media_id: 1,
            url: "https://cdn/a.png",
            file_type: "image/png",
            alt_text: "Logo",
        });
    });

    test("toBrandModelListItemDTO coerces or nulls release_year", () => {
        expect(
            toBrandModelListItemDTO({
                model_id: 1,
                name: "Model 3",
                release_year: "2024",
            }).release_year,
        ).toBe(2024);
        expect(
            toBrandModelListItemDTO({
                model_id: 2,
                name: "Concept",
                release_year: null,
            }).release_year,
        ).toBeNull();
    });
});
