import {
    computeOrderTotals,
    computeTaxBreakdown,
    roundCurrency,
} from "../../../services/order/helpers/orderTotals.js";
import {
    resolveTaxBreakdown,
    resolveTaxRate,
} from "../../../services/order/helpers/resolveTaxRate.js";
import { TAX_RATES_BY_PROVINCE } from "../../../services/order/constants.js";

describe("order tax helpers", () => {
    test("resolveTaxBreakdown returns GST-only components for Alberta", () => {
        expect(resolveTaxBreakdown("AB")).toEqual({
            province: "AB",
            type: "gst",
            gst: 0.05,
            pst: 0,
            hst: 0,
            applicable: TAX_RATES_BY_PROVINCE.AB,
        });
    });

    test("resolveTaxBreakdown returns HST for Ontario", () => {
        expect(resolveTaxBreakdown("Ontario")).toMatchObject({
            province: "ON",
            type: "hst",
            gst: 0,
            pst: 0,
            hst: 0.13,
            applicable: 0.13,
        });
    });

    test("computeTaxBreakdown amounts sum to tax for Quebec", () => {
        const breakdown = computeTaxBreakdown(1000, "QC");
        expect(breakdown.province).toBe("QC");
        expect(breakdown.type).toBe("gst_pst");
        expect(breakdown.gst).toBe(50);
        expect(breakdown.pst).toBe(99.75);
        expect(breakdown.hst).toBe(0);
        expect(breakdown.tax).toBe(149.75);
    });

    test("computeOrderTotals with province includes tax_breakdown", () => {
        const totals = computeOrderTotals(
            [{ unit_price: 100, quantity: 2 }],
            null,
            "ON",
        );
        expect(totals.subtotal).toBe(200);
        expect(totals.tax).toBe(26);
        expect(totals.total).toBe(226);
        expect(totals.tax_breakdown).toMatchObject({
            province: "ON",
            type: "hst",
            gst: 0,
            pst: 0,
            hst: 26,
            tax: 26,
        });
    });

    test("computeOrderTotals flat rate path leaves tax_breakdown null", () => {
        const totals = computeOrderTotals(
            [{ unit_price: 100, quantity: 1 }],
            resolveTaxRate("AB"),
        );
        expect(totals.tax).toBe(5);
        expect(totals.tax_breakdown).toBeNull();
    });

    test("roundCurrency rounds to cents", () => {
        expect(roundCurrency(10.126)).toBe(10.13);
        expect(roundCurrency(10.124)).toBe(10.12);
    });
});
