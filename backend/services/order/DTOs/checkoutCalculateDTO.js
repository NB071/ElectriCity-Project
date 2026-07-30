import { roundCurrency } from "../helpers/orderTotals.js";

/**
 * This function maps a priced checkout line to a representable format.
 * @param {object} item
 * @returns {object}
 */
function toCheckoutCalculateLineDTO(item) {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unit_price);
    return {
        cid: Number(item.cid),
        config_id: item.config_id == null ? null : Number(item.config_id),
        quantity,
        unit_price: unitPrice,
        line_total: roundCurrency(unitPrice * quantity),
    };
}

/**
 * This function maps checkout calculate totals to a representable format.
 * @param {object} input
 * @param {object[]} input.items Priced line items
 * @param {number} input.subtotal
 * @param {number} input.tax
 * @param {number} input.total
 * @param {object} input.tax_breakdown Tax breakdown from computeOrderTotals
 * @returns {object}
 */
function toCheckoutCalculateDTO({
    items,
    subtotal,
    tax,
    total,
    tax_breakdown,
}) {
    return {
        currency: "CAD",
        province: tax_breakdown.province,
        tax_rate: tax_breakdown.rates.applicable,
        subtotal: Number(subtotal),
        tax: Number(tax),
        total: Number(total),
        tax_breakdown: {
            type: tax_breakdown.type,
            rates: {
                gst: tax_breakdown.rates.gst,
                pst: tax_breakdown.rates.pst,
                hst: tax_breakdown.rates.hst,
                applicable: tax_breakdown.rates.applicable,
            },
            amounts: {
                gst: tax_breakdown.gst,
                pst: tax_breakdown.pst,
                hst: tax_breakdown.hst,
                tax: tax_breakdown.tax,
            },
        },
        items: items.map(toCheckoutCalculateLineDTO),
    };
}

export { toCheckoutCalculateLineDTO, toCheckoutCalculateDTO };
