// Order Service
// Strategy pattern / admin manual order strategy (concrete strategy)

import CheckoutStrategy from "./CheckoutStrategy.js";
import { resolveItemsPricing } from "./resolveItemPricing.js";
import { runCheckout } from "./checkoutHelpers.js";

/**
 * Lets an admin manually place an order for a specific customer or guest (e.g. phone orders),
 * always sourcing line items from the request body rather than any stored cart.
 * @extends CheckoutStrategy (Strategy pattern)
 */
class AdminCheckoutStrategy extends CheckoutStrategy {
    /**
     * @param {object} input
     * @param {number|null} input.userId Target customer; null when placing a guest order
     * @param {string} [input.guest_email]
     * @param {object[]} input.items
     * @param {object} input.shipping_address
     * @param {object} [input.billing_address]
     * @param {string} input.payment_method
     * @param {object} [input.payment_details]
     * @returns {Promise<object>} Checkout result
     */
    async checkout({
        userId,
        guest_email,
        items,
        shipping_address,
        billing_address,
        payment_method,
        payment_details,
    }) {
        const resolvedItems = await resolveItemsPricing(items);

        return runCheckout({
            userId,
            guest_email,
            resolvedItems,
            shipping_address,
            billing_address,
            payment_method,
            payment_details,
        });
    }
}

const adminCheckoutStrategy = new AdminCheckoutStrategy();
export default adminCheckoutStrategy;
