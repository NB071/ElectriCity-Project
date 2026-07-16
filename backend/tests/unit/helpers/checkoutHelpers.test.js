/**
 * Unit tests for order helpers + checkoutHelpers
 */
import {
    buildAddressRecords,
    roundCurrency,
    computeOrderTotals,
} from "../../../services/order/strategies/checkoutHelpers.js";
import {
    normalizeCanadianProvince,
    resolveTaxRate,
} from "../../../services/order/helpers/resolveTaxRate.js";
import { ADDRESS_TYPES } from "../../../services/order/constants.js";

const shipping = {
    full_name: "A",
    street: "1 Main",
    city: "Toronto",
    province: "ON",
    country: "Canada",
    postal_code: "M5H2N2",
};

describe("order helpers / checkoutHelpers", () => {
    test("roundCurrency rounds to 2 decimals", () => {
        expect(roundCurrency(10.126)).toBe(10.13);
        expect(roundCurrency(10)).toBe(10);
        expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
    });

    test("computeOrderTotals with explicit tax rate", () => {
        const totals = computeOrderTotals(
            [
                { unit_price: 100, quantity: 2 },
                { unit_price: 50, quantity: 1 },
            ],
            0.13,
        );
        expect(totals.subtotal).toBe(250);
        expect(totals.tax).toBe(32.5);
        expect(totals.total).toBe(282.5);
    });

    test("computeOrderTotals uses default tax when rate omitted", () => {
        const totals = computeOrderTotals([{ unit_price: 100, quantity: 1 }]);
        expect(totals.subtotal).toBe(100);
        expect(typeof totals.tax).toBe("number");
        expect(totals.total).toBe(roundCurrency(100 + totals.tax));
    });

    test("buildAddressRecords duplicates shipping as billing when omitted", () => {
        const rows = buildAddressRecords(shipping);
        expect(rows).toHaveLength(2);
        expect(rows[0].address_type).toBe(ADDRESS_TYPES.SHIPPING);
        expect(rows[1].address_type).toBe(ADDRESS_TYPES.BILLING);
        expect(rows[1].street).toBe(shipping.street);
    });

    test("buildAddressRecords keeps distinct billing address", () => {
        const billing = { ...shipping, street: "2 Queen" };
        const rows = buildAddressRecords(shipping, billing);
        expect(rows[0].street).toBe("1 Main");
        expect(rows[1].street).toBe("2 Queen");
        expect(rows[1].address_type).toBe(ADDRESS_TYPES.BILLING);
    });

    test("normalizeCanadianProvince accepts codes and names", () => {
        expect(normalizeCanadianProvince("on")).toBe("ON");
        expect(normalizeCanadianProvince("Ontario")).toBe("ON");
        expect(normalizeCanadianProvince("british columbia")).toBe("BC");
        expect(normalizeCanadianProvince("Québec")).toBe("QC");
        expect(normalizeCanadianProvince("")).toBeNull();
        expect(normalizeCanadianProvince(null)).toBeNull();
        expect(normalizeCanadianProvince("Narnia")).toBeNull();
    });

    test("resolveTaxRate returns rates or null for unknown", () => {
        expect(resolveTaxRate("ON")).toBe(0.13);
        expect(resolveTaxRate("BC")).toBe(0.12);
        expect(resolveTaxRate("Ontario")).toBe(0.13);
        expect(resolveTaxRate("NotAProvince")).toBeNull();
        expect(typeof resolveTaxRate(null)).toBe("number");
        expect(typeof resolveTaxRate("")).toBe("number");
    });
});
