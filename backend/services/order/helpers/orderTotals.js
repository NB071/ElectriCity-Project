// Order Service (Helpers; for totals)

import { resolveTaxRate } from "./resolveTaxRate.js";

/**
 * This function rounds a number to 2 decimal places (currency precision).
 * @param {number} amount Amount to round
 * @returns {number}
 */
function roundCurrency(amount) {
    return Math.round(amount * 100) / 100;
}

/**
 * This function computes subtotal/tax/total for a list of priced line items.
 * @param {object[]} items Items array [{ unit_price, quantity }]
 * @param {number} [taxRate] Tax rate
 * @returns {{ subtotal: number, tax: number, total: number }}
 */
function computeOrderTotals(items, taxRate) {
    // resolve the tax rate
    const rate = taxRate ?? resolveTaxRate(null);

    // compute the subtotal
    const subtotal = roundCurrency(
        items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    );
    // if the subtotal is not a number, throw an error
    // compute the tax
    const tax = roundCurrency(subtotal * rate);

    // compute the total
    const total = roundCurrency(subtotal + tax);

    // return the order totals
    return { subtotal, tax, total };
}

export { roundCurrency, computeOrderTotals };
