// Order Service (Helpers; for totals)

import { resolveTaxRate, resolveTaxBreakdown } from "./resolveTaxRate.js";

/**
 * This function rounds a number to 2 decimal places (currency precision).
 * @param {number} amount Amount to round
 * @returns {number}
 */
function roundCurrency(amount) {
    return Math.round(amount * 100) / 100;
}

/**
 * This function builds GST/PST/HST amount breakdown for a subtotal and province.
 * Component amounts are rounded independently, then summed for `tax`.
 * @param {number} subtotal
 * @param {string|null|undefined} province Canonical province code or name
 * @returns {{
 *   province: string,
 *   type: string,
 *   rates: { gst: number, pst: number, hst: number, applicable: number },
 *   gst: number,
 *   pst: number,
 *   hst: number,
 *   tax: number
 * }|null}
 */
function computeTaxBreakdown(subtotal, province) {
    const rates = resolveTaxBreakdown(province);
    if (!rates) {
        return null;
    }

    const gst = roundCurrency(subtotal * rates.gst);
    const pst = roundCurrency(subtotal * rates.pst);
    const hst = roundCurrency(subtotal * rates.hst);
    const tax = roundCurrency(gst + pst + hst);

    return {
        province: rates.province,
        type: rates.type,
        rates: {
            gst: rates.gst,
            pst: rates.pst,
            hst: rates.hst,
            applicable: rates.applicable,
        },
        gst,
        pst,
        hst,
        tax,
    };
}

/**
 * This function computes subtotal/tax/total for a list of priced line items.
 * When `province` is provided, tax is computed from GST/PST/HST components.
 * Otherwise a flat `taxRate` is used (defaults to Ontario).
 * @param {object[]} items Items array [{ unit_price, quantity }]
 * @param {number} [taxRate] Flat tax rate fallback
 * @param {string|null} [province] Canonical province code for breakdown
 * @returns {{
 *   subtotal: number,
 *   tax: number,
 *   total: number,
 *   tax_breakdown: object|null
 * }}
 */
function computeOrderTotals(items, taxRate, province = null) {
    // compute the subtotal
    const subtotal = roundCurrency(
        items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    );

    if (province != null && String(province).trim() !== "") {
        const tax_breakdown = computeTaxBreakdown(subtotal, province);
        if (!tax_breakdown) {
            // unknown province - caller should have validated already
            const rate = taxRate ?? resolveTaxRate(null);
            const tax = roundCurrency(subtotal * rate);
            return {
                subtotal,
                tax,
                total: roundCurrency(subtotal + tax),
                tax_breakdown: null,
            };
        }

        return {
            subtotal,
            tax: tax_breakdown.tax,
            total: roundCurrency(subtotal + tax_breakdown.tax),
            tax_breakdown,
        };
    }

    // resolve the flat tax rate
    const rate = taxRate ?? resolveTaxRate(null);
    const tax = roundCurrency(subtotal * rate);

    return {
        subtotal,
        tax,
        total: roundCurrency(subtotal + tax),
        tax_breakdown: null,
    };
}

export { roundCurrency, computeTaxBreakdown, computeOrderTotals };
